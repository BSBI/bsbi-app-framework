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
        const error = doc.createElement('error');

        if (line !== null && line !== undefined) {
            error.setAttribute('line', line);
        }

        if (errorObj && ('stack' in errorObj)) {
            error.setAttribute('stack', errorObj.stack);
        }

        if (url !== null && url !== undefined && url !== '') {
            error.setAttribute('url', url);
        }

        if (window.location.href) {
            error.setAttribute('referrer', window.location.href);
        }

        if (window.location.search) {
            error.setAttribute('urlquery', window.location.search);
        }

        if (window.location.hash) {
            error.setAttribute('urlhash', window.location.hash);
        }

        if (Logger.app?.session?.userId) {
            error.setAttribute('userid', Logger.app.session.userId);
        }

        // noinspection PlatformDetectionJS
        error.setAttribute('browser', navigator.appName);
        error.setAttribute('browserv', navigator.appVersion);
        error.setAttribute('userAgent', navigator.userAgent);
        error.setAttribute('versions', Model.bsbiAppVersion);

        error.appendChild(doc.createTextNode(message));

        doc.documentElement.appendChild(error);

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
        }).finally(() => {
            window.onerror = Logger.logError; // turn on error handling again
        });
    };
}
