/**
 * Persistent buffer for log entries that could not be delivered at the time they were raised.
 *
 * Deliberately backed by localStorage rather than IndexedDb. The failures most worth capturing are
 * the ones where IndexedDb itself has died, taking the records with it; entries held in a second
 * IndexedDb database would be lost in the same event, which is precisely the evidence needed.
 * localStorage is a separate backend, is synchronous (so an entry survives an immediate crash,
 * unload or reload), and adds no pressure to the database under investigation.
 *
 * Nothing in this file may call Logger.logError(). A failure here must not generate a log entry,
 * or a failing flush would produce more entries needing flushing. console only.
 */

/**
 * Prefix for individual buffered entries. Keys sort lexicographically into chronological order.
 *
 * @type {string}
 */
const ENTRY_KEY_PREFIX = 'bsbiLog.';

/**
 * Separate prefix, so that meta keys are not picked up by the entry scan.
 *
 * @type {string}
 */
const DROPPED_COUNT_KEY = 'bsbiLogMeta.dropped';

/**
 * Caps on the buffer, against a total origin budget of roughly 5Mb. Entries run about 0.5-1.5Kb
 * each, so this is far more history than is ever likely to be useful.
 */
const MAX_ENTRIES = 500;
const MAX_TOTAL_BYTES = 1024 * 1024;

/**
 * A single oversized entry (a huge stack, or a stringified object) must not be able to consume the
 * whole budget.
 *
 * @type {number}
 */
const MAX_ENTRY_BYTES = 16 * 1024;

/**
 * Batch limits, whichever is reached first.
 *
 * Sized for a slow or intermittent mobile connection: roughly 25Kb per request, which should
 * complete in a few seconds even on a poor link, and costs little when it has to be retried.
 */
const CHUNK_ENTRIES = 25;
const CHUNK_BYTES = 64 * 1024;

/**
 * Minimum interval between flush attempts after a failure, so that an unreachable endpoint is not
 * hammered.
 *
 * @type {number}
 */
const FLUSH_RETRY_INTERVAL_MS = 60000;

export class LogBuffer {
    /**
     * @type {boolean}
     * @private
     */
    static _flushInProgress = false;

    /**
     * @type {number}
     * @private
     */
    static _nextFlushAllowedStamp = 0;

    /**
     * @type {boolean}
     * @private
     */
    static _onlineListenerAttached = false;

    /**
     * Key of the newest buffered entry, cached so that repeat detection doesn't rescan on every
     * call. Null means 'not yet determined', and triggers a single scan.
     *
     * @type {string|null}
     * @private
     */
    static _newestKey = null;

    /**
     * @type {string|null}
     * @private
     */
    static _newestSignature = null;

    /**
     * @type {number}
     * @private
     */
    static _serial = 0;

    /**
     * @returns {boolean}
     */
    static isAvailable() {
        try {
            // absent in a service worker, and can throw in restricted contexts
            return typeof localStorage !== 'undefined' && !!localStorage;
        } catch (error) {
            return false;
        }
    }

    /**
     * Buffers an undelivered entry.
     *
     * Consecutive identical entries are coalesced, carrying a count and the stamp of the latest
     * occurrence. That matters because the entries most worth keeping tend to arrive in bursts -
     * a reload loop, or a repeated failing save - and 30 copies of one message is both wasteful
     * and harder to read than one with a count.
     *
     * @param {{}} doc the payload that would have been posted
     * @returns {boolean} true if the entry was buffered
     */
    static store(doc) {
        if (!LogBuffer.isAvailable()) {
            return false;
        }

        try {
            LogBuffer._attachOnlineListener();

            const descriptor = doc.error || doc.descriptor;

            if (descriptor) {
                // marks the entry as delivered late, so that a batch arriving hours afterwards is
                // not mistaken for a burst of simultaneous failures
                descriptor.buffered = true;
            }

            const signature = LogBuffer._signatureOf(doc);

            if (LogBuffer._coalesceWithNewest(signature, descriptor)) {
                return true;
            }

            let serialised = JSON.stringify(doc);

            if (serialised.length > MAX_ENTRY_BYTES) {
                serialised = LogBuffer._truncateEntry(doc, descriptor);
            }

            const key = `${ENTRY_KEY_PREFIX}${Date.now().toString().padStart(14, '0')}.${(LogBuffer._serial++).toString().padStart(6, '0')}`;

            localStorage.setItem(key, serialised);

            LogBuffer._newestKey = key;
            LogBuffer._newestSignature = signature;

            LogBuffer._enforceLimits();

            return true;
        } catch (error) {
            // quota exceeded, or storage unavailable - drop the entry rather than propagate
            console.error({'Failed to buffer log entry': error});

            try {
                LogBuffer._evictOldest(Math.ceil(MAX_ENTRIES / 4));
            } catch (evictionError) {
                console.error({'Failed to evict buffered log entries': evictionError});
            }

            return false;
        }
    }

