import {LogBuffer} from "./LogBuffer.js";

const JS_LOG_PATH = '/jsLog.php';

/**
 * Deadline for a log post. Without one a stalled connection leaves the request hanging, which for a
 * batch flush would block the queue behind it indefinitely.
 *
 * @type {number}
 */
const LOG_POST_TIMEOUT_MS = 30000;

export class Logger {

    /**
     * @type {App}
     */
    static app;

    /**
     * @type {string}
     */
    static bsbiAppVersion;

    static _serialNumber = 0;

    /**
     * Used only if the Logger is running in a service worker context, otherwise use Logger.app.session.userId
     *
     * @type {string}
     */
    static userId;

    static get serialNumber() {
        return Logger._serialNumber++;
    }

    /**
     * For test builds reports a JavaScript error, otherwise is a no-op
     *
     * @param {string} message
     * @param {string|null} [url]
     * @param {string|number|null} [line]
     * @param {number|null} [column]
     * @param {Error|null} [errorObj]
     * @returns {Promise<void>}
     */
    static logErrorDev(message, url = '', line= '', column = null, errorObj = null) {
        return (Logger?.app?.isTestBuild) ?
            Logger.logError(message, url, line, column, errorObj)
            :
            Promise.resolve();
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * For test builds reports a JavaScript error, otherwise is a no-op
     *
     * @param {string} message
     * @param {string|null} [url]
     * @returns {Promise<void>}
     */
    static logMessageDev(message, url = '') {
        return (Logger?.app?.isTestBuild) ?
            Logger.logMessage(message, url)
            :
            Promise.resolve();
    }

    static stringifyObject(obj) {
        if (obj === null || obj === undefined) {
            // reached via Promise.reject() with no reason, among others; obj.toString() would throw
            return String(obj);
        } else if (typeof obj !== 'object') {
            return obj.toString();
        } else if (obj instanceof Error) {
            return `Error (${obj.name}): ${obj.message}\nStack: ${obj.stack}`;
        } else {
            const stringified = JSON.stringify(obj, null, 2);
            return stringified === '{}' ? obj.toString() : stringified;
        }
    }

    /**
     * reports a JavaScript error
     *
     * @param {string|object} message
     * @param {string|null} [url]
     * @param {string|number|null} [line]
     * @param {number|null} [column]
     * @param {Error|null} [errorObj]
     * @returns {Promise<void>} a fulfilled promise (even if logging fails)
     */
    static logError(message, url = '', line= '', column = null, errorObj = null) {
        try {
            console.error(message, url, line, errorObj);

            if (!errorObj) {
                // on V8 construction of PlaceholderError will capture a stack trace automatically
                errorObj = new _PlaceholderError(message);

                // otherwise may need to throw and catch the error
                if (!Error.captureStackTrace) {
                    try {
                        // thrown just to generate a stack trace
                        // noinspection ExceptionCaughtLocallyJS
                        throw errorObj;
                    } catch (error) {

                    }
                }
            }

            if (!url) {
                url = globalThis.window?.location?.href;
            }

            if (console.trace) {
                console.trace('Trace');
            }

            const doc = {error: {}};
            const errorDescriptor = doc.error;

            errorDescriptor.n = Logger.serialNumber;

            if (line !== null && line !== undefined) {
                errorDescriptor.line = line;
            }

            if (errorObj && ('stack' in errorObj)) {
                errorDescriptor.stack = errorObj.stack;
            }

            if (url !== null && url !== undefined && url !== '') {
                errorDescriptor.url = url;
            }

            if (globalThis.window?.location?.href) {
                errorDescriptor.referrer = window.location.href;
            }

            if (globalThis.window?.location?.search) {
                errorDescriptor.urlquery = window.location.search;
            }

            if (globalThis.window?.location?.hash) {
                errorDescriptor.urlhash = window.location.hash;
            }

            if (Logger.app?.session?.userId || Logger.userId) {
                errorDescriptor.userid = Logger.app?.session?.userId || Logger.userId;
            }

            if (globalThis.navigator) {
                // noinspection PlatformDetectionJS,JSDeprecatedSymbols
                errorDescriptor.browser = navigator.appName;
                // noinspection JSDeprecatedSymbols
                errorDescriptor.browserv = navigator.appVersion;
                errorDescriptor.userAgent = navigator.userAgent;
            }

            errorDescriptor.versions = Logger.bsbiAppVersion;

            if (message instanceof Error) {
                message = Logger.stringifyObject(message);
            }

            errorDescriptor.message = message;

            errorDescriptor.stamp = Date.now();

            return Logger._deliver(doc);
        } catch (error) {
            console.error({'error in error handler' : error});

            // Callers chain .then()/.finally() onto this, so a promise must be returned even when
            // the error handler itself fails.
            return Promise.resolve();
        }
    }

    /**
     * remote-logs a message
     *
     * @param {string|object} message
     * @param {string|null} [url]
     * @returns {Promise<void>} a fulfilled promise (even if logging fails)
     */
    static logMessage(message, url = '') {
        try {
            return Logger._buildAndDeliverMessage(message, url);
        } catch (error) {
            console.error({'error in message logger' : error});
            return Promise.resolve();
        }
    }

    /**
     * @param {string|object} message
     * @param {string|null} url
     * @returns {Promise<void>}
     * @private
     */
    static _buildAndDeliverMessage(message, url) {
        console.log(message);

        if (!url) {
            url = globalThis.window?.location?.href;
        }

        if (console.trace) {
            console.trace('Trace');
        }

        const doc = {descriptor: {}};
        const messageDescriptor = doc.descriptor;

        messageDescriptor.n = Logger.serialNumber;

        if (url !== null && url !== undefined && url !== '') {
            messageDescriptor.url = url;
        }

        if (globalThis.window?.location?.search) {
            messageDescriptor.urlquery = window.location.search;
        }

        if (globalThis.window?.location?.hash) {
            messageDescriptor.urlhash = window.location.hash;
        }

        if (Logger.app?.session?.userId || Logger.userId) {
            messageDescriptor.userid = Logger.app?.session?.userId || Logger.userId;
        }

        // noinspection PlatformDetectionJS,JSDeprecatedSymbols
        messageDescriptor.browser = navigator?.appName;
        // noinspection JSDeprecatedSymbols
        messageDescriptor.browserv = navigator?.appVersion;
        messageDescriptor.useragent = navigator?.userAgent;
        messageDescriptor.version = Logger.bsbiAppVersion;

        messageDescriptor.message = message;
        messageDescriptor.stamp = Date.now();

        return Logger._deliver(doc);
    }

    /**
     * Posts an entry, buffering it for later if that isn't currently possible.
     *
     * Entries are buffered both when offline and when a post fails while apparently online.
     * navigator.onLine only reports whether a network interface exists, so a captive portal, a
     * stalled mobile connection or a server error would otherwise discard the entry silently -
     * and those are exactly the conditions worth having a record of.
     *
     * @param {{}} doc
     * @returns {Promise<void>} always resolves
     * @private
     */
    static _deliver(doc) {
        if (!globalThis.navigator?.onLine) {
            console.info({'Offline, report buffered': doc});
            LogBuffer.store(doc);

            return Promise.resolve();
        }

        return Logger._postPayload(doc).then((accepted) => {
            if (accepted) {
                // The post proves the endpoint is reachable, which is a better signal than
                // navigator.onLine, so take the opportunity to drain anything held back.
                return Logger.flushBufferedLogs();
            }

            LogBuffer.store(doc);
        });
    }

    /**
     * Sends buffered entries to the server in batches.
     *
     * @returns {Promise<void>} always resolves
     */
    static flushBufferedLogs() {
        if (!globalThis.navigator?.onLine) {
            return Promise.resolve();
        }

        return LogBuffer.flush((entries) => Logger._postPayload(entries));
    }

    /**
     * Posts either a single entry or an array of them; jsLog.php accepts both.
     *
     * Must never call Logger.logError(), or a failing log post would generate further entries.
     *
     * @param {{}|Array<{}>} payload
     * @returns {Promise<boolean>} resolves true if the server accepted the payload
     * @private
     */
    static _postPayload(payload) {
        let timeoutId = null;

        const clearPostTimeout = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        try {
            const fetchOptions = {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "include", // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer-when-downgrade", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(payload),
            };

            if (typeof AbortController !== 'undefined') {
                const signalController = new AbortController();
                fetchOptions.signal = signalController.signal;

                timeoutId = setTimeout(() => {
                    timeoutId = null;
                    signalController.abort();
                }, LOG_POST_TIMEOUT_MS);
            }

            return fetch(JS_LOG_PATH, fetchOptions).then(
                (response) => {
                    if (!response.ok) {
                        console.info({'Remote logging rejected': response.status});
                    }

                    return response.ok;
                },
                (reason) => {
                    console.info({'Remote logging failed': reason});
                    return false;
                }
            ).finally(clearPostTimeout);
        } catch (error) {
            clearPostTimeout();
            console.info({'Remote logging threw': error});

            return Promise.resolve(false);
        }
    }
}

// LogBuffer owns the storage and scheduling; Logger owns the transport, so it supplies the means of
// draining the buffer when connectivity returns.
LogBuffer.onFlushRequested = () => Logger.flushBufferedLogs();

/**
 * Throw this only from within logError
 */
class _PlaceholderError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, Logger.logError); // see https://v8.dev/docs/stack-trace-api
    }
}