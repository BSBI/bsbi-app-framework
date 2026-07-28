import localforage from 'localforage';
import {Logger} from "./Logger";

/**
 * localforage's default driver order is [INDEXEDDB, WEBSQL, LOCALSTORAGE], so if IndexedDb fails
 * its support check or fails to initialise it silently degrades — potentially all the way to
 * localStorage, which is roughly 5Mb, synchronous, string-only, and cannot hold a File at all.
 *
 * For this app that would look like working saves right up to the point the quota blows, while
 * everything already in IndexedDb became invisible. Pinning the driver turns a silent degradation
 * into a loud, reportable failure.
 *
 * @type {string}
 */
export const PINNED_FORAGE_DRIVER = localforage.INDEXEDDB;

/**
 * Reports which driver a store actually ended up using.
 *
 * config() is peculiar: it *returns* an Error rather than throwing when called too late, and
 * returns the setDriver() promise when a driver was specified, so both need handling.
 *
 * @param {LocalForage} instance
 * @param {Error|boolean|Promise} configResult whatever localforage.config() returned
 * @param {string} label identifies the store in the log message
 * @returns {Promise<string|null>} resolves with the driver name, or null if none could be set
 */
export function reportForageDriver(instance, configResult, label) {
    if (configResult instanceof Error) {
        // e.g. 'Can't call config() after localforage has been used.' — the pinned driver was
        // never applied, so the store may be running on a fallback driver.
        console.error({[`Failed to configure '${label}' store`]: configResult});

        // noinspection JSIgnoredPromiseFromCall
        Logger.logError(`Failed to configure '${label}' local store: ${configResult.message}`);

        return Promise.resolve(instance.driver());
    }

    return Promise.resolve(configResult)
        .then(() => instance.ready())
        .then(() => {
            const driver = instance.driver();

            console.info(`Local store '${label}' is using driver '${driver}'.`);

            if (driver !== PINNED_FORAGE_DRIVER) {
                // shouldn't be reachable while the driver is pinned, but worth knowing about
                // noinspection JSIgnoredPromiseFromCall
                Logger.logError(`Local store '${label}' is using unexpected driver '${driver}'.`);
            }

            return driver;
        })
        .catch((reason) => {
            // IndexedDb is unavailable and no fallback is permitted. Storage will not work, so this
            // needs to be loud — previously the app would have limped along on localStorage and
            // failed later in a much more confusing way.
            console.error({[`No usable storage driver for '${label}' store`]: reason});

            // noinspection JSIgnoredPromiseFromCall
            Logger.logError(`No usable storage driver for '${label}' local store (IndexedDb unavailable): ${Logger.stringifyObject(reason)}`);

            return null;
        });
}