    /**
     * Posts buffered entries in batches, discarding each batch only once the server has accepted it.
     *
     * @param {function(Array<{}>): Promise<boolean>} postBatch resolves true if the batch was accepted
     * @returns {Promise<void>} always resolves
     */
    static flush(postBatch) {
        if (!LogBuffer.isAvailable() || LogBuffer._flushInProgress) {
            return Promise.resolve();
        }

        if (Date.now() < LogBuffer._nextFlushAllowedStamp) {
            // still backing off from a previous failure
            return Promise.resolve();
        }

        let keys;

        try {
            keys = LogBuffer._entryKeys();
        } catch (error) {
            console.error({'Failed to read buffered log entries': error});
            return Promise.resolve();
        }

        if (!keys.length) {
            return Promise.resolve();
        }

        LogBuffer._flushInProgress = true;

        return LogBuffer._flushChunks(keys, postBatch)
            .catch((error) => {
                console.error({'Buffered log flush failed': error});
                // @intentional allow the chain to continue
            })
            .then(() => {
                LogBuffer._flushInProgress = false;
            });
    }

    /**
     * @param {Array<string>} keys
     * @param {function(Array<{}>): Promise<boolean>} postBatch
     * @returns {Promise<void>}
     * @private
     */
    static _flushChunks(keys, postBatch) {
        if (!keys.length) {
            return Promise.resolve();
        }

        const chunkKeys = [];
        const chunkEntries = [];
        let chunkBytes = 0;

        while (keys.length && chunkKeys.length < CHUNK_ENTRIES) {
            const key = keys[0];
            const raw = localStorage.getItem(key);

            if (!raw) {
                // vanished (another tab, or eviction) - nothing to send
                keys.shift();
                continue;
            }

            if (chunkKeys.length && (chunkBytes + raw.length) > CHUNK_BYTES) {
                break;
            }

            let entry;

            try {
                entry = JSON.parse(raw);
            } catch (error) {
                // unreadable entry: discard it rather than block the queue behind it
                console.error({'Discarding unreadable buffered log entry': {key, error}});
                localStorage.removeItem(key);
                keys.shift();
                continue;
            }

            chunkKeys.push(key);
            chunkEntries.push(entry);
            chunkBytes += raw.length;
            keys.shift();
        }

        if (!chunkEntries.length) {
            return Promise.resolve();
        }

        LogBuffer._prependDroppedNotice(chunkEntries);

        return postBatch(chunkEntries).then((accepted) => {
            if (!accepted) {
                // leave the entries in place and stop; they'll be retried after the backoff
                LogBuffer._nextFlushAllowedStamp = Date.now() + FLUSH_RETRY_INTERVAL_MS;
                return;
            }

            for (const key of chunkKeys) {
                localStorage.removeItem(key);

                if (LogBuffer._newestKey === key) {
                    LogBuffer._newestKey = null;
                    LogBuffer._newestSignature = null;
                }
            }

            return LogBuffer._flushChunks(keys, postBatch);
        }, (reason) => {
            LogBuffer._nextFlushAllowedStamp = Date.now() + FLUSH_RETRY_INTERVAL_MS;

            // postBatch is contracted to resolve with a boolean, so a rejection means the poster
            // itself failed rather than the server declining the batch. Rejecting keeps the two
            // apart and carries the reason up to flush(), which logs it - swallowing it here left
            // that catch unreachable and discarded the only evidence of what went wrong.
            return Promise.reject(reason);
        });
    }

    /**
     * Adds a synthetic entry recording how many entries were evicted, so that a gap in the record is
     * visible rather than silent.
     *
     * @param {Array<{}>} chunkEntries
     * @private
     */
    static _prependDroppedNotice(chunkEntries) {
        try {
            const dropped = parseInt(localStorage.getItem(DROPPED_COUNT_KEY), 10);

            if (dropped > 0) {
                chunkEntries.unshift({
                    descriptor: {
                        message: `${dropped} buffered log entries were discarded because the offline log buffer was full.`,
                        buffered: true,
                        stamp: Date.now(),
                    }
                });

                localStorage.removeItem(DROPPED_COUNT_KEY);
            }
        } catch (error) {
            console.error({'Failed to read dropped log entry count': error});
        }
    }

    /**
     * @returns {Array<string>} entry keys, oldest first
     * @private
     */
    static _entryKeys() {
        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (key && key.startsWith(ENTRY_KEY_PREFIX)) {
                keys.push(key);
            }
        }

        // keys embed a zero-padded stamp and serial, so lexicographic order is chronological
        keys.sort();

