
const JS_LOG_PATH = '/jsLog.php';

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
        if (typeof obj !== 'object') {
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

            if (Logger.app?.session?.userId) {
                errorDescriptor.userid = Logger.app.session.userId;
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

            if (globalThis.navigator?.onLine) {
                return fetch(JS_LOG_PATH, {
                    method: "POST", // *GET, POST, PUT, DELETE, etc.
                    mode: "cors", // no-cors, *cors, same-origin
                    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                    credentials: "include", // include, *same-origin, omit
                    headers: {
                        "Content-Type": "application/json",
                    },
                    redirect: "follow", // manual, *follow, error
                    referrerPolicy: "no-referrer-when-downgrade", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                    body: JSON.stringify(doc),
                }).catch((reason) => {
                    console.info({'Remote error logging failed': reason});
                    // don't reject here, as the promise chain should continue, even after a failed log
                });
            } else {
                console.info({'Offline, report not sent': doc});

                return Promise.resolve();
            }
        } catch (error) {
            console.error({'error in error handler' : error});
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

        if (Logger.app?.session?.userId) {
            messageDescriptor.userid = Logger.app.session.userId;
        }

        // noinspection PlatformDetectionJS,JSDeprecatedSymbols
        messageDescriptor.browser = navigator?.appName;
        // noinspection JSDeprecatedSymbols
        messageDescriptor.browserv = navigator?.appVersion;
        messageDescriptor.userAgent = navigator?.userAgent;
        messageDescriptor.versions = Logger.bsbiAppVersion;

        messageDescriptor.message = message;
        messageDescriptor.stamp = Date.now();

        if (globalThis.navigator?.onLine) {
            return fetch(JS_LOG_PATH, {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "include", // include, *same-origin, omit
                headers: {
                    "Content-Type": "application/json",
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer-when-downgrade", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: JSON.stringify(doc),
            }).catch((reason) => {
                console.info({'Remote message logging failed': reason});
                // don't reject here, as the promise chain should continue, even after a failed log
            });
        } else {
            console.info({'Offline, message report not sent': doc});

            return Promise.resolve();
        }
    }
}

/**
 * Throw this only from within logError
 */
class _PlaceholderError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, Logger.logError); // see https://v8.dev/docs/stack-trace-api
    }
}