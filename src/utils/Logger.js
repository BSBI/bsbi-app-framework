
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

    /**
     * reports a JavaScript error
     *
     * @param {string} message
     * @param {string|null} [url]
     * @param {string|number|null} [line]
     * @param {number|null} [column]
     * @param {Error|null} [errorObj]
     * @returns {Promise<void>} a fulfilled promise (even if logging fails)
     */
    static logError(message, url = '', line= '', column = null, errorObj = null) {
        window.onerror = null;

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
            url = window?.location?.href;
        }

        if (console.trace) {
            console.trace('Trace');
        }

        const doc = document.implementation.createDocument('', 'response', null); // create blank XML response document
        const errorEl = doc.createElement('error');

        errorEl.setAttribute('n', Logger.serialNumber);

        if (line !== null && line !== undefined) {
            errorEl.setAttribute('line', line);
        }

        if (errorObj && ('stack' in errorObj)) {
            errorEl.setAttribute('stack', errorObj.stack);
        }

        if (url !== null && url !== undefined && url !== '') {
            errorEl.setAttribute('url', url);
        }

        if (window?.location?.href) {
            errorEl.setAttribute('referrer', window.location.href);
        }

        if (window?.location?.search) {
            errorEl.setAttribute('urlquery', window.location.search);
        }

        if (window?.location?.hash) {
            errorEl.setAttribute('urlhash', window.location.hash);
        }

        if (Logger.app?.session?.userId) {
            errorEl.setAttribute('userid', Logger.app.session.userId);
        }

        // noinspection PlatformDetectionJS,JSDeprecatedSymbols
        errorEl.setAttribute('browser', navigator.appName);
        // noinspection JSDeprecatedSymbols
        errorEl.setAttribute('browserv', navigator.appVersion);
        errorEl.setAttribute('userAgent', navigator.userAgent);
        errorEl.setAttribute('versions', Logger.bsbiAppVersion);

        errorEl.appendChild(doc.createTextNode(message));

        doc.documentElement.appendChild(errorEl);

        if (navigator.onLine) {
            return fetch('/javascriptErrorLog.php', {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "include", // include, *same-origin, omit
                headers: {
                    "Content-Type": "text/xml",
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer-when-downgrade", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: (new XMLSerializer()).serializeToString(doc),
            }).catch((reason) => {
                console.info({'Remote error logging failed': reason});
                // don't reject here, as the promise chain should continue, even after a failed log
            }).finally(() => {
                window.onerror = Logger.logError; // turn on error handling again
            });
        } else {
            console.info({'Offline, report not sent': doc});
            window.onerror = Logger.logError; // turn on error handling again

            return Promise.resolve();
        }
    }

    /**
     * remote-logs a message
     *
     * @param {string} message
     * @param {string|null} [url]
     * @returns {Promise<void>} a fulfilled promise (even if logging fails)
     */
    static logMessage(message, url = '') {
        console.log(message);

        if (!url) {
            url = window?.location?.href;
        }

        if (console.trace) {
            console.trace('Trace');
        }

        const doc = document.implementation.createDocument('', 'response', null); // create blank XML response document
        const messageEl = doc.createElement('message');

        messageEl.setAttribute('n', Logger.serialNumber);

        if (url !== null && url !== undefined && url !== '') {
            messageEl.setAttribute('url', url);
        }



        if (window?.location?.search) {
            messageEl.setAttribute('urlquery', window.location.search);
        }

        if (window?.location?.hash) {
            messageEl.setAttribute('urlhash', window.location.hash);
        }

        if (Logger.app?.session?.userId) {
            messageEl.setAttribute('userid', Logger.app.session.userId);
        }

        // noinspection PlatformDetectionJS,JSDeprecatedSymbols
        messageEl.setAttribute('browser', navigator.appName);
        // noinspection JSDeprecatedSymbols
        messageEl.setAttribute('browserv', navigator.appVersion);
        messageEl.setAttribute('userAgent', navigator.userAgent);
        messageEl.setAttribute('versions', Logger.bsbiAppVersion);

        messageEl.appendChild(doc.createTextNode(message));

        doc.documentElement.appendChild(messageEl);

        if (navigator.onLine) {
            return fetch('/javascriptErrorLog.php', {
                method: "POST", // *GET, POST, PUT, DELETE, etc.
                mode: "cors", // no-cors, *cors, same-origin
                cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
                credentials: "include", // include, *same-origin, omit
                headers: {
                    "Content-Type": "text/xml",
                },
                redirect: "follow", // manual, *follow, error
                referrerPolicy: "no-referrer-when-downgrade", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                body: (new XMLSerializer()).serializeToString(doc),
            }).catch((reason) => {
                console.info({'Remote message logging failed': reason});
                // don't reject here, as the promise chain should continue, even after a failed log
            });
        } else {
            console.info({'Offline, report not sent': doc});

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