        return keys;
    }

    /**
     * Identity of an entry for repeat detection.
     *
     * Built with JSON.stringify rather than by joining with a separator, so that no character needs
     * to be assumed absent from a message or stack.
     *
     * @param {{}} doc
     * @returns {string}
     * @private
     */
    static _signatureOf(doc) {
        const descriptor = doc.error || doc.descriptor || {};

        return JSON.stringify([descriptor.message || '', descriptor.stack || '']);
    }

    /**
     * @param {string} signature
     * @param {{}} descriptor
     * @returns {boolean} true if the entry was merged into the newest buffered entry
     * @private
     */
    static _coalesceWithNewest(signature, descriptor) {
        if (LogBuffer._newestKey === null) {
            LogBuffer._loadNewest();
        }

        if (!LogBuffer._newestKey || LogBuffer._newestSignature !== signature) {
            return false;
        }

        const raw = localStorage.getItem(LogBuffer._newestKey);

        if (!raw) {
            LogBuffer._newestKey = null;
            LogBuffer._newestSignature = null;
            return false;
        }

        const existing = JSON.parse(raw);
        const existingDescriptor = existing.error || existing.descriptor;

        if (!existingDescriptor) {
            return false;
        }

        existingDescriptor.count = (existingDescriptor.count || 1) + 1;
        existingDescriptor.lastStamp = descriptor?.stamp || Date.now();

        localStorage.setItem(LogBuffer._newestKey, JSON.stringify(existing));

        return true;
    }

    /**
     * Establishes the newest buffered entry after a page load, so that repeats spanning a reload are
     * still coalesced - which is the case that matters, since a reload loop produces one entry per
     * load.
     *
     * @private
     */
    static _loadNewest() {
        try {
            const keys = LogBuffer._entryKeys();

            if (!keys.length) {
                LogBuffer._newestKey = '';
                LogBuffer._newestSignature = null;
                return;
            }

            const key = keys[keys.length - 1];
            const raw = localStorage.getItem(key);

            LogBuffer._newestKey = key;
            LogBuffer._newestSignature = raw ? LogBuffer._signatureOf(JSON.parse(raw)) : null;
        } catch (error) {
            console.error({'Failed to inspect newest buffered log entry': error});
            LogBuffer._newestKey = '';
            LogBuffer._newestSignature = null;
        }
    }

    /**
     * @param {{}} doc
     * @param {{}} descriptor
     * @returns {string}
     * @private
     */
    static _truncateEntry(doc, descriptor) {
        if (descriptor) {
            if (typeof descriptor.stack === 'string') {
                descriptor.stack = `${descriptor.stack.slice(0, 2000)}\n[truncated]`;
            }

            if (typeof descriptor.message === 'string') {
                descriptor.message = `${descriptor.message.slice(0, 4000)}\n[truncated]`;
            }

            descriptor.truncated = true;
        }

        return JSON.stringify(doc).slice(0, MAX_ENTRY_BYTES);
    }

    /**
     * @private
     */
    static _enforceLimits() {
        const keys = LogBuffer._entryKeys();

        let totalBytes = 0;

        for (const key of keys) {
            totalBytes += (localStorage.getItem(key) || '').length;
        }

        let excess = keys.length - MAX_ENTRIES;

        while (totalBytes > MAX_TOTAL_BYTES && excess < keys.length) {
            excess++;
            totalBytes -= (localStorage.getItem(keys[excess - 1]) || '').length;
        }

        if (excess > 0) {
            LogBuffer._removeKeys(keys.slice(0, excess));
        }
    }

    /**
     * @param {number} count
     * @private
     */
    static _evictOldest(count) {
        LogBuffer._removeKeys(LogBuffer._entryKeys().slice(0, count));
    }

    /**
     * @param {Array<string>} keys
     * @private
     */
    static _removeKeys(keys) {
        if (!keys.length) {
            return;
        }

        for (const key of keys) {
            localStorage.removeItem(key);

            if (LogBuffer._newestKey === key) {
                LogBuffer._newestKey = null;
                LogBuffer._newestSignature = null;
            }
        }

        try {
            const dropped = (parseInt(localStorage.getItem(DROPPED_COUNT_KEY), 10) || 0) + keys.length;
            localStorage.setItem(DROPPED_COUNT_KEY, dropped.toString());
        } catch (error) {
            console.error({'Failed to record dropped log entry count': error});
        }
    }

    /**
     * @private
     */
    static _attachOnlineListener() {
        if (LogBuffer._onlineListenerAttached || typeof addEventListener !== 'function') {
            return;
        }

        LogBuffer._onlineListenerAttached = true;

        addEventListener('online', () => {
            // cleared so that a genuine reconnection isn't blocked by an earlier backoff
            LogBuffer._nextFlushAllowedStamp = 0;

            if (LogBuffer.onFlushRequested) {
                LogBuffer.onFlushRequested();
            }
        });
    }

    /**
     * Set by Logger, which owns the transport.
     *
     * @type {function|null}
     */
    static onFlushRequested = null;
}
