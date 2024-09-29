import {Model} from "../models/Model";

export class Logger {

    /**
     * @type {App}
     */
    static app;

    /**
     * reports a javascript error
     *
     * @param {string} message
     * @param {string|null} [url]
     * @param {string|number|null} [line]
     * @param {number|null} [column]
     * @param {Error|null} [errorObj]
     * @returns {Promise<void>}
     */
    static logError = function(message, url = '', line= '', column = null, errorObj = null) {

        window.onerror = null;

        console.error(message, url, line, errorObj);

        if (console.trace) {
            console.trace('Trace');
        }

        const doc = document.implementation.createDocument('', 'response', null); // create blank XML response document
        const errorEl = doc.createElement('error');

        if (line !== null && line !== undefined) {
            errorEl.setAttribute('line', line);
        }

        if (errorObj && ('stack' in errorObj)) {
            errorEl.setAttribute('stack', errorObj.stack);
        }

        if (url !== null && url !== undefined && url !== '') {
            errorEl.setAttribute('url', url);
        }

        if (window.location.href) {
            errorEl.setAttribute('referrer', window.location.href);
        }

        if (window.location.search) {
            errorEl.setAttribute('urlquery', window.location.search);
        }

        if (window.location.hash) {
            errorEl.setAttribute('urlhash', window.location.hash);
        }

        if (Logger.app?.session?.userId) {
            errorEl.setAttribute('userid', Logger.app.session.userId);
        }

        // noinspection PlatformDetectionJS
        errorEl.setAttribute('browser', navigator.appName);
        errorEl.setAttribute('browserv', navigator.appVersion);
        errorEl.setAttribute('userAgent', navigator.userAgent);
        errorEl.setAttribute('versions', Model.bsbiAppVersion);

        errorEl.appendChild(doc.createTextNode(message));

        doc.documentElement.appendChild(errorEl);

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
            console.info({'Remote error logging failed' : reason});
        }).finally(() => {
            window.onerror = Logger.logError; // turn on error handling again
        });
    };
}
