import { GridRef } from 'british-isles-gridrefs';

class Logger {

    /**
     * @type {App}
     */
    static app;

    /**
     * @type {string}
     */
    static bsbiAppVersion;

    /**
     * For test builds reports a javascript error, otherwise is a no-op
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

        // noinspection PlatformDetectionJS
        errorEl.setAttribute('browser', navigator.appName);
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
            }).finally(() => {
                window.onerror = Logger.logError; // turn on error handling again
            });
        } else {
            console.info({'Offline, report not sent': doc});
            window.onerror = Logger.logError; // turn on error handling again

            return Promise.resolve();
        }
    };
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

/**
 * @typedef {number} EventHarness~Handle
 */

class EventHarness {
    /**
     *
     * @type {Object<string,Array<function>>}
     */
    _eventListeners = {};

    /**
     *
     * @type {Map<Object, Object<string,Array<function>>>}
     * @private
     */
    static _staticEventListeners = new Map;

    /**
     *
     * @type {Map<Object, Array<{eventName: string, handle: EventHarness~Handle}>>}
     * @private
     */
    _wrappedStaticHandles = new Map;

    /**
     *
     * @type {Array<{element: Element, type: string, handler: Function, options}|null>}
     * @private
     */
    _domEventListeners = [];

    static STOP_PROPAGATION = 'STOP_PROPAGATION';

    addDomEventListener(element, type, handler, options) {
        element.addEventListener(type, handler, options);
        return this._domEventListeners.push({element, type, handler, options}) - 1;
    }

    removeDomEventListener(handle) {
        if (this._domEventListeners[handle]) {
            const listener = this._domEventListeners[handle];
            listener.element.removeEventListener(listener.type, listener.handler, listener.options);
            listener.handler = null;
            listener.element = null;
            this._domEventListeners[handle] = null;
        }
    }

    removeDomEventListeners(handles) {
        handles.forEach(this.removeDomEventListener.bind(this));
    }

    addWeakListener (eventName, handlerObject, handlerMethodName, constructionParam = {}) {
        //this._eventListeners = this._eventListeners || [];

        const weakWrapped = new WeakRef(handlerObject);
        handlerObject = null;

        const handlerFunction = (context, eventName, invocationParam = {}) => {
            let weakObject = weakWrapped.deref();

            if (weakObject) {
                weakObject[handlerMethodName]({context, eventName, ...invocationParam, ...constructionParam});
            } else {
                console.warn(`A ${eventName} handler (${handlerMethodName}) has been garbage collected`);
            }
        };

        if (this._eventListeners[eventName]) {
            return (this._eventListeners[eventName].push(handlerFunction)) - 1;
        } else {
            this._eventListeners[eventName] = [handlerFunction];
            return 0; // first element in the array
        }
    }

    // /**
    //  *
    //  * @param {string} eventName
    //  * @param {Function} handler
    //  * @param {*=} constructionParam
    //  * @return {EventHarness~Handle} handle
    //  */
    // addWeakListener(eventName, handler, constructionParam = {}) {
    //     //this._eventListeners = this._eventListeners || [];
    //
    //     /**
    //      *
    //      * @type {WeakRef<Function>}
    //      */
    //     const weakWrapped = new WeakRef(handler);
    //
    //     const handlerFunction = (context, eventName, invocationParam = {}) => {
    //         const handler = weakWrapped.deref();
    //
    //         if (handler) {
    //             handler({context, eventName, ...invocationParam, ...constructionParam});
    //         } else {
    //             console.warn(`A ${eventName} handler has been garbage collected`);
    //         }
    //     }
    //
    //     if (this._eventListeners[eventName]) {
    //         return (this._eventListeners[eventName].push(handlerFunction)) - 1;
    //     } else {
    //         this._eventListeners[eventName] = [handlerFunction];
    //         return 0; // first element in array
    //     }
    // }

    /**
     *
     * @param {string} eventName
     * @param {Function} handler
     * @param {*=} constructionParam
     * @return {EventHarness~Handle} handle
     */
    addListener (eventName, handler, constructionParam = {}) {
        const handlerFunction = (context, eventName, invocationParam = {}) =>
            handler({context, eventName, ...invocationParam, ...constructionParam});

        if (this._eventListeners[eventName]) {
            return (this._eventListeners[eventName].push(handlerFunction)) - 1;
        } else {
            this._eventListeners[eventName] = [handlerFunction];
            return 0; // first element in the array
        }
    }

    /**
     *
     * @param {{}} staticTarget
     * @param {string} eventName
     * @param {Function} handler
     * @param {*=} constructionParam
     * @return {EventHarness~Handle} handle
     */
    static staticAddListener (staticTarget, eventName, handler, constructionParam = {}) {
        const handlerFunction = (context, eventName, invocationParam = {}) =>
            handler({context, eventName, ...invocationParam, ...constructionParam});

        if (!EventHarness._staticEventListeners.has(staticTarget)) {
            EventHarness._staticEventListeners.set(staticTarget, {});
        }

        const eventListeners = EventHarness._staticEventListeners.get(staticTarget);

        if (eventListeners[eventName]) {
            return (eventListeners[eventName].push(handlerFunction)) - 1;
        } else {
            eventListeners[eventName] = [handlerFunction];
            return 0; // first element in the array
        }
    }

    /**
     *
     * @param {{}} staticTarget
     * @param {string} eventName
     * @param {Function} handler
     * @param {*=} constructionParam
     */
    addStaticListenerWrapper(staticTarget, eventName, handler, constructionParam = {}) {
        let wrappedHandles;

        if (this._wrappedStaticHandles.has(staticTarget)) {
            wrappedHandles = this._wrappedStaticHandles.get(staticTarget);
        } else {
            wrappedHandles = [];
            this._wrappedStaticHandles.set(staticTarget, wrappedHandles);
        }

        wrappedHandles.push({eventName, handle: EventHarness.staticAddListener(staticTarget, eventName, handler, constructionParam)});
    }

    /**
     *
     * @param {string} eventName
     * @param {number} handle
     * @returns undefined
     */
    removeListener(eventName, handle) {
        if (this._eventListeners[eventName]?.[handle]) {
            delete this._eventListeners[eventName][handle];
        }
        // no need for console warning if event listener already gone
        // as a model may have been destroyed legitimately without the awareness of everyone who holds listeners

        // else {
        //     console.info('trying to remove non-existent event handler, event = ' + eventName + ' handle = ' + handle);
        // }
        return undefined;
    }

    static staticRemoveListener(staticTarget, eventName, handle) {
        const eventListeners = EventHarness._staticEventListeners.get(staticTarget);

        if (eventListeners[eventName]?.[handle]) {
            delete eventListeners[eventName][handle];
        }
        // no need for console warning if event listener already gone
        // as a model may have been destroyed legitimately without the awareness of everyone who holds listeners
    }

    /**
     *
     */
    destructor() {
        this._eventListeners = {};

        for (let n in this._domEventListeners) {
            if (this._domEventListeners.hasOwnProperty(n) && this._domEventListeners[n]) {
                const listener = this._domEventListeners[n];
                listener.element.removeEventListener(listener.type, listener.handler, listener.options);
                this._domEventListeners[n] = null;
            }
        }

        this._domEventListeners = [];

        for (const [targetClass, eventDescriptors]  of this._wrappedStaticHandles) {
            for (let descriptor of eventDescriptors) {
                EventHarness.staticRemoveListener(targetClass, descriptor.eventName, descriptor.handle);
            }
        }
        this._wrappedStaticHandles.clear();
    }

    /**
     *
     * @param {string} eventName
     * @param {Object=} param optional parameter to pass on to listener
     * @return void
     */
    fireEvent (eventName, param) {
        if (this._eventListeners) {
            for (let f in this._eventListeners[eventName]) {
                try {
                    if (this._eventListeners[eventName][f](this, eventName, arguments[1]) === EventHarness.STOP_PROPAGATION) {
                        break;
                    }
                } catch (exception) {
                    console.error({'Exception thrown in event handler' : {eventName, exception}});
                    // noinspection JSIgnoredPromiseFromCall
                    Logger.logError(
                        `Exception thrown in event handler '${eventName}': ${exception.message}`,
                        '',
                        null,
                        null,
                        exception
                    );
                }
            }
        }
    }

    /**
     * @param {{}} staticTarget
     * @param {string} eventName
     * @param {Object=} param optional parameter to pass on to listener
     * @return void
     */
    static staticFireEvent (staticTarget, eventName, param) {
        const eventListeners = EventHarness._staticEventListeners.get(staticTarget);

        if (eventListeners) {
            for (let f in eventListeners[eventName]) {
                try {
                    if (eventListeners[eventName][f](this, eventName, arguments[2]) === EventHarness.STOP_PROPAGATION) {
                        break;
                    }
                } catch (exception) {
                    console.error({'Exception thrown in static event handler' : {eventName, exception}});
                    // noinspection JSIgnoredPromiseFromCall
                    Logger.logError(
                        `Exception thrown in static event handler '${eventName}': ${exception.message}`,
                        '',
                        null,
                        null,
                        exception
                    );
                }
            }
        }
    }
}

/**
 * Event fired when user requests a new blank survey
 *
 * @type {string}
 */
const APP_EVENT_ADD_SURVEY_USER_REQUEST = 'useraddsurveyrequest';

/**
 * Event fired when user requests a reset (local clearance) of all surveys
 * @type {string}
 */
const APP_EVENT_RESET_SURVEYS = 'userresetsurveys';

/**
 * Fired after App.currentSurvey has been set to a new blank survey
 * the survey will be accessible in App.currentSurvey
 *
 * @type {string}
 */
const APP_EVENT_NEW_SURVEY = 'newsurvey';

/**
 * Fired when a brand-new occurrence is added
 *
 * @type {string}
 */
const APP_EVENT_OCCURRENCE_ADDED = 'occurrenceadded';

/**
 * Fired when new user preferences are first restored from local storage
 *
 * @type {string}
 */
const APP_EVENT_OPTIONS_RESTORED = 'optionsrestored';

/**
 * Fired when a survey is retrieved from local storage
 * parameter is {survey : Survey}
 *
 * @type {string}
 */
const APP_EVENT_SURVEY_LOADED = 'surveyloaded';

/**
 * Fired when an occurrence is retrieved from local storage or newly initialised
 * parameter is {occurrence : Occurrence}
 *
 * @type {string}
 */
const APP_EVENT_OCCURRENCE_LOADED = 'occurrenceloaded';

const APP_EVENT_CURRENT_OCCURRENCE_CHANGED = 'currentoccurrencechanged';

/**
 * Fired when the selected current survey id is changed
 * parameter is {newSurvey : Survey|null}
 *
 * (this is not fired for modification of the survey content)
 *
 * @type {string}
 */
const APP_EVENT_CURRENT_SURVEY_CHANGED = 'currentsurveychanged';

/**
 * Fired if the surveys list might need updating (as a survey has been added, removed or changed)
 *
 * @type {string}
 */
const APP_EVENT_SURVEYS_CHANGED = 'surveyschanged';

/**
 * Fired after fully-successful sync-all
 * (or if sync-all resolved with nothing to send)
 *
 * @todo this is misleading as in fact is fired when all saved to indexeddb or to server
 *
 * @type {string}
 */
const APP_EVENT_ALL_SYNCED_TO_SERVER = 'allsyncedtoserver';

/**
 * fired if sync-all called, but one or more objects failed to be stored
 *
 * @type {string}
 */
const APP_EVENT_SYNC_ALL_FAILED = 'syncallfailed';

const APP_EVENT_USER_LOGIN = 'login';

const APP_EVENT_USER_LOGOUT = 'logout';

/**
 * Fired when watching of GPS has been granted following user request.
 *
 * @type {string}
 */
const APP_EVENT_WATCH_GPS_USER_REQUEST = 'watchgps';

/**
 * fired when GPS tracking should cease
 * parameter 'auto' set if this was triggered by a non-explicit user action
 *
 * @type {string}
 */
const APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST = 'cancelgpswatch';

/**
 * fired after the new controller activates
 *
 * @type {string}
 */
const APP_EVENT_CONTROLLER_CHANGED = 'controllerchanged';

/**
 * fired on Survey when one of its occurrences has been modified, added, deleted or reloaded
 *
 * no parameters
 *
 * @type {string}
 */
const SURVEY_EVENT_OCCURRENCES_CHANGED = 'occurrenceschanged';

/**
 *
 * @type {string}
 */
const SURVEY_EVENT_DELETED = 'surveydeleted';

/**
 * fired from Survey when the object's contents have been modified
 *
 * parameter is {surveyId : string}
 *
 * @type {string}
 */
const SURVEY_EVENT_MODIFIED = 'modified';

// AppController
// Abstract super-class for page controllers


/**
 * @typedef {import('bsbi-app-framework-view').Page} Page
 * @typedef {import('bsbi-app-framework-view').PatchedNavigo} PatchedNavigo
 */

class AppController extends EventHarness {

    /**
     *
     * @type {(null|string)}
     */
    route = null;

    /**
     *
     * @type {Page}
     */
    view;

    title = 'untitled';

    /**
     * integer controller handle
     * note that 0 is a valid handle
     *
     * @type {number}
     */
    handle;

    /**
     *
     * @type {App}
     */
    app;

    /**
     *
     * @type {function|null}
     */
    beforeRouteHandler = null;

    /**
     *
     * @type {function|null}
     */
    afterRouteHandler = null;

    // /**
    //  *
    //  * @type {function|null}
    //  */
    // leaveRouteHandler = null;

    /**
     *
     * @type {function|null}
     */
    alreadyRouteHandler = null;

    static _handleIndex = 0;

    /**
     * @type {function}
     */
    viewClass;

    static get nextHandle() {
        return AppController._handleIndex++;
    }

    isCurrent() {
        return this.app.currentControllerHandle === this.handle;
    }

    /**
     * Called when the app's current controller is about to change.
     * The controller may want to clear view listeners.
     */
    makeNotActive() {

    }

    /**
     * Called after the app's current controller has changed, to make this the current controller.
     */
    makeActive() {
        this.app.fireEvent(APP_EVENT_CONTROLLER_CHANGED);
    }

    /**
     * called from App.initialise() to trigger late-stage initialisation
     */
    initialise() {

        // remove this once all controllers shift to having on-demand rather than permanent views
        this.view?.initialise?.();
    }

    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */
    registerRoute(router) {
        if (null === this.route) {
            throw new Error(`No route set for '${this.title}' controller.`);
        }

        router.on(
            this.route,
            this.routeHandler.bind(this),
            {
                before : this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
                after : this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
                leave : this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
                already : this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
            }
        );
    }


    routeHandler(context, subcontext, rhs, queryParameters) {

    }

    leaveRouteHandler() {
        AppController.clearControlHiding();
    }

    /**
     * If a CSS body class has been set to hide controls due to open drop-boxes, then clear any hiding
     */
    static clearControlHiding() {
        //this is a low priority, so yield here

        const yieldCallback = () => {
            document.body.classList.remove('hide-controls');

            for (let element of document.querySelectorAll('.needs-bsbi-controls')) {
                if (!element.classList.contains('bsbi-controls')) {
                    element.classList.add('bsbi-controls');
                }
            }

            for (let element of document.querySelectorAll('.dropdown-focused')) {
                element.classList.remove('dropdown-focused');
            }
        };

        window.requestIdleCallback?.(yieldCallback, {timeout: 500}) ?? setTimeout(yieldCallback);
    }

    /**
     * If the controller currently allows a dynamic survey change to happen (triggered by GPS) then return true
     *
     * @returns {boolean}
     * @protected
     */
    _allowGPSTriggeredSurveyChanges() {
        return false;
    }
}

// StaticContentController

/**
 * @typedef {import('bsbi-app-framework-view').Page} Page
 */

class StaticContentController extends AppController {
    /**
     * @type {Array<string>|null}
     */
    _routes = [];

    /**
     *
     * @param {?Page} [view]
     * @param {Array<string>|null} [route]
     */
    constructor (view = null, route = null) {
        super();

        if (view) {
            this.view = view;
            this.view.controller = this;
        }

        if (route) {
            this._routes = route;
        }

        this.handle = AppController.nextHandle;
    }

    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */
    registerRoute(router) {

        for (const route of this._routes) {
            router.on(
                route,
                this.routeHandler.bind(this),
                {
                    before: this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
                    after: this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
                    leave: this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
                    already: this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
                }
            );
        }
    }

    routeHandler(context, subcontext, rhs, queryParameters) {
        // console.log("reached route handler for StaticContentController.js");
        this.app.saveRoute();

        this.app.currentControllerHandle = this.handle;
        this.view.display();
    }

    backHandler() {
        // backHandler may still be attached to other inactive controllers
        // need to check that only the current one takes effect
        if (this.isCurrent()) {

            // check that previous page is within app (i.e. that someone hasn't bizarrely navigated from outside, straight to this page)
            if (this.app.routeHistory.length >= 2) {
                this.app.routeHistory.length--;
                console.log('using standard back navigation');

                window.history.back();
            } else {
                console.log(`navigating back to home page '${this.app.homeRoute}'`);

                if (this.app.routeHistory.length > 0) {
                    this.app.routeHistory.length--;
                } else {
                    console.error(`In static content controller back handler route history length was ${this.app.routeHistory.length} before back navigation.`);
                }

                // pause so that replace rather than push history state
                this.app.router.pause();
                this.app.router.navigate(this.app.homeRoute).resume();
                this.app.router.resolve();
            }
        }
    }
}

class NotFoundError extends Error {
    constructor (message) {
        super(message);

        Error.captureStackTrace?.(this, NotFoundError); // see https://v8.dev/docs/stack-trace-api
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var localforage$1 = {exports: {}};

/*!
    localForage -- Offline Storage, Improved
    Version 1.10.0
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/

var hasRequiredLocalforage;

function requireLocalforage () {
	if (hasRequiredLocalforage) return localforage$1.exports;
	hasRequiredLocalforage = 1;
	(function (module, exports) {
		(function(f){{module.exports=f();}})(function(){return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof commonjsRequire=="function"&&commonjsRequire;if(!u&&a)return a(o,true);if(i)return i(o,true);var f=new Error("Cannot find module '"+o+"'");throw (f.code="MODULE_NOT_FOUND", f)}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r);}return n[o].exports}var i=typeof commonjsRequire=="function"&&commonjsRequire;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
		(function (global){
		var Mutation = global.MutationObserver || global.WebKitMutationObserver;

		var scheduleDrain;

		{
		  if (Mutation) {
		    var called = 0;
		    var observer = new Mutation(nextTick);
		    var element = global.document.createTextNode('');
		    observer.observe(element, {
		      characterData: true
		    });
		    scheduleDrain = function () {
		      element.data = (called = ++called % 2);
		    };
		  } else if (!global.setImmediate && typeof global.MessageChannel !== 'undefined') {
		    var channel = new global.MessageChannel();
		    channel.port1.onmessage = nextTick;
		    scheduleDrain = function () {
		      channel.port2.postMessage(0);
		    };
		  } else if ('document' in global && 'onreadystatechange' in global.document.createElement('script')) {
		    scheduleDrain = function () {

		      // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
		      // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
		      var scriptEl = global.document.createElement('script');
		      scriptEl.onreadystatechange = function () {
		        nextTick();

		        scriptEl.onreadystatechange = null;
		        scriptEl.parentNode.removeChild(scriptEl);
		        scriptEl = null;
		      };
		      global.document.documentElement.appendChild(scriptEl);
		    };
		  } else {
		    scheduleDrain = function () {
		      setTimeout(nextTick, 0);
		    };
		  }
		}

		var draining;
		var queue = [];
		//named nextTick for less confusing stack traces
		function nextTick() {
		  draining = true;
		  var i, oldQueue;
		  var len = queue.length;
		  while (len) {
		    oldQueue = queue;
		    queue = [];
		    i = -1;
		    while (++i < len) {
		      oldQueue[i]();
		    }
		    len = queue.length;
		  }
		  draining = false;
		}

		module.exports = immediate;
		function immediate(task) {
		  if (queue.push(task) === 1 && !draining) {
		    scheduleDrain();
		  }
		}

		}).call(this,typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		},{}],2:[function(_dereq_,module,exports){
		var immediate = _dereq_(1);

		/* istanbul ignore next */
		function INTERNAL() {}

		var handlers = {};

		var REJECTED = ['REJECTED'];
		var FULFILLED = ['FULFILLED'];
		var PENDING = ['PENDING'];

		module.exports = Promise;

		function Promise(resolver) {
		  if (typeof resolver !== 'function') {
		    throw new TypeError('resolver must be a function');
		  }
		  this.state = PENDING;
		  this.queue = [];
		  this.outcome = void 0;
		  if (resolver !== INTERNAL) {
		    safelyResolveThenable(this, resolver);
		  }
		}

		Promise.prototype["catch"] = function (onRejected) {
		  return this.then(null, onRejected);
		};
		Promise.prototype.then = function (onFulfilled, onRejected) {
		  if (typeof onFulfilled !== 'function' && this.state === FULFILLED ||
		    typeof onRejected !== 'function' && this.state === REJECTED) {
		    return this;
		  }
		  var promise = new this.constructor(INTERNAL);
		  if (this.state !== PENDING) {
		    var resolver = this.state === FULFILLED ? onFulfilled : onRejected;
		    unwrap(promise, resolver, this.outcome);
		  } else {
		    this.queue.push(new QueueItem(promise, onFulfilled, onRejected));
		  }

		  return promise;
		};
		function QueueItem(promise, onFulfilled, onRejected) {
		  this.promise = promise;
		  if (typeof onFulfilled === 'function') {
		    this.onFulfilled = onFulfilled;
		    this.callFulfilled = this.otherCallFulfilled;
		  }
		  if (typeof onRejected === 'function') {
		    this.onRejected = onRejected;
		    this.callRejected = this.otherCallRejected;
		  }
		}
		QueueItem.prototype.callFulfilled = function (value) {
		  handlers.resolve(this.promise, value);
		};
		QueueItem.prototype.otherCallFulfilled = function (value) {
		  unwrap(this.promise, this.onFulfilled, value);
		};
		QueueItem.prototype.callRejected = function (value) {
		  handlers.reject(this.promise, value);
		};
		QueueItem.prototype.otherCallRejected = function (value) {
		  unwrap(this.promise, this.onRejected, value);
		};

		function unwrap(promise, func, value) {
		  immediate(function () {
		    var returnValue;
		    try {
		      returnValue = func(value);
		    } catch (e) {
		      return handlers.reject(promise, e);
		    }
		    if (returnValue === promise) {
		      handlers.reject(promise, new TypeError('Cannot resolve promise with itself'));
		    } else {
		      handlers.resolve(promise, returnValue);
		    }
		  });
		}

		handlers.resolve = function (self, value) {
		  var result = tryCatch(getThen, value);
		  if (result.status === 'error') {
		    return handlers.reject(self, result.value);
		  }
		  var thenable = result.value;

		  if (thenable) {
		    safelyResolveThenable(self, thenable);
		  } else {
		    self.state = FULFILLED;
		    self.outcome = value;
		    var i = -1;
		    var len = self.queue.length;
		    while (++i < len) {
		      self.queue[i].callFulfilled(value);
		    }
		  }
		  return self;
		};
		handlers.reject = function (self, error) {
		  self.state = REJECTED;
		  self.outcome = error;
		  var i = -1;
		  var len = self.queue.length;
		  while (++i < len) {
		    self.queue[i].callRejected(error);
		  }
		  return self;
		};

		function getThen(obj) {
		  // Make sure we only access the accessor once as required by the spec
		  var then = obj && obj.then;
		  if (obj && (typeof obj === 'object' || typeof obj === 'function') && typeof then === 'function') {
		    return function appyThen() {
		      then.apply(obj, arguments);
		    };
		  }
		}

		function safelyResolveThenable(self, thenable) {
		  // Either fulfill, reject or reject with error
		  var called = false;
		  function onError(value) {
		    if (called) {
		      return;
		    }
		    called = true;
		    handlers.reject(self, value);
		  }

		  function onSuccess(value) {
		    if (called) {
		      return;
		    }
		    called = true;
		    handlers.resolve(self, value);
		  }

		  function tryToUnwrap() {
		    thenable(onSuccess, onError);
		  }

		  var result = tryCatch(tryToUnwrap);
		  if (result.status === 'error') {
		    onError(result.value);
		  }
		}

		function tryCatch(func, value) {
		  var out = {};
		  try {
		    out.value = func(value);
		    out.status = 'success';
		  } catch (e) {
		    out.status = 'error';
		    out.value = e;
		  }
		  return out;
		}

		Promise.resolve = resolve;
		function resolve(value) {
		  if (value instanceof this) {
		    return value;
		  }
		  return handlers.resolve(new this(INTERNAL), value);
		}

		Promise.reject = reject;
		function reject(reason) {
		  var promise = new this(INTERNAL);
		  return handlers.reject(promise, reason);
		}

		Promise.all = all;
		function all(iterable) {
		  var self = this;
		  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
		    return this.reject(new TypeError('must be an array'));
		  }

		  var len = iterable.length;
		  var called = false;
		  if (!len) {
		    return this.resolve([]);
		  }

		  var values = new Array(len);
		  var resolved = 0;
		  var i = -1;
		  var promise = new this(INTERNAL);

		  while (++i < len) {
		    allResolver(iterable[i], i);
		  }
		  return promise;
		  function allResolver(value, i) {
		    self.resolve(value).then(resolveFromAll, function (error) {
		      if (!called) {
		        called = true;
		        handlers.reject(promise, error);
		      }
		    });
		    function resolveFromAll(outValue) {
		      values[i] = outValue;
		      if (++resolved === len && !called) {
		        called = true;
		        handlers.resolve(promise, values);
		      }
		    }
		  }
		}

		Promise.race = race;
		function race(iterable) {
		  var self = this;
		  if (Object.prototype.toString.call(iterable) !== '[object Array]') {
		    return this.reject(new TypeError('must be an array'));
		  }

		  var len = iterable.length;
		  var called = false;
		  if (!len) {
		    return this.resolve([]);
		  }

		  var i = -1;
		  var promise = new this(INTERNAL);

		  while (++i < len) {
		    resolver(iterable[i]);
		  }
		  return promise;
		  function resolver(value) {
		    self.resolve(value).then(function (response) {
		      if (!called) {
		        called = true;
		        handlers.resolve(promise, response);
		      }
		    }, function (error) {
		      if (!called) {
		        called = true;
		        handlers.reject(promise, error);
		      }
		    });
		  }
		}

		},{"1":1}],3:[function(_dereq_,module,exports){
		(function (global){
		if (typeof global.Promise !== 'function') {
		  global.Promise = _dereq_(2);
		}

		}).call(this,typeof commonjsGlobal !== "undefined" ? commonjsGlobal : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
		},{"2":2}],4:[function(_dereq_,module,exports){

		var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

		function getIDB() {
		    /* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB */
		    try {
		        if (typeof indexedDB !== 'undefined') {
		            return indexedDB;
		        }
		        if (typeof webkitIndexedDB !== 'undefined') {
		            return webkitIndexedDB;
		        }
		        if (typeof mozIndexedDB !== 'undefined') {
		            return mozIndexedDB;
		        }
		        if (typeof OIndexedDB !== 'undefined') {
		            return OIndexedDB;
		        }
		        if (typeof msIndexedDB !== 'undefined') {
		            return msIndexedDB;
		        }
		    } catch (e) {
		        return;
		    }
		}

		var idb = getIDB();

		function isIndexedDBValid() {
		    try {
		        // Initialize IndexedDB; fall back to vendor-prefixed versions
		        // if needed.
		        if (!idb || !idb.open) {
		            return false;
		        }
		        // We mimic PouchDB here;
		        //
		        // We test for openDatabase because IE Mobile identifies itself
		        // as Safari. Oh the lulz...
		        var isSafari = typeof openDatabase !== 'undefined' && /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent) && !/BlackBerry/.test(navigator.platform);

		        var hasFetch = typeof fetch === 'function' && fetch.toString().indexOf('[native code') !== -1;

		        // Safari <10.1 does not meet our requirements for IDB support
		        // (see: https://github.com/pouchdb/pouchdb/issues/5572).
		        // Safari 10.1 shipped with fetch, we can use that to detect it.
		        // Note: this creates issues with `window.fetch` polyfills and
		        // overrides; see:
		        // https://github.com/localForage/localForage/issues/856
		        return (!isSafari || hasFetch) && typeof indexedDB !== 'undefined' &&
		        // some outdated implementations of IDB that appear on Samsung
		        // and HTC Android devices <4.4 are missing IDBKeyRange
		        // See: https://github.com/mozilla/localForage/issues/128
		        // See: https://github.com/mozilla/localForage/issues/272
		        typeof IDBKeyRange !== 'undefined';
		    } catch (e) {
		        return false;
		    }
		}

		// Abstracts constructing a Blob object, so it also works in older
		// browsers that don't support the native Blob constructor. (i.e.
		// old QtWebKit versions, at least).
		// Abstracts constructing a Blob object, so it also works in older
		// browsers that don't support the native Blob constructor. (i.e.
		// old QtWebKit versions, at least).
		function createBlob(parts, properties) {
		    /* global BlobBuilder,MSBlobBuilder,MozBlobBuilder,WebKitBlobBuilder */
		    parts = parts || [];
		    properties = properties || {};
		    try {
		        return new Blob(parts, properties);
		    } catch (e) {
		        if (e.name !== 'TypeError') {
		            throw e;
		        }
		        var Builder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : WebKitBlobBuilder;
		        var builder = new Builder();
		        for (var i = 0; i < parts.length; i += 1) {
		            builder.append(parts[i]);
		        }
		        return builder.getBlob(properties.type);
		    }
		}

		// This is CommonJS because lie is an external dependency, so Rollup
		// can just ignore it.
		if (typeof Promise === 'undefined') {
		    // In the "nopromises" build this will just throw if you don't have
		    // a global promise object, but it would throw anyway later.
		    _dereq_(3);
		}
		var Promise$1 = Promise;

		function executeCallback(promise, callback) {
		    if (callback) {
		        promise.then(function (result) {
		            callback(null, result);
		        }, function (error) {
		            callback(error);
		        });
		    }
		}

		function executeTwoCallbacks(promise, callback, errorCallback) {
		    if (typeof callback === 'function') {
		        promise.then(callback);
		    }

		    if (typeof errorCallback === 'function') {
		        promise["catch"](errorCallback);
		    }
		}

		function normalizeKey(key) {
		    // Cast the key to a string, as that's all we can set as a key.
		    if (typeof key !== 'string') {
		        console.warn(key + ' used as a key, but it is not a string.');
		        key = String(key);
		    }

		    return key;
		}

		function getCallback() {
		    if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
		        return arguments[arguments.length - 1];
		    }
		}

		// Some code originally from async_storage.js in
		// [Gaia](https://github.com/mozilla-b2g/gaia).

		var DETECT_BLOB_SUPPORT_STORE = 'local-forage-detect-blob-support';
		var supportsBlobs = void 0;
		var dbContexts = {};
		var toString = Object.prototype.toString;

		// Transaction Modes
		var READ_ONLY = 'readonly';
		var READ_WRITE = 'readwrite';

		// Transform a binary string to an array buffer, because otherwise
		// weird stuff happens when you try to work with the binary string directly.
		// It is known.
		// From http://stackoverflow.com/questions/14967647/ (continues on next line)
		// encode-decode-image-with-base64-breaks-image (2013-04-21)
		function _binStringToArrayBuffer(bin) {
		    var length = bin.length;
		    var buf = new ArrayBuffer(length);
		    var arr = new Uint8Array(buf);
		    for (var i = 0; i < length; i++) {
		        arr[i] = bin.charCodeAt(i);
		    }
		    return buf;
		}

		//
		// Blobs are not supported in all versions of IndexedDB, notably
		// Chrome <37 and Android <5. In those versions, storing a blob will throw.
		//
		// Various other blob bugs exist in Chrome v37-42 (inclusive).
		// Detecting them is expensive and confusing to users, and Chrome 37-42
		// is at very low usage worldwide, so we do a hacky userAgent check instead.
		//
		// content-type bug: https://code.google.com/p/chromium/issues/detail?id=408120
		// 404 bug: https://code.google.com/p/chromium/issues/detail?id=447916
		// FileReader bug: https://code.google.com/p/chromium/issues/detail?id=447836
		//
		// Code borrowed from PouchDB. See:
		// https://github.com/pouchdb/pouchdb/blob/master/packages/node_modules/pouchdb-adapter-idb/src/blobSupport.js
		//
		function _checkBlobSupportWithoutCaching(idb) {
		    return new Promise$1(function (resolve) {
		        var txn = idb.transaction(DETECT_BLOB_SUPPORT_STORE, READ_WRITE);
		        var blob = createBlob(['']);
		        txn.objectStore(DETECT_BLOB_SUPPORT_STORE).put(blob, 'key');

		        txn.onabort = function (e) {
		            // If the transaction aborts now its due to not being able to
		            // write to the database, likely due to the disk being full
		            e.preventDefault();
		            e.stopPropagation();
		            resolve(false);
		        };

		        txn.oncomplete = function () {
		            var matchedChrome = navigator.userAgent.match(/Chrome\/(\d+)/);
		            var matchedEdge = navigator.userAgent.match(/Edge\//);
		            // MS Edge pretends to be Chrome 42:
		            // https://msdn.microsoft.com/en-us/library/hh869301%28v=vs.85%29.aspx
		            resolve(matchedEdge || !matchedChrome || parseInt(matchedChrome[1], 10) >= 43);
		        };
		    })["catch"](function () {
		        return false; // error, so assume unsupported
		    });
		}

		function _checkBlobSupport(idb) {
		    if (typeof supportsBlobs === 'boolean') {
		        return Promise$1.resolve(supportsBlobs);
		    }
		    return _checkBlobSupportWithoutCaching(idb).then(function (value) {
		        supportsBlobs = value;
		        return supportsBlobs;
		    });
		}

		function _deferReadiness(dbInfo) {
		    var dbContext = dbContexts[dbInfo.name];

		    // Create a deferred object representing the current database operation.
		    var deferredOperation = {};

		    deferredOperation.promise = new Promise$1(function (resolve, reject) {
		        deferredOperation.resolve = resolve;
		        deferredOperation.reject = reject;
		    });

		    // Enqueue the deferred operation.
		    dbContext.deferredOperations.push(deferredOperation);

		    // Chain its promise to the database readiness.
		    if (!dbContext.dbReady) {
		        dbContext.dbReady = deferredOperation.promise;
		    } else {
		        dbContext.dbReady = dbContext.dbReady.then(function () {
		            return deferredOperation.promise;
		        });
		    }
		}

		function _advanceReadiness(dbInfo) {
		    var dbContext = dbContexts[dbInfo.name];

		    // Dequeue a deferred operation.
		    var deferredOperation = dbContext.deferredOperations.pop();

		    // Resolve its promise (which is part of the database readiness
		    // chain of promises).
		    if (deferredOperation) {
		        deferredOperation.resolve();
		        return deferredOperation.promise;
		    }
		}

		function _rejectReadiness(dbInfo, err) {
		    var dbContext = dbContexts[dbInfo.name];

		    // Dequeue a deferred operation.
		    var deferredOperation = dbContext.deferredOperations.pop();

		    // Reject its promise (which is part of the database readiness
		    // chain of promises).
		    if (deferredOperation) {
		        deferredOperation.reject(err);
		        return deferredOperation.promise;
		    }
		}

		function _getConnection(dbInfo, upgradeNeeded) {
		    return new Promise$1(function (resolve, reject) {
		        dbContexts[dbInfo.name] = dbContexts[dbInfo.name] || createDbContext();

		        if (dbInfo.db) {
		            if (upgradeNeeded) {
		                _deferReadiness(dbInfo);
		                dbInfo.db.close();
		            } else {
		                return resolve(dbInfo.db);
		            }
		        }

		        var dbArgs = [dbInfo.name];

		        if (upgradeNeeded) {
		            dbArgs.push(dbInfo.version);
		        }

		        var openreq = idb.open.apply(idb, dbArgs);

		        if (upgradeNeeded) {
		            openreq.onupgradeneeded = function (e) {
		                var db = openreq.result;
		                try {
		                    db.createObjectStore(dbInfo.storeName);
		                    if (e.oldVersion <= 1) {
		                        // Added when support for blob shims was added
		                        db.createObjectStore(DETECT_BLOB_SUPPORT_STORE);
		                    }
		                } catch (ex) {
		                    if (ex.name === 'ConstraintError') {
		                        console.warn('The database "' + dbInfo.name + '"' + ' has been upgraded from version ' + e.oldVersion + ' to version ' + e.newVersion + ', but the storage "' + dbInfo.storeName + '" already exists.');
		                    } else {
		                        throw ex;
		                    }
		                }
		            };
		        }

		        openreq.onerror = function (e) {
		            e.preventDefault();
		            reject(openreq.error);
		        };

		        openreq.onsuccess = function () {
		            var db = openreq.result;
		            db.onversionchange = function (e) {
		                // Triggered when the database is modified (e.g. adding an objectStore) or
		                // deleted (even when initiated by other sessions in different tabs).
		                // Closing the connection here prevents those operations from being blocked.
		                // If the database is accessed again later by this instance, the connection
		                // will be reopened or the database recreated as needed.
		                e.target.close();
		            };
		            resolve(db);
		            _advanceReadiness(dbInfo);
		        };
		    });
		}

		function _getOriginalConnection(dbInfo) {
		    return _getConnection(dbInfo, false);
		}

		function _getUpgradedConnection(dbInfo) {
		    return _getConnection(dbInfo, true);
		}

		function _isUpgradeNeeded(dbInfo, defaultVersion) {
		    if (!dbInfo.db) {
		        return true;
		    }

		    var isNewStore = !dbInfo.db.objectStoreNames.contains(dbInfo.storeName);
		    var isDowngrade = dbInfo.version < dbInfo.db.version;
		    var isUpgrade = dbInfo.version > dbInfo.db.version;

		    if (isDowngrade) {
		        // If the version is not the default one
		        // then warn for impossible downgrade.
		        if (dbInfo.version !== defaultVersion) {
		            console.warn('The database "' + dbInfo.name + '"' + " can't be downgraded from version " + dbInfo.db.version + ' to version ' + dbInfo.version + '.');
		        }
		        // Align the versions to prevent errors.
		        dbInfo.version = dbInfo.db.version;
		    }

		    if (isUpgrade || isNewStore) {
		        // If the store is new then increment the version (if needed).
		        // This will trigger an "upgradeneeded" event which is required
		        // for creating a store.
		        if (isNewStore) {
		            var incVersion = dbInfo.db.version + 1;
		            if (incVersion > dbInfo.version) {
		                dbInfo.version = incVersion;
		            }
		        }

		        return true;
		    }

		    return false;
		}

		// encode a blob for indexeddb engines that don't support blobs
		function _encodeBlob(blob) {
		    return new Promise$1(function (resolve, reject) {
		        var reader = new FileReader();
		        reader.onerror = reject;
		        reader.onloadend = function (e) {
		            var base64 = btoa(e.target.result || '');
		            resolve({
		                __local_forage_encoded_blob: true,
		                data: base64,
		                type: blob.type
		            });
		        };
		        reader.readAsBinaryString(blob);
		    });
		}

		// decode an encoded blob
		function _decodeBlob(encodedBlob) {
		    var arrayBuff = _binStringToArrayBuffer(atob(encodedBlob.data));
		    return createBlob([arrayBuff], { type: encodedBlob.type });
		}

		// is this one of our fancy encoded blobs?
		function _isEncodedBlob(value) {
		    return value && value.__local_forage_encoded_blob;
		}

		// Specialize the default `ready()` function by making it dependent
		// on the current database operations. Thus, the driver will be actually
		// ready when it's been initialized (default) *and* there are no pending
		// operations on the database (initiated by some other instances).
		function _fullyReady(callback) {
		    var self = this;

		    var promise = self._initReady().then(function () {
		        var dbContext = dbContexts[self._dbInfo.name];

		        if (dbContext && dbContext.dbReady) {
		            return dbContext.dbReady;
		        }
		    });

		    executeTwoCallbacks(promise, callback, callback);
		    return promise;
		}

		// Try to establish a new db connection to replace the
		// current one which is broken (i.e. experiencing
		// InvalidStateError while creating a transaction).
		function _tryReconnect(dbInfo) {
		    _deferReadiness(dbInfo);

		    var dbContext = dbContexts[dbInfo.name];
		    var forages = dbContext.forages;

		    for (var i = 0; i < forages.length; i++) {
		        var forage = forages[i];
		        if (forage._dbInfo.db) {
		            forage._dbInfo.db.close();
		            forage._dbInfo.db = null;
		        }
		    }
		    dbInfo.db = null;

		    return _getOriginalConnection(dbInfo).then(function (db) {
		        dbInfo.db = db;
		        if (_isUpgradeNeeded(dbInfo)) {
		            // Reopen the database for upgrading.
		            return _getUpgradedConnection(dbInfo);
		        }
		        return db;
		    }).then(function (db) {
		        // store the latest db reference
		        // in case the db was upgraded
		        dbInfo.db = dbContext.db = db;
		        for (var i = 0; i < forages.length; i++) {
		            forages[i]._dbInfo.db = db;
		        }
		    })["catch"](function (err) {
		        _rejectReadiness(dbInfo, err);
		        throw err;
		    });
		}

		// FF doesn't like Promises (micro-tasks) and IDDB store operations,
		// so we have to do it with callbacks
		function createTransaction(dbInfo, mode, callback, retries) {
		    if (retries === undefined) {
		        retries = 1;
		    }

		    try {
		        var tx = dbInfo.db.transaction(dbInfo.storeName, mode);
		        callback(null, tx);
		    } catch (err) {
		        if (retries > 0 && (!dbInfo.db || err.name === 'InvalidStateError' || err.name === 'NotFoundError')) {
		            return Promise$1.resolve().then(function () {
		                if (!dbInfo.db || err.name === 'NotFoundError' && !dbInfo.db.objectStoreNames.contains(dbInfo.storeName) && dbInfo.version <= dbInfo.db.version) {
		                    // increase the db version, to create the new ObjectStore
		                    if (dbInfo.db) {
		                        dbInfo.version = dbInfo.db.version + 1;
		                    }
		                    // Reopen the database for upgrading.
		                    return _getUpgradedConnection(dbInfo);
		                }
		            }).then(function () {
		                return _tryReconnect(dbInfo).then(function () {
		                    createTransaction(dbInfo, mode, callback, retries - 1);
		                });
		            })["catch"](callback);
		        }

		        callback(err);
		    }
		}

		function createDbContext() {
		    return {
		        // Running localForages sharing a database.
		        forages: [],
		        // Shared database.
		        db: null,
		        // Database readiness (promise).
		        dbReady: null,
		        // Deferred operations on the database.
		        deferredOperations: []
		    };
		}

		// Open the IndexedDB database (automatically creates one if one didn't
		// previously exist), using any options set in the config.
		function _initStorage(options) {
		    var self = this;
		    var dbInfo = {
		        db: null
		    };

		    if (options) {
		        for (var i in options) {
		            dbInfo[i] = options[i];
		        }
		    }

		    // Get the current context of the database;
		    var dbContext = dbContexts[dbInfo.name];

		    // ...or create a new context.
		    if (!dbContext) {
		        dbContext = createDbContext();
		        // Register the new context in the global container.
		        dbContexts[dbInfo.name] = dbContext;
		    }

		    // Register itself as a running localForage in the current context.
		    dbContext.forages.push(self);

		    // Replace the default `ready()` function with the specialized one.
		    if (!self._initReady) {
		        self._initReady = self.ready;
		        self.ready = _fullyReady;
		    }

		    // Create an array of initialization states of the related localForages.
		    var initPromises = [];

		    function ignoreErrors() {
		        // Don't handle errors here,
		        // just makes sure related localForages aren't pending.
		        return Promise$1.resolve();
		    }

		    for (var j = 0; j < dbContext.forages.length; j++) {
		        var forage = dbContext.forages[j];
		        if (forage !== self) {
		            // Don't wait for itself...
		            initPromises.push(forage._initReady()["catch"](ignoreErrors));
		        }
		    }

		    // Take a snapshot of the related localForages.
		    var forages = dbContext.forages.slice(0);

		    // Initialize the connection process only when
		    // all the related localForages aren't pending.
		    return Promise$1.all(initPromises).then(function () {
		        dbInfo.db = dbContext.db;
		        // Get the connection or open a new one without upgrade.
		        return _getOriginalConnection(dbInfo);
		    }).then(function (db) {
		        dbInfo.db = db;
		        if (_isUpgradeNeeded(dbInfo, self._defaultConfig.version)) {
		            // Reopen the database for upgrading.
		            return _getUpgradedConnection(dbInfo);
		        }
		        return db;
		    }).then(function (db) {
		        dbInfo.db = dbContext.db = db;
		        self._dbInfo = dbInfo;
		        // Share the final connection amongst related localForages.
		        for (var k = 0; k < forages.length; k++) {
		            var forage = forages[k];
		            if (forage !== self) {
		                // Self is already up-to-date.
		                forage._dbInfo.db = dbInfo.db;
		                forage._dbInfo.version = dbInfo.version;
		            }
		        }
		    });
		}

		function getItem(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.get(key);

		                    req.onsuccess = function () {
		                        var value = req.result;
		                        if (value === undefined) {
		                            value = null;
		                        }
		                        if (_isEncodedBlob(value)) {
		                            value = _decodeBlob(value);
		                        }
		                        resolve(value);
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Iterate over all items stored in database.
		function iterate(iterator, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.openCursor();
		                    var iterationNumber = 1;

		                    req.onsuccess = function () {
		                        var cursor = req.result;

		                        if (cursor) {
		                            var value = cursor.value;
		                            if (_isEncodedBlob(value)) {
		                                value = _decodeBlob(value);
		                            }
		                            var result = iterator(value, cursor.key, iterationNumber++);

		                            // when the iterator callback returns any
		                            // (non-`undefined`) value, then we stop
		                            // the iteration immediately
		                            if (result !== void 0) {
		                                resolve(result);
		                            } else {
		                                cursor["continue"]();
		                            }
		                        } else {
		                            resolve();
		                        }
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);

		    return promise;
		}

		function setItem(key, value, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        var dbInfo;
		        self.ready().then(function () {
		            dbInfo = self._dbInfo;
		            if (toString.call(value) === '[object Blob]') {
		                return _checkBlobSupport(dbInfo.db).then(function (blobSupport) {
		                    if (blobSupport) {
		                        return value;
		                    }
		                    return _encodeBlob(value);
		                });
		            }
		            return value;
		        }).then(function (value) {
		            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);

		                    // The reason we don't _save_ null is because IE 10 does
		                    // not support saving the `null` type in IndexedDB. How
		                    // ironic, given the bug below!
		                    // See: https://github.com/mozilla/localForage/issues/161
		                    if (value === null) {
		                        value = undefined;
		                    }

		                    var req = store.put(value, key);

		                    transaction.oncomplete = function () {
		                        // Cast to undefined so the value passed to
		                        // callback/promise is the same as what one would get out
		                        // of `getItem()` later. This leads to some weirdness
		                        // (setItem('foo', undefined) will return `null`), but
		                        // it's not my fault localStorage is our baseline and that
		                        // it's weird.
		                        if (value === undefined) {
		                            value = null;
		                        }

		                        resolve(value);
		                    };
		                    transaction.onabort = transaction.onerror = function () {
		                        var err = req.error ? req.error : req.transaction.error;
		                        reject(err);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function removeItem(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    // We use a Grunt task to make this safe for IE and some
		                    // versions of Android (including those used by Cordova).
		                    // Normally IE won't like `.delete()` and will insist on
		                    // using `['delete']()`, but we have a build step that
		                    // fixes this for us now.
		                    var req = store["delete"](key);
		                    transaction.oncomplete = function () {
		                        resolve();
		                    };

		                    transaction.onerror = function () {
		                        reject(req.error);
		                    };

		                    // The request will be also be aborted if we've exceeded our storage
		                    // space.
		                    transaction.onabort = function () {
		                        var err = req.error ? req.error : req.transaction.error;
		                        reject(err);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function clear(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_WRITE, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.clear();

		                    transaction.oncomplete = function () {
		                        resolve();
		                    };

		                    transaction.onabort = transaction.onerror = function () {
		                        var err = req.error ? req.error : req.transaction.error;
		                        reject(err);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function length(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.count();

		                    req.onsuccess = function () {
		                        resolve(req.result);
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function key(n, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        if (n < 0) {
		            resolve(null);

		            return;
		        }

		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var advanced = false;
		                    var req = store.openKeyCursor();

		                    req.onsuccess = function () {
		                        var cursor = req.result;
		                        if (!cursor) {
		                            // this means there weren't enough keys
		                            resolve(null);

		                            return;
		                        }

		                        if (n === 0) {
		                            // We have the first key, return it if that's what they
		                            // wanted.
		                            resolve(cursor.key);
		                        } else {
		                            if (!advanced) {
		                                // Otherwise, ask the cursor to skip ahead n
		                                // records.
		                                advanced = true;
		                                cursor.advance(n);
		                            } else {
		                                // When we get here, we've got the nth key.
		                                resolve(cursor.key);
		                            }
		                        }
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function keys(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            createTransaction(self._dbInfo, READ_ONLY, function (err, transaction) {
		                if (err) {
		                    return reject(err);
		                }

		                try {
		                    var store = transaction.objectStore(self._dbInfo.storeName);
		                    var req = store.openKeyCursor();
		                    var keys = [];

		                    req.onsuccess = function () {
		                        var cursor = req.result;

		                        if (!cursor) {
		                            resolve(keys);
		                            return;
		                        }

		                        keys.push(cursor.key);
		                        cursor["continue"]();
		                    };

		                    req.onerror = function () {
		                        reject(req.error);
		                    };
		                } catch (e) {
		                    reject(e);
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function dropInstance(options, callback) {
		    callback = getCallback.apply(this, arguments);

		    var currentConfig = this.config();
		    options = typeof options !== 'function' && options || {};
		    if (!options.name) {
		        options.name = options.name || currentConfig.name;
		        options.storeName = options.storeName || currentConfig.storeName;
		    }

		    var self = this;
		    var promise;
		    if (!options.name) {
		        promise = Promise$1.reject('Invalid arguments');
		    } else {
		        var isCurrentDb = options.name === currentConfig.name && self._dbInfo.db;

		        var dbPromise = isCurrentDb ? Promise$1.resolve(self._dbInfo.db) : _getOriginalConnection(options).then(function (db) {
		            var dbContext = dbContexts[options.name];
		            var forages = dbContext.forages;
		            dbContext.db = db;
		            for (var i = 0; i < forages.length; i++) {
		                forages[i]._dbInfo.db = db;
		            }
		            return db;
		        });

		        if (!options.storeName) {
		            promise = dbPromise.then(function (db) {
		                _deferReadiness(options);

		                var dbContext = dbContexts[options.name];
		                var forages = dbContext.forages;

		                db.close();
		                for (var i = 0; i < forages.length; i++) {
		                    var forage = forages[i];
		                    forage._dbInfo.db = null;
		                }

		                var dropDBPromise = new Promise$1(function (resolve, reject) {
		                    var req = idb.deleteDatabase(options.name);

		                    req.onerror = function () {
		                        var db = req.result;
		                        if (db) {
		                            db.close();
		                        }
		                        reject(req.error);
		                    };

		                    req.onblocked = function () {
		                        // Closing all open connections in onversionchange handler should prevent this situation, but if
		                        // we do get here, it just means the request remains pending - eventually it will succeed or error
		                        console.warn('dropInstance blocked for database "' + options.name + '" until all open connections are closed');
		                    };

		                    req.onsuccess = function () {
		                        var db = req.result;
		                        if (db) {
		                            db.close();
		                        }
		                        resolve(db);
		                    };
		                });

		                return dropDBPromise.then(function (db) {
		                    dbContext.db = db;
		                    for (var i = 0; i < forages.length; i++) {
		                        var _forage = forages[i];
		                        _advanceReadiness(_forage._dbInfo);
		                    }
		                })["catch"](function (err) {
		                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
		                    throw err;
		                });
		            });
		        } else {
		            promise = dbPromise.then(function (db) {
		                if (!db.objectStoreNames.contains(options.storeName)) {
		                    return;
		                }

		                var newVersion = db.version + 1;

		                _deferReadiness(options);

		                var dbContext = dbContexts[options.name];
		                var forages = dbContext.forages;

		                db.close();
		                for (var i = 0; i < forages.length; i++) {
		                    var forage = forages[i];
		                    forage._dbInfo.db = null;
		                    forage._dbInfo.version = newVersion;
		                }

		                var dropObjectPromise = new Promise$1(function (resolve, reject) {
		                    var req = idb.open(options.name, newVersion);

		                    req.onerror = function (err) {
		                        var db = req.result;
		                        db.close();
		                        reject(err);
		                    };

		                    req.onupgradeneeded = function () {
		                        var db = req.result;
		                        db.deleteObjectStore(options.storeName);
		                    };

		                    req.onsuccess = function () {
		                        var db = req.result;
		                        db.close();
		                        resolve(db);
		                    };
		                });

		                return dropObjectPromise.then(function (db) {
		                    dbContext.db = db;
		                    for (var j = 0; j < forages.length; j++) {
		                        var _forage2 = forages[j];
		                        _forage2._dbInfo.db = db;
		                        _advanceReadiness(_forage2._dbInfo);
		                    }
		                })["catch"](function (err) {
		                    (_rejectReadiness(options, err) || Promise$1.resolve())["catch"](function () {});
		                    throw err;
		                });
		            });
		        }
		    }

		    executeCallback(promise, callback);
		    return promise;
		}

		var asyncStorage = {
		    _driver: 'asyncStorage',
		    _initStorage: _initStorage,
		    _support: isIndexedDBValid(),
		    iterate: iterate,
		    getItem: getItem,
		    setItem: setItem,
		    removeItem: removeItem,
		    clear: clear,
		    length: length,
		    key: key,
		    keys: keys,
		    dropInstance: dropInstance
		};

		function isWebSQLValid() {
		    return typeof openDatabase === 'function';
		}

		// Sadly, the best way to save binary data in WebSQL/localStorage is serializing
		// it to Base64, so this is how we store it to prevent very strange errors with less
		// verbose ways of binary <-> string data storage.
		var BASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

		var BLOB_TYPE_PREFIX = '~~local_forage_type~';
		var BLOB_TYPE_PREFIX_REGEX = /^~~local_forage_type~([^~]+)~/;

		var SERIALIZED_MARKER = '__lfsc__:';
		var SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER.length;

		// OMG the serializations!
		var TYPE_ARRAYBUFFER = 'arbf';
		var TYPE_BLOB = 'blob';
		var TYPE_INT8ARRAY = 'si08';
		var TYPE_UINT8ARRAY = 'ui08';
		var TYPE_UINT8CLAMPEDARRAY = 'uic8';
		var TYPE_INT16ARRAY = 'si16';
		var TYPE_INT32ARRAY = 'si32';
		var TYPE_UINT16ARRAY = 'ur16';
		var TYPE_UINT32ARRAY = 'ui32';
		var TYPE_FLOAT32ARRAY = 'fl32';
		var TYPE_FLOAT64ARRAY = 'fl64';
		var TYPE_SERIALIZED_MARKER_LENGTH = SERIALIZED_MARKER_LENGTH + TYPE_ARRAYBUFFER.length;

		var toString$1 = Object.prototype.toString;

		function stringToBuffer(serializedString) {
		    // Fill the string into a ArrayBuffer.
		    var bufferLength = serializedString.length * 0.75;
		    var len = serializedString.length;
		    var i;
		    var p = 0;
		    var encoded1, encoded2, encoded3, encoded4;

		    if (serializedString[serializedString.length - 1] === '=') {
		        bufferLength--;
		        if (serializedString[serializedString.length - 2] === '=') {
		            bufferLength--;
		        }
		    }

		    var buffer = new ArrayBuffer(bufferLength);
		    var bytes = new Uint8Array(buffer);

		    for (i = 0; i < len; i += 4) {
		        encoded1 = BASE_CHARS.indexOf(serializedString[i]);
		        encoded2 = BASE_CHARS.indexOf(serializedString[i + 1]);
		        encoded3 = BASE_CHARS.indexOf(serializedString[i + 2]);
		        encoded4 = BASE_CHARS.indexOf(serializedString[i + 3]);

		        /*jslint bitwise: true */
		        bytes[p++] = encoded1 << 2 | encoded2 >> 4;
		        bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
		        bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
		    }
		    return buffer;
		}

		// Converts a buffer to a string to store, serialized, in the backend
		// storage library.
		function bufferToString(buffer) {
		    // base64-arraybuffer
		    var bytes = new Uint8Array(buffer);
		    var base64String = '';
		    var i;

		    for (i = 0; i < bytes.length; i += 3) {
		        /*jslint bitwise: true */
		        base64String += BASE_CHARS[bytes[i] >> 2];
		        base64String += BASE_CHARS[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];
		        base64String += BASE_CHARS[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];
		        base64String += BASE_CHARS[bytes[i + 2] & 63];
		    }

		    if (bytes.length % 3 === 2) {
		        base64String = base64String.substring(0, base64String.length - 1) + '=';
		    } else if (bytes.length % 3 === 1) {
		        base64String = base64String.substring(0, base64String.length - 2) + '==';
		    }

		    return base64String;
		}

		// Serialize a value, afterwards executing a callback (which usually
		// instructs the `setItem()` callback/promise to be executed). This is how
		// we store binary data with localStorage.
		function serialize(value, callback) {
		    var valueType = '';
		    if (value) {
		        valueType = toString$1.call(value);
		    }

		    // Cannot use `value instanceof ArrayBuffer` or such here, as these
		    // checks fail when running the tests using casper.js...
		    //
		    // TODO: See why those tests fail and use a better solution.
		    if (value && (valueType === '[object ArrayBuffer]' || value.buffer && toString$1.call(value.buffer) === '[object ArrayBuffer]')) {
		        // Convert binary arrays to a string and prefix the string with
		        // a special marker.
		        var buffer;
		        var marker = SERIALIZED_MARKER;

		        if (value instanceof ArrayBuffer) {
		            buffer = value;
		            marker += TYPE_ARRAYBUFFER;
		        } else {
		            buffer = value.buffer;

		            if (valueType === '[object Int8Array]') {
		                marker += TYPE_INT8ARRAY;
		            } else if (valueType === '[object Uint8Array]') {
		                marker += TYPE_UINT8ARRAY;
		            } else if (valueType === '[object Uint8ClampedArray]') {
		                marker += TYPE_UINT8CLAMPEDARRAY;
		            } else if (valueType === '[object Int16Array]') {
		                marker += TYPE_INT16ARRAY;
		            } else if (valueType === '[object Uint16Array]') {
		                marker += TYPE_UINT16ARRAY;
		            } else if (valueType === '[object Int32Array]') {
		                marker += TYPE_INT32ARRAY;
		            } else if (valueType === '[object Uint32Array]') {
		                marker += TYPE_UINT32ARRAY;
		            } else if (valueType === '[object Float32Array]') {
		                marker += TYPE_FLOAT32ARRAY;
		            } else if (valueType === '[object Float64Array]') {
		                marker += TYPE_FLOAT64ARRAY;
		            } else {
		                callback(new Error('Failed to get type for BinaryArray'));
		            }
		        }

		        callback(marker + bufferToString(buffer));
		    } else if (valueType === '[object Blob]') {
		        // Conver the blob to a binaryArray and then to a string.
		        var fileReader = new FileReader();

		        fileReader.onload = function () {
		            // Backwards-compatible prefix for the blob type.
		            var str = BLOB_TYPE_PREFIX + value.type + '~' + bufferToString(this.result);

		            callback(SERIALIZED_MARKER + TYPE_BLOB + str);
		        };

		        fileReader.readAsArrayBuffer(value);
		    } else {
		        try {
		            callback(JSON.stringify(value));
		        } catch (e) {
		            console.error("Couldn't convert value into a JSON string: ", value);

		            callback(null, e);
		        }
		    }
		}

		// Deserialize data we've inserted into a value column/field. We place
		// special markers into our strings to mark them as encoded; this isn't
		// as nice as a meta field, but it's the only sane thing we can do whilst
		// keeping localStorage support intact.
		//
		// Oftentimes this will just deserialize JSON content, but if we have a
		// special marker (SERIALIZED_MARKER, defined above), we will extract
		// some kind of arraybuffer/binary data/typed array out of the string.
		function deserialize(value) {
		    // If we haven't marked this string as being specially serialized (i.e.
		    // something other than serialized JSON), we can just return it and be
		    // done with it.
		    if (value.substring(0, SERIALIZED_MARKER_LENGTH) !== SERIALIZED_MARKER) {
		        return JSON.parse(value);
		    }

		    // The following code deals with deserializing some kind of Blob or
		    // TypedArray. First we separate out the type of data we're dealing
		    // with from the data itself.
		    var serializedString = value.substring(TYPE_SERIALIZED_MARKER_LENGTH);
		    var type = value.substring(SERIALIZED_MARKER_LENGTH, TYPE_SERIALIZED_MARKER_LENGTH);

		    var blobType;
		    // Backwards-compatible blob type serialization strategy.
		    // DBs created with older versions of localForage will simply not have the blob type.
		    if (type === TYPE_BLOB && BLOB_TYPE_PREFIX_REGEX.test(serializedString)) {
		        var matcher = serializedString.match(BLOB_TYPE_PREFIX_REGEX);
		        blobType = matcher[1];
		        serializedString = serializedString.substring(matcher[0].length);
		    }
		    var buffer = stringToBuffer(serializedString);

		    // Return the right type based on the code/type set during
		    // serialization.
		    switch (type) {
		        case TYPE_ARRAYBUFFER:
		            return buffer;
		        case TYPE_BLOB:
		            return createBlob([buffer], { type: blobType });
		        case TYPE_INT8ARRAY:
		            return new Int8Array(buffer);
		        case TYPE_UINT8ARRAY:
		            return new Uint8Array(buffer);
		        case TYPE_UINT8CLAMPEDARRAY:
		            return new Uint8ClampedArray(buffer);
		        case TYPE_INT16ARRAY:
		            return new Int16Array(buffer);
		        case TYPE_UINT16ARRAY:
		            return new Uint16Array(buffer);
		        case TYPE_INT32ARRAY:
		            return new Int32Array(buffer);
		        case TYPE_UINT32ARRAY:
		            return new Uint32Array(buffer);
		        case TYPE_FLOAT32ARRAY:
		            return new Float32Array(buffer);
		        case TYPE_FLOAT64ARRAY:
		            return new Float64Array(buffer);
		        default:
		            throw new Error('Unkown type: ' + type);
		    }
		}

		var localforageSerializer = {
		    serialize: serialize,
		    deserialize: deserialize,
		    stringToBuffer: stringToBuffer,
		    bufferToString: bufferToString
		};

		/*
		 * Includes code from:
		 *
		 * base64-arraybuffer
		 * https://github.com/niklasvh/base64-arraybuffer
		 *
		 * Copyright (c) 2012 Niklas von Hertzen
		 * Licensed under the MIT license.
		 */

		function createDbTable(t, dbInfo, callback, errorCallback) {
		    t.executeSql('CREATE TABLE IF NOT EXISTS ' + dbInfo.storeName + ' ' + '(id INTEGER PRIMARY KEY, key unique, value)', [], callback, errorCallback);
		}

		// Open the WebSQL database (automatically creates one if one didn't
		// previously exist), using any options set in the config.
		function _initStorage$1(options) {
		    var self = this;
		    var dbInfo = {
		        db: null
		    };

		    if (options) {
		        for (var i in options) {
		            dbInfo[i] = typeof options[i] !== 'string' ? options[i].toString() : options[i];
		        }
		    }

		    var dbInfoPromise = new Promise$1(function (resolve, reject) {
		        // Open the database; the openDatabase API will automatically
		        // create it for us if it doesn't exist.
		        try {
		            dbInfo.db = openDatabase(dbInfo.name, String(dbInfo.version), dbInfo.description, dbInfo.size);
		        } catch (e) {
		            return reject(e);
		        }

		        // Create our key/value table if it doesn't exist.
		        dbInfo.db.transaction(function (t) {
		            createDbTable(t, dbInfo, function () {
		                self._dbInfo = dbInfo;
		                resolve();
		            }, function (t, error) {
		                reject(error);
		            });
		        }, reject);
		    });

		    dbInfo.serializer = localforageSerializer;
		    return dbInfoPromise;
		}

		function tryExecuteSql(t, dbInfo, sqlStatement, args, callback, errorCallback) {
		    t.executeSql(sqlStatement, args, callback, function (t, error) {
		        if (error.code === error.SYNTAX_ERR) {
		            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name = ?", [dbInfo.storeName], function (t, results) {
		                if (!results.rows.length) {
		                    // if the table is missing (was deleted)
		                    // re-create it table and retry
		                    createDbTable(t, dbInfo, function () {
		                        t.executeSql(sqlStatement, args, callback, errorCallback);
		                    }, errorCallback);
		                } else {
		                    errorCallback(t, error);
		                }
		            }, errorCallback);
		        } else {
		            errorCallback(t, error);
		        }
		    }, errorCallback);
		}

		function getItem$1(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName + ' WHERE key = ? LIMIT 1', [key], function (t, results) {
		                    var result = results.rows.length ? results.rows.item(0).value : null;

		                    // Check to see if this is serialized content we need to
		                    // unpack.
		                    if (result) {
		                        result = dbInfo.serializer.deserialize(result);
		                    }

		                    resolve(result);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function iterate$1(iterator, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;

		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT * FROM ' + dbInfo.storeName, [], function (t, results) {
		                    var rows = results.rows;
		                    var length = rows.length;

		                    for (var i = 0; i < length; i++) {
		                        var item = rows.item(i);
		                        var result = item.value;

		                        // Check to see if this is serialized content
		                        // we need to unpack.
		                        if (result) {
		                            result = dbInfo.serializer.deserialize(result);
		                        }

		                        result = iterator(result, item.key, i + 1);

		                        // void(0) prevents problems with redefinition
		                        // of `undefined`.
		                        if (result !== void 0) {
		                            resolve(result);
		                            return;
		                        }
		                    }

		                    resolve();
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function _setItem(key, value, callback, retriesLeft) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            // The localStorage API doesn't return undefined values in an
		            // "expected" way, so undefined is always cast to null in all
		            // drivers. See: https://github.com/mozilla/localForage/pull/42
		            if (value === undefined) {
		                value = null;
		            }

		            // Save the original value to pass to the callback.
		            var originalValue = value;

		            var dbInfo = self._dbInfo;
		            dbInfo.serializer.serialize(value, function (value, error) {
		                if (error) {
		                    reject(error);
		                } else {
		                    dbInfo.db.transaction(function (t) {
		                        tryExecuteSql(t, dbInfo, 'INSERT OR REPLACE INTO ' + dbInfo.storeName + ' ' + '(key, value) VALUES (?, ?)', [key, value], function () {
		                            resolve(originalValue);
		                        }, function (t, error) {
		                            reject(error);
		                        });
		                    }, function (sqlError) {
		                        // The transaction failed; check
		                        // to see if it's a quota error.
		                        if (sqlError.code === sqlError.QUOTA_ERR) {
		                            // We reject the callback outright for now, but
		                            // it's worth trying to re-run the transaction.
		                            // Even if the user accepts the prompt to use
		                            // more storage on Safari, this error will
		                            // be called.
		                            //
		                            // Try to re-run the transaction.
		                            if (retriesLeft > 0) {
		                                resolve(_setItem.apply(self, [key, originalValue, callback, retriesLeft - 1]));
		                                return;
		                            }
		                            reject(sqlError);
		                        }
		                    });
		                }
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function setItem$1(key, value, callback) {
		    return _setItem.apply(this, [key, value, callback, 1]);
		}

		function removeItem$1(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName + ' WHERE key = ?', [key], function () {
		                    resolve();
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Deletes every item in the table.
		// TODO: Find out if this resets the AUTO_INCREMENT number.
		function clear$1(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'DELETE FROM ' + dbInfo.storeName, [], function () {
		                    resolve();
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Does a simple `COUNT(key)` to get the number of items stored in
		// localForage.
		function length$1(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                // Ahhh, SQL makes this one soooooo easy.
		                tryExecuteSql(t, dbInfo, 'SELECT COUNT(key) as c FROM ' + dbInfo.storeName, [], function (t, results) {
		                    var result = results.rows.item(0).c;
		                    resolve(result);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Return the key located at key index X; essentially gets the key from a
		// `WHERE id = ?`. This is the most efficient way I can think to implement
		// this rarely-used (in my experience) part of the API, but it can seem
		// inconsistent, because we do `INSERT OR REPLACE INTO` on `setItem()`, so
		// the ID of each key will change every time it's updated. Perhaps a stored
		// procedure for the `setItem()` SQL would solve this problem?
		// TODO: Don't change ID on `setItem()`.
		function key$1(n, callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName + ' WHERE id = ? LIMIT 1', [n + 1], function (t, results) {
		                    var result = results.rows.length ? results.rows.item(0).key : null;
		                    resolve(result);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function keys$1(callback) {
		    var self = this;

		    var promise = new Promise$1(function (resolve, reject) {
		        self.ready().then(function () {
		            var dbInfo = self._dbInfo;
		            dbInfo.db.transaction(function (t) {
		                tryExecuteSql(t, dbInfo, 'SELECT key FROM ' + dbInfo.storeName, [], function (t, results) {
		                    var keys = [];

		                    for (var i = 0; i < results.rows.length; i++) {
		                        keys.push(results.rows.item(i).key);
		                    }

		                    resolve(keys);
		                }, function (t, error) {
		                    reject(error);
		                });
		            });
		        })["catch"](reject);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// https://www.w3.org/TR/webdatabase/#databases
		// > There is no way to enumerate or delete the databases available for an origin from this API.
		function getAllStoreNames(db) {
		    return new Promise$1(function (resolve, reject) {
		        db.transaction(function (t) {
		            t.executeSql('SELECT name FROM sqlite_master ' + "WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'", [], function (t, results) {
		                var storeNames = [];

		                for (var i = 0; i < results.rows.length; i++) {
		                    storeNames.push(results.rows.item(i).name);
		                }

		                resolve({
		                    db: db,
		                    storeNames: storeNames
		                });
		            }, function (t, error) {
		                reject(error);
		            });
		        }, function (sqlError) {
		            reject(sqlError);
		        });
		    });
		}

		function dropInstance$1(options, callback) {
		    callback = getCallback.apply(this, arguments);

		    var currentConfig = this.config();
		    options = typeof options !== 'function' && options || {};
		    if (!options.name) {
		        options.name = options.name || currentConfig.name;
		        options.storeName = options.storeName || currentConfig.storeName;
		    }

		    var self = this;
		    var promise;
		    if (!options.name) {
		        promise = Promise$1.reject('Invalid arguments');
		    } else {
		        promise = new Promise$1(function (resolve) {
		            var db;
		            if (options.name === currentConfig.name) {
		                // use the db reference of the current instance
		                db = self._dbInfo.db;
		            } else {
		                db = openDatabase(options.name, '', '', 0);
		            }

		            if (!options.storeName) {
		                // drop all database tables
		                resolve(getAllStoreNames(db));
		            } else {
		                resolve({
		                    db: db,
		                    storeNames: [options.storeName]
		                });
		            }
		        }).then(function (operationInfo) {
		            return new Promise$1(function (resolve, reject) {
		                operationInfo.db.transaction(function (t) {
		                    function dropTable(storeName) {
		                        return new Promise$1(function (resolve, reject) {
		                            t.executeSql('DROP TABLE IF EXISTS ' + storeName, [], function () {
		                                resolve();
		                            }, function (t, error) {
		                                reject(error);
		                            });
		                        });
		                    }

		                    var operations = [];
		                    for (var i = 0, len = operationInfo.storeNames.length; i < len; i++) {
		                        operations.push(dropTable(operationInfo.storeNames[i]));
		                    }

		                    Promise$1.all(operations).then(function () {
		                        resolve();
		                    })["catch"](function (e) {
		                        reject(e);
		                    });
		                }, function (sqlError) {
		                    reject(sqlError);
		                });
		            });
		        });
		    }

		    executeCallback(promise, callback);
		    return promise;
		}

		var webSQLStorage = {
		    _driver: 'webSQLStorage',
		    _initStorage: _initStorage$1,
		    _support: isWebSQLValid(),
		    iterate: iterate$1,
		    getItem: getItem$1,
		    setItem: setItem$1,
		    removeItem: removeItem$1,
		    clear: clear$1,
		    length: length$1,
		    key: key$1,
		    keys: keys$1,
		    dropInstance: dropInstance$1
		};

		function isLocalStorageValid() {
		    try {
		        return typeof localStorage !== 'undefined' && 'setItem' in localStorage &&
		        // in IE8 typeof localStorage.setItem === 'object'
		        !!localStorage.setItem;
		    } catch (e) {
		        return false;
		    }
		}

		function _getKeyPrefix(options, defaultConfig) {
		    var keyPrefix = options.name + '/';

		    if (options.storeName !== defaultConfig.storeName) {
		        keyPrefix += options.storeName + '/';
		    }
		    return keyPrefix;
		}

		// Check if localStorage throws when saving an item
		function checkIfLocalStorageThrows() {
		    var localStorageTestKey = '_localforage_support_test';

		    try {
		        localStorage.setItem(localStorageTestKey, true);
		        localStorage.removeItem(localStorageTestKey);

		        return false;
		    } catch (e) {
		        return true;
		    }
		}

		// Check if localStorage is usable and allows to save an item
		// This method checks if localStorage is usable in Safari Private Browsing
		// mode, or in any other case where the available quota for localStorage
		// is 0 and there wasn't any saved items yet.
		function _isLocalStorageUsable() {
		    return !checkIfLocalStorageThrows() || localStorage.length > 0;
		}

		// Config the localStorage backend, using options set in the config.
		function _initStorage$2(options) {
		    var self = this;
		    var dbInfo = {};
		    if (options) {
		        for (var i in options) {
		            dbInfo[i] = options[i];
		        }
		    }

		    dbInfo.keyPrefix = _getKeyPrefix(options, self._defaultConfig);

		    if (!_isLocalStorageUsable()) {
		        return Promise$1.reject();
		    }

		    self._dbInfo = dbInfo;
		    dbInfo.serializer = localforageSerializer;

		    return Promise$1.resolve();
		}

		// Remove all keys from the datastore, effectively destroying all data in
		// the app's key/value store!
		function clear$2(callback) {
		    var self = this;
		    var promise = self.ready().then(function () {
		        var keyPrefix = self._dbInfo.keyPrefix;

		        for (var i = localStorage.length - 1; i >= 0; i--) {
		            var key = localStorage.key(i);

		            if (key.indexOf(keyPrefix) === 0) {
		                localStorage.removeItem(key);
		            }
		        }
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Retrieve an item from the store. Unlike the original async_storage
		// library in Gaia, we don't modify return values at all. If a key's value
		// is `undefined`, we pass that value to the callback function.
		function getItem$2(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var result = localStorage.getItem(dbInfo.keyPrefix + key);

		        // If a result was found, parse it from the serialized
		        // string into a JS object. If result isn't truthy, the key
		        // is likely undefined and we'll pass it straight to the
		        // callback.
		        if (result) {
		            result = dbInfo.serializer.deserialize(result);
		        }

		        return result;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Iterate over all items in the store.
		function iterate$2(iterator, callback) {
		    var self = this;

		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var keyPrefix = dbInfo.keyPrefix;
		        var keyPrefixLength = keyPrefix.length;
		        var length = localStorage.length;

		        // We use a dedicated iterator instead of the `i` variable below
		        // so other keys we fetch in localStorage aren't counted in
		        // the `iterationNumber` argument passed to the `iterate()`
		        // callback.
		        //
		        // See: github.com/mozilla/localForage/pull/435#discussion_r38061530
		        var iterationNumber = 1;

		        for (var i = 0; i < length; i++) {
		            var key = localStorage.key(i);
		            if (key.indexOf(keyPrefix) !== 0) {
		                continue;
		            }
		            var value = localStorage.getItem(key);

		            // If a result was found, parse it from the serialized
		            // string into a JS object. If result isn't truthy, the
		            // key is likely undefined and we'll pass it straight
		            // to the iterator.
		            if (value) {
		                value = dbInfo.serializer.deserialize(value);
		            }

		            value = iterator(value, key.substring(keyPrefixLength), iterationNumber++);

		            if (value !== void 0) {
		                return value;
		            }
		        }
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Same as localStorage's key() method, except takes a callback.
		function key$2(n, callback) {
		    var self = this;
		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var result;
		        try {
		            result = localStorage.key(n);
		        } catch (error) {
		            result = null;
		        }

		        // Remove the prefix from the key, if a key is found.
		        if (result) {
		            result = result.substring(dbInfo.keyPrefix.length);
		        }

		        return result;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function keys$2(callback) {
		    var self = this;
		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        var length = localStorage.length;
		        var keys = [];

		        for (var i = 0; i < length; i++) {
		            var itemKey = localStorage.key(i);
		            if (itemKey.indexOf(dbInfo.keyPrefix) === 0) {
		                keys.push(itemKey.substring(dbInfo.keyPrefix.length));
		            }
		        }

		        return keys;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Supply the number of keys in the datastore to the callback function.
		function length$2(callback) {
		    var self = this;
		    var promise = self.keys().then(function (keys) {
		        return keys.length;
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Remove an item from the store, nice and simple.
		function removeItem$2(key, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = self.ready().then(function () {
		        var dbInfo = self._dbInfo;
		        localStorage.removeItem(dbInfo.keyPrefix + key);
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		// Set a key's value and run an optional callback once the value is set.
		// Unlike Gaia's implementation, the callback function is passed the value,
		// in case you want to operate on that value only after you're sure it
		// saved, or something like that.
		function setItem$2(key, value, callback) {
		    var self = this;

		    key = normalizeKey(key);

		    var promise = self.ready().then(function () {
		        // Convert undefined values to null.
		        // https://github.com/mozilla/localForage/pull/42
		        if (value === undefined) {
		            value = null;
		        }

		        // Save the original value to pass to the callback.
		        var originalValue = value;

		        return new Promise$1(function (resolve, reject) {
		            var dbInfo = self._dbInfo;
		            dbInfo.serializer.serialize(value, function (value, error) {
		                if (error) {
		                    reject(error);
		                } else {
		                    try {
		                        localStorage.setItem(dbInfo.keyPrefix + key, value);
		                        resolve(originalValue);
		                    } catch (e) {
		                        // localStorage capacity exceeded.
		                        // TODO: Make this a specific error/event.
		                        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
		                            reject(e);
		                        }
		                        reject(e);
		                    }
		                }
		            });
		        });
		    });

		    executeCallback(promise, callback);
		    return promise;
		}

		function dropInstance$2(options, callback) {
		    callback = getCallback.apply(this, arguments);

		    options = typeof options !== 'function' && options || {};
		    if (!options.name) {
		        var currentConfig = this.config();
		        options.name = options.name || currentConfig.name;
		        options.storeName = options.storeName || currentConfig.storeName;
		    }

		    var self = this;
		    var promise;
		    if (!options.name) {
		        promise = Promise$1.reject('Invalid arguments');
		    } else {
		        promise = new Promise$1(function (resolve) {
		            if (!options.storeName) {
		                resolve(options.name + '/');
		            } else {
		                resolve(_getKeyPrefix(options, self._defaultConfig));
		            }
		        }).then(function (keyPrefix) {
		            for (var i = localStorage.length - 1; i >= 0; i--) {
		                var key = localStorage.key(i);

		                if (key.indexOf(keyPrefix) === 0) {
		                    localStorage.removeItem(key);
		                }
		            }
		        });
		    }

		    executeCallback(promise, callback);
		    return promise;
		}

		var localStorageWrapper = {
		    _driver: 'localStorageWrapper',
		    _initStorage: _initStorage$2,
		    _support: isLocalStorageValid(),
		    iterate: iterate$2,
		    getItem: getItem$2,
		    setItem: setItem$2,
		    removeItem: removeItem$2,
		    clear: clear$2,
		    length: length$2,
		    key: key$2,
		    keys: keys$2,
		    dropInstance: dropInstance$2
		};

		var sameValue = function sameValue(x, y) {
		    return x === y || typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y);
		};

		var includes = function includes(array, searchElement) {
		    var len = array.length;
		    var i = 0;
		    while (i < len) {
		        if (sameValue(array[i], searchElement)) {
		            return true;
		        }
		        i++;
		    }

		    return false;
		};

		var isArray = Array.isArray || function (arg) {
		    return Object.prototype.toString.call(arg) === '[object Array]';
		};

		// Drivers are stored here when `defineDriver()` is called.
		// They are shared across all instances of localForage.
		var DefinedDrivers = {};

		var DriverSupport = {};

		var DefaultDrivers = {
		    INDEXEDDB: asyncStorage,
		    WEBSQL: webSQLStorage,
		    LOCALSTORAGE: localStorageWrapper
		};

		var DefaultDriverOrder = [DefaultDrivers.INDEXEDDB._driver, DefaultDrivers.WEBSQL._driver, DefaultDrivers.LOCALSTORAGE._driver];

		var OptionalDriverMethods = ['dropInstance'];

		var LibraryMethods = ['clear', 'getItem', 'iterate', 'key', 'keys', 'length', 'removeItem', 'setItem'].concat(OptionalDriverMethods);

		var DefaultConfig = {
		    description: '',
		    driver: DefaultDriverOrder.slice(),
		    name: 'localforage',
		    // Default DB size is _JUST UNDER_ 5MB, as it's the highest size
		    // we can use without a prompt.
		    size: 4980736,
		    storeName: 'keyvaluepairs',
		    version: 1.0
		};

		function callWhenReady(localForageInstance, libraryMethod) {
		    localForageInstance[libraryMethod] = function () {
		        var _args = arguments;
		        return localForageInstance.ready().then(function () {
		            return localForageInstance[libraryMethod].apply(localForageInstance, _args);
		        });
		    };
		}

		function extend() {
		    for (var i = 1; i < arguments.length; i++) {
		        var arg = arguments[i];

		        if (arg) {
		            for (var _key in arg) {
		                if (arg.hasOwnProperty(_key)) {
		                    if (isArray(arg[_key])) {
		                        arguments[0][_key] = arg[_key].slice();
		                    } else {
		                        arguments[0][_key] = arg[_key];
		                    }
		                }
		            }
		        }
		    }

		    return arguments[0];
		}

		var LocalForage = function () {
		    function LocalForage(options) {
		        _classCallCheck(this, LocalForage);

		        for (var driverTypeKey in DefaultDrivers) {
		            if (DefaultDrivers.hasOwnProperty(driverTypeKey)) {
		                var driver = DefaultDrivers[driverTypeKey];
		                var driverName = driver._driver;
		                this[driverTypeKey] = driverName;

		                if (!DefinedDrivers[driverName]) {
		                    // we don't need to wait for the promise,
		                    // since the default drivers can be defined
		                    // in a blocking manner
		                    this.defineDriver(driver);
		                }
		            }
		        }

		        this._defaultConfig = extend({}, DefaultConfig);
		        this._config = extend({}, this._defaultConfig, options);
		        this._driverSet = null;
		        this._initDriver = null;
		        this._ready = false;
		        this._dbInfo = null;

		        this._wrapLibraryMethodsWithReady();
		        this.setDriver(this._config.driver)["catch"](function () {});
		    }

		    // Set any config values for localForage; can be called anytime before
		    // the first API call (e.g. `getItem`, `setItem`).
		    // We loop through options so we don't overwrite existing config
		    // values.


		    LocalForage.prototype.config = function config(options) {
		        // If the options argument is an object, we use it to set values.
		        // Otherwise, we return either a specified config value or all
		        // config values.
		        if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
		            // If localforage is ready and fully initialized, we can't set
		            // any new configuration values. Instead, we return an error.
		            if (this._ready) {
		                return new Error("Can't call config() after localforage " + 'has been used.');
		            }

		            for (var i in options) {
		                if (i === 'storeName') {
		                    options[i] = options[i].replace(/\W/g, '_');
		                }

		                if (i === 'version' && typeof options[i] !== 'number') {
		                    return new Error('Database version must be a number.');
		                }

		                this._config[i] = options[i];
		            }

		            // after all config options are set and
		            // the driver option is used, try setting it
		            if ('driver' in options && options.driver) {
		                return this.setDriver(this._config.driver);
		            }

		            return true;
		        } else if (typeof options === 'string') {
		            return this._config[options];
		        } else {
		            return this._config;
		        }
		    };

		    // Used to define a custom driver, shared across all instances of
		    // localForage.


		    LocalForage.prototype.defineDriver = function defineDriver(driverObject, callback, errorCallback) {
		        var promise = new Promise$1(function (resolve, reject) {
		            try {
		                var driverName = driverObject._driver;
		                var complianceError = new Error('Custom driver not compliant; see ' + 'https://mozilla.github.io/localForage/#definedriver');

		                // A driver name should be defined and not overlap with the
		                // library-defined, default drivers.
		                if (!driverObject._driver) {
		                    reject(complianceError);
		                    return;
		                }

		                var driverMethods = LibraryMethods.concat('_initStorage');
		                for (var i = 0, len = driverMethods.length; i < len; i++) {
		                    var driverMethodName = driverMethods[i];

		                    // when the property is there,
		                    // it should be a method even when optional
		                    var isRequired = !includes(OptionalDriverMethods, driverMethodName);
		                    if ((isRequired || driverObject[driverMethodName]) && typeof driverObject[driverMethodName] !== 'function') {
		                        reject(complianceError);
		                        return;
		                    }
		                }

		                var configureMissingMethods = function configureMissingMethods() {
		                    var methodNotImplementedFactory = function methodNotImplementedFactory(methodName) {
		                        return function () {
		                            var error = new Error('Method ' + methodName + ' is not implemented by the current driver');
		                            var promise = Promise$1.reject(error);
		                            executeCallback(promise, arguments[arguments.length - 1]);
		                            return promise;
		                        };
		                    };

		                    for (var _i = 0, _len = OptionalDriverMethods.length; _i < _len; _i++) {
		                        var optionalDriverMethod = OptionalDriverMethods[_i];
		                        if (!driverObject[optionalDriverMethod]) {
		                            driverObject[optionalDriverMethod] = methodNotImplementedFactory(optionalDriverMethod);
		                        }
		                    }
		                };

		                configureMissingMethods();

		                var setDriverSupport = function setDriverSupport(support) {
		                    if (DefinedDrivers[driverName]) {
		                        console.info('Redefining LocalForage driver: ' + driverName);
		                    }
		                    DefinedDrivers[driverName] = driverObject;
		                    DriverSupport[driverName] = support;
		                    // don't use a then, so that we can define
		                    // drivers that have simple _support methods
		                    // in a blocking manner
		                    resolve();
		                };

		                if ('_support' in driverObject) {
		                    if (driverObject._support && typeof driverObject._support === 'function') {
		                        driverObject._support().then(setDriverSupport, reject);
		                    } else {
		                        setDriverSupport(!!driverObject._support);
		                    }
		                } else {
		                    setDriverSupport(true);
		                }
		            } catch (e) {
		                reject(e);
		            }
		        });

		        executeTwoCallbacks(promise, callback, errorCallback);
		        return promise;
		    };

		    LocalForage.prototype.driver = function driver() {
		        return this._driver || null;
		    };

		    LocalForage.prototype.getDriver = function getDriver(driverName, callback, errorCallback) {
		        var getDriverPromise = DefinedDrivers[driverName] ? Promise$1.resolve(DefinedDrivers[driverName]) : Promise$1.reject(new Error('Driver not found.'));

		        executeTwoCallbacks(getDriverPromise, callback, errorCallback);
		        return getDriverPromise;
		    };

		    LocalForage.prototype.getSerializer = function getSerializer(callback) {
		        var serializerPromise = Promise$1.resolve(localforageSerializer);
		        executeTwoCallbacks(serializerPromise, callback);
		        return serializerPromise;
		    };

		    LocalForage.prototype.ready = function ready(callback) {
		        var self = this;

		        var promise = self._driverSet.then(function () {
		            if (self._ready === null) {
		                self._ready = self._initDriver();
		            }

		            return self._ready;
		        });

		        executeTwoCallbacks(promise, callback, callback);
		        return promise;
		    };

		    LocalForage.prototype.setDriver = function setDriver(drivers, callback, errorCallback) {
		        var self = this;

		        if (!isArray(drivers)) {
		            drivers = [drivers];
		        }

		        var supportedDrivers = this._getSupportedDrivers(drivers);

		        function setDriverToConfig() {
		            self._config.driver = self.driver();
		        }

		        function extendSelfWithDriver(driver) {
		            self._extend(driver);
		            setDriverToConfig();

		            self._ready = self._initStorage(self._config);
		            return self._ready;
		        }

		        function initDriver(supportedDrivers) {
		            return function () {
		                var currentDriverIndex = 0;

		                function driverPromiseLoop() {
		                    while (currentDriverIndex < supportedDrivers.length) {
		                        var driverName = supportedDrivers[currentDriverIndex];
		                        currentDriverIndex++;

		                        self._dbInfo = null;
		                        self._ready = null;

		                        return self.getDriver(driverName).then(extendSelfWithDriver)["catch"](driverPromiseLoop);
		                    }

		                    setDriverToConfig();
		                    var error = new Error('No available storage method found.');
		                    self._driverSet = Promise$1.reject(error);
		                    return self._driverSet;
		                }

		                return driverPromiseLoop();
		            };
		        }

		        // There might be a driver initialization in progress
		        // so wait for it to finish in order to avoid a possible
		        // race condition to set _dbInfo
		        var oldDriverSetDone = this._driverSet !== null ? this._driverSet["catch"](function () {
		            return Promise$1.resolve();
		        }) : Promise$1.resolve();

		        this._driverSet = oldDriverSetDone.then(function () {
		            var driverName = supportedDrivers[0];
		            self._dbInfo = null;
		            self._ready = null;

		            return self.getDriver(driverName).then(function (driver) {
		                self._driver = driver._driver;
		                setDriverToConfig();
		                self._wrapLibraryMethodsWithReady();
		                self._initDriver = initDriver(supportedDrivers);
		            });
		        })["catch"](function () {
		            setDriverToConfig();
		            var error = new Error('No available storage method found.');
		            self._driverSet = Promise$1.reject(error);
		            return self._driverSet;
		        });

		        executeTwoCallbacks(this._driverSet, callback, errorCallback);
		        return this._driverSet;
		    };

		    LocalForage.prototype.supports = function supports(driverName) {
		        return !!DriverSupport[driverName];
		    };

		    LocalForage.prototype._extend = function _extend(libraryMethodsAndProperties) {
		        extend(this, libraryMethodsAndProperties);
		    };

		    LocalForage.prototype._getSupportedDrivers = function _getSupportedDrivers(drivers) {
		        var supportedDrivers = [];
		        for (var i = 0, len = drivers.length; i < len; i++) {
		            var driverName = drivers[i];
		            if (this.supports(driverName)) {
		                supportedDrivers.push(driverName);
		            }
		        }
		        return supportedDrivers;
		    };

		    LocalForage.prototype._wrapLibraryMethodsWithReady = function _wrapLibraryMethodsWithReady() {
		        // Add a stub for each driver API method that delays the call to the
		        // corresponding driver method until localForage is ready. These stubs
		        // will be replaced by the driver methods as soon as the driver is
		        // loaded, so there is no performance impact.
		        for (var i = 0, len = LibraryMethods.length; i < len; i++) {
		            callWhenReady(this, LibraryMethods[i]);
		        }
		    };

		    LocalForage.prototype.createInstance = function createInstance(options) {
		        return new LocalForage(options);
		    };

		    return LocalForage;
		}();

		// The actual localForage object that we expose as a module or via a
		// global. It's extended by pulling in one of our other libraries.


		var localforage_js = new LocalForage();

		module.exports = localforage_js;

		},{"3":3}]},{},[4])(4)
		}); 
	} (localforage$1));
	return localforage$1.exports;
}

var localforageExports = requireLocalforage();
var localforage = /*@__PURE__*/getDefaultExportFromCjs(localforageExports);

/**
 * @typedef {import('bsbi-app-framework-view').FormField} FormField
 */

function uuid(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

/**
 * regex used to validate AppObject external ids
 * (UUID form is 8 digits followed by three groups of 4 digits followed by a group of 12)
 */
const UUID_REGEX = /^[a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$/;

const SAVE_STATE_LOCAL = 'SAVED_LOCALLY';
const SAVE_STATE_SERVER = 'SAVED_TO_SERVER';

const MODEL_EVENT_SAVED_REMOTELY = 'savedremotely';

const MODEL_EVENT_DESTROYED = 'destroyed';

class Model extends EventHarness {
    /**
     * @type {string}
     */
    _id = '';

    /**
     * set if the object has been posted to the server
     *
     * @type {boolean}
     */
    _savedRemotely = false;

    // static EVENT_SAVED_REMOTELY = MODEL_EVENT_SAVED_REMOTELY;

    static bsbiAppVersion = '';

    /**
     * mirrors constructor.name but doesn't get mangled by minification
     *
     * @type {string}
     */
    static className = 'Model';

    attributes = {};

    /**
     *
     * @param {boolean} savedFlag
     */
    set savedRemotely(savedFlag) {
        if (this._savedRemotely !== savedFlag) {
            this._savedRemotely = !!savedFlag;

            if (this._savedRemotely) {
                this.fireEvent(MODEL_EVENT_SAVED_REMOTELY, {id : this.id});
            }
        }
    }

    /**
     *
     * @returns {boolean}
     */
    get savedRemotely() {
        return this._savedRemotely;
    }

    /**
     * set if the object has been added to a temporary store (e.g. indexedDb)
     *
     * @type {boolean}
     */
    _savedLocally = false;

    /**
     *
     * @type {boolean}
     */
    deleted = false;

    /**
     * unix timestamp (seconds since epoch)
     * Provided that the created stamp is < the modified stamp then the externally assigned creation stamp will be used
     *
     * @type {number}
     */
    createdStamp;

    /**
     * unix timestamp (seconds since epoch)
     * modified stamp is generally server assigned - rather than using a potentially discrepant client clock
     * this may increase synchrony and trust between distributed clients
     *
     * @type {number}
     */
    modifiedStamp;

    /**
     * DDb AppProject id
     *
     * @type {number}
     */
    projectId;

    /**
     * paired with isNew this marks objects that have never been edited
     *
     * @type {boolean}
     */
    isPristine = false;

    constructor() {
        super();

        this.createdStamp = Math.floor(Date.now() / 1000);
    }

    /**
     * returns true if either remote or local copy is missing
     *
     * @returns {boolean}
     */
    unsaved() {
        return !(this._savedLocally && this._savedRemotely);
    }

    /**
     * string
     */
    get id() {
        if (!this._id) {
            this._id = uuid();
        } else if (this._id === 'undefined') {
            console.error("id is literal 'undefined', am forcing new id");
            this._id = uuid();
        }

        return this._id;
    }

    /**
     *
     * @param {string} newId
     */
    set id(newId) {

        if (!newId.match(UUID_REGEX)) {
            throw new Error(`Cannot set malformed object id '${newId}'.`);
        } else {
            // only allow an id to be set if not present already

            if (this._id && newId !== this._id) {
                throw new Error(`Object id has already been set, when trying to set new id '${newId}'.`);
            }
            this._id = newId;
        }
    }

    /**
     *
     * @abstract
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{[surveyId] : string, [projectId] : number|null, [occurrenceId] : string}} [params]
     *
     * @returns {Promise}
     */
    save(forceSave = false, isSync = false, params) {}

    /**
     *
     * @type {Array<function>}
     * @private
     */
    static _tasks = [];

    /**
     * Add a post request to the queue
     * Requests run in sequence.
     * Returns a promise that resolves once the queued request completes
     *
     * The queue reduces the chance of requests being sent to the server out-of-order (which can lead to race conditions)
     *
     * @param {FormData} formData
     * @param {boolean} isSync default false, set if request is part of sync all rather than a regular save
     * @returns {Promise}
     */
    queuePost(formData, isSync = false) {
        return new Promise((resolve, reject) => {
            /**
             * @returns {Promise}
             */
            const task = () => {
                //console.log({'posting form data': formData});
                return this.post(formData, isSync)
                    .catch((reason) => {
                        // noinspection JSIgnoredPromiseFromCall
                        Logger.logError(`Failed to post '${JSON.stringify(reason)}' for ${this.constructor.className} id ${this.id} isSync: ${isSync ? 'true' : 'false'}.`);

                        return Promise.reject(reason);
                    })
                    .then(resolve, reject);
            };

            Model._tasks.push(task);

            if (Model._tasks.length > 1) {
                console.log(`Added post request to the queue.`);
            } else {
                console.log(`No pending tasks, starting post request immediately.`);
                task().finally(Model._next);
            }
        });
    }

    /**
     *
     * @returns {Promise}
     * @private
     */
    static _next() {
        Model._tasks.shift(); // save is done

        if (Model._tasks.length) {
            // run the next task
            //console.log('Running the next task.');
            return Model._tasks[0]().finally(Model._next);
        }
    }

    /**
     * if not securely saved, then makes a post to /save<object>
     *
     * this may be intercepted by a service worker, which could write the image to indexeddb
     * a successful save will result in a JSON response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails, then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexeddb
     *
     * must test indexeddb for this eventuality after the save has returned
     *
     * @param {FormData} formData
     * @param {boolean} isSync default false, set if request is part of sync all rather than a regular save
     * @returns {Promise}
     */
    post(formData, isSync = false) {
        return fetch(`${this.SAVE_ENDPOINT}${isSync ? '?issync' : ''}`, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                // need to find out whether this was a local store in indexedDb by the service worker
                // or a server-side save

                // to do that, need to decode the JSON response
                // which can only be done once, so need to clone first
                const clonedResponse = response.clone();
                return clonedResponse.json().then((responseData) => {
                    /** @param {{saveState : string, created : number, modified : number}} responseData */

                    //console.log({'returned to client after save' : responseData});

                    switch (responseData.saveState) {
                        case SAVE_STATE_SERVER:
                            this._savedLocally = true;
                            this.savedRemotely = true;
                            break;

                        case SAVE_STATE_LOCAL:
                            this._savedLocally = true;
                            this.savedRemotely = false;
                            break;

                        default:
                            console.log(`Unrecognised save state '${responseData.saveState}'`);
                    }

                    this.createdStamp = parseInt(responseData.created, 10);
                    this.modifiedStamp = parseInt(responseData.modified, 10);

                    // return the JSON version of the original response as a promise
                    return response.json(); // assign a JSON type to the response
                });
            } else {
                // try instead to write the data to local storage

                console.log('Save failed, presumably service worker is missing and there is no network connection. Should write to IndexedDb here.');
                this._savedLocally = false;
                this.savedRemotely = false;

                return Promise.reject(`IndexedDb storage not yet implemented (probably no service worker). (${response.status}) when saving ${this.constructor.className}`);
            }
        });
    }

    /**
     *
     * @param {string} key
     * @param {string} type
     * @returns {Promise<{}>}
     */
    static retrieveRawFromLocal(key, type) {
        if (!key || key === 'undefined') {
            // bad key or literal string 'undefined'
            throw new Error(`Cannot retrieve empty or 'undefined' key from local '${key}', type '${typeof key}'.`);
        }

        return localforage.getItem(`${type}.${key}`)
            .then(
                (descriptor) => {
                    if (descriptor) {
                        return descriptor;
                    } else {
                        return Promise.reject(`Failed to retrieve ${type}.${key} locally`);
                    }
                },
                (reason) => {
                    console.error({'Error retrieving from localforage' : {type : `${type}.${key}`}, reason});
                    return Promise.reject(`Failed to retrieve ${type}.${key} locally (forage error)`);
                }
            );
    }

    /**
     *
     * @param {string} key
     * @param {(Survey|Occurrence|OccurrenceImage|Track)} modelObject
     * @returns {Promise<Model>}
     */
    static retrieveFromLocal(key, modelObject) {
        if (!key || key === 'undefined') {
            // bad key or literal string 'undefined'
            throw new Error(`Cannot retrieve empty or 'undefined' key from local '${key}', type '${typeof key}'.`);
        }

        return localforage.getItem(`${modelObject.TYPE}.${key}`)
            .then(
                (descriptor) => {
                    if (descriptor) {
                        modelObject._id = key; // _id must be set directly rather than through the setter, as a spurious id already set for the empty may need to be overwritten
                        modelObject._parseDescriptor(descriptor);

                        return modelObject;
                    } else {
                        return Promise.reject(`Failed to retrieve ${modelObject.TYPE}.${key} locally`);
                    }
                },
                (reason) => {
                    console.error({'Error retrieving from localforage' : {type : `${modelObject.TYPE}.${key}`}, reason});
                    return Promise.reject(`Failed to retrieve ${modelObject.TYPE}.${key} locally (forage error)`);
                }
            );
    }

    /**
     *
     * @param {{
     *      id : string,
     *      saveState: string,
     *      [userId]: string,
     *      attributes: Object.<string, *>,
     *      deleted: boolean|string,
     *      created: (number|string),
     *      modified: (number|string),
     *      projectId: (number|string)
     *      }} descriptor
     */
    _parseDescriptor(descriptor) {
        this._parseAttributes(descriptor.attributes);
        this._parseSavedState(descriptor.saveState);
        this.deleted = (descriptor.deleted === true) || (descriptor.deleted === 'true'); // cast stringified boolean to true boolean
        this.createdStamp = parseInt(descriptor.created, 10);
        this.modifiedStamp = descriptor.modified ? parseInt(descriptor.modified, 10) : 0; // avoids NaN
        this.projectId = parseInt(descriptor.projectId, 10);

        if (descriptor.userId) {
            this.userId = descriptor.userId;
        }
    }

    /**
     *
     * @param {Object.<string, {}>|string|Array} attributes
     */
    _parseAttributes(attributes) {
        if (typeof attributes === 'string') {
            attributes = JSON.parse(attributes);
        }

        if (Array.isArray(attributes)) {
            // problematic bug, where empty attributes come back as an array rather than as an object

            //console.log('Attributes were spuriously represented as an array rather than as an empty object');
            this.attributes = {};
        } else {
            this.attributes = attributes;
        }
    }

    /**
     *
     * @param {string} saveState
     */
    _parseSavedState(saveState) {
        switch (saveState) {
            case SAVE_STATE_LOCAL:
                this.savedRemotely = false;
                this._savedLocally = true;
                break;

            case SAVE_STATE_SERVER:
                this.savedRemotely = true;
                this._savedLocally = true;
                break;

            default:
                throw new Error(`Unrecognised saved state '${saveState}`);
        }
    }

    /**
     * update modified stamp to current time
     */
    touch() {
        this.modifiedStamp = Math.floor(Date.now() / 1000);

        if (this.isPristine) {
            this.isPristine = false;
            this.createdStamp = this.modifiedStamp;
        }

        this._savedLocally = false;
        this.savedRemotely = false;
    }

    /**
     *
     * @param {Object.<string,{field: typeof FormField, [validator]: function, attributes: {label: string, helpText: string, placeholder: string, autocomplete: string}}>} formSectionProperties
     * @return {{requiredFieldsPresent: boolean, validity: Object.<string, boolean>}}
     */
    evaluateCompletionStatus(formSectionProperties) {
        const validity = {};
        let requiredFieldsPresent = true;

        for (let key in formSectionProperties) {
            if (formSectionProperties.hasOwnProperty(key)) {
                let property = formSectionProperties[key];

                validity[key] = property.validator ?
                    property.validator(key, property, this.attributes)
                    :
                    property.field.isValid(key, property, this.attributes);

                if (null !== validity[key]) {
                    // validity can be 'null' in which case field was optional and not assessed
                    requiredFieldsPresent = requiredFieldsPresent && validity[key];
                }
            }
        }

        return {
            requiredFieldsPresent,
            validity
        };
    }

    destructor() {
        this.fireEvent(MODEL_EVENT_DESTROYED);
        super.destructor();
    }
}

// SurveyPickerController
//


/**
 * @typedef {import('bsbi-app-framework-view').SurveyPickerView} SurveyPickerView
 * @typedef {import('bsbi-app-framework-view').PatchedNavigo} PatchedNavigo
 */

class SurveyPickerController extends AppController {
    route = '/survey/:action/:id';

    static EVENT_BACK = 'back';

    title = 'Survey picker';

    /**
     *
     * @type {SurveyPickerView}
     */
    view;

    /**
     *
     * @returns {Survey}
     */
    get survey() {
        return this.app.currentSurvey;
    }

    /**
     *
     * @param {SurveyPickerView} view
     */
    constructor (view) {
        super();

        this.view = view;
        view.controller = this;

        this.handle = AppController.nextHandle;
    }

    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */
    registerRoute(router) {
        // router.on(
        //     '/survey',
        //     this.mainRouteHandler.bind(this, 'survey', '', ''),
        //     {
        //         // before : this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        //         // after : this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        //         // leave : this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        //         // already : this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
        //     }
        // );

        router.on(
            '/survey/new',
            this.newSurveyHandler.bind(this, 'survey', 'new', ''),
            {
                before : this.beforeNewHandler.bind(this)
            }
        );

        router.on(
            '/survey/reset',
            this.mainRouteHandler.bind(this, 'survey', 'reset', ''),
            {
                before : this.beforeResetHandler.bind(this)
            }
        );

        router.on(
            '/survey/save',
            this.mainRouteHandler.bind(this, 'survey', 'save', ''),
            {
                before : this.beforeSaveAllHandler.bind(this)
            }
        );

        router.on(
            '/survey/add/:surveyId/:occurrenceId',
            this.addSurveyHandler.bind(this, 'survey', 'add', ''),
            {
                before: this.beforeRouteLoginHandler.bind(this),
            }
        );

        router.on(
            '/survey/add/:surveyId',
            this.addSurveyHandler.bind(this, 'survey', 'add', ''),
            {
                before: this.beforeRouteLoginHandler.bind(this),
            }
        );

        this.app.addListener(APP_EVENT_ADD_SURVEY_USER_REQUEST, this.addNewSurveyHandler.bind(this));
        this.app.addListener(APP_EVENT_RESET_SURVEYS, this.resetSurveysHandler.bind(this));
    }

    beforeNewHandler(done) {
        this.view.newSurveyDialog();
        this.app.revertUrl();
        done(false); // block navigation
    }

    beforeResetHandler(done) {
        this.view.showResetDialog();
        this.app.revertUrl();

        done(false); // block navigation
    }

    beforeSaveAllHandler(done) {

        if (navigator.onLine) {
            // invoke sync of any/all unsaved data
            // show pop-ups on success and failure
            this.app.syncAll(false).then((result) => {
                //console.log({'In save all handler, success result': result});

                this.view.showSaveAllSuccess(result);

                return this.app.refreshFromServer(Array.from(this.app.surveys.keys()), false)
                    .then(() => this.app.addAllSurveysFromLocal())
                    .then(() => {
                        console.log('Surveys refreshed from the server');
                        // this.fireEvent(APP_EVENT_SURVEYS_CHANGED); this will have been fired already from app.addSurvey()

                        // @todo should now update the current survey from indexDb without clearing existing entries
                    });
            }, (result) => {
                console.log({'In save all handler, failure result': result});
                // noinspection JSIgnoredPromiseFromCall
                Logger.logError(`Failed to sync all (line 143): ${JSON.stringify(result)}`);
                this.view.showSaveAllFailure(result);
            }).finally(() => {
                // stop the spinner
            });
        }

        this.app.revertUrl();
        done(false); // block navigation
    }

    /**
     *
     * @param {string} context typically 'survey'
     * @param {('new'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */
    newSurveyHandler(context, subcontext, rhs, queryParameters) {
        // should not get here, as beforeNewHandler ought to have been invoked first
    }

    /**
     * called after user has confirmed add new survey dialog box
     *
     */
    addNewSurveyHandler() {
        console.log("reached addNewSurveyHandler");
        this.app.currentControllerHandle = this.handle; // when navigate back need to list need to ensure full view refresh

        // it's opportune at this point to try to ping the server again to save anything left outstanding
        this.app.syncAll(true).finally(() => {

            // the app's occurrences should only relate to the current survey
            // (the reset are remote or in IndexedDb)
            this.app.clearCurrentSurvey().then(() => {

                this.app.setNewSurvey();

                this.app.router.pause();
                this.app.router.navigate('/list/survey/about').resume(); // jump straight into the survey rather than to welcome stage
                this.app.router.resolve();
            });
        });
    }

    /**
     * called after user has confirmed reset surveys dialog box
     */
    resetSurveysHandler() {
        this.app.clearLocalForage().then(() => {
            return this.app.reset();
        }).finally(() => {
            this.addNewSurveyHandler();
        });
    }

    /**
     * url fragment to redirect to, following addition of an existing survey, e.g. a pick from the selection list
     *
     * should be '/list' or '/list/record'
     *
     * @type {string}
     */
    restoredSurveyNavigationTarget = '/list';

    /**
     *
     * @param {string} context typically 'survey'
     * @param {('add'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */
    addSurveyHandler(context, subcontext, rhs, queryParameters) {
        console.log("reached addSurveyHandler");
        //console.log({context: context, params: subcontext, query: queryParameters});

        this.app.currentControllerHandle = this.handle; // when navigate back need to list need to ensure full view refresh

        let surveyId = queryParameters.surveyId;

        if (!surveyId || !surveyId.match(UUID_REGEX)) {
            throw new NotFoundError(`Failed to match survey id '${surveyId}', the id format appears to be incorrect`);
        }

        surveyId = surveyId.toLowerCase();

        // hide the left panel before loading, otherwise there can be a confusing delay
        this.view.hideLeftPanel();

        this.app.restoreOccurrences(surveyId, false, true, false, true)
            .then(() => {
                this.app.markAllNotPristine();

                this.app.router.pause();
                this.app.router.navigate(this.restoredSurveyNavigationTarget).resume();
                this.app.router.resolve();
            }, (error) => {
                console.log({'failed survey restoration' : error});

                // should display a modal error message
                // either the survey was not found or there was no network connection

                // should switch to displaying a list of available surveys and an option to start a new survey
            })
            .finally(() => {
                this.view.restoreLeftPanel();
            })
        ;
    }

    /**
     *
     * @param {string} context typically 'survey'
     * @param {('add'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */
    mainRouteHandler(context, subcontext, rhs, queryParameters) {
        console.log("reached special route handler for SurveyPickerController.js");
        //console.log({context: context, params: subcontext, query: queryParameters});
    }

    /**
     * Placeholder hook for login, overriden in descendants as required
     *
     * @param done
     * @param params
     */
    beforeRouteLoginHandler(done, params) {
        done(true);
    }
}

/**
 *
 * @param text
 * @returns {string}
 */
function escapeHTML(text) {
    try {
        // IE (even v 11) sometimes fails here with 'Unknown runtime error', see http://blog.rakeshpai.me/2007/02/ies-unknown-runtime-error-when-using.html
        const textArea = document.createElement('textarea');
        textArea.innerHTML = text;
        return textArea.innerHTML.replace(/"/g, '&quot;');
    } catch (e) {
        const pre = document.createElement('pre');
        pre.appendChild(document.createTextNode(text));
        return pre.innerHTML.replace(/"/g, '&quot;');
    }
}

class DeviceType extends EventHarness {
	static DEVICE_TYPE_UNKNOWN = 'unknown';
	static DEVICE_TYPE_UNCHECKED = 'unchecked';
	static DEVICE_TYPE_MOBILE = 'mobile';
	static DEVICE_TYPE_IMMOBILE = 'immobile';

	/**
	 * global flag affecting the behaviour of some GPS functionality,
	 * e.g. on a non-mobile device don't automatically seek GPS locality for new records
	 * @private
	 *
	 * @type {string}
	 */
	static _deviceType = DeviceType.DEVICE_TYPE_UNCHECKED;

	/**
	 * @type {App}
	 */
	static app;

	/**
	 * @returns {string}
	 */
	static getDeviceType() {
		if (DeviceType._deviceType === DeviceType.DEVICE_TYPE_UNCHECKED) {
			const override = DeviceType?.app?.getOption?.('mobileOverride');

			if (override === 'mobile') {
				DeviceType._deviceType = DeviceType.DEVICE_TYPE_MOBILE;
			} else if (override === 'immobile') {
				DeviceType._deviceType = DeviceType.DEVICE_TYPE_IMMOBILE;
			} else {
				DeviceType._deviceType = DeviceType.getDeviceTypeUncached();
			}
		}

		return DeviceType._deviceType;
	}

	/**
	 *
	 * @returns {boolean} true if the device type has changed
	 */
	static reevaluate() {
		const previous = DeviceType._deviceType;
		DeviceType._deviceType = DeviceType.DEVICE_TYPE_UNCHECKED; // reset
		DeviceType._deviceType = DeviceType.getDeviceType();

		return previous !== DeviceType._deviceType;
	}

	/**
	 *
	 * @param {string} deviceType
	 */
	static setDeviceType(deviceType) {
		DeviceType._deviceType = deviceType;
	}

	// /**
	//  * @returns {string}
	//  */
	// static getDeviceType() {
	// 	if (DeviceType._deviceType === DeviceType.DEVICE_TYPE_UNCHECKED) {
	// 		// noinspection JSUnresolvedReference
	// 		if (navigator.userAgentData && "mobile" in navigator.userAgentData) {
	// 			DeviceType._deviceType = navigator.userAgentData.mobile ?
	// 				DeviceType.DEVICE_TYPE_MOBILE : DeviceType.DEVICE_TYPE_IMMOBILE;
	// 			console.log(`Evaluated device using mobile flag, result: ${DeviceType._deviceType}`);
	// 		} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
	// 			// see https://javascript.plainenglish.io/how-to-detect-a-mobile-device-with-javascript-1c26e0002b31
	// 			console.log(`Detected mobile via use-agent string: ${navigator.userAgent}`);
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_MOBILE;
	// 		} else if (navigator.platform && /iPhone|iPad/.test(navigator.platform)) {
	// 			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
	// 			console.log(`Detected mobile via platform string: ${navigator.platform}`);
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_MOBILE;
	// 		} else if (navigator.platform && /Win32|^Mac/.test(navigator.platform)) {
	// 			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
	// 			console.log(`Detected immobility via platform string: ${navigator.platform}`);
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_IMMOBILE;
	// 		} else {
	// 			console.log('Flagging device type as unknown.');
	// 			DeviceType._deviceType = DeviceType.DEVICE_TYPE_UNKNOWN;
	// 		}
	// 	}
	//
	// 	return DeviceType._deviceType;
	// }

	/**
	 * Evaluates the device type based on browser information, does not consider user-set overrides.
	 *
	 * @returns {string}
	 */
	static getDeviceTypeUncached() {
		// noinspection JSUnresolvedReference
		if (navigator.userAgentData && "mobile" in navigator.userAgentData) {
			return navigator.userAgentData.mobile ?
				DeviceType.DEVICE_TYPE_MOBILE : DeviceType.DEVICE_TYPE_IMMOBILE;
			// console.log(`Evaluated device using mobile flag, result: ${DeviceType._deviceType}`);
		} else if (/Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)) {
			// see https://javascript.plainenglish.io/how-to-detect-a-mobile-device-with-javascript-1c26e0002b31
			//console.log(`Detected mobile via use-agent string: ${navigator.userAgent}`);
			return DeviceType.DEVICE_TYPE_MOBILE;
		} else if (navigator.platform && /iPhone|iPad/.test(navigator.platform)) {
			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
			//console.log(`Detected mobile via platform string: ${navigator.platform}`);
			return DeviceType.DEVICE_TYPE_MOBILE;
		} else if (navigator.platform && /Win32|^Mac/.test(navigator.platform)) {
			// see https://stackoverflow.com/questions/19877924/what-is-the-list-of-possible-values-for-navigator-platform-as-of-today
			//console.log(`Detected immobility via platform string: ${navigator.platform}`);
			return DeviceType.DEVICE_TYPE_IMMOBILE;
		} else {
			//console.log('Flagging device type as unknown.');
			return DeviceType.DEVICE_TYPE_UNKNOWN;
		}
	}
}

/**
 * Used for saving current survey track that is still open
 * @type {number}
 */
const TRACK_END_REASON_SURVEY_OPEN = 0;

const TRACK_END_REASON_WATCHING_ENDED = 1;
const TRACK_END_REASON_SURVEY_DATE = 2;
const TRACK_END_REASON_SURVEY_CHANGED = 3;

/**
 * @typedef {import('british-isles-gridrefs').GridCoords} GridCoords
 */

class Track extends Model {

    /**
     * mirrors constructor.name but doesn't get mangled by minification
     *
     * @type {string}
     */
    static className = 'Track';

    /**
     * @todo consider whether PointTriplet should also include accuracy
     *
     * @typedef PointTriplet
     * @type {array}
     * @property {number} 0 lng
     * @property {number} 1 lat
     * @property {number} 2 stamp (seconds since epoch)
     */

    /**
     * @typedef PointSeries
     * @type {Array<Array<PointTriplet>|number>}
     * @property {Array<PointTriplet>} 0 points
     * @property {number} 1 end reason code
     */

    // /**
    //  *
    //  * @type {{}}
    //  */
    // attributes = {};

    /**
     *
     * @type {Array<PointSeries>}
     */
    points = []

    /**
     * next index to write to in points
     * Following a successful save to the server, the earlier values will be cleared locally, but pointIndex will continue
     *
     * @type {number}
     */
    pointIndex = 0;

    /**
     *
     * @type {string}
     */
    userId = '';

    /**
     *
     * @type {string}
     */
    surveyId = '';

    /**
     * route tracking should be maintained separately on each device
     * (e.g. if multiple people linked to a single live survey)
     *
     * @type {string}
     */
    deviceId = '';

    // /**
    //  * set if the image has been posted to the server
    //  * (a local copy might still exist, which may have been reduced to thumbnail resolution)
    //  *
    //  * @type {boolean}
    //  */
    // _savedRemotely = false;

    // /**
    //  * set if the image has been added to a temporary store (e.g. indexedDb)
    //  *
    //  * @type {boolean}
    //  */
    // _savedLocally = false;

    SAVE_ENDPOINT = '/savetrack.php';

    TYPE = 'track';

    /**
     * @type {App}
     */
    static _app;

    /**
     * Tracking is active if GPS watching is turned on,
     * the current survey is from the same day and the device id matches
     *
     * @type {boolean}
     */
    static trackingIsActive = false;

    /**
     *
     * @type {null|string}
     * @private
     */
    static _currentlyTrackedSurveyId = null;

    /**
     *
     * @type {null|string}
     * @private
     */
    static _currentlyTrackedDeviceId = null;

    /**
     * keyed by survey id and then by device id
     *
     * @type {Map<string, Map<string,Track>>}
     * @private
     */
    static _tracks = new Map();

    /**
     * Unix timestamp of the most recent co-ordinate ping, in ms
     * @type {number}
     */
    static lastPingStamp = 0;

    /**
     * Minimum interval between position updates in milliseconds
     * @type {number}
     */
    static msInterval = 30 * 1000;

    /**
     *
     * @type {EventHarness~Handle|null}
     */
    _surveyChangeListenerHandle = null;

    /**
     *
     * @type {EventHarness~Handle|null}
     */
    _surveyDestroyedListenerHandle = null;

    /**
     *
     * @type {EventHarness~Handle|null}
     */
    _surveyOccurrencesChangeListenerHandle = null;

    // /**
    //  * Project ids of survey types that are trackable
    //  *
    //  * @type {Array<number>}
    //  */
    // static trackableSurveyProjects = [];

    static reset() {
        Track._tracks = new Map();
        Track.trackingIsActive = false;
        Track._currentlyTrackedSurveyId = null;
        Track.lastPingStamp = 0;
    }

    /**
     * Need to listen for change of current survey
     *
     * @param {App} app
     */
    static registerApp(app) {
        Track._app = app;
    }

    static _staticListenersRegistered = false;

    static registerStaticListeners() {
        if (!Track._staticListenersRegistered) {
            const app = Track._app;
            if (DeviceType.getDeviceType() !== DeviceType.DEVICE_TYPE_IMMOBILE) {
                app.addListener(APP_EVENT_CURRENT_SURVEY_CHANGED, (/** {newSurvey : Survey|null}|null */ params) => {
                    //const survey = Track._app.currentSurvey;
                    const survey = params?.newSurvey;
                    params = null;

                    if (!survey || Track._currentlyTrackedSurveyId !== survey.id) {
                        /**
                         *
                         * @type {null|Survey}
                         */
                        let previouslyTrackedSurvey = null;

                        if (Track._currentlyTrackedSurveyId) {
                            /**
                             * @type {Track|null}
                             */
                            const oldTrack =
                                Track._tracks.get(Track._currentlyTrackedSurveyId)
                                    ?.get?.(Track._currentlyTrackedDeviceId);

                            previouslyTrackedSurvey = this._app.surveys.get(Track._currentlyTrackedSurveyId);

                            if (oldTrack) {
                                if (oldTrack._surveyChangeListenerHandle) {
                                    oldTrack.removeSurveyChangeListener();
                                }

                                oldTrack.endCurrentSeries(TRACK_END_REASON_SURVEY_CHANGED);

                                oldTrack.save(true).then(() => {
                                    console.log(`Tracking for survey ${oldTrack.surveyId} saved following survey change.`);
                                });
                            } else {
                                console.error(`Failed to retrieve old track for survey ${Track._currentlyTrackedSurveyId} in survey changed event handler.`);
                            }

                            Track._currentlyTrackedSurveyId = null;
                            Track._currentlyTrackedDeviceId = null;
                        }

                        Track.applyChangedSurveyTrackingResumption(survey, previouslyTrackedSurvey);
                    }
                });
            }

            Track._app.addListener(APP_EVENT_WATCH_GPS_USER_REQUEST, () => {
                const survey = this._app.currentSurvey;

                if (survey) {
                    if (!survey.attributes?.casual && survey.isToday()) {
                        // Resume existing tracking, or start a new track.
                        Track._trackSurvey(survey);
                        Track.trackingIsActive = true;
                    }
                }
            });

            Track._app.addListener(APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST, () => {

                if (Track.trackingIsActive) {
                    /**
                     * @type {Track|null}
                     */
                    const track = Track._tracks.get(Track._currentlyTrackedSurveyId)?.get?.(Track._currentlyTrackedDeviceId);

                    if (track) {
                        track.endCurrentSeries(TRACK_END_REASON_WATCHING_ENDED);

                        track.save(true).then(() => {
                            console.log(`Tracking for survey ${track.surveyId} saved following tracking change.`);
                        });
                    }

                    Track._currentlyTrackedSurveyId = null;
                    Track._currentlyTrackedDeviceId = null;
                    Track.trackingIsActive = false;
                }
            });
            Track._staticListenersRegistered = true;
        }
    }

    /**
     *
     * @param {Survey} survey
     * @param {?Survey} previouslyTrackedSurvey
     */
    static applyChangedSurveyTrackingResumption(survey, previouslyTrackedSurvey = null) {
        // Tracking should only resume automatically if the survey change was an automatic switch
        // to a new square and tracking was previously active.

        // otherwise, there is a risk that a survey switch will lead to spurious new points
        if (survey &&
            !survey.attributes?.casual &&
            survey.isToday() !== false &&
            survey.baseSurveyId === previouslyTrackedSurvey?.baseSurveyId
        ) {
            // Resume existing tracking or start a new track.

            console.log('continuing tracking for survey with common baseSurvey');
            Track._trackSurvey(survey);
            Track.trackingIsActive = true;
        } else if (survey && !survey.attributes?.casual && survey.isToday() !== false) {
            // Dependent on user preferences may restart tracking
            const trackingLocation = Track._app.getOption('trackLocation')  && DeviceType.getDeviceType() !== DeviceType.DEVICE_TYPE_IMMOBILE;

            if (trackingLocation) {
                // start tracking

                console.log('start tracking for survey based on user preference');
                Track._trackSurvey(survey);
                Track.trackingIsActive = true;
                Track._app.fireEvent(APP_EVENT_WATCH_GPS_USER_REQUEST, {auto: true});
            } else {
                Track._app.fireEvent(APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST, {auto : true});
            }
        } else {
            Track._app.fireEvent(APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST, {auto : true});
        }
    }

    /**
     * Resume existing tracking, or start a new track.
     *
     * @param {Survey} survey
     * @private
     */
    static _trackSurvey(survey) {
        let surveyTracks = Track._tracks.get(survey.id);
        let track;

        if (!surveyTracks) {
            surveyTracks = new Map();
            Track._tracks.set(survey.id, surveyTracks);
        }

        const deviceId = Track._app.deviceId;

        if (surveyTracks.has(deviceId)) {
            track = surveyTracks.get(deviceId);
        } else {
            track = survey.initialiseNewTracker(Track._app);
            surveyTracks.set(deviceId, track);
        }

        track.registerSurvey(survey);
    }

    /**
     *
     * @param {GeolocationPosition} position
     * @param {GridCoords} gridCoords
     */
    static ping(position, gridCoords) {
        const track = Track._tracks.get(Track._currentlyTrackedSurveyId)?.get?.(Track._currentlyTrackedDeviceId);

        if (track) {
            const changed = track.addPoint(position, gridCoords);
            Track.lastPingStamp = position.timestamp;

            if (changed) {
                const currentSurvey = track._app?.currentSurvey;

                // survey must be saved first
                if (currentSurvey?.unsaved?.()) {
                    if (!currentSurvey.isPristine) {
                        currentSurvey.save().then(() => track.save());
                    }
                } else {
                    track.save();
                }
            }
        }
    }

    /**
     *
     * @param {GeolocationPosition} position
     * @param {GridCoords} gridCoords
     * @returns {boolean} changed
     */
    addPoint(position, gridCoords) {
        let series = this.points[this.points.length - 1];

        if (!series || series?.[1] !== TRACK_END_REASON_SURVEY_OPEN) {
            series = this.startPointSeries();
        }

        const l = series[0].length;

        // test if have moved since last point
        if (l > 0 && series[0][l - 1][0] === position.coords.longitude && series[0][l - 1][1] === position.coords.latitude) {
            // no change since last point
            return false;
        } else {

            series[0][l] = [
                position.coords.longitude,
                position.coords.latitude,
                Math.floor(position.timestamp / 1000),
            ];

            this.touch();

            return true;
        }
    }

    /**
     * Appends a new point series and advances this.pointIndex
     * Does not close previous series and does not mark series as unsaved (which happens only
     * once co-ordinate data starts to be added)
     *
     * @returns {PointSeries}
     */
    startPointSeries() {
        /**
         *
         * @type {PointSeries}
         */
        const pointSeries = [
            /** @type {Array<PointTriplet>} */ [], // empty array of PointTriplets
            TRACK_END_REASON_SURVEY_OPEN
        ];

        this.points[this.points.length] = pointSeries;

        this.pointIndex++;

        return pointSeries;
    }

    /**
     * Called only if tracking is currently enabled
     *
     * @param {number} reason
     */
    endCurrentSeries(reason) {
        if (this.points.length) {
            const lastEntry = this.points[this.points.length - 1];

            if (lastEntry[0].length) {
                // co-ordinates have been added

                lastEntry[1] = reason;
            } else {
                // this is ann empty series, so just delete it

                delete this.points[this.points.length - 1];
                this.pointIndex--;
            }
        } else {
            //throw new Error("Track.endCurrentSeries called when no series in progress.");
            console.error("Track.endCurrentSeries called when no series in progress.");
        }
    }

    /**
     * if not securely saved then makes a post to /savetrack.php
     *
     * This should be intercepted by a service worker, which could write the object to indexeddb
     * A successful save (local or to server) will result in a json response containing the object
     * and also the state of persistence. After a save to the server the points list may be cleared,
     * but pointIndex will be maintained so that tracking can resume.
     *
     * If saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the object directly to indexeddb
     *
     * Must test indexeddb for this eventuality after the save has returned.
     *
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{}} [params]
     *
     * @returns {Promise}
     */
    save(forceSave = false, isSync = false, params) {
        if (forceSave || this.unsaved()) {
            const formData = new FormData;

            if (!this.surveyId) {
                throw new Error(`Survey id must be set before saving a track.`);
            }

            if (!this.deviceId) {
                throw new Error(`Device id must be set before saving a track.`);
            }

            formData.append('type', this.TYPE);
            formData.append('surveyId', this.surveyId);
            formData.append('deviceId', this.deviceId);
            formData.append('id', `${this.surveyId}.${this.deviceId}`);
            formData.append('projectId', this.projectId.toString());
            formData.append('pointIndex', this.pointIndex.toString());
            formData.append('points', JSON.stringify(this.points));
            formData.append('attributes', JSON.stringify(this.attributes));
            formData.append('created', this.createdStamp?.toString() || '');
            formData.append('modified', this.modifiedStamp?.toString() || '');

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            formData.append('appVersion', Model.bsbiAppVersion);

            console.log('queueing Track post');
            return this.queuePost(formData, isSync);
        } else {
            return Promise.resolve();
            //return Promise.reject(`Track for survey ${this.surveyId} has already been saved.`);
        }
    }

    /**
     *
     * @param {{
     *      id : string,
     *      saveState: string,
     *      attributes: Object.<string, *>,
     *      deleted: boolean|string,
     *      created: number,
     *      modified: number,
     *      projectId: number,
     *      surveyId: string,
     *      deviceId: string,
     *      pointIndex: string,
     *      points: string | Array<PointSeries>,
     *      }} descriptor
     * @param {string|Array<PointSeries>} descriptor.points JSON-serialized Array<PointSeries> or native array
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this.surveyId = descriptor.surveyId;
        this.deviceId = descriptor.deviceId;
        this.pointIndex = parseInt(descriptor.pointIndex, 10);

        if (typeof descriptor.pointIndex === 'string') {
            // uncertain if this is ever relevant
            this.points = JSON.parse(descriptor.points);
        } else {
            this.points = descriptor.points;
        }
    }

    /**
     *
     *
     * Listen for survey changes (e.g. to date) that might abort tracking
     *
     * surveyId and deviceId will already have been set
     * The track must already have been added to Track._tracks
     *
     * sets Track._currentlyTrackedSurveyId and Track._currentlyTrackedDeviceId
     *
     * @param {Survey} survey
     *
     */
    registerSurvey(survey) {
        if (!survey) {
            throw new Error('Attempt to register null survey in Track.registerSurvey()');
        }

        Track._currentlyTrackedSurveyId = this.surveyId;
        Track._currentlyTrackedDeviceId = Track._app.deviceId;
        Track.lastPingStamp = 0;

        if (survey.attributes.casual) {
            throw new Error('Attempt to register tracking for casual survey.');
        }

        if (!this._surveyChangeListenerHandle) {
            this._surveyChangeListenerHandle = survey.addListener(SURVEY_EVENT_MODIFIED, () => {
                // need to check for change to date

                if (Track.trackingIsActive && survey.id === Track._currentlyTrackedSurveyId) {
                    if (!survey.isToday()) {
                        this.endCurrentSeries(TRACK_END_REASON_SURVEY_DATE);

                        this.save().then(() => {
                            console.log(`Tracking for survey ${this.surveyId} saved following survey date change.`);
                        });

                        Track._currentlyTrackedSurveyId = null;
                        Track._currentlyTrackedDeviceId = null;
                        Track.trackingIsActive = false;
                    }
                }
            });
        }

        if (!this._surveyOccurrencesChangeListenerHandle) {
            this._surveyOccurrencesChangeListenerHandle = survey.addListener(SURVEY_EVENT_OCCURRENCES_CHANGED, () => {
                // if occurrences have changed, then worth ensuring that tracking is up-to-date

                this.isPristine = false; // probably not required, but safety fallback to ensure survey is saved

                if (Track.trackingIsActive && survey.id === Track._currentlyTrackedSurveyId && !this.isPristine && this.unsaved()) {
                    this.save().then(() => {
                        console.log(`Tracking for survey ${this.surveyId} saved following occurrence change.`);
                    });
                }
            });
        }

        if (!this._surveyDestroyedListenerHandle) {
            this._surveyDestroyedListenerHandle = survey.addListener(MODEL_EVENT_DESTROYED, () => {
                this.removeSurveyChangeListener();
            });
        }
    }

    removeSurveyChangeListener() {
        const survey = Track._app.surveys.get(this.surveyId);

        survey?.removeListener?.(SURVEY_EVENT_MODIFIED, this._surveyChangeListenerHandle);
        this._surveyChangeListenerHandle = undefined;

        survey?.removeListener?.(SURVEY_EVENT_MODIFIED, this._surveyOccurrencesChangeListenerHandle);
        this._surveyOccurrencesChangeListenerHandle = undefined;

        survey?.removeListener?.(MODEL_EVENT_DESTROYED, this._surveyDestroyedListenerHandle);
        this._surveyDestroyedListenerHandle = undefined;
    }
}

class TaxonError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, TaxonError); // see https://v8.dev/docs/stack-trace-api
    }
}

const SORT_ORDER_GENUS = 28;
const SORT_ORDER_SPECIES = 56;
const SORT_ORDER_SUBSPECIES = 76;
const SORT_ORDER_CULTIVAR = 120;

const AGG_QUALIFIER = 'agg.';
const SL_QUALIFIER = 's.l.';

const INFO_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg>';

const RAW_TAXON_NAMESTRING = 0;
const RAW_TAXON_CANONICAL = 1;
const RAW_TAXON_HYBRID_CANONCIAL = 2;
const RAW_TAXON_ACCEPTED_ENTITY_ID = 3;
const RAW_TAXON_QUALIFIER = 4;
const RAW_TAXON_AUTHORITY = 5;
const RAW_TAXON_VERNACULAR = 6;
const RAW_TAXON_VERNACULAR_ROOT = 7;
const RAW_TAXON_USED = 8;
const RAW_TAXON_SORT_ORDER = 9;
const RAW_TAXON_PARENT_IDS = 10;
const RAW_TAXON_VERNACULAR_NOT_FOR_ENTRY = 11;
const RAW_TAXON_GB_NATIONAL_STATUS = 12;
const RAW_TAXON_IE_NATIONAL_STATUS = 13;
const RAW_TAXON_CI_NATIONAL_STATUS = 14;
const RAW_TAXON_GB_RARE_SCARCE = 15;
const RAW_TAXON_IE_RARE_SCARCE = 16;
const RAW_TAXON_NYPH_RANKING = 17;
const RAW_TAXON_BRC_CODE = 18;
const RAW_TAXON_NOT_FOR_NEW_RECORDING = 19;
const RAW_TAXON_ATLAS_DOCS = 20;

class Taxon {
    /**
     * @typedef RawTaxon
     * @type {array}
     * @property {string} 0 - nameString
     * @property {(string|number)} 1 - canonical
     * @property {string} 2 hybridCanonical, raw entry is 0/undefined if canonical == hybridCanonical
     * @property {(string|number)} 3 acceptedEntityId or 0/undefined if name is accepted
     * @property {string} 4 qualifier
     * @property {string} 5 authority
     * @property {string} 6 vernacular
     * @property {string} 7 vernacularRoot
     * @property {number} 8 used
     * @property {number} 9 sortOrder
     * @property {Array.<string>} 10 parentIds id(s) of *immediate* parent(s)
     * @property {number} [11] vernacularNotForEntry (1 === not for entry)
     * @property {string} [12] GB national status
     * @property {string} [13] IE national status
     * @property {string} [14] CI national status
     * @property {string} [15] GB rare/scarce conservation status
     * @property {string} [16] IE rare/scarce conservation status
     * @property {number|null} [17] (optionally) NYPH percentile ranking or null
     * @property {string|null} [18] BRC code
     * @property {string|null} [19] Taxon not for new recording
     * @property {number} [20] documentation (Atlas captions etc.) [not used yet]
     *
     * // properties beyond this point are not part of the source file
     * @property {{}} [21] Presence in grid-squares (top-level object is keyed by grid-ref)
     * @property {{}} [22] Presence on rpr
     * @property {{}} [23] Presence in county (top-level object is keyed by vc code string, including prefix)
     */

    static PARENT_IDS_KEY = 10;

    static GR_PRESENCE_KEY = 21;
    static RPR_KEY = 22;
    static VC_PRESENCE_KEY = 23;

    /**
     *
     * @type {Object.<string, RawTaxon>}
     */
    static rawTaxa;

    /**
     *
     * @type {boolean}
     */
    static includeAtlasDocumentation = false;

    /**
     * @type {string}
     */
    id;

    /**
     *
     * @type {string}
     */
    nameString = '';

    /**
     *
     * @type {string}
     */
    canonical = '';

    /**
     *
     * @type {string}
     */
    hybridCanonical = '';

    /**
     *
     * @type {string}
     */
    acceptedEntityId = '';

    /**
     *
     * @type {string}
     */
    qualifier = '';

    /**
     *
     * @type {string}
     */
    authority = '';

    /**
     *
     * @type {string}
     */
    vernacular = '';

    /**
     *
     * @type {string}
     */
    vernacularRoot = '';

    /**
     * if set then the vernacular name should not be allowed for data entry
     *
     * @type {boolean}
     */
    badVernacular = false;

    /**
     * @type {boolean}
     */
    used;

    /**
     * @type {number}
     */
    sortOrder;

    /**
     *
     * @type {Array.<string>}
     */
    parentIds = [];

    /**
     *
     * @type {{CI: null|string, GB: null|string, IE: null|string}}
     */
    nationalStatus = {
        GB : null,
        IE : null,
        CI : null
    }

    /**
     * if rated, then the string is 'scarce' or 'rare'
     *
     * @type {{GB: null|('rare'|'scarce'), IE: null|('rare'|'scarce')}}
     */
    rareScarceStatus = {
        GB : null,
        IE : null
    }

    /**
     *
     * @type {{number, (string|true)}}
     */
    rprStatus = {}

    /**
     * keyed by grid-square string
     * @type {Object<string, {current : number, previous : number, [year] : number, [status] : string}>|null}
     */
    occurrenceCoverage = null;

    /**
     * keyed by vc code string
     * @type {Object<string, {current : number, previous : number, [year] : number}>|null}
     */
    vcPresence = null;

    /**
     *
     * @type {number|null}
     */
    nyphRanking = null;

    /**
     *
     * @type {boolean}
     */
    notForNewRecording = false;

    /**
     *
     * @type {string}
     */
    brcCode = '';

    /**
     *
     * @type {null|{description: string, trends: string, biogeog: string}}
     */
    documentation = null;

    /**
     *
     * @type {boolean}
     */
    static showVernacular = true;

    /**
     *
     * @param {Object.<string, RawTaxon>} taxa
     */
    static setTaxa(taxa) {
        Taxon.rawTaxa = taxa;
    }

    /**
     *
     * @param {Object.<string, RawTaxon>} taxa
     * @param {string} sourceUrl
     */
    static initialiseTaxa(taxa, sourceUrl) {
        Taxon.rawTaxa = taxa;

        if (navigator.onLine && (taxa.stamp + (3600 * 24 * 7)) < (Date.now() / 1000)) {
            console.log(`Taxon list may be stale (stamp is ${taxa.stamp}), prompting re-cache.`);
            navigator?.serviceWorker?.ready?.then?.((registration) => {
                registration.active.postMessage(
                    {
                        action: 'recache',
                        url: sourceUrl
                    }
                );
            });
        }
    }

    /**
     *
     * @param {string} id
     * @returns {Taxon}
     * @throws {TaxonError}
     */
    static fromId (id) {
        if (!Taxon.rawTaxa) {
            throw new TaxonError(`Taxon.fromId() called before taxon list has been initialized.`);
        }

        if (!Taxon.rawTaxa.hasOwnProperty(id)) {
            //console.error(`Taxon id '${id}' not found.`);
            throw new TaxonError(`Taxon id '${id}' not found.`);
        }

        const raw = Taxon.rawTaxa[id];

        // if (raw[0] === 'Poa annua') {
        //     console.log('got Poa annua');
        // }

        const taxon = new Taxon;

        taxon.id = id;
        taxon.nameString = raw[0];
        taxon.canonical = raw[1] || raw[0]; // raw entry is blank if namesString == canonical
        taxon.hybridCanonical = raw[2] || taxon.canonical; // raw entry is blank if canonical == hybridCanonical
        taxon.acceptedEntityId = raw[3] || id;
        taxon.qualifier = raw[4] || '';
        taxon.authority = raw[5] || '';
        taxon.vernacular = raw[6] || '';
        taxon.vernacularRoot = raw[7] || '';
        taxon.used = !!raw[8];
        taxon.sortOrder = raw[9];
        taxon.parentIds = raw[10];
        taxon.badVernacular = !!raw[11];
        taxon.nyphRanking = raw[RAW_TAXON_NYPH_RANKING] || null;
        taxon.notForNewRecording = !!raw[RAW_TAXON_NOT_FOR_NEW_RECORDING];
        taxon.brcCode = raw[RAW_TAXON_BRC_CODE] || '';

        taxon.nationalStatus = {
            GB: raw[12] || null,
            IE: raw[13] || null,
            CI: raw[14] || null
        };

        taxon.rareScarceStatus = {
            GB: raw[15] || null,
            IE: raw[16] || null
        };

        taxon.rprStatus = raw[Taxon.RPR_KEY] || null;

        taxon.occurrenceCoverage = raw[Taxon.GR_PRESENCE_KEY] || null;

        taxon.vcPresence = raw[Taxon.VC_PRESENCE_KEY] || null;

        return taxon;
    }

    /**
     *
     * @param {number} maxSortOrder lowest matching rank to accept
     * @param {number} minSortOrder highest rank to allow (return null if fails)
     * @param {boolean} excludeAggregates ignore aggregate parents
     * @param {boolean} excludeCultivars if set and current taxon is a cultivar then return null
     * @return {Taxon|null}
     */
    seekRankedAncestor(maxSortOrder, minSortOrder = SORT_ORDER_SPECIES, excludeAggregates = true, excludeCultivars = true) {
        const parentStack = [this];
        do {
            let taxon = parentStack.pop();

            if (taxon.sortOrder <= maxSortOrder && taxon.sortOrder >= minSortOrder) {
                // potentially have an acceptable taxon already

                if (!excludeAggregates || (taxon.qualifier !== AGG_QUALIFIER && taxon.qualifier !== SL_QUALIFIER)) {
                    return taxon;
                }
            }

            if (taxon.sortOrder < minSortOrder || (excludeCultivars && taxon.sortOrder === SORT_ORDER_CULTIVAR)) {
                continue;
            }

            if (taxon.parentIds?.length) {
                for (let parentId of taxon.parentIds) {
                    try {
                        parentStack[parentStack.length] = Taxon.fromId(parentId);
                    } catch {
                        // occasionally, taxon not found errors might end up here
                        console.error(error);
                    }
                }
            }
        } while (parentStack.length);

        return null;
    }

    /**
     *
     * @param {boolean} vernacularMatched
     * @returns {string}
     */
    formattedHTML(vernacularMatched) {
        let acceptedTaxon;

        try {
            if (this.id !== this.acceptedEntityId) {
                acceptedTaxon = Taxon.fromId(this.acceptedEntityId);
            }
        } catch (error) {
            // occasionally, taxon not found errors might end up here
            // in which case acceptedTaxon can stay unset
            console.error(error);
        }

        let infoLink = '';
        if (Taxon.includeAtlasDocumentation) {
            const preferredTaxon = acceptedTaxon || this;

            if (preferredTaxon?.documentation?.description) {
                infoLink = ` <a href="#" title="taxon description" data-taxon-info-link="${preferredTaxon.id}">${INFO_ICON_SVG}</a>`;
            }
        }

        if (Taxon.showVernacular) {
            if (vernacularMatched) {
                return (acceptedTaxon) ?
                    `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>` +
                    ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>${infoLink}`
                    :
                    `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${infoLink}`
                    ;
            } else {
                return (acceptedTaxon) ?
                    `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''
                    } = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>${infoLink}`
                    :
                    `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>${infoLink}` : ''}`
                    ;
            }
        } else {
            return (acceptedTaxon) ?
                `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>` +
                ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>${infoLink}`
                :
                `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${infoLink}`
                ;
        }
    }

    /**
     * @returns boolean
     */
    isAggregate() {
        return (this.qualifier === 's.l.' || this.qualifier === 'agg.');
    }
}

/**
 * @typedef {import('bsbi-app-framework-view').Form} Form
 */

/**
 * fired from Occurrence when the object's contents have been modified
 *
 * @type {string}
 */
const OCCURRENCE_EVENT_MODIFIED = 'modified';

const MODEL_TYPE_OCCURRENCE = 'occurrence';

class Occurrence extends Model {

    /**
     * mirrors constructor.name but doesn't get mangled by minification
     *
     * @type {string}
     */
    static className = 'Occurrence';

    /**
     *
     * @type {Object.<string, *>}
     */
    attributes = {
        // taxon: {
        //     taxonId: '',
        //     taxonName: '',
        //     vernacularMatch: false
        // }
    };

    /**
     *
     * @type {string}
     */
    userId = '';

    // /**
    //  * set if the image has been posted to the server
    //  * (a local copy might still exist, which may have been reduced to thumbnail resolution)
    //  *
    //  * @type {boolean}
    //  */
    // _savedRemotely = false;

    // /**
    //  * set if the image has been added to a temporary store (e.g. indexedDb)
    //  *
    //  * @type {boolean}
    //  */
    // _savedLocally = false;

    SAVE_ENDPOINT = '/saveoccurrence.php';

    TYPE = MODEL_TYPE_OCCURRENCE;

    // /**
    //  * fired from Occurrence when the object's contents have been modified
    //  *
    //  * @type {string}
    //  */
    // static EVENT_MODIFIED = OCCURRENCE_EVENT_MODIFIED;

    /**
     * set if this is a new entry (before user has moved on to the next entry)
     * influences whether form validation errors are displayed
     *
     * @type {boolean}
     */
    isNew = false;

    /**
     *
     * @returns {(Taxon|null)} returns null for unmatched taxa specified by name
     */
    get taxon() {
        try {
            return this.attributes.taxon?.taxonId ? Taxon.fromId(this.attributes.taxon.taxonId) : null;
        } catch (error) {
            // occasionally, taxon not found errors might end up here

            console.error(error);
            return null;
        }
    };

    /**
     * Returns true or false based on occurrence date compatibility of *this* occurrence,
     * or null if individual occurrences are not dated (i.e. part of a dated survey)
     *
     * @returns {boolean|null}
     */
    isToday() {
        const date = this.attributes.date || '';

        return date === '' ? null : (date === (new Date).toISOString().slice(0,10));
    }

    /**
     * called after the form has changed, before the values have been read back in to the occurrence
     *
     * @param {{form: Form}} params
     */
    formChangedHandler(params) {
        console.log('Occurrence change handler invoked.');

        const form = params.form;
        params = null;

        // read new values
        // then fire its own change event (Occurrence.EVENT_MODIFIED)
        form.updateModelFromContent().then(() => {
            // refresh the form's validation state
            form.conditionallyValidateForm();

           this.changeApplied();
        });
    }

    changeApplied() {
        this.touch();
        this.fireEvent(OCCURRENCE_EVENT_MODIFIED, {occurrenceId: this.id});
    }

    delete() {
        if (!this.deleted) {
            this.touch();
            this.deleted = true;

            this.fireEvent(OCCURRENCE_EVENT_MODIFIED, {occurrenceId : this.id});
        }
    }

    /**
     * If not securely saved then makes a post to /saveoccurrence.php
     *
     * This should be intercepted by a service worker, which could write the object to indexeddb
     * A successful save (local or to server) will result in a json response containing the object
     * and also the state of persistence.
     *
     * If saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the object directly to indexeddb
     *
     * Must test indexeddb for this eventuality after the save has returned.
     *
     *
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{}} [params]
     *
     * @returns {Promise}
     */
    save(forceSave = false, isSync = false, params) {
        if (this.unsaved() || forceSave) {
            const formData = new FormData;

            if (!this.surveyId) {
                throw new Error(`Survey id must be set before saving an occurrence. Failed for occ id '${this.id}'`);
            }

            formData.append('type', this.TYPE);
            formData.append('surveyId', this.surveyId);
            formData.append('occurrenceId', this.id);
            formData.append('id', this.id); // this is incorrect duplication
            formData.append('projectId', this.projectId.toString());
            formData.append('attributes', JSON.stringify(this.attributes));
            formData.append('deleted', this.deleted.toString());
            formData.append('created', this.createdStamp?.toString?.() || '');
            formData.append('modified', this.modifiedStamp?.toString?.() || '');

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            formData.append('appVersion', Model.bsbiAppVersion);

            console.log('queueing occurrence post');
            return this.queuePost(formData, isSync);
        } else {
            return Promise.reject(`Occurrence ${this.id} has already been saved.`);
        }
    }

    /**
     *
     * @param {{id : string, saveState: string, userId : string?, attributes: Object.<string, *>, deleted: boolean|string, created: number, modified: number, projectId: number, surveyId: string}} descriptor
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this.surveyId = descriptor.surveyId;
    }

    /**
     * returns interpreted grid-ref / vc summary, used to look-up meta-data for the taxon list
     *
     * @return {{
     *     hectad : string,
     *     tetrad : string,
     *     monad : string,
     *     country : string,
     *     vc : int[],
     *     interleavedGridRef : string,
     * }}
     */
    getGeoContext() {
        const geoRef = this.geoReference;

        const result = {};

        if (this.attributes.vc?.selection) {
            result.vc = [...this.attributes.vc.selection]; // clone rather than reference the VC selection
        } else {
            result.vc = [];
        }

        if (geoRef?.gridRef) {
            const gridRef = GridRef.fromString(geoRef.gridRef);

            if (gridRef) {
                if (gridRef.length <= 1000) {
                    result.monad = gridRef.gridCoords.toGridRef(1000);
                }

                if (gridRef.length <= 2000) {
                    result.tetrad = gridRef.gridCoords.toGridRef(2000);
                }

                result.country = gridRef.country;
            }

            result.hectad = gridRef.gridCoords.toGridRef(10000);

            result.interleavedGridRef = GridRef.interleave(geoRef.gridRef);
        }

        return {...{hectad : '', tetrad : '', monad : '', country : '', vc : [], interleavedGridRef : ''}, ...result};
    }

    /**
     *
     * @returns {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: ({lat: number, lng: number}|null), [defaultSurveyGridRef]: string, [defaultSurveyPrecision]: number}|null)}
     */
    get geoReference() {
        return this.attributes.georef || {
            gridRef: '',
            rawString: '', // what was provided by the user to generate this grid-ref (might be a postcode or placename)
            source: 'unknown', //TextGeorefField.GEOREF_SOURCE_UNKNOWN,
            latLng: null,
            precision: null
        };
    };
}

// a Survey captures the currentSurvey meta-data
// i.e. it captures site details (name, location); user details (name, email)
//
// if a user were to submit multiple surveys then they would end up in the contact database multiple times
// this is probably unavoidable. Not worth the effort and risk of automatic de-duplication. Email preferences would be
// shared, keyed by email.


// /**
//   * fired on Survey when one of its occurrences has been modified, added, deleted or reloaded
//   *
//   * no parameters
//   *
//   * @type {string}
//   */
// export const SURVEY_EVENT_OCCURRENCES_CHANGED = 'occurrenceschanged';

/**
 * fired on Survey when one of its occurrences has been added, deleted or reloaded
 *
 * no parameters
 *
 * @type {string}
 */
const SURVEY_EVENT_LIST_LENGTH_CHANGED = 'listlengthchanged';

/**
 * parameter is {currentHectadSubunit : string}
 *
 * @type {string}
 */
const SURVEY_EVENT_TETRAD_SUBUNIT_CHANGED = 'tetradsubunitchanged';

// /**
//  * fired from Survey when the object's contents have been modified
//  *
//  * parameter is {surveyId : string}
//  *
//  * @type {string}
//  */
// export const SURVEY_EVENT_MODIFIED = 'modified';

/**
 * @typedef {import('bsbi-app-framework-view').SurveyForm} SurveyForm
 */

class Survey extends Model {

    /**
     * mirrors constructor.name but doesn't get mangled by minification
     *
     * @type {string}
     */
    static className = 'Survey';

    // /**
    //  * fired from Survey when the object's contents have been modified
    //  *
    //  * parameter is {surveyId : string}
    //  *
    //  * @type {string}
    //  */
    // static EVENT_MODIFIED = SURVEY_EVENT_MODIFIED;

    // /**
    //  * fired on Survey when one of its occurrences has been modified, added, deleted or reloaded
    //  *
    //  * no parameters
    //  *
    //  * @type {string}
    //  */
    // static EVENT_OCCURRENCES_CHANGED = SURVEY_EVENT_OCCURRENCES_CHANGED;

    // /**
    //  * fired on Survey when one of its occurrences has been added, deleted or reloaded
    //  *
    //  * no parameters
    //  *
    //  * @type {string}
    //  */
    // static EVENT_LIST_LENGTH_CHANGED = 'listlengthchanged';

    // /**
    //  * parameter is {currentHectadSubunit : string}
    //  *
    //  * @type {string}
    //  */
    // static EVENT_TETRAD_SUBUNIT_CHANGED = 'tetradsubunitchanged';

    SAVE_ENDPOINT = '/savesurvey.php';

    TYPE = 'survey';

    /**
     *
     * @type {{
     *     [sampleUnit] : {selection : Array<string>, [precision] : number}
     *     [georef] : {
     *          rawString: string,
     *          precision: number|null,
     *          source: string|null,
     *          gridRef: string,
     *          latLng: {lat : number, lng : number}|null,
     *          [defaultSurveyGridRef]: string|null,
     *          [defaultSurveyPrecision]: number|null
     *          },
     *     [date] : string|null,
     *     [place] : string|null,
     *     [surveyName] : string|null,
     *     [casual] : "1"|null,
     *     [defaultCasual] : true|null,
     *     [vc] : {selection : Array<string>, inferred: (boolean|null)}|null,
     *     [nulllist] : boolean,
     *     [listname] : string,
     * }}
     */
    attributes = {};

    /**
     * if set then provide default values (e.g. GPS look-up of current geo-reference)
     *
     * @type {boolean}
     */
    isNew = false;

    /**
     * kludge to flag once the App singleton has set up a listener for changes on the survey
     *
     * @type {boolean}
     */
    hasAppModifiedListener = false;

    /**
     * kludge to flag once the App singleton has set up a listener for deletion on the survey
     *
     * @type {boolean}
     */
    hasDeleteListener = false;

    /**
     *
     * @type {string}
     */
    userId = '';

    /**
     *
     * @type {Track|null}
     * @private
     */
    _track = null;

    /**
     * Used to tie together linked surveys
     * (e.g. deliberately duplicated, or generated automatically by movement to a new grid-square)
     *
     * Tracking of location can continue seamlessly across linked surveys.
     *
     * @type {string}
     */
     _baseSurveyId = '';

    /**
     *
     * @returns {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: ({lat: number, lng: number}|null)}|null)}
     */
    get geoReference() {
        return this.attributes.georef || {
            gridRef: '',
            rawString: '', // the string provided by the user to generate this grid-ref (might be a postcode or placename)
            source: 'unknown', //TextGeorefField.GEOREF_SOURCE_UNKNOWN,
            latLng: null,
            precision: null
        };
    };

    /**
     * @returns {string}
     */
    get baseSurveyId() {
        if (!this._baseSurveyId || this._baseSurveyId === 'undefined') {
            this._baseSurveyId = this._id;
        }

        return this._baseSurveyId;
    }

    /**
     *
     * @param {string} id
     */
    set baseSurveyId(id) {
        this._baseSurveyId = id;
    }

    /**
     * string
     */
    get id() {
        if (!this._id) {
            this._id = uuid();

            if (!this._baseSurveyId) {
                this._baseSurveyId = this._id;
            }
        } else if (this._id === 'undefined') {
            console.error("id is literal 'undefined', am forcing new id");
            this._id = uuid();

            if (!this._baseSurveyId) {
                this._baseSurveyId = this._id;
            }
        }

        return this._id;
    }

    /**
     * Set for tetrad structured surveys, where user may be working within a monad subdivision
     *
     * @type {string}
     */
    currentTetradSubunit = '';

    /**
     * Get a summarised geo-ref from the survey geo-reference, based on the survey unit type and precision
     * If the user has explicitly specified a centroid-based survey then the result will instead be a centroid
     *
     * For structured tetrad surveys squareReference will return the currently selected monad within the tetrad (or tetrad if 2km scale selected)
     * For monad or 100m square surveys will return grid-ref at that resolution
     *
     * @returns {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: ({lat: number, lng: number}|null)}|null)}
     */
    get summaryReference() {
        if (this.attributes.sampleUnit?.selection?.[0]) {
            let n = parseInt(this.attributes.sampleUnit.selection[0], 10);

            if (n > 0) {
                // have user-specified square precision value

                if (n === 2000 && this.currentTetradSubunit) {
                    // special-case treatment of tetrad surveys using a monad subdivision

                    return {
                        gridRef: this.currentTetradSubunit,
                        rawString: this.currentTetradSubunit,
                        source: 'unknown',
                        latLng: null,
                        precision: /[A-Z]$/.test(this.currentTetradSubunit) ? 2000 : 1000
                    }
                }

                const ref = this.geoReference;
                const gridRef = GridRef.fromString(ref.gridRef);

                if (gridRef && gridRef.length <= n) {
                    const newRef = gridRef.gridCoords.toGridRef(n);

                    if (n === 2000) {
                        this.currentTetradSubunit = newRef;
                    } else {
                        this.currentTetradSubunit = '';
                    }

                    return {
                        gridRef: newRef,
                        rawString: newRef,
                        source: 'unknown',
                        latLng: null,
                        precision: n
                    }
                } else {
                    return {
                        gridRef: '',
                        rawString: '',
                        source: 'unknown',
                        latLng: null,
                        precision: null
                    }
                }
            } else {
                switch (this.attributes.sampleUnit.selection[0]) {
                    case 'centroid':
                        const georef = this.geoReference; // avoid calling getter repeatedly

                        return {
                            gridRef: georef.gridRef,
                            rawString: '',
                            source: 'unknown',
                            latLng: georef.latLng,
                            precision: this.attributes.sampleUnit.precision || 1000
                        };

                    case 'other':
                        return this._infer_square_ref_from_survey_ref();

                    default:
                        throw new Error(`Unrecognized sample unit value '${this.attributes.sampleUnit.selection[0]}'`);
                }
            }
        } else {
            return this._infer_square_ref_from_survey_ref();
        }
    }

    /**
     *
     * @returns {{rawString: string, precision: null, source: string, gridRef: string, latLng: null}|{rawString, precision: null, source: string, gridRef, latLng: null}}
     * @private
     */
    _infer_square_ref_from_survey_ref() {
        if (this.attributes.georef?.gridRef && this.attributes.georef.precision <= 2000) {
            let newRef;

            if (this.attributes.georef.precision === 2000 || this.attributes.georef.precision === 1000) {
                newRef = this.attributes.georef.gridRef;
            } else {
                // this is really inefficient
                const context = this.getGeoContext();
                newRef = context.monad || context.tetrad;
            }

            return {
                gridRef: newRef,
                rawString: newRef,
                source: 'unknown',
                latLng: null,
                precision: this.attributes.georef.precision
            }
        } else {
            return {
                gridRef: '',
                rawString: '', // what was provided by the user to generate this grid-ref (might be a postcode or placename)
                source: 'unknown', //TextGeorefField.GEOREF_SOURCE_UNKNOWN,
                latLng: null,
                precision: null
            }
        }
    }

    /**
     *
     * @returns {string}
     */
    get date() {
        return this.attributes.date || '';
    }

    /**
     * returns survey date string, with special formatting for 'today' and 'yesterday'
     *
     * @returns {string}
     */
    get prettyDate() {
        const date = this.attributes.date || '';
        const today = new Date;

        if (date === today.toISOString().slice(0,10)) {
            return 'today';
        } else if (date === (new Date(today.valueOf() - (3600*24*1000))).toISOString().slice(0,10)) {
            return 'yesterday';
        } else {
            return date;
        }
    }

    /**
     * Returns true or false based on date compatibility or null if the survey is undated (e.g. ongoing casual)
     * @param {string} [today] (iso YYYY-MM-DD) defaults to current day
     * @returns {boolean|null}
     */
    isToday(today = (new Date).toISOString().slice(0,10)) {
        const date = this.date;

        return date === '' ? null : (date === today);
    }

    /**
     * Returns true or false based on date compatibility or null if the survey is undated (e.g. ongoing casual)
     *
     * @returns {boolean}
     */
    createdInCurrentYear() {
        const yearString = new Date(this.createdStamp * 1000).toISOString().slice(0,4);

        return yearString === (new Date).toISOString().slice(0,4);
    }

    get place() {
        return this.attributes.place || '';
    }

    /**
     * called after the form has changed, before the values have been read back in to the occurrence
     * read new values
     * validate
     * then fire its own change event (Survey.EVENT_MODIFIED)
     * @param {{form: SurveyForm}} params
     */
    formChangedHandler(params) {
        console.log('Survey change handler invoked.');

        const form = params.form;
        params = null;

        form.updateModelFromContent().then(() => {

            console.log('Survey calling conditional validation.');

            // refresh the form's validation state
            form.conditionallyValidateForm();

            this.touch();
            this.fireEvent(SURVEY_EVENT_MODIFIED, {surveyId: this.id});
        })
        .catch((error) => {
            // if updateModelFromContent() fails, due to user rejection of dialogue box then intentionally don't want survey to save
            console.log({"In survey form handler promise rejected (probably normal cancellation of dialogue box)" : error});
        });
    }

    /**
     * Used for special-case setting of a custom attribute
     * (i.e. not usually one linked to a form)
     * e.g. used for updating the NYPH null-list flag
     *
     * @param attributeName
     * @param value
     */
    setAttribute(attributeName, value) {
        if (this.attributes[attributeName] !== value) {
            this.attributes[attributeName] = value;

            this.touch();
            this.fireEvent(SURVEY_EVENT_MODIFIED, {surveyId : this.id});
        }
    }

    /**
     * returns interpreted grid-ref / vc summary, used to look-up meta-data for the taxon list
     *
     * @return {{
     *     hectad : string,
     *     tetrad : string,
     *     monad : string,
     *     country : string,
     *     vc : number[],
     *     interleavedGridRef : string,
     *     [surveyGridUnit] : number,
     *     [hectare] : string,
     * }}
     */
    getGeoContext() {
        const geoRef = this.geoReference;

        const result = {};

        if (this.attributes.vc?.selection) {
            result.vc = [...this.attributes.vc.selection]; // clone rather than reference the VC selection
        } else {
            result.vc = [];
        }

        const surveyGridUnit = parseInt(this.attributes.sampleUnit?.selection?.[0], 10) || null;

        if (surveyGridUnit) {
            result.surveyGridUnit = surveyGridUnit;
        }

        if (geoRef?.gridRef) {
            const gridRef = GridRef.fromString(geoRef.gridRef);

            if (gridRef) {
                if (gridRef.length <= 100 && surveyGridUnit && surveyGridUnit <= 100) {
                    result.hectare = gridRef.gridCoords.toGridRef(100);
                }

                if (gridRef.length <= 1000 && surveyGridUnit && surveyGridUnit <= 1000) {
                    result.monad = gridRef.gridCoords.toGridRef(1000);
                }

                if (gridRef.length <= 2000) {
                    result.tetrad = gridRef.gridCoords.toGridRef(2000);
                }

                result.country = gridRef.country;
            }

            result.hectad = gridRef.gridCoords.toGridRef(10000);

            result.interleavedGridRef = GridRef.interleave(geoRef.gridRef);
        }

        return {...{hectad : '', tetrad : '', monad : '', hectare : '', country : '', vc : [], interleavedGridRef : ''}, ...result};
    }

    /**
     * if not securely saved, then makes a post to /savesurvey.php
     *
     * this may be intercepted by a service worker, which could write the image to indexeddb
     * a successful save will result in a JSON response containing the uri from which the object may be retrieved
     * and also the state of persistence (whether or not the object was intercepted by a service worker while offline)
     *
     * if saving fails, then the expectation is that there is no service worker, in which case should attempt to write
     * the object directly to indexeddb
     *
     * must test indexeddb for this eventuality after the save has returned
     *
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{}} [params]
     *
     * @returns {Promise}
     */
    save(forceSave = false, isSync = false, params) {
        if (forceSave || this.unsaved()) {
            const formData = new FormData;

            formData.append('type', this.TYPE);
            formData.append('surveyId', this.id);
            formData.append('id', this.id); // this is incorrect duplication
            formData.append('projectId', this.projectId.toString());
            formData.append('attributes', JSON.stringify(this.attributes));
            formData.append('deleted', this.deleted.toString());
            formData.append('created', this.createdStamp?.toString?.() || '');
            formData.append('baseSurveyId', this.baseSurveyId || this.id);

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            formData.append('appVersion', Model.bsbiAppVersion);

            console.log(`queueing survey post ${this.id}`);
            return this.queuePost(formData, isSync);
        } else {
            return Promise.reject(`Survey ${this.id} has already been saved.`);
        }
    }

    /**
     * low-level delete of survey
     * does not test whether there are extant occurrences
     *
     */
    delete() {
        if (!this.deleted) {
            this.touch();
            this.deleted = true;
            this.save().finally(() => {
                this.fireEvent(SURVEY_EVENT_DELETED, {surveyId : this.id});
            });
        }
    }

    /**
     * @param {{summarySquarePrecision : number, summarizeTetrad : boolean}} options
     * @returns {string} an html-safe string based on the locality and creation date
     */
    generateSurveyName(options = {
        summarySquarePrecision : 1000,
        summarizeTetrad : false,
    }) {

        if (this.attributes.casual) {
            // special-case treatment of surveys with 'casual' attribute (which won't have a locality or date as part of the survey)

            return this.attributes.surveyName ?
                escapeHTML(this.attributes.surveyName)
                :
                `Data-set created on ${this._createdDateString()}`;
        } else {
            let place;

            if (this.attributes.place) {
                let summaryGridRef = this._summarySquareString(options.summarySquarePrecision);

                place = `${this.attributes.place}${summaryGridRef ? ` ${summaryGridRef}` : ''}`;
            } else if (this.attributes.georef?.gridRef) {
                place = this._summarySquareString(options.summarySquarePrecision);
            } else {
                place = '(unlocalized)';
            }

            let surveyName = '';
            if (this.attributes.listname) {
                surveyName = ` “${escapeHTML(this.attributes.listname)}”`;
            }

            return `${escapeHTML(place)}${surveyName} ${this.prettyDate || this._createdDateString()}`;
        }
    }

    /**
     * if survey has specified grid-unit then use that instead of the fallBackPrecision option
     *
     * @param {number|null} fallBackPrecision
     * @returns {string}
     * @private
     */
    _summarySquareString(fallBackPrecision) {
        if (this.attributes.georef?.gridRef) {
            let sampleUnit;

            // '<' replacement used simplistically to sanitize against script injection
            const rawGridRef = this.attributes.georef.gridRef.replace(/[<&\s]/g, '');

            if (this.attributes.sampleUnit) {
                sampleUnit = parseInt(this.attributes.sampleUnit?.selection[0], 10) || null;
            }

            const precision = sampleUnit || fallBackPrecision;

            if (precision) {
                const gridRef = GridRef.fromString(rawGridRef);

                return gridRef?.gridCoords?.toGridRef?.(gridRef.length <= precision ? precision : gridRef.length) || this.attributes.georef.gridRef;
            } else {
                return rawGridRef;
            }
        } else {
            return '';
        }
    }

    _createdDateString() {
        const createdDate = new Date(this.createdStamp * 1000);
        let dateString;

        try {
            // 'default' locale fails on Edge
            dateString = createdDate.toLocaleString('default', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            dateString = createdDate.toLocaleString('en-GB', {year: 'numeric', month: 'long', day: 'numeric'});
        }

        return dateString;
    }

    /**
     *
     * @type {Set<string>}
     *
     */
    extantOccurrenceKeys = new Set();

    /**
     * @todo need to exclude deleted records
     * @returns {number}
     *
     */
    countRecords() {
        return this.extantOccurrenceKeys.size;
    }

    /**
     *
     * @param {{
     *      id : string,
     *      saveState: string,
     *      [userId]: string,
     *      attributes: Object.<string, *>,
     *      deleted: boolean|string,
     *      created: (number|string),
     *      modified: (number|string),
     *      projectId: (number|string),
     *      [baseSurveyId]: (string),
     *      }} descriptor
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this._baseSurveyId = descriptor.baseSurveyId;
    }

    /**
     * @returns {Survey}
     */
    duplicate(newAttributes = {}, properties = {}) {
        const newSurvey = new Survey();

        // @todo need to be certain that are not cloning image attribute
        newSurvey.attributes = Object.assign(structuredClone(this.attributes), newAttributes);

        if (newSurvey.attributes.hasOwnProperty('images') && newSurvey.attributes.images?.length > 0) {
            // reset to default value
            newSurvey.attributes.images = [];
        }

        newSurvey.userId = properties.hasOwnProperty('userId') ? properties.userId : this.userId;
        newSurvey.isPristine = true;
        newSurvey.isNew = false; // don't want GPS override of geo-ref
        newSurvey._savedLocally = false;
        newSurvey._savedRemotely = false;
        newSurvey.deleted = false;
        newSurvey.projectId = this.projectId;
        newSurvey.baseSurveyId = this.baseSurveyId;
        newSurvey.id; // trigger id generation

        return newSurvey;
    }

    /**
     *
     * @param {App} app
     * @returns {Track}
     */
    initialiseNewTracker(app) {
        const track = new Track();
        track.surveyId = this.id;
        track.deviceId = app.deviceId;

        // In some cases more than one project id may be in use (e.g. RecordingApp v's NYPH)
        // so use the survey rather than app project id as the source-of-truth
        track.projectId = this.projectId;
        //track.projectId = app.projectId;
        track.isPristine = true;

        this.track = track;
        track.registerSurvey(this);

        return track;
    }

    /**
     * returns the currently active track (other tracks may exist if the survey has shifted between devices etc.)
     *
     * @returns {Track|null}
     */
    get track() {
        return this._track;
    }

    /**
     *
     * @param {Track|null} track
     */
    set track(track) {
        this._track = track;
    }

    mergeUpdate(newSurvey) {
        if (newSurvey.id !== this._id) {
            throw new Error(`Survey merge id mismatch: ${newSurvey.id} !== ${this._id}`);
        }

        if (!(this.isPristine || this._savedLocally)) {
            //throw new Error(`Cannot merge with unsaved local survey, for survey id ${this._id}`);
            console.error(`Dangerous merge with unsaved local survey, for survey id ${this._id}`);
            // noinspection JSIgnoredPromiseFromCall
            Logger.logError(`Dangerous merge with unsaved local survey, for survey id ${this._id}`);
        }

        Object.assign(this.attributes, newSurvey.attributes);

        this.userId = newSurvey.userId; // generally this should be the same anyway
        this.deleted = newSurvey.deleted; // probably doesn't change here
        //this.created = newSurvey.created; // should be the same
        this.modified = newSurvey.modified;
        this.projectId = newSurvey.projectId; // generally this should be the same anyway
        this.isPristine = newSurvey.isPristine;

        if (newSurvey.baseSurveyId) {
            this.baseSurveyId = newSurvey.baseSurveyId;
        }

        return this;
    }

    destructor() {
        super.destructor();
        this.hasAppModifiedListener = false;
        this.hasDeleteListener = false;
    }
}

/**
 *
 */
class InternalAppError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, InternalAppError); // see https://v8.dev/docs/stack-trace-api
    }
}

const IMAGE_CONTEXT_SURVEY = 'survey';
const IMAGE_CONTEXT_OCCURRENCE = 'occurrence';

class OccurrenceImage extends Model {

    /**
     * mirrors constructor.name but doesn't get mangled by minification
     *
     * @type {string}
     */
    static className = 'OccurrenceImage';

    /**
     * raw file object retrieved from a file upload image element
     *
     * @type {File}
     */
    file;

    /**
     *
     * @type {Map.<string, OccurrenceImage>}
     */
    static imageCache = new Map;

    TYPE = 'image';

    /**
     * Only relevant for occurrence-linked images
     *
     * @type {string}
     */
    occurrenceId = '';

    surveyId = '';

    //projectId = '';

    //static CONTEXT_SURVEY = IMAGE_CONTEXT_SURVEY;
    //static CONTEXT_OCCURRENCE = IMAGE_CONTEXT_OCCURRENCE;

    context = IMAGE_CONTEXT_OCCURRENCE;

    /**
     * fetches a URL of the image
     * this might be a remote url (or one intercepted by a service worker)
     * or a data url of the raw image, (not yet uploaded)
     *
     * @returns {string}
     */
    getUrl () {
        throw new Error('OccurrenceImage getUrl() not implemented.')
    }

    SAVE_ENDPOINT = '/saveimage.php';

    /**
     *
     * @param {File} file
     */
    static fromFile(file) {
        const image = new OccurrenceImage;
        image.file = file;

        return image;
    }

    /**
     * if not securely saved then makes a post to /saveimage.php
     *
     * this may be intercepted by a service worker, which could write the image to indexeddb
     * a successful save will result in a json response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexeddb
     *
     * must test indexeddb for this eventuality after the save has returned
     *
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{[surveyId] : string, [projectId] : number|null, [occurrenceId] : string}} [params]
     *
     * @returns {Promise<{}>}
     */
    save(forceSave = false, isSync = false, params) {
        if (params?.surveyId) {
            this.surveyId = params.surveyId;
        }

        if (params?.projectId) {
            this.projectId = params.projectId;
        }

        if (params?.occurrenceId) {
            this.occurrenceId = params.occurrenceId;
        }

        // kludge to avoid historical instances of corrupted surveyId
        if (this.surveyId === true || this.surveyId === false) {
            console.log(`Fixing damaged survey id for image '${this.id}'`);
            this.surveyId = '';
        }

        if (forceSave || this.unsaved()) {
            const formData = new FormData;
            formData.append('type', this.TYPE);
            formData.append('surveyId', params?.surveyId ? params.surveyId : (this.surveyId ? this.surveyId : '')); // avoid 'undefined'
            formData.append('projectId', params?.projectId ? params.projectId.toString() : '');
            formData.append('imageId', this.id);
            formData.append('id', this.id);
            if (!this.deleted) {
                formData.append('image', this.file);
            }
            formData.append('deleted', this.deleted.toString());
            formData.append('created', this.createdStamp?.toString?.() || '');
            formData.append('modified', this.modifiedStamp?.toString?.() || '');

            if (this.context === IMAGE_CONTEXT_SURVEY) {
                formData.append('context', this.context);
            } else {
                formData.append('occurrenceId', params?.occurrenceId ? params.occurrenceId : this.occurrenceId); // avoid 'undefined'
            }

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            formData.append('appVersion', Model.bsbiAppVersion);

            console.log(`queueing image post, image id ${this.id}`);
            return this.queuePost(formData, isSync);
        } else {
            return Promise.reject(`Image ${this.id} has already been saved.`);
        }
    }

    /**
     * fired from Occurrence when the object's contents have been modified
     *
     * @type {string}
     */
    static EVENT_MODIFIED = 'modified';

    /**
     *
     * @param id
     * @returns {OccurrenceImage}
     */
    static placeholder(id) {
        let placeholderObject = new OccurrenceImage;
        //placeholderObject._id = id;
        placeholderObject.id = id; // should use setter, to enforce validation

        OccurrenceImage.imageCache.set(id, placeholderObject);

        return placeholderObject;
    }

    /**
     *
     *
     * @param {{
     *      id : string,
     *      saveState: string,
     *      [userId]: string,
     *      attributes: Object.<string, *>,
     *      deleted: boolean|string,
     *      created: (number|string),
     *      modified: (number|string),
     *      projectId: (number|string),
     *      surveyId: string,
     *      occurrenceId: string,
     *      [image]: File
     *      [context]: string
     *      }} descriptor
     * @private
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this.surveyId = descriptor.surveyId;

        // kludge to deal with corrupted survey ids
        if (this.surveyId === true || this.surveyId === false) {
            this.surveyId = '';
            descriptor.surveyId = '';
        }

        if (descriptor.occurrenceId) {
            this.occurrenceId = descriptor.occurrenceId;
        }
        this.file = descriptor.image;

        if (descriptor.context) {
            this.context = descriptor.context;
        }
    }

    /**
     *
     * @param {string} id
     * @param {(number|null)} width
     * @param {(number|null)} height
     * @param {{[className] : string}} [attributes]
     * @return {string}
     */
    static imageLink(id, width, height, attributes) {
        width = width || 0;
        height = height || 0;

        let attributesString = '';

        if (attributes.className) {
            attributesString += ` class="${attributes.className}"`;
        }

        const renderingConstraint = (width > height) ?
            `width="${width}"`
            :
            `height="${height}"`;

        // try sized images first, before falling back to un-sized jpeg, that may match an offline cache
        return `<picture>` +
    //<source srcset="/image.php?imageid=${id}&amp;height=128&amp;format=avif" type="image/avif">
    `<source srcset="/image.php?imageid=${id}&amp;height=${width}&amp;format=webp" type="image/webp">
    <source srcset="/image.php?imageid=${id}&amp;width=${width}&amp;format=jpeg" type="image/jpeg">
    <img${attributesString} src="/image.php?imageid=${id}&amp;format=jpeg" ${renderingConstraint} alt="photo">
    </picture>`;
    }
}

class PurgeInconsistencyError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, PurgeInconsistencyError); // see https://v8.dev/docs/stack-trace-api
    }
}

// App.js
// base class for single page application
// allows binding of controllers and routes

/**
 * @typedef {import('bsbi-app-framework-view').PatchedNavigo} PatchedNavigo
 * @typedef {import('bsbi-app-framework-view').Layout} Layout
 */

class App extends EventHarness {
    /**
     * @type {PatchedNavigo}
     */
    _router;

    /**
     * @type {HTMLElement}
     */
    _containerEl;

    /**
     * flag marking test build, set in constructor of child class.
     *
     * @type {boolean}
     */
    isTestBuild = false;

    /**
     *
     * @type {Array.<AppController>}
     */
    controllers = [];

    /**
     * tracks the handle of the current page controller
     * updating this is the responsibility of the controller
     *
     * *never* set this directly, always use setter
     *
     * @protected
     * @type {number|null}
     */
    _currentControllerHandle = null;

    /**
     * Set while a purge is in progress, to prevent overlapping conflicting purge operations
     *
     * @type {boolean}
     * @private
     */
    _doingPurge = false;

    /**
     *
     * @param {number|null} handle
     */
    set currentControllerHandle(handle) {
        if (handle !== this._currentControllerHandle) {
            if (this._currentControllerHandle !== null) {
                this.controllers[this._currentControllerHandle].makeNotActive();
            }

            this._currentControllerHandle = handle;

            if (this._currentControllerHandle !== null) {
                this.controllers[this._currentControllerHandle].makeActive();
            }
        }
    }

    /**
     *
     * @returns {number|null}
     */
    get currentControllerHandle() {
        return this._currentControllerHandle;
    }

    /**
     *
     * @type {Array.<{url : string}>}
     */
    routeHistory = [];

    /**
     * Used when re-opening with no specified survey
     *
     * @type {string}
     */
    homeRoute = '/list/survey/welcome';

    defaultListRoute = '/list';

    /**
     * keyed by occurrence id (a UUID string)
     *
     * @type {Map.<string,Occurrence>}
     */
    occurrences= new Map();

    /**
     * keyed by survey id (a UUID string)
     *
     * @type {Map.<string,Survey>}
     */
    surveys= new Map();

    /**
     * @type {?Survey}
     */
    _currentSurvey = null;

    /**
     * @abstract
     * @type {number}
     */
    projectId;

    /**
     *
     * @type {{[superAdmin] : boolean, [userId] : string} | null}
     */
    session = null;

    /**
     *
     * @type {Object<string, number|string|{}>}
     */
    _options = {};

    static DEFAULT_OPTIONS = {};

    /**
     *
     * @type {string}
     * @private
     */
    _deviceId = '';

    /**
     * time in seconds to retain stale surveys
     *
     * @type {number}
     */
    staleThreshold = 3600 * 24 * 14; // keep surveys for 14 days

    /**
     * called to resolve display promise after the very first navigation happens
     *
     * @type {function|null}
     */
    afterFirstNavigationHandler = null;

    /**
     * Flags the occurrence of a pervasive Safari bug
     * see https://bugs.webkit.org/show_bug.cgi?id=197050
     * @type {boolean}
     */
    static indexedDbConnectionLost = false;

    // /**
    //  * Event fired when user requests a new blank survey
    //  *
    //  * @type {string}
    //  */
    // static EVENT_ADD_SURVEY_USER_REQUEST = APP_EVENT_ADD_SURVEY_USER_REQUEST;

    // /**
    //  * Event fired when user requests a reset (local clearance) of all surveys
    //  * @type {string}
    //  */
    // static EVENT_RESET_SURVEYS = APP_EVENT_RESET_SURVEYS;

    // /**
    //  * Fired after App.currentSurvey has been set to a new blank survey
    //  * the survey will be accessible in App.currentSurvey
    //  *
    //  * @type {string}
    //  */
    // static EVENT_NEW_SURVEY = APP_EVENT_NEW_SURVEY;

    static LOAD_SURVEYS_ENDPOINT = '/loadsurveys.php';

    /**
     * IndexedDb key used for storing id of the current (last accessed) survey (or null)
     *
     * @type {string}
     */
    static CURRENT_SURVEY_KEY_NAME = 'currentsurvey';
    static SESSION_KEY_NAME = 'session';
    static DEVICE_ID_KEY_NAME = 'deviceid';
    static LOCAL_OPTIONS_KEY_NAME = 'localoptions';

    static RESERVED_KEY_NAMES = [
        App.CURRENT_SURVEY_KEY_NAME,
        App.SESSION_KEY_NAME,
        App.DEVICE_ID_KEY_NAME,
        App.LOCAL_OPTIONS_KEY_NAME,
    ];

    /**
     *
     * @type {boolean}
     */
    static devMode = false;

    /**
     *
     * @private
     */
    static _DATA_CACHE_VERSION;

    static set DATA_CACHE_VERSION(version) {
        App._DATA_CACHE_VERSION = `bsbi-data-${version}`;
    }

    static get DATA_CACHE_VERSION() {
        if (!App._DATA_CACHE_VERSION) {
            throw new Error('DATA_CACHE_VERSION has not been initialized');
        }
        return App._DATA_CACHE_VERSION;
    }

    constructor() {
        super();
    }

    /**
     *
     * @param {?Survey} survey
     */
    set currentSurvey(survey) {
        if (this._currentSurvey !== survey) {
            this._currentSurvey = survey || null;

            if (survey) {
                // listeners should have been set by App.addSurvey()
                // but there might be edge-cases where the listeners have been cleared
                // and not re-established.
                this._applySurveyListeners(survey);
            }

            let surveyId = survey?.id;
            localforage.setItem(App.CURRENT_SURVEY_KEY_NAME, surveyId)
                .finally(() => {
                    this.fireEvent(APP_EVENT_CURRENT_SURVEY_CHANGED, {newSurvey: survey});
                });
        }
    }

    /**
     *
     * @returns {?Survey}
     */
    get currentSurvey() {
        return this._currentSurvey;
    }

    get userId() {
        return this.session?.userId;
    }

    /**
     *
     * @returns {Promise<{}>}
     */
    restoreOptions() {
        const userId = this.userId;

        if (userId) {
            return localforage.getItem(`${App.LOCAL_OPTIONS_KEY_NAME}.${userId}`)
                .then((options) => {
                    if (options) {
                        this._options = options;
                    } else {
                        this._options = JSON.parse(JSON.stringify(this.constructor.DEFAULT_OPTIONS));
                    }

                    // return a clone of the options (to prevent improper direct modification
                    const clonedOptions = JSON.parse(JSON.stringify(this._options));

                    this.fireEvent(APP_EVENT_OPTIONS_RESTORED, clonedOptions);

                    return clonedOptions;
                });
        } else {
            throw new Error('User ID unset when restoring options.');
        }
    }

    clearOptions() {
        this._options = null;
    }

    setOptions(rawOptions) {
        const userId = this.userId;

        if (userId) {
            if (!this.options) {
                this.options = {};
            }

            Object.assign(this._options, rawOptions);

            return localforage.setItem(`${App.LOCAL_OPTIONS_KEY_NAME}.${userId}`, this._options);
        } else {
            throw new Error(`User ID unset when setting options.`);
        }
    }

    setOption(key, value) {
        const userId = this.userId;

        if (userId) {
            this._options[key] = JSON.parse(JSON.stringify(value));

            return localforage.setItem(`${App.LOCAL_OPTIONS_KEY_NAME}.${userId}`, this._options);
        } else {
            throw new Error(`User ID unset when setting option '${key}'.`);
        }
    }

    /**
     *
     * @param {string} key
     * @returns {any|undefined}
     */
    getOption(key) {
        return this._options?.hasOwnProperty?.(key) ? JSON.parse(JSON.stringify(this._options[key])) : undefined;
    }

    /**
     *
     * @param {string} key
     * @returns {boolean}
     */
    hasOption(key) {
        return this._options?.hasOwnProperty?.(key) || false;
    }

    /**
     * @return Promise<string>
     */
    initialiseDeviceId() {
        if (!this._deviceId) {
            return localforage.getItem(App.DEVICE_ID_KEY_NAME)
                .then((deviceId) => {
                    if (deviceId && deviceId !== 'undefined') {
                        this._deviceId = deviceId;
                        return deviceId;
                    } else {
                        const deviceId = uuid();

                        return localforage.setItem(App.DEVICE_ID_KEY_NAME, deviceId)
                            .then(() => {
                                this._deviceId = deviceId;
                                return deviceId;
                            })
                    }
                });
        } else {
            return Promise.resolve(this._deviceId);
        }
    }

    get deviceId() {
        if (!this._deviceId) {
            throw new Error("Device ID has not been initialised.");
        }

        return this._deviceId;
    }

    /**
     *
     * @param {string} key
     * @param value
     * @returns {Promise<*>}
     */
    forageSetItem(key, value) {
        return localforage.setItem(key, value);
    }

    /**
     *
     * @param {string} key
     * @returns {Promise<unknown | null>}
     */
    forageGetItem(key) {
        return localforage.getItem(key);
    }

    /**
     *
     * @param {string} key
     * @returns {Promise<unknown | null>}
     */
    forageRemoveItem(key) {
        return localforage.removeItem(key);
    }

    /**
     * @abstract
     * @protected
     */
    _updateUnsavedMarkerCss() {

    }

    /**
     * note that the last survey might not belong to the current user
     *
     * @returns {Promise<string | null>}
     */
    getLastSurveyId() {
        return localforage.getItem(App.CURRENT_SURVEY_KEY_NAME)
            .catch((error) => {
                console.log({'Error retrieving last survey id' : error});
                return Promise.resolve(null);
            });
    }

    clearLastSurveyId() {
        return localforage.removeItem(App.CURRENT_SURVEY_KEY_NAME)
            .catch((error) => {
                console.log({'Error removing last survey id' : error});
                return Promise.resolve(null);
            });
    }

    /**
     * @type {Layout}
     */
    layout;

    /**
     *
     * @param {string} name
     */
    setLocalForageName(name) {
        localforage.config({
            name: name
        });
    }

    /**
     * Try to enable persistent storage if installed and running on mobile.
     *
     * @param always
     * @returns {Promise<void>|Promise<boolean>}
     */
    tryPersistStorage(always = false) {
        if ((always || (window.matchMedia('(display-mode: standalone)').matches) &&
            navigator?.storage?.persist && navigator?.storage?.persisted &&
            DeviceType.getDeviceType() !== DeviceType.DEVICE_TYPE_IMMOBILE)
        ) {
            return navigator.storage.persisted().then((persistent) => {
                if (persistent) {
                    console.log('Storage already persisted');
                } else {
                    console.log('Attempting to enable persistent storage');
                    return navigator.storage.persist().then((persistent) => {
                        if (persistent) {
                            console.log('Storage now persists.');
                            //return Logger.logError('Storage now persists.');
                            return Promise.resolve();
                        } else {
                            console.log('Failed to enable persistent storage.');
                            return Logger.logError('Failed to enable persistent storage.');
                        }
                    });
                }
            }, (error) => {
                console.log({'Failure reading state of persistent storage' : error});
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     *
     * @returns {Promise<void | null>}
     */
    reset() {
        this.surveys = new Map();
        Track.reset();
        return this.clearCurrentSurvey().then(this.clearLastSurveyId);

        // if (false) {
        //     // currently disabled during testing to minimise data loss potential
        //     this.surveys = new Map();
        //     return this.clearCurrentSurvey().then(this.clearLastSurveyId);
        // } else {
        //     return Promise.resolve();
        // }
    }

    /**
     * unset the current survey and its associated list of occurrences
     * called when switching surveys and during startup
     *
     * updates local storage last saved survey id
     *
     * @param {string|null} surveyId only used as a sanity check
     *
     * @returns {Promise<void | null>}
     */
    clearCurrentSurvey(surveyId = null) {
        if (surveyId && this._currentSurvey && surveyId !== this._currentSurvey.id) {
            // theoretical weird error state where the current survey has changed prior to call to clearCurrentSurvey()
            console.error('Conflicting survey id in clearCurrentSurvey()');
            return Promise.reject('Conflicting survey id in clearCurrentSurvey()');
        }

        try {
            for (let occurrenceTuple of this.occurrences) {
                occurrenceTuple[1].destructor();
            }
        } catch (e) {
            console.error({"in clearCurrentSurvey, failed occurrence destruction" : e});
        }

        this.occurrences = new Map();

        try {
            if (this._currentSurvey) {
                this._currentSurvey.destructor();
                this._currentSurvey = null; // must not use setter here otherwise local storage saved previous id will be lost
            }
        } catch (e) {
            console.error({"in clearCurrentSurvey, failed survey destruction" : e});
        }
        return this.clearLastSurveyId();
    }

    /**
     * see https://github.com/krasimir/navigo
     * @param {PatchedNavigo} router
     */
    set router(router) {
        this._router = router;
    }

    /**
     *
     * @returns {PatchedNavigo}
     */
    get router() {
        return this._router;
    }

    set containerId(containerId) {
        const el = document.getElementById(containerId);
        if (!el) {
            throw new Error(`App container '${containerId}' not found.`);
        } else {
            this._containerEl = el;
        }
    }

    get container() {
        return this._containerEl;
    }

    /**
     *
     * @param {AppController} controller
     */
    registerController(controller) {
        controller.handle = this.controllers.length;
        this.controllers[this.controllers.length] = controller;

        controller.app = this;
        controller.registerRoute(this._router);
    }

    initialise() {
        this.layout.initialise();

        // this.addListener(APP_EVENT_WATCH_GPS_USER_REQUEST, () => {
        //     EventHarness.staticFireEvent(App, APP_EVENT_WATCH_GPS_USER_REQUEST);
        // });

        // this.addListener(APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST, () => {
        //     EventHarness.staticFireEvent(App, APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST);
        // });

        for (let controller of this.controllers) {
            controller.initialise();
        }

        this._router.notFound((query) => {
            // called when there is a path specified but
            // there is no route matching

            console.log(`no route found for '${query}'`);
            //this._router.navigate('/list');

            // const view = new NotFoundView();
            // view.display();
            this.notFoundView();
        });

        this._router.hooks({
            //before: function(done, params) { ... },
            after: (params) => {
                // generic 'after' handler for all routes
                if (this.afterFirstNavigationHandler) {
                    try {
                        this.afterFirstNavigationHandler();
                    } finally {
                        this.afterFirstNavigationHandler = null;
                    }
                }
            }
        });

        //default homepage
        this._router.on(() => {
            // special-case redirect (replacing in history) from '/' to '/list' without updating browser history

            console.log("redirecting from '/'");

            this._router.pause();

            if (!this.currentSurvey) {
                console.log(`redirecting without survey from '/' to '${this.homeRoute}'`);
                this._router.navigate(this.homeRoute).resume();
            } else if (this.currentSurvey && this.currentSurvey.isPristine) {
                console.log(`redirecting from '/' to '${this.homeRoute}'`);
                this._router.navigate(this.homeRoute).resume();
            } else {
                console.log(`redirecting from '/' to '${this.defaultListRoute}'`);
                this._router.navigate(this.defaultListRoute).resume();
            }
            this._router.resolve();
        });
    }

    /**
     * Returns a promise that resolves after the initial navigation completes
     *
     * @returns {Promise<void>}
     */
    display() {
        //console.log('App display');
        //this._router.resolve();

        // it's opportune at this point to try to ping the server again to save anything left outstanding
        // this.syncAll(true).then(() => {
        //     this._router.resolve();
        // });

        return new Promise((resolve, reject) => {
            this.afterFirstNavigationHandler = resolve;
            this._router.resolve();
        });
    }

    saveRoute() {
        const lastRoute = this._router.lastRouteResolved();
        if (this.routeHistory.length) {
            if (this.routeHistory[this.routeHistory.length - 1] !== lastRoute) {
                this.routeHistory[this.routeHistory.length] = lastRoute;
            }
        } else {
            this.routeHistory[0] = lastRoute;
        }
    }

    /**
     * returns true if window history state is not null and not an empty object
     *
     * @returns {boolean}
     */
    windowHasHistoryState() {
        return this.routeHistory.length > 0;

        // const state = window.history.state;
        //
        // return (state !== null && typeof state === 'object' && Object.keys(state).length > 0);
    }

    /**
     * Go back to the last page logged in the app's history thread
     * Usually used after temporary navigation to service handling urls
     */
    revertUrl() {
        this.router.pause();
        if (this.windowHasHistoryState()) {
            window.history.back(); // this could fail if the previous url was not under the single-page-app umbrella (should test)
        }
        this.router.resume();
    }

    /**
     * mark the current survey and its constituent records as subject to validation checks (not pristine)
     */
    markAllNotPristine() {
        for (let occurrenceTuple of this.occurrences) {
            occurrenceTuple[1].isPristine = false;
        }
    }

    /**
     *
     * @param {Layout} layout
     */
    setLayout(layout) {
        this.layout = layout;
        layout.setApp(this);
    }

    /**
     * App implementations may replace this to allow more complex project id matching
     *
     * @param {number} projectId
     * @returns {boolean}
     */
    projectIdIsCompatible(projectId) {
        return projectId === this.projectId;
    }

    /**
     * Adds or updates the survey
     * Caller should always use the returned value, *which may have become a reference to the original now amended survey*
     *
     * @param {Survey} survey
     * @returns {Survey}
     */
    addSurvey(survey) {
        if (!this.projectIdIsCompatible(survey.projectId)) {
            throw new Error(`Survey project id '${survey.projectId} does not match with current project ('${this.projectId}')`);
        }

        let changes = false;

        if (this.surveys.has(survey.id)) {
            const previousSurvey = this.surveys.get(survey.id);

            if (previousSurvey.modifiedStamp !== this.modifiedStamp) {
                changes = true;
            }

            survey = previousSurvey.mergeUpdate(survey);
        } else {
            this.surveys.set(survey.id, survey);
            changes = true;
        }

        if (changes) {
            this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
        }

        this._applySurveyListeners(survey);

        return survey;
    }

    /**
     *
     * @param {Survey} survey
     * @private
     */
    _applySurveyListeners(survey) {
        if (!survey.hasAppModifiedListener) {
            survey.hasAppModifiedListener = true;

            //console.log("setting survey's modified/save handler");
            survey.addListener(
                SURVEY_EVENT_MODIFIED,
                () => {
                    survey.save().finally(() => {
                        this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
                    });
                }
            );
        }

        if (!survey.hasDeleteListener) {
            survey.hasDeleteListener = true;

            survey.addListener(
                SURVEY_EVENT_DELETED,
                () => {
                    // do this slightly more safely via ids, in case surveys somehow refer to different objects
                    if (this.currentSurvey?.id === survey.id) {
                        this.currentSurvey = null;
                    }

                    this.surveys.delete(survey.id);

                    // only clear from local storage if the deletion has gone through
                    if (survey.savedRemotely) {
                        // noinspection JSIgnoredPromiseFromCall
                        this.forageRemoveItem(`survey.${survey.id}`);
                    }

                    survey.destructor();
                    this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
                }
            );
        }
    }

    /**
     * tests whether occurrences have been defined, excluding any that have been deleted
     *
     * @returns {boolean}
     */
    haveExtantOccurrences() {
        for (let occurrence of this.occurrences) {

            // occurrence should at least exist (null entries shouldn't be possible, but want to allow for something
            // having gone awry)
            if (!occurrence?.deleted) {
                return true;
            }
        }
        return false;
    }

    /**
     *
     * @param {Occurrence} occurrence
     */
    addOccurrence(occurrence) {
        if (!occurrence.surveyId) {
            throw new InternalAppError('Survey id must set prior to registering occurrence.');
        }


        // set the survey creation stamp to match the earliest extant occurrence
        // this avoids anomalies where a 'stale' survey created when the form was first opened but not used sits around
        // for a protracted period

        const survey = this.surveys.get(occurrence.surveyId);
        if (!survey) {
            throw new Error(`Failed to look up survey id ${occurrence.surveyId}`);
        }

        if (occurrence.createdStamp &&
            (this.occurrences.size === 0 || survey.createdStamp > occurrence.createdStamp)) {

            survey.createdStamp = occurrence.createdStamp;
        }
        //console.log(`in addOccurrence setting id '${occurrence.id}'`);
        this.occurrences.set(occurrence.id, occurrence);

        // listener will be cleared when the occurrence is destroyed (which happens during survey change)
        occurrence.addListener(OCCURRENCE_EVENT_MODIFIED,
            () => {
                const survey = this.surveys.get(occurrence.surveyId);
                if (!survey) {
                    // this should be impossible but seems to happen

                    // noinspection JSIgnoredPromiseFromCall
                    Logger.logError(`Failed to look up survey id ${occurrence.surveyId} in app listener for OCCURRENCE_EVENT_MODIFIED; available surveys: ${Array.from(this.surveys.keys()).join(',')}`);

                    // in desperation, try to save the occurrence anyway
                    occurrence.save().then(() => {
                        // noinspection JSIgnoredPromiseFromCall
                        Logger.logError(`Saved modified occurrence ${occurrence.id} for missing survey ${occurrence.surveyId}.`);
                    });

                    throw new Error(`Failed to look up survey id ${occurrence.surveyId} in app listener for OCCURRENCE_EVENT_MODIFIED`);
                } else {
                    survey.isPristine = false;

                    // Need to ensure that currentSurvey is saved before occurrence.
                    // Rather than using a promise chain here, instead rely on the enforced queuing of post requests by Model,
                    // otherwise there are problems with queue-jumping (e.g. when an image needs to be saved after both previous requests).
                    if (survey.unsaved()) {
                        // noinspection JSIgnoredPromiseFromCall
                        survey.save(true);
                    }

                    // // against a backdrop where surveys are somehow going unsaved, always force a survey re-save
                    // // @todo need to watch if this is creating a mess of identical survey revisions
                    // // noinspection JSIgnoredPromiseFromCall
                    // survey.save(true);

                    occurrence.save().finally(() => {
                        survey.fireEvent(SURVEY_EVENT_OCCURRENCES_CHANGED, {occurrenceId: occurrence.id});
                    });
                }
            });

        this.fireEvent(APP_EVENT_OCCURRENCE_LOADED, {occurrence: occurrence});
    }

    /**
     * attempts to refresh the state of local storage for the specified survey ids
     * If the fetch fails, then return a failed promise.
     *
     * updates local copy of surveys and occurrences
     *
     * no service worker interception of this call - passed through and not cached
     *
     * @param {Array.<string>} surveyIds
     * @param {boolean} specifiedSurveysOnly if set then don't return a full extended refresh, only the specified surveys
     * @param {number|null} maxAge maximum age of surveys to retrieve (excluding specified ids, which are unconstrained), applicable only if a userid is provided, default null
     * @return {Promise}
     */
    refreshFromServer(surveyIds, specifiedSurveysOnly = false, maxAge = null) {
        //console.log({'Refresh from server, ids' : surveyIds});
        const formData = new FormData;

        let n = 0;
        for (let key of surveyIds) {
            if (key && key !== 'undefined') {
                formData.append(`surveyId[${n++}]`, key);
            }
        }

        if (this.session?.userId) {
            formData.append('userId', this.session.userId);

            // relevant only if a user is logged in
            if (maxAge) {
                formData.append('userMaxAge', maxAge.toString());
            }
        }

        if (specifiedSurveysOnly) {
            formData.append('specifiedOnly', '1');
        }

        return fetch(App.LOAD_SURVEYS_ENDPOINT, {
            method: 'POST',
            body: formData
        }).then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return Promise.reject(`Invalid response from server when refreshing survey ids`);
            }
        }).then((jsonResponse) => {
            /** @param {{survey : Array.<object>, occurrence: Array.<object>, image: Array.<object>}} jsonResponse */

            //console.log({'refresh from server json response' : jsonResponse});

            // if external objects newer than local version then place in local storage
            let promise = Promise.resolve();

            for (let type in jsonResponse) {
                if (jsonResponse.hasOwnProperty(type)) {
                    for (let object of jsonResponse[type]) {
                        promise = promise.then(() => this._conditionallyReplaceObject(object))
                            .catch((reason) => {
                                console.error({'Failed to replace' : {type, id : object.id, reason}});
                                return Promise.resolve();
                            })
                        ;
                    }
                }
            }

            return promise;
        });
    }

    /**
     * compare modified stamp of indexeddb and external objects and write external version locally if more recent
     *
     * @param {{id : string, type : string, modified : number, created : number, saveState : string, deleted : boolean}} externalVersion
     * @returns {Promise}
     * @private
     */
    _conditionallyReplaceObject(externalVersion) {
        const objectType = externalVersion.type;
        const id = externalVersion.id;
        const key = `${objectType}.${id}`;

        return localforage.getItem(key)
            .then((localVersion) => {
                if (localVersion) {
                    // compare stamps

                    // if (externalVersion.deleted) {
                    //     // if the external copy is deleted then remove the local copy
                    //     return localforage.removeItem(key);
                    // }

                    if (!externalVersion.deleted && localVersion.modified >= externalVersion.modified) {
                        this.isTestBuild && console.info(`Local copy of ${key} is the same or newer than the server copy. (${localVersion.modified} >= ${externalVersion.modified}) `);
                        return Promise.resolve();
                    }
                } else {
                    this.isTestBuild && console.info(`Adding new ${key} from server. (locally absent) `);
                }

                // no local copy or stale copy
                // so store response locally
                //console.info(`Adding or replacing local copy of ${key}`);
                return localforage.setItem(key, externalVersion);
            });
    }

    /**
     * retrieve the full set of keys from local storage (IndexedDb)
     *
     * @param {{survey: Array<string>, occurrence : Array<string>, image: Array<string>, [track]: Array<string>}} storedObjectKeys
     * @returns {Promise<{
     *      survey: Array<string>,
     *      occurrence: Array<string>,
     *      image: Array<string>,
     *      [track]: Array<string>
     *      }>}
     */
    seekKeys(storedObjectKeys = {survey: [], occurrence: [], image: [], track: []}) {
        //console.log('starting seekKeys');

        return localforage.keys().then((keys) => {
            //console.log({"in seekKeys: local forage keys" : keys});

            const reservedNamesRegex = new RegExp(`^(?:${App.RESERVED_KEY_NAMES.join('|')})\\b`);

            for (let key of keys) {

                //if (!App.RESERVED_KEY_NAMES.includes(key)) {
                if (!key.match(reservedNamesRegex)) {
                    let type, id, deviceId;

                    [type, id, deviceId] = key.split('.', 3);

                    if (storedObjectKeys.hasOwnProperty(type)) {
                        if (type === 'track') {
                            // tracks keys consist of id.deviceId rather than just id

                            if (!storedObjectKeys[type].includes(`${id}.${deviceId}`)) {
                                storedObjectKeys[type].push(`${id}.${deviceId}`);
                            }
                        } else if (!storedObjectKeys[type].includes(id)) {
                            if (id && id !== 'undefined') {
                                storedObjectKeys[type].push(id);
                            }
                        }
                    } else {
                        // 'track' and 'log' records not always wanted here, but not an error
                        if (type !== 'track' && type !== 'log') {
                            console.error(`Unrecognised stored key type '${type}'.`);
                        }
                    }
                }
            }

            return storedObjectKeys;
        });
    }

    /**
     * Purge local entries that are older than the threshold or orphaned and which have been saved externally
     *
     * @returns {Promise}
     */
    purgeStale(fastReturn = true) {
        const storedObjectKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        if (this._doingPurge) {
            console.error('Already doing a purge');

            // noinspection JSIgnoredPromiseFromCall
            Logger.logError('Already doing a purge');
            return Promise.resolve();
        }

        this._doingPurge = true;

        const promise = this.seekKeys(storedObjectKeys)
            .then((storedObjectKeys) => {
                return this._purgeLocal(storedObjectKeys)
                    .then((result) => {
                        // if (!fastReturn) {
                        //     // Can only trigger the event once the whole process is complete, rather than after
                        //     // a short-cut fast return.
                        //     this.fireEvent(APP_EVENT_PURGE);
                        // }

                        return result;
                    });
            }, (failedResult) => {
                console.error(`Failed to purge: ${failedResult}`);
                Logger.logError(`Failed to purge: ${failedResult}`)
                    .finally(() => {
                        // cope with the pervasive Safari crash
                        // see https://bugs.webkit.org/show_bug.cgi?id=197050
                        if (failedResult.toString().includes('Connection to Indexed Database server lost')) {
                            App.indexedDbConnectionLost = true;
                            location.reload();
                        }
                    });

                //this.fireEvent(APP_EVENT_PURGE_FAILED);
                return false;
            }).finally(() => {
                this._doingPurge = false;
            });

        return fastReturn ?
            Promise.resolve()
            :
            promise;
    }

    /**
     * Flag to prevent multiple syncAll sequences happening at once
     *
     * @type {boolean}
     * @private
     */
    static _syncAllInProgress = false;

    /**
     * @param {boolean} fastReturn If set then the promise returns more quickly once the saves have been queued but not all effected
     * This should allow surveys to be switched etc. without disrupting the ongoing save process.
     * @returns {Promise<{savedCount : {}}|void>}
     */
    syncAll(fastReturn = true) {

        if ((App._syncAllInProgress || !navigator.onLine) && fastReturn) {
            console.info("Skipped sync-all as another sync is already in progress or the device is offline.");
            return Promise.resolve();
        }

        App._syncAllInProgress = true;

        const storedObjectKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        let promise;

        try {
            promise = this.seekKeys(storedObjectKeys)
                .then((storedObjectKeys) => {
                    return this._syncLocalUnsaved(storedObjectKeys, fastReturn)
                        .then((result) => {
                            if (!fastReturn) {
                                // Can only trigger the event once the whole process is complete, rather than after
                                // a short-cut fast return.
                                this.fireEvent(APP_EVENT_ALL_SYNCED_TO_SERVER, result);
                            }

                            return result;
                        }, (failedResult) => {
                            this.fireEvent(APP_EVENT_SYNC_ALL_FAILED, failedResult);
                            return Promise.reject({'_syncLocalUnsaved failedResult': failedResult});
                        });
                }, (failedResult) => {
                    console.error(`Failed to seek keys: ${failedResult}`);
                    Logger.logError(`Failed to seek keys for sync all: ${failedResult}`)
                        .finally(() => {
                            // @todo need to check that failedResult can be parsed in this way
                            // (possibly should happen earlier rather than here)

                            // cope with pervasive Safari crash
                            // see https://bugs.webkit.org/show_bug.cgi?id=197050
                            if (failedResult.toString().includes('Connection to Indexed Database server lost')) {
                                App.indexedDbConnectionLost = true;
                                location.reload();
                            }
                        })
                    ;

                    this.fireEvent(APP_EVENT_SYNC_ALL_FAILED);
                    return Promise.reject(failedResult);
                }).finally(() => {
                    App._syncAllInProgress = false;
                });


        } catch (error) {
            console.error({'syncAll reached outer catch' : error});
            App._syncAllInProgress = false;
        }

        return fastReturn ? Promise.resolve() : promise;
    }

    /**
     * @param queryFilters
     * @param {boolean} [queryFilters.structuredSurvey]
     * @param {boolean} [queryFilters.createdInCurrentYear]
     * @param {boolean} [queryFilters.isToday]
     * @param {string} [queryFilters.monad]
     * @param {string} [queryFilters.tetrad]
     * @param {string} [queryFilters.sampleUnit]
     * @param {string} [queryFilters.userId]
     * @param {string} [queryFilters.date]
     * @param {string} [queryFilters.excludeSurveyId]
     * @param {boolean} [queryFilters.defaultCasual]
     * @param {string|null} preferredBaseSurveyId
     * @returns {Array<Survey>}
     */
    queryLocalSurveys(queryFilters, preferredBaseSurveyId = null) {
        const matches = [];

        for (const surveyTuple of this.surveys) {
            /**
             * @type {Survey}
             */
            const survey = surveyTuple[1];

            if (queryFilters.structuredSurvey && survey.attributes.casual) {
                continue;
            }

            if (queryFilters.defaultCasual && !survey.attributes.defaultCasual) {
                continue;
            }

            if (queryFilters.createdInCurrentYear && !survey.createdInCurrentYear()) {
                continue;
            }

            if (queryFilters.isToday && !survey.isToday()) {
                continue;
            }

            if (queryFilters.monad && survey.getGeoContext()?.monad !== queryFilters.monad) {
                continue;
            }

            if (queryFilters.tetrad && survey.getGeoContext()?.tetrad !== queryFilters.tetrad) {
                continue;
            }

            if (queryFilters.sampleUnit && survey.attributes?.sampleUnit?.selection[0] !== queryFilters.sampleUnit) {
                continue;
            }

            if (queryFilters.hasOwnProperty('userId')) {
                if (queryFilters.userId !== survey.userId) {
                    continue;
                }
            } else {
                // test if the survey belongs to the session user by default (only relevant if an explicit userId selector wasn't applied)
                if (this.session?.userId && survey.userId !== this.session.userId) {
                    continue;
                }
            }

            if (queryFilters.excludeSurveyId === survey.id) {
                continue;
            }

            if (queryFilters.date && queryFilters.date !== survey.date) {
                continue;
            }

            matches[matches.length] = survey;
        }

        if (preferredBaseSurveyId && matches.length) {
            // sort matches with a compatible base survey first
            matches.sort((a, b) => {
                if (a.baseSurveyId === preferredBaseSurveyId) {
                    if (b.baseSurveyId === preferredBaseSurveyId) {
                        return b.createdStamp - a.createdStamp; // return earliest first
                    } else {
                        return -1;
                    }
                }

                if (b.baseSurveyId === preferredBaseSurveyId) {
                    return 1;
                }

                return b.createdStamp - a.createdStamp; // return earliest first
            });
        }

        return matches;
    }

    /**
     *
     * @param {{survey : Array<string>, occurrence : Array<string>, image : Array<string>, [track] : Array<string>}} storedObjectKeys
     * @param {boolean} fastReturn default false
     * @returns {Promise<{savedCount : Object<string, number>, errors : null|Object<string,Array<{key: string, reason: string}>>, savedFlag : boolean}|void>}
     * @private
     */
    _syncLocalUnsaved(storedObjectKeys, fastReturn = false) {

        /**
         *
         * @type {Object<string,Array<{key: string, reason: string}>>}
         */
        const errors = {
            survey : [],
            occurrence : [],
            occurrenceimage : [],
            track : [],
        };

        /**
         *
         * @type {{image: number, survey: number, occurrenceimage: number, track: number}}
         */
        const savedCount = {
            survey : 0,
            occurrence : 0,
            occurrenceimage : 0,
            track : 0,
        };
        let errorFlag = false;

        // set if at least one save happened
        let savedFlag = false;

        /**
         * @param {string} objectKey
         * @param {typeof Model} objectClass
         * @returns {function(): Promise<unknown>}
         * @private
         *
         */
        const queueSync = (objectKey, objectClass) => {
            const classLowerName = objectClass.className.toLowerCase();

                /**
                 * @returns {Promise}
                 */
                return () => {
                    //console.log({'queueing sync': {key: objectKey, type: classLowerName}});
                    return objectClass.retrieveFromLocal(objectKey, new objectClass)
                        .then((/** Model */ model) => {
                            if (model.unsaved()) {
                                return model.save(true, true)
                                    .then(() => {
                                        // for sync, only a remote save should count as successful
                                        if (!model.savedRemotely) {
                                            return Promise.reject(`Failed to save ${classLowerName} to server.`);
                                        }

                                        // make sure that the local copy of the object matches the saved
                                        // in terms of save flags
                                        // (as retrieveFromLocal has substituted a new object with the same values)
                                        if (classLowerName === 'occurrence' &&
                                            this.occurrences.has(model.id) &&
                                            this.occurrences.get(model.id).modifiedStamp === model.modifiedStamp
                                        ) {
                                            this.occurrences.get(model.id).savedRemotely = true;
                                        }
                                    })
                                    .then(() => {
                                        savedCount[classLowerName]++;
                                        savedFlag = true;
                                    });
                            }
                        })
                        .catch((/** string */ failedResult) => {
                            errors[classLowerName].push({
                                key: objectKey,
                                reason: failedResult,
                            });
                            errorFlag = true;
                            return Promise.resolve('Continuing after sync failure.');
                        })
                        .finally(() => {
                            //console.log({'processed sync': {key: objectKey, type: classLowerName}});
                        });
                };


        };

        // /**
        //  *
        //  * @returns {Promise}
        //  * @private
        //  */
        // const next = () => {
        //     tasks.shift(); // save is done
        //
        //     if (tasks.length) {
        //         // run the next task
        //         console.log('Running the next sync task.');
        //         return tasks[0]().finally(next);
        //     }
        // };

        let syncPromise = Promise.resolve();
        //const syncPromise = new Promise();

            // this complex queuing system enforces the order of save requests:
        // survey > occurrences > images > tracks
        // and minimises flooding of indexedDb look-ups that sometimes appear to crash Safari
        // and should minimise memory usage

        //console.log('got to 1079');

        for(let surveyKey of storedObjectKeys.survey) {
            syncPromise = syncPromise.then(() => queueSync(surveyKey, Survey)());

            // queueSync(surveyKey, Survey);
        }

        for(let occurrenceKey of storedObjectKeys.occurrence) {
            syncPromise =syncPromise.then(() => queueSync(occurrenceKey, Occurrence)());

            // queueSync(occurrenceKey, Occurrence);
        }

        for(let imageKey of storedObjectKeys.image) {
            syncPromise = syncPromise.then(() => queueSync(imageKey, OccurrenceImage)());


            // queueSync(imageKey, OccurrenceImage);
        }

        for(let trackKey of storedObjectKeys.track) {
            syncPromise = syncPromise.then(() => queueSync(trackKey, Track)());
            // queueSync(trackKey, Track);
        }

        //console.log('got to 1105');

        syncPromise = syncPromise.finally(() => {
                this._updateUnsavedMarkerCss();
                if (errorFlag) {
                    console.log({'local sync failed with errors': errors});
                    return Promise.reject({
                        savedCount,
                        errors,
                        savedFlag
                    });
                }
            });


        if (fastReturn) {
            return Promise.resolve('Fast return before syncLocalUnsaved completed.');
            // // this will return near instantaneously as there is an already resolved promise at the head of the array
            // // the other promises will continue to resolve
            // //return Promise.race(promises);
            // return Promise.race([
            //     Promise.resolve(true), // as shortcut queue an already resolved promise, so that later Promise.race returns immediately.
            //     syncPromise
            // ]);
        } else {
            return syncPromise.then(() => {
                //console.log('got to 1148');
                return {
                    savedCount,
                    errors: null,
                    savedFlag
                }
            });
        }
    }

    /**
     *
     * @param {{survey : Array<string>, occurrence : Array<string>, image : Array<string>, [track] : Array<string>}} storedObjectKeys
     *
     * @returns {Promise}
     *
     * @private
     */
    _purgeLocal(storedObjectKeys) {
        // synchronises surveys first, then occurrences, then images from indexedDb

        let purgePromise = Promise.resolve();

        const deletionCandidateKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        const preservedKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        const recentSurveyKeys = [];

        const thresholdStamp = Math.floor(Date.now() / 1000) - this.staleThreshold;

        const recentThresholdStamp = Math.floor(Date.now() / 1000) - (3600 * 24);

        const currentSurveyId = this.currentSurvey?.id;

        console.info(`in _purgeLocal currentSurveyId = ${currentSurveyId}`);

        for(let surveyKey of storedObjectKeys.survey) {
            purgePromise = purgePromise.then(() => Survey.retrieveFromLocal(surveyKey, new Survey)
                .then((/** Survey */ survey) => {
                    if (survey.id !== currentSurveyId && survey.savedRemotely && (
                        (survey.modifiedStamp <= thresholdStamp) || (this.session?.userId && survey.userId && this.session.userId !== survey.userId)
                    )) {
                        // survey hasn't been modified recently or belongs to a different user

                        if (!(survey.attributes?.defaultCasual && survey.createdInCurrentYear() && survey.userId === this.userId)) {
                            // survey isn't the set of casual records for the current year for the current user

                            deletionCandidateKeys.survey.push(survey.id);
                        } else {
                            preservedKeys.survey.push(survey.id);

                            if (survey.modifiedStamp <= recentThresholdStamp &&
                                !survey.attributes?.defaultCasual &&
                                !survey.attributes?.nulllist // NYPH-specific
                            ) {
                                recentSurveyKeys.push(survey.id);
                            }
                        }
                    } else {
                        preservedKeys.survey.push(survey.id);
                    }
                })
                // .catch((reason) => {
                //     console.error({'survey pre-purge failed reason' : reason});
                // })
            );
        }

        // at this point all surveys will have been checked by the time the next thenables are processed
        for (let occurrenceKey of storedObjectKeys.occurrence) {
            purgePromise = purgePromise.then(() => Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence))
                .then((/** Occurrence */ occurrence) => {

                    if (!occurrence.deleted) {
                        // see if occurrence belongs to one of the threshold recent surveys
                        // if so, then the survey should be kept (so removed from the imperilled recent list)
                        const recentIndex = recentSurveyKeys.indexOf(occurrence.surveyId);
                        if (recentIndex !== -1) {
                            delete recentSurveyKeys[recentIndex];
                        }
                    }

                    if (occurrence.unsaved()) {
                        if (deletionCandidateKeys.survey.includes(occurrence.surveyId)) {
                            throw new PurgeInconsistencyError(`Occurrence ${occurrence.id} from deletable survey ${occurrence.surveyId} is unsaved.`);
                        } else {
                            preservedKeys.occurrence.push(occurrence.id);
                        }
                    } else if (deletionCandidateKeys.survey.includes(occurrence.surveyId) || occurrence.deleted) {
                        deletionCandidateKeys.occurrence.push(occurrence.id);
                    } else if (!preservedKeys.survey.includes(occurrence.surveyId)) {
                        // have an orphaned occurrence
                        console.log(`Queueing purge of orphaned occurrence id ${occurrence.id}`);
                        deletionCandidateKeys.occurrence.push(occurrence.id);
                    } else {
                        preservedKeys.occurrence.push(occurrence.id);
                    }
                });
        }

        for(let imageKey of storedObjectKeys.image) {
            purgePromise = purgePromise.then(() => OccurrenceImage.retrieveFromLocal(imageKey, new OccurrenceImage)
                .then((/** OccurrenceImage */ image) => {
                    if (image.unsaved()) {
                        if (deletionCandidateKeys.survey.includes(image.surveyId)) {
                            throw new PurgeInconsistencyError(`Image ${image.id} from deletable survey ${image.surveyId} is unsaved.`);
                        } else if (deletionCandidateKeys.occurrence.includes(image.occurrenceId)) {
                            throw new PurgeInconsistencyError(`Image ${image.id} from deletable occurrence ${image.occurrenceId} is unsaved.`);
                        } else {
                            preservedKeys.image.push(image.id);
                        }
                    } else {
                        if (deletionCandidateKeys.survey.includes(image.surveyId) ||
                            deletionCandidateKeys.occurrence.includes(image.occurrenceId) ||
                            image.deleted
                        ) {
                            deletionCandidateKeys.image.push(image.id);
                        } else if (!(
                            preservedKeys.survey.includes(image.surveyId) ||
                            preservedKeys.occurrence.includes(image.occurrenceId)
                        )) {
                            // have an orphaned image
                            console.log(`Queueing purge of orphaned image id ${image.id}`);
                            deletionCandidateKeys.image.push(image.id);
                        } else {
                            preservedKeys.image.push(image.id);
                        }
                    }
                })
            );
        }

        for(let trackKey of storedObjectKeys.track) {
            purgePromise = purgePromise.then(() => Track.retrieveFromLocal(trackKey, new Track)
                .then((/** Track */ track) => {
                    // use trackKey rather track.id as keys for tracks are expressed as id.deviceId

                    if (!track.deviceId || track.deviceId === 'undefined') {
                        console.log(`Queueing purge of corrupt track id ${track.id} with no device.`);
                        deletionCandidateKeys.track.push(trackKey);
                    } else if (track.unsaved()) {
                        if (deletionCandidateKeys.survey.includes(track.surveyId)) {
                            throw new PurgeInconsistencyError(`Track ${trackKey} from deletable survey ${track.surveyId} is unsaved.`);
                        } else {
                            preservedKeys.track.push(trackKey);
                        }
                    } else {
                        if (deletionCandidateKeys.survey.includes(track.surveyId) || track.deleted) {
                            deletionCandidateKeys.track.push(trackKey);
                        } else if (!preservedKeys.survey.includes(track.surveyId)) {
                            // have an orphaned image
                            console.log(`Queueing purge of orphaned track id ${track.id} for survey ${track.surveyId}.`);
                            deletionCandidateKeys.track.push(trackKey);
                        } else {
                            preservedKeys.track.push(trackKey);
                        }
                    }
                })
            );
        }

        // add remaining recent surveys that have no records to the purge list
        deletionCandidateKeys.survey.push(...recentSurveyKeys);

        purgePromise = purgePromise.then(
            () => {
                //console.log({'Purging' : deletionCandidateKeys});

                return this._applyPurge(deletionCandidateKeys);
            },
            (reason) => {
                console.error({'purge failed reason' : reason});
                console.log({'would have purged' : deletionCandidateKeys});

                // noinspection JSIgnoredPromiseFromCall
                Logger.logError(`Purge failed: ${reason}`);
            });

        return purgePromise;
    }

    /**
     *
     * @param {{survey : Array<string>, occurrence : Array<string>, image : Array<string>, track : Array<string>}} deletionIds
     * @private
     */
    _applyPurge(deletionIds) {
        let purgePromise = Promise.resolve();

        // local survey list should be cleared first, to avoid the risk of the user selecting a survey mid-purge
        if (deletionIds.survey.length > 0) {
            purgePromise = purgePromise.then(() => {
                for (let key of deletionIds.survey) {
                    console.info(`Purging survey id ${key}.`);
                    this.surveys.delete(key);
                }

                this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
            })
                .catch(error => console.error({'survey deletion error' : {surveyskeys: deletionIds.survey, error}}));
        }

        for (let type in deletionIds) {
            for (let key of deletionIds[type]) {
                purgePromise = purgePromise.then(() => this.forageRemoveItem(`${type}.${key}`))
                    .catch(error => console.error({'purge error' : {key: `${type}.${key}`, error}}));
            }
        }

        if (deletionIds.image.length > 0) {
            purgePromise = purgePromise.then(() => this._purgeCachedImages(deletionIds.image))
                .catch(error => console.error({'purge images error' : {imagekeys: deletionIds.image, error}}));
        }

        return purgePromise;
    }

    /**
     *
     * @param {Array<string>} imageIds
     * @returns {Promise<void>}
     * @private
     */
    _purgeCachedImages(imageIds) {
        const cacheName = App.DATA_CACHE_VERSION;

        return caches.open(cacheName)
            .then((cache) => {
                return cache.keys()
                    .then((/** Array<Request> */ requests) => {
                        for (let request of requests) {
                            const url = request.url;

                            const match = url.match(/image\.php.*imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

                            //if (url.match(new RegExp(`image\.php.*imageid=${imageId}`))) {
                            if (match && imageIds.includes(match[1])) {
                                console.log(`Deleting cached image ${url}`);
                                // noinspection JSIgnoredPromiseFromCall
                                cache.delete(request);
                            }
                        }
                    })
            });

    }

    /**
     * restore previous state, pulling back from local and external store
     * @todo this needs a save phase, so that local changes are saved back to the server
     *
     * @param {string} [targetSurveyId] if specified then select this id as the current survey
     * @param {boolean} [neverAddBlank] if set then don't add a new blank survey if none available, default false
     * @param {boolean} [setCurrentSurvey] if set then, if possible, set a survey as current, default true
     * @param {boolean} [localOnly] if set then only retrieve data from local storage (applies only if a targetSurveyId is specified, default false
     * @param {boolean} [specifiedSurveyOnly] if set (default FALSE) then pull-back only the target survey and no others
     * @return {Promise}
     */
    restoreOccurrences(targetSurveyId = '', neverAddBlank = false, setCurrentSurvey = true, localOnly = false, specifiedSurveyOnly = false) {
        console.log(`Invoked restoreOccurrences, target survey id: ${targetSurveyId}, localOnly: '${localOnly.toString()}'`);

        if (targetSurveyId === 'undefined') {
            console.error(`Attempt to restore occurrences for literal 'undefined' survey id.`);
            targetSurveyId = '';
        }

        return (targetSurveyId) ?
            this._restoreOccurrenceImp(targetSurveyId, neverAddBlank, setCurrentSurvey, localOnly, specifiedSurveyOnly)
            :
            this.getLastSurveyId().then(
                (lastSurveyId) => {
                    console.log(`Retrieved last used survey id '${lastSurveyId}'`);

                    if (lastSurveyId) {
                        return this._restoreOccurrenceImp(lastSurveyId, neverAddBlank, setCurrentSurvey, localOnly, false /* specifiedSurveyOnly can't apply */).catch(() => {
                            console.log(`Failed to retrieve lastSurveyId ${lastSurveyId}. Resetting current survey and retrying.`);
                            // noinspection JSIgnoredPromiseFromCall
                            Logger.logError(`Failed to retrieve lastSurveyId ${lastSurveyId}. Resetting current survey and retrying.`);
                            this.currentSurvey = null;
                            return this._restoreOccurrenceImp('', neverAddBlank, setCurrentSurvey, false, false);
                        });
                    } else {
                        // noinspection JSIgnoredPromiseFromCall
                        Logger.logError('Failed to retrieve lastSurveyId.');
                        return this._restoreOccurrenceImp('', neverAddBlank, setCurrentSurvey, false, false);
                    }
                },
                // probably can't reach this catch phase
                () => this._restoreOccurrenceImp('', neverAddBlank, setCurrentSurvey, false, false)
            );
    }

    /**
     *
     * @param {string} contextMessage
     * @return Promise<void>
     */
    static logMemoryUsage(contextMessage) {
        if (navigator.storage?.estimate || performance?.measureUserAgentSpecificMemory) {
            let memory, storage, promise;

            promise = Promise.resolve();

            if (performance?.measureUserAgentSpecificMemory) {
                promise = promise.then(() => {
                    return performance.measureUserAgentSpecificMemory().then(memorySpec => {
                        memory = memorySpec;
                    });
                });
            }

            if (navigator.storage?.estimate) {
                promise = promise.then(() => {
                    return navigator.storage?.estimate().then(storageSpec => {
                        storage = storageSpec;
                    });
                });
            }

            return promise.then(() => Logger.logErrorDev(`Memory and storage logs: ${contextMessage} : ${JSON.stringify({
                memory,
                storage
            })}`));
        } else {
            return Promise.resolve();
        }
    }

    /**
     *
     * @param {string} [targetSurveyId] default ''
     * @param {boolean} [neverAddBlank] if set then don't add a new blank survey if none available, default false
     * @param {boolean} [setCurrentSurvey] default true
     * @param {boolean} [localOnly] default false, if set then do a fast local switch rather than refreshing from server
     * @param {boolean} [specifiedSurveyOnly] default FALSE, if set then only seek the targetSurveyId from the server
     *
     * @returns {Promise<void>}
     * @protected
     */
    _restoreOccurrenceImp(targetSurveyId = '', neverAddBlank = false, setCurrentSurvey = true, localOnly = false, specifiedSurveyOnly = false) {
        // Need to check for a special case where restoring a survey that has never been saved even locally
        // i.e. new and unmodified and only present in current App.surveys
        // This occurs if the user creates a new survey, makes no changes, switches away from it, then switches back
        // and also in some other automated navigation sequences.
        if (targetSurveyId && this.surveys.has(targetSurveyId)) {
            const localSurvey = this.surveys.get(targetSurveyId);

            if (localSurvey.isPristine) {
                // If the local survey is not current, then
                // clear occurrences from the previous survey.

                if (setCurrentSurvey && localSurvey.id !== this._currentSurvey?.id) {
                    // noinspection JSIgnoredPromiseFromCall
                    Logger.logError(`Switching to pristine survey ${targetSurveyId}.`);

                    return this.clearCurrentSurvey().then(() => {
                        this.currentSurvey = localSurvey;
                        this.fireEvent(APP_EVENT_SURVEYS_CHANGED); // the current survey should be set now, so the menu needs refreshing
                        return Promise.resolve();
                    });
                } else {
                    return Promise.resolve();
                }
            }
        } else {
            localOnly = false;
        }

        /**
         *
         * @type {{image: Array<string>, survey: Array<string>, occurrence: Array<string>}}
         */
        const storedObjectKeys = {
            survey: [],
            occurrence: [],
            image: [],
            track: [],
        };

        if (targetSurveyId) {
            storedObjectKeys.survey[0] = targetSurveyId;
        } else {
            specifiedSurveyOnly = false;
        }

        let promise;
        // only clear the current survey if the new one is different
        if (this.currentSurvey && this.currentSurvey.id !== targetSurveyId) {
            promise = this.clearCurrentSurvey();
        } else {
            promise = Promise.resolve();
        }

        return promise.then(() => this.seekKeys(storedObjectKeys))
            .then((storedObjectKeys) => {
                // if (!navigator.onLine) { // insufficiently reliable
                //     localOnly = true;
                // }

                if (!localOnly && (storedObjectKeys.survey.length || this.session?.userId)) {
                    let timer;
                    const timeoutMs = 15 * 1000;

                    const promisesToRace = [
                        new Promise((resolve, reject) => {
                            // Set up the timeout
                            timer = setTimeout(() => {
                                timer = null;
                                console.error(`Refresh from server timeout.`);
                                reject(new Error(`Survey load timed out after ${timeoutMs} ms`));
                            }, timeoutMs);
                        }),
                        this.refreshFromServer(specifiedSurveyOnly ? [targetSurveyId] : storedObjectKeys.survey, specifiedSurveyOnly)
                            // re-seek keys from indexed db, to take account of any new occurrences received from the server
                            // do this for both promise states (can't use finally as it doesn't chain returned promises)
                            .then(
                                () => this.seekKeys(storedObjectKeys),
                                () => this.seekKeys(storedObjectKeys),
                            ).then(() => {
                                if (!timer) {
                                    console.log('Adding surveys for late response to load surveys');

                                    return this.app.addAllSurveysFromLocal();
                                }
                            })
                            .finally(() => {
                                if (timer) {
                                    clearTimeout(timer);
                                }
                            })
                    ];

                    // The split approach below isn't yet safe
                    /*
                    if (targetSurveyId) {
                        // as a single batch, try to get just the survey of interest

                        promisesToRace.push(
                            this.refreshFromServer([targetSurveyId], true)
                                // re-seek keys from indexed db, to take account of any new occurrences received from the server
                                // do this for both promise states (can't use finally as it doesn't chain returned promises)
                                .then(
                                    () => this.seekKeys(storedObjectKeys),
                                    () => this.seekKeys(storedObjectKeys),
                                )
                                .finally(() => {
                                    console.info(`Returned from narrow survey load.`);
                                    if (timer) {
                                        clearTimeout(timer);
                                    }
                                })
                        );
                    }

                    // request other relevant recent surveys more generally
                    // will usually complete more slowly
                    promisesToRace.push(
                        this.refreshFromServer(storedObjectKeys.survey)
                            .then(() => this.seekKeys(storedObjectKeys))
                            .finally(() => {
                                console.info(`Returned from broad survey load.`);
                                if (timer) {
                                    clearTimeout(timer);
                                }
                            })
                    );
                     */

                    return Promise.race(promisesToRace);
                } else {
                    return null;
                }
            })
            .catch(() => {
                // need this catch to get back to a resolving promise chain
                console.error('Failed at clear survey or at seek keys.');
                return Promise.resolve();
            })
            .then(() => {
                // called regardless of whether a server refresh was successful
                // (because of previous catch)
                // storedObjectKeys and indexed db should be as up to date as possible

                if (storedObjectKeys?.survey?.length) {
                    let n = 0;

                    let restorePromise = Promise.resolve();

                    for (let surveyKey of storedObjectKeys.survey) {
                        // arbitrarily set the first survey key as current if a target id hasn't been specified

                        if (localOnly
                            && targetSurveyId
                            && surveyKey !== targetSurveyId
                            && this.surveys.has(surveyKey)
                        ) {
                            // don't bother with non-target surveys that are already in the survey list, as for local-only we know nothing has changed
                            continue;
                        }

                        restorePromise = restorePromise
                            .then(() => {
                                return this._restoreSurveyFromLocal(surveyKey, storedObjectKeys, setCurrentSurvey && ((targetSurveyId === surveyKey) || (!targetSurveyId && n++ === 0)));
                            })
                            .catch((reason) => {
                                console.log({'failed to restore from local': {surveyKey, reason}});
                                return Promise.resolve();
                            });
                    }

                    return restorePromise
                        .finally(() => {
                            //this.currentSurvey = this.surveys.get(storedObjectKeys.survey[0]);

                            if (!this.currentSurvey && neverAddBlank && setCurrentSurvey) {
                                // survey doesn't exist
                                // this could have happened in an invalid survey id was provided as a targetSurveyId
                                console.log(`Failed to retrieve survey id '${targetSurveyId}'`);
                                return Promise.reject(new Error(`Failed to retrieve survey id '${targetSurveyId}'`));
                            }

                            if (this.currentSurvey?.deleted) {
                                // unusual case where the survey was deleted or was not found
                                // substitute a new one

                                // this should probably never happen, as items deleted on the server ought to have been
                                // removed locally
                                this.currentSurvey = null;
                                if (neverAddBlank) {
                                    return Promise.reject(new Error(`Survey id '${targetSurveyId}' ${this.currentSurvey?.deleted ? 'is deleted' : 'not found'}.`));
                                } else {
                                    this.setNewSurvey();
                                }
                            }

                            this.fireEvent(APP_EVENT_SURVEYS_CHANGED); // current survey should be set now, so menu needs refresh
                            this.currentSurvey?.fireEvent?.(SURVEY_EVENT_OCCURRENCES_CHANGED);
                            this.currentSurvey?.fireEvent?.(SURVEY_EVENT_LIST_LENGTH_CHANGED);
                        });
                } else {
                    // no pre-existing surveys

                    if (neverAddBlank) {
                        console.log('no pre-existing survey');
                        this.fireEvent(APP_EVENT_SURVEYS_CHANGED); // survey menu needs refresh
                        return Promise.reject(new Error(`Failed to match survey.`));
                    } else {
                        console.log('no pre-existing surveys, so creating a new one');
                        this.setNewSurvey(); // this also fires EVENT_SURVEYS_CHANGED
                        return Promise.resolve();
                    }
                }
            });
    }

    /**
     * Adds surveys from local storage to the app's current list (if survey is compatible)
     * Does not affect the current survey or refresh any dependent occurrences etc.
     *
     * Called as part of refresh following sync all (not used during app start-up, when current survey also needs to be set)
     *
     * @returns {Promise<void>}
     *
     */
    addAllSurveysFromLocal() {
        return this.seekKeys()
            .then((storedObjectKeys) => {
                let wrappedPromise = Promise.resolve();
                if (storedObjectKeys?.survey?.length) {
                    for (let surveyKey of storedObjectKeys.survey) {
                        wrappedPromise = wrappedPromise.then(() => {
                            return this._restoreSurveyFromLocal(surveyKey, storedObjectKeys, false);
                        })
                        .catch((reason) => {
                            console.log({'failed to restore from local': {surveyKey, reason}});
                            return Promise.resolve();
                        });
                    }
                }
                return wrappedPromise;
            });
    }

    /**
     *
     * @param {{}|null} [attributes]
     * @param {number} [projectId]
     */
    setNewSurvey(attributes, projectId) {
        const newSurvey = new Survey();

        newSurvey.id; // trigger id initialisation

        if (attributes) {
            newSurvey.attributes = {...newSurvey.attributes, ...attributes};
        }

        newSurvey.projectId = projectId || this.projectId;
        newSurvey.isPristine = true;
        newSurvey.isNew = true;

        if (this.session?.userId) {
            newSurvey.userId = this.session.userId;
        }

        // Important: don't set this.currentSurvey until default attributes have been set,
        // as currentSurvey setter fires an event that may depend on these attributes
        this.currentSurvey = this.addSurvey(newSurvey);
        this.fireEvent(APP_EVENT_NEW_SURVEY);

        Track.applyChangedSurveyTrackingResumption(newSurvey);
    }

    /**
     * Add and set a *new* survey
     *
     * @param survey
     */
    addAndSetSurvey(survey) {
        this.currentSurvey = this.addSurvey(survey);
        this.fireEvent(APP_EVENT_NEW_SURVEY);
    }

    /**
     * specialised surveys might return an HTML <img> tag string
     * @param {Survey} survey
     * @returns {string}
     */
    getSurveyTypeMarkerIcon(survey) {
        return '';
    }

    /**
     * Note that if attributes are set here, then the occurrence is regarded as changed and unsaved, rather than pristine
     * i.e. attributes setting here is *not* intended as a way to set defaults
     *
     * @param {{}|null} [attributes]
     * @param {{}|null} [pristineAttributes] additional attributes, that if set, don't count as edits
     * @return {Occurrence}
     */
    addNewOccurrence(attributes, pristineAttributes) {
        const occurrence = new Occurrence();
        const currentSurvey = this.currentSurvey; // avoid too many getter lookups

        if (!currentSurvey) {
            throw new Error(`Current survey unset when adding new occurrence.`);
        }

        occurrence.id; // force initialisation of occurrence id
        occurrence.surveyId = currentSurvey.id;

        // In some cases more than one project id may be in use (e.g. RecordingApp v's NYPH)
        // so when adding occurrences use the survey rather than app project id as the source-of-truth
        occurrence.projectId = currentSurvey.projectId;

        if (currentSurvey.userId) {
            occurrence.userId = currentSurvey.userId;
        }

        occurrence.isNew = true;
        occurrence.isPristine = true;

        if (attributes && Object.keys(attributes).length) {
            occurrence.attributes = {...occurrence.attributes, ...attributes};
            occurrence.touch(); // now no longer pristine
        }

        if (pristineAttributes && Object.keys(pristineAttributes).length) {
            // unlike above, setting these doesn't affect the modified state of the object
            occurrence.attributes = {...occurrence.attributes, ...pristineAttributes};
        }

        this.addOccurrence(occurrence);

        currentSurvey.extantOccurrenceKeys.add(occurrence.id);

        this.fireEvent(APP_EVENT_OCCURRENCE_ADDED, {occurrenceId: occurrence.id, surveyId: occurrence.surveyId});

        currentSurvey.fireEvent(SURVEY_EVENT_OCCURRENCES_CHANGED, {occurrenceId : occurrence.id});
        currentSurvey.fireEvent(SURVEY_EVENT_LIST_LENGTH_CHANGED);

        // occurrence modified event fired to ensure that the occurrence is saved
        occurrence.fireEvent(OCCURRENCE_EVENT_MODIFIED);

        return occurrence;
    }

    /**
     * Test if user has the necessary admin rights for the given survey.
     * May be overridden in child classes to cope with administration of specialized survey types
     *
     * @param {Survey} survey
     * @returns {boolean}
     * @protected
     */
    _userHasSurveyAdminRights(survey) {
        if (this.session?.userId) {
            return survey.userId === this.session.userId || this.session?.superAdmin
        } else {
            return false;
        }
    }

    /**
     *
     * @param {string} surveyId
     * @param {{survey: Array, occurrence: Array, image: Array}} storedObjectKeys
     * @param {boolean} setAsCurrent
     * @returns {Promise}
     * @private
     */
    _restoreSurveyFromLocal(surveyId, storedObjectKeys = {survey: [], occurrence: [], image: []}, setAsCurrent = false) {
        // retrieve surveys first, then occurrences, then images from indexedDb

        let userIdFilter = this.session?.userId;

        let promise = Survey.retrieveFromLocal(surveyId, new Survey)
            .then((survey) => {
                //console.log(`retrieving local survey ${surveyId}`);

                this.fireEvent(APP_EVENT_SURVEY_LOADED, {survey}); // provides a hook point in case any attributes need to be re-initialised

                if (survey.deleted) {
                    console.log(`Skipping deleted survey id ${survey.id}.`);
                    return Promise.reject(`Skipping deleted survey id ${survey.id}.`);
                }

                if ((!userIdFilter && !survey.userId) || this._userHasSurveyAdminRights(survey)) {
                    if (setAsCurrent) {
                        // the app's occurrences should only relate to the current survey
                        // (the reset records are remote or in IndexedDb)
                        return this.clearCurrentSurvey().then(() => {
                            survey = this.addSurvey(survey);
                            //const occurrenceFetchingPromises = [];
                            let occurrenceFetchingPromise = Promise.resolve();

                            for (let occurrenceKey of storedObjectKeys.occurrence) {
                                occurrenceFetchingPromise = occurrenceFetchingPromise
                                    .then(() => Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence)
                                        .then((occurrence) => {
                                            if (occurrence.surveyId === surveyId) {
                                                //console.log(`adding occurrence ${occurrenceKey}`);
                                                this.addOccurrence(occurrence);

                                                survey.extantOccurrenceKeys.add(occurrence.id);
                                            } else {
                                                // not part of the current survey but should still add it to the key list for counting purposes

                                                this.surveys.get(occurrence.surveyId)?.extantOccurrenceKeys?.add?.(occurrence.id);
                                            }

                                        })
                                    )
                                    .catch((reason) => {
                                        console.error({'Failed to fetch occurrence for current survey' : {occurrenceKey, reason}});
                                        return Promise.resolve();
                                    });
                            }

                            //return Promise.all(occurrenceFetchingPromises);
                            return occurrenceFetchingPromise;
                        });
                    } else {
                        // not the current survey, so just add it but don't load occurrences
                        survey = this.addSurvey(survey);
                        return Promise.resolve();
                    }
                } else {
                    console.log(`Skipping survey id ${survey.id} that belongs to user ${survey.userId}`);
                    return Promise.reject(`Skipping survey id ${survey.id} that belongs to user ${survey.userId}`);
                }
            });

        if (setAsCurrent) {
            promise.then( () => {

                //this.currentSurvey = this.surveys.get(storedObjectKeys.survey[0]) || null;
                this.currentSurvey = this.surveys.get(surveyId) || null;

                if (this.currentSurvey) {
                    //console.log('Reached image fetching part');
                    //const imageFetchingPromises = [];
                    let imageFetchingPromise = Promise.resolve();

                    for (let occurrenceImageKey of storedObjectKeys.image) {
                        imageFetchingPromise = imageFetchingPromise
                            .then(
                                () => OccurrenceImage.retrieveFromLocal(occurrenceImageKey, new OccurrenceImage)
                                    .then((occurrenceImage) => {
                                        console.log(`restoring image id '${occurrenceImageKey}'`);

                                        if (occurrenceImage.surveyId === surveyId) {
                                            OccurrenceImage.imageCache.set(occurrenceImageKey, occurrenceImage);
                                        }
                                    }, (reason) => {
                                        console.log(`Failed to retrieve an image: ${reason}`);
                                        return Promise.resolve();
                                    })
                                ,
                                () => Promise.resolve() // always finish with a resolved promise, even on failure
                            );

                        // imageFetchingPromises.push(
                        //     OccurrenceImage.retrieveFromLocal(occurrenceImageKey, new OccurrenceImage)
                        //         .then((occurrenceImage) => {
                        //             console.log(`restoring image id '${occurrenceImageKey}'`);
                        //
                        //             if (occurrenceImage.surveyId === surveyId) {
                        //                 OccurrenceImage.imageCache.set(occurrenceImageKey, occurrenceImage);
                        //             }
                        //         }, (reason) => {
                        //             console.log(`Failed to retrieve an image: ${reason}`);
                        //         })
                        // );
                    }

                    return imageFetchingPromise;
                } else {
                    Logger.logError(`Failed to retrieve survey id '${surveyId}' from local set in _restoreSurveyFromLocal().`);
                    return Promise.reject(`Failed to restore survey id '${surveyId}' from local set.`);
                }

                // if the target survey belonged to a different user then could be undefined here
                // failed state should reject rather than resolve the promise
                // return this.currentSurvey ? Promise.all(imageFetchingPromises) : Promise.reject();
            });
        }

        return promise;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    clearLocalForage() {
        return localforage.clear();
    }

    /**
     * @abstract
     */
    notFoundView() {
        // const view = new NotFoundView();
        // view.display();
    }
}

const PARTY_NAME_INDEX = 0;
const PARTY_SURNAME_INDEX = 2;
const PARTY_FORENAMES_INDEX = 3;
const PARTY_ORGNAME_INDEX = 4;
const PARTY_INITIALS_INDEX = 5;
const PARTY_ID_INDEX = 6;
const PARTY_USERID_INDEX = 7;
const PARTY_ROLES_INDEX = 8;

class Party {
    /**
     * @typedef RawParty
     * @type {object}
     *
     * @property {string} 0 - name string
     * @property {array} 1 - dates (normally blank)
     * @property {string} 2 - surname
     * @property {string} 3 - forenames
     * @property {string} 4 - orgName
     * @property {string} 5 - initials
     * @property {string} 6 - id
     * @property {string} 7 - linked user id
     * @property {array} 8 - roles
     *
     * // these are not implemented
     * @property {string} [9] - type code
     * @property {string} [10] - prefix
     * @property {string} [11] - suffix
     * @property {string} [12] - disambiguation
     */

    // static NAME_INDEX = PARTY_NAME_INDEX;
    // static SURNAME_INDEX = PARTY_SURNAME_INDEX;
    // static FORENAMES_INDEX = PARTY_FORENAMES_INDEX;
    // static ORGNAME_INDEX = PARTY_ORGNAME_INDEX;
    // static INITIALS_INDEX = PARTY_INITIALS_INDEX;
    // static ID_INDEX = PARTY_ID_INDEX;
    // static USERID_INDEX = PARTY_USERID_INDEX;
    // static ROLES_INDEX = PARTY_ROLES_INDEX;

    /**
     * Generic party list, not tied to a particular user id
     *
     * @type {Array.<RawParty>}
     */
    static _baseParties = [];

    /**
     * Current party working set, combining the base set with per-user extras
     *
     * @type {Array.<RawParty>}
     */
    static rawParties = [];

    /**
     *
     * @type {string|null}
     */
    static loadedUserId = null;

    static TYPE_PERSON = 'p';
    static TYPE_ORGANISATION = 'u';
    static TYPE_UNKNOWN = '?';

    static USER_PARTIES_URL = '/';

    /**
     * @type {string}
     */
    id;

    /**
     *
     * @type {string}
     */
    name = '';

    /**
     *
     * @type {string}
     */
    firstName = '';

    /**
     *
     * @type {string}
     */
    surnameName = '';

    /**
     *
     * @type {string}
     */
    orgName = '';

    /**
     *
     * @type {string}
     */
    type = '';

    /**
     *
     * @type {string}
     */
    prefix = '';

    /**
     *
     * @type {string}
     */
    suffix = '';

    /**
     *
     * @type {string}
     */
    disambiguation = '';

    // static setParties(parties) {
    //     Party.rawParties = parties;
    // }

    /**
     *
     * @param {Array.<RawParty>} parties
     * @param {number} parties.stamp
     * @param {string|null} sourceUrl
     */
    static initialiseParties(parties, sourceUrl = null) {
        Party._baseParties = parties;
        //Party.rawParties = [...Party._baseParties, ...parties];
        Party.rawParties = Party._baseParties;

        if (sourceUrl) {
            Party.testPartyRecache(parties.stamp, sourceUrl);
        }
    }

    static clearUserParties() {
        Party.rawParties = Party._baseParties;
    }

    /**
     *
     * @param {number|null} stamp
     * @param {string} sourceUrl
     * @param {number} interval
     * @todo default interval for re-cache should be shorter on desktops than on mobile
     */
    static testPartyRecache(stamp, sourceUrl, interval = (3600 * 24 * 7)) {
        if (navigator.onLine && stamp && (stamp + interval) < (Date.now() / 1000)) {
            console.log(`Party list may be stale (stamp is ${stamp}), prompting re-cache from ${sourceUrl}.`);
            navigator?.serviceWorker?.ready?.then?.((registration) => {
                registration.active.postMessage(
                    {
                        action: 'recache',
                        url: sourceUrl
                    }
                );
            });
        }
    }

    static additionalPartiesUrl = 'https://database.bsbi.org/js/appuserpartylist.mjs.php?user=';

    /**
     *
     * @param {string} userId
     * @returns {Promise}
     */
    static addUserParties(userId) {
        // where parties are the newly loaded extra set

        const url = `${Party.additionalPartiesUrl}${userId}`;

        return import(url).then((imported) => {
            const newParties = imported?.default;

            if (newParties?.length) {
                /**
                 *
                 * @type {Map<string, array<RawParty>>}
                 */
                const unique = new Map;

                // base parties must come first as these will be tied to registered DDb users
                // dynamically added in-app names must come last
                for (let party of [...Party._baseParties, ...newParties]) {
                    /**
                     * either the packed entity id, or a string-serialised forename-surname-orgname
                     * @type {string}
                     */
                    let key = (party?.[PARTY_ID_INDEX]) || JSON.stringify([party?.[PARTY_FORENAMES_INDEX], party?.[PARTY_SURNAME_INDEX], party?.[PARTY_ORGNAME_INDEX]]);

                    if (!unique.has(key)) {
                        unique.set(key, party);
                    }
                }

                Party.rawParties = Array.from(unique.values());
            }
            Party.testPartyRecache(newParties?.stamp, url);

            return newParties;
        }, (reason) => {
            console.error({"Failed to import user parties" : reason});
            return null;
        });
    }

    // /**
    //  * @todo this does not work as rawParties are not keyed by ID (as newly added parities in app won't have an entity id)
    //  *
    //  * @param {string} id
    //  * @returns {Party}
    //  * @throws {PartyError}
    //  */
    // static fromId (id) {
    //     if (!Party.rawParties) {
    //         throw new PartyError(`Party.fromId() called before list has been initialized.`);
    //     }
    //
    //     if (!Party.rawParties.hasOwnProperty(id)) {
    //         throw new PartyError(`Party id '${id}' not found.`);
    //     }
    //
    //     const raw = Party.rawParties[id];
    //
    //     const party = new Party;
    //
    //     party.id = id;
    //     party.surname = raw[0] || '';
    //     party.firstName = raw[1] || '';
    //     party.orgName = raw[2] || '';
    //     party.type = raw[3];
    //     party.prefix = raw[4] || '';
    //     party.suffix = raw[5] || '';
    //     party.disambiguation = raw[6] || '';
    //     // @todo need to set party.name
    //
    //     return party;
    // }

    /**
     *
     * @returns {string}
     */
    formattedHTML() {

        return this.type === Party.TYPE_PERSON ?
            escapeHTML(`${this.firstName} ${this.surnameName}`)
            :
            escapeHTML(this.orgName);

        // if (Taxon.showVernacular) {
        //     if (vernacularMatched) {
        //         return (acceptedTaxon) ?
        //             `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>` +
        //             ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
        //             :
        //             `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>`
        //             ;
        //     } else {
        //         return (acceptedTaxon) ?
        //             `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''
        //             } = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
        //             :
        //             `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''}`
        //             ;
        //     }
        // } else {
        //     return (acceptedTaxon) ?
        //         `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>` +
        //         ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
        //         :
        //         `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>`
        //         ;
        // }
    }
}

class ResponseFactory {
    static responses = {};

    /**
     *
     * @param {FormData} formData
     * @returns {LocalResponse}
     */
    static fromPostedData(formData) {
        /**
         * the object that will be saved to IndexedDb
         *
         * this needs to be in scope for several stages of the promise chain
         * @type {{[saved]: string, [type]: string, [imageId]: string, [surveyId]: string, [occurrenceId]: string, [image]: file, [projectId]: number, saveState: string }}
         */
        const toSaveLocally = {
            saveState: SAVE_STATE_LOCAL // mark as not saved externally
        };

        for(let pair of formData.entries()) {
            toSaveLocally[pair[0]] = pair[1];
        }

        if (!toSaveLocally.type) {
            throw new Error('Missing type in form data.');
        }

        if (ResponseFactory.responses.hasOwnProperty(toSaveLocally.type)) {
            return new ResponseFactory.responses[toSaveLocally.type](toSaveLocally, {});
        } else {
            throw new Error(`Unrecognised post type '${toSaveLocally.type}'`);
        }
    }

    /**
     *
     * @param {{}} returnedToClient
     */
    static fromPostResponse(returnedToClient) {
        if (!returnedToClient) {
            throw new Error('Invalid empty post response.');
        }

        if (!returnedToClient.type) {
            throw new Error('Missing type in returned response.');
        }

        if (ResponseFactory.responses.hasOwnProperty(returnedToClient.type)) {
            console.log(`in fromPostResponse returning a ${returnedToClient.type}`);
            return new ResponseFactory.responses[returnedToClient.type]({}, returnedToClient);
        } else {
            throw new Error(`Unrecognised post type '${returnedToClient.type}'`);
        }
    }
}

function packageClientResponse (returnedToClient) {
    const headers = new Headers;
    headers.set('Content-Type', 'application/json');

    return new Response(
        JSON.stringify(returnedToClient),
        {
            status: returnedToClient.error ? 500 : 200,
            headers
        });
}

class LocalResponse {
    /**
     * @type {Object}
     */
    toSaveLocally;

    /**
     * @type {Object}
     */
    returnedToClient;

    /**
     * @type {Response}
     */
    prebuiltResponse;

    failureErrorMessage = 'Failed to save a local copy on your device.';
    failureErrorHelp = 'Your internet connection may have failed (or there could be a problem with the server). ' +
        'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' +
        'Please try to re-establish a network connection and try again.';

    /**
     *
     * @param {{}} toSaveLocally
     * @param {{}} returnedToClient
     */
    constructor(toSaveLocally, returnedToClient) {
        this.toSaveLocally = toSaveLocally;
        this.returnedToClient = returnedToClient;
    }

    /**
     *
     * @param {Response} prebuiltResponse
     * @returns this
     */
    setPrebuiltResponse(prebuiltResponse) {
        this.prebuiltResponse = prebuiltResponse;
        return this;
    }

    /**
     * @param {boolean} remoteSuccess set if the object has been saved remotely
     * @returns {Promise<Response>}
     */
    storeLocally(remoteSuccess = true) {
        return localforage.setItem(this.localKey(), this.toSaveLocally)
            .then(() => {
                console.log(`Stored object ${this.localKey()} locally`);
                return this.prebuiltResponse ? this.prebuiltResponse : packageClientResponse(this.returnedToClient);
            },
            (reason) => {
                console.log(`Failed to store object ${this.localKey()} locally`);
                console.log({reason});
                this.returnedToClient.error = this.failureErrorMessage;
                this.returnedToClient.errorHelp = this.failureErrorHelp;

                return packageClientResponse(this.returnedToClient);
            }
        );
    }

    /**
     * @return {string}
     */
    localKey () {
        throw new Error(`LocalKey must be implemented in a subclass for ${this.toSaveLocally.type}`);
    }

    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     * @abstract
     */
    populateClientResponse() {
    }
}

class ImageResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store image.';
    failureErrorHelp = 'Your internet connection may have failed (or there could be a problem with the server). ' +
        'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' +
        'Please try to re-establish a network connection and try again.';

    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    populateClientResponse() {
        // kludge to deal with corrupted survey ids
        if (this.toSaveLocally.surveyId === true
            || this.toSaveLocally.surveyId === false
            || this.toSaveLocally.surveyId === 'true'
            || this.toSaveLocally.surveyId === 'false'
        ) {
            this.toSaveLocally.surveyId = '';
        }

        this.returnedToClient.id = this.toSaveLocally.imageId ? this.toSaveLocally.imageId : this.toSaveLocally.id;
        this.returnedToClient.imageId = this.toSaveLocally.imageId ? this.toSaveLocally.imageId : this.toSaveLocally.id;
        this.returnedToClient.type = 'image';
        this.returnedToClient.surveyId = this.toSaveLocally.surveyId;
        this.returnedToClient.created = parseInt(this.toSaveLocally.created, 10); // stamps from server always take precedence
        this.returnedToClient.modified = parseInt(this.toSaveLocally.modified, 10);
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted;
        this.returnedToClient.projectId = parseInt(this.toSaveLocally.projectId, 10);
        this.returnedToClient.context = this.toSaveLocally.context || IMAGE_CONTEXT_OCCURRENCE;

        if (this.toSaveLocally.context !== IMAGE_CONTEXT_SURVEY) {
            this.returnedToClient.occurrenceId = this.toSaveLocally.occurrenceId;
        }

        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.surveyId = this.returnedToClient.surveyId;
        this.toSaveLocally.type = 'image';
        this.toSaveLocally.imageId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.imageId; // hedging
        this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.imageId; // hedging
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = (this.returnedToClient.deleted === true || this.returnedToClient.deleted === 'true');
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.context = this.returnedToClient.context || IMAGE_CONTEXT_OCCURRENCE;

        if (this.returnedToClient.context !== IMAGE_CONTEXT_SURVEY) {
            this.toSaveLocally.occurrenceId = this.returnedToClient.occurrenceId;
        }

        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `image.${this.toSaveLocally.imageId}`;
    }

    static register() {
        ResponseFactory.responses.image = ImageResponse;
    }
}

class SurveyResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store survey.';
    failureErrorHelp = 'Your internet connection may have failed (or there could be a problem with the server). ' +
        'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' +
        'Please try to re-establish a network connection and try again.';

    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    populateClientResponse() {
        this.returnedToClient.surveyId = this.toSaveLocally.id || this.toSaveLocally.surveyId; // hedging
        this.returnedToClient.id = this.toSaveLocally.id ? this.toSaveLocally.id : this.toSaveLocally.surveyId; // hedging
        this.returnedToClient.baseSurveyId = this.toSaveLocally.baseSurveyId || this.returnedToClient.id;
        this.returnedToClient.type = 'survey';
        this.returnedToClient.attributes = this.toSaveLocally.attributes;
        this.returnedToClient.created = this.toSaveLocally.created; // stamps from server always take precedence
        this.returnedToClient.modified = this.toSaveLocally.modified;
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted;
        this.returnedToClient.projectId = this.toSaveLocally.projectId;
        this.returnedToClient.userId = this.toSaveLocally.userId || '';
        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.surveyId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId;
        this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId;
        this.toSaveLocally.baseSurveyId = this.returnedToClient.baseSurveyId || this.toSaveLocally.id;
        this.toSaveLocally.type = 'survey';
        this.toSaveLocally.attributes = this.returnedToClient.attributes;
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = this.returnedToClient.deleted;
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.userId = this.returnedToClient.userId || '';
        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `survey.${this.toSaveLocally.surveyId}`;
    }

    static register() {
        ResponseFactory.responses.survey = SurveyResponse;
    }
}

class OccurrenceResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store occurrence.';
    failureErrorHelp = 'Your internet connection may have failed (or there could be a problem with the server). ' +
        'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' +
        'Please try to re-establish a network connection and try again.';

    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    populateClientResponse() {
        this.returnedToClient.id = this.toSaveLocally.occurrenceId ? this.toSaveLocally.occurrenceId : this.toSaveLocally.id;
        this.returnedToClient.occurrenceId = this.toSaveLocally.occurrenceId ? this.toSaveLocally.occurrenceId : this.toSaveLocally.id;
        this.returnedToClient.type = 'occurrence';
        this.returnedToClient.surveyId = this.toSaveLocally.surveyId;
        this.returnedToClient.attributes = this.toSaveLocally.attributes;
        this.returnedToClient.created = parseInt(this.toSaveLocally.created, 10); // stamps from server always take precedence
        this.returnedToClient.modified = parseInt(this.toSaveLocally.modified, 10);
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted;
        this.returnedToClient.projectId = parseInt(this.toSaveLocally.projectId, 10);
        this.returnedToClient.userId = this.toSaveLocally.userId || '';
        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.occurrenceId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.occurrenceId; // hedging
        this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.occurrenceId; // hedging
        this.toSaveLocally.type = 'occurrence';
        this.toSaveLocally.surveyId = this.returnedToClient.surveyId;
        this.toSaveLocally.attributes = this.returnedToClient.attributes;
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = (this.returnedToClient.deleted === true || this.returnedToClient.deleted === 'true');
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.userId = this.returnedToClient.userId || '';
        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `occurrence.${this.toSaveLocally.occurrenceId}`;
    }

    static register() {
        ResponseFactory.responses.occurrence = OccurrenceResponse;
    }
}

class TrackResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store tracking data.';
    failureErrorHelp = 'Your internet connection may have failed (or there could be a problem with the server). ' +
        'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' +
        'Please try to re-establish a network connection and try again.';

    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    populateClientResponse() {
        this.returnedToClient.surveyId = this.toSaveLocally.surveyId;
        this.returnedToClient.deviceId = this.toSaveLocally.deviceId;
        this.returnedToClient.type = 'track';
        this.returnedToClient.attributes = this.toSaveLocally.attributes;
        this.returnedToClient.created = this.toSaveLocally.created; // stamps from server always take precedence
        this.returnedToClient.modified = this.toSaveLocally.modified;
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted || '';
        this.returnedToClient.projectId = this.toSaveLocally.projectId;
        this.returnedToClient.userId = this.toSaveLocally.userId || '';
        this.returnedToClient.pointIndex = this.toSaveLocally.pointIndex;
        this.returnedToClient.points = this.toSaveLocally.points;
        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.surveyId = this.returnedToClient.surveyId;
        this.toSaveLocally.deviceId = this.returnedToClient.deviceId;
        this.toSaveLocally.type = 'track';
        this.toSaveLocally.attributes = this.returnedToClient.attributes;
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = this.returnedToClient.deleted;
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.userId = this.returnedToClient.userId || '';
        this.toSaveLocally.pointIndex = parseInt(this.returnedToClient.pointIndex, 10);
        this.toSaveLocally.points = this.returnedToClient.points; // may eventually want to truncate this to save local space
        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        if (!this.toSaveLocally.deviceId || this.toSaveLocally.deviceId === 'undefined') {
            throw new Error(`Cannot generate a localKey for track, as the device id is undefined.`);
        }

        return `track.${this.toSaveLocally.surveyId}.${this.toSaveLocally.deviceId}`;
    }

    static register() {
        ResponseFactory.responses.track = TrackResponse;
    }
}

// service worker for BSBI app


class BSBIServiceWorker {

    /**
     * @var {Array.<string>}
     */
    URL_CACHE_SET;

    /**
     * @var {string}
     */
    CACHE_VERSION;

    /**
     * @var {string}
     */
    DATA_CACHE_VERSION;

    /**
     * @var {RegExp}
     */
    SERVICE_WORKER_DATA_URL_MATCHES;

    /**
     *
     * @param {{
     *  forageName : string,
     *  postPassThroughWhitelist : RegExp,
     *  postImageUrlMatch : RegExp,
     *  getImageUrlMatch : RegExp,
     *  interceptUrlMatches : RegExp,
     *  [dataUrlMatches] : RegExp,
     *  ignoreUrlMatches : RegExp,
     *  staticUrlMatches : RegExp|null,
     *  passThroughNoCache : RegExp,
     *  indexUrl : string,
     *  urlCacheSet : Array.<string>,
     *  version : string,
     *  [dataVersion] : string
     * }} configuration
     */
    initialise(configuration) {
        if (!Promise.prototype.finally) {
            Promise.prototype.finally = function (callback) { // must use 'function' here rather than arrow, due to this binding requirement
                return this.then(callback)
                    .catch(callback);
            };
        }

        ImageResponse.register();
        SurveyResponse.register();
        OccurrenceResponse.register();
        TrackResponse.register();

        this.CACHE_VERSION = `version-1.0.3.1752052739-${configuration.version}`;
        this.DATA_CACHE_VERSION = `bsbi-data-${configuration.dataVersion || configuration.version}`;

        Model.bsbiAppVersion = configuration.version;
        Logger.bsbiAppVersion = configuration.version;

        const POST_PASS_THROUGH_WHITELIST = configuration.postPassThroughWhitelist;
        const POST_IMAGE_URL_MATCH = configuration.postImageUrlMatch;
        const GET_IMAGE_URL_MATCH = configuration.getImageUrlMatch;
        const SERVICE_WORKER_INTERCEPT_URL_MATCHES = configuration.interceptUrlMatches;
        const SERVICE_WORKER_IGNORE_URL_MATCHES = configuration.ignoreUrlMatches;
        const SERVICE_WORKER_PASS_THROUGH_NO_CACHE = configuration.passThroughNoCache;

        this.SERVICE_WORKER_DATA_URL_MATCHES = configuration.dataUrlMatches || /^NO_MATCHING$/;

        /**
         * Urls that should be cached, with no need for automatic refresh
         *
         * @type {RegExp|null}
         */
        const SERVICE_WORKER_STATIC_URL_MATCHES= configuration.staticUrlMatches;
        const INDEX_URL = configuration.indexUrl;

        this.URL_CACHE_SET = configuration.urlCacheSet;

        localforage.config({
            name: configuration.forageName
        });

        self.addEventListener("message", (event) => {
                console.log({"Message received": event.data});

                switch (event.data.action) {
                    case 'recache':
                        event.waitUntil(this.handleRecacheMessage(event.data.url));
                        break;
                }
            }
        );

        // On install, cache some resources.
        self.addEventListener('install', (evt) => {
            console.log('BSBI app service worker is being installed.');

            // noinspection JSIgnoredPromiseFromCall
            self.skipWaiting();

            // Ask the service worker to keep installing until the returning promise
            // resolves.
            evt.waitUntil(
                this.precache()
                    .catch(() => true) // allow installation even if not everything got cached, can avoid problems if a once-cached file has now been deleted

                    // see https://serviceworke.rs/immediate-claim_service-worker_doc.html
                    // .finally(() => {
                    //     console.log("Service worker skip waiting after precache.");
                    //
                    //     return self.skipWaiting();
                    // })
            );
        });

        self.addEventListener('activate', (event) => {
            console.log({'service worker activate event' : event});

            event.waitUntil(
                self.clients.matchAll({
                    includeUncontrolled: true
                }).then((clientList) => {
                    const urls = clientList.map((client) => {
                        return client.url;
                    });
                    console.log('[ServiceWorker] Matching clients:', urls.join(', '));
                }).then(() => caches.keys())
                    .then((cacheNames) => {
                        return Promise.all(
                            cacheNames.map((cacheName) => {
                                // test for 'version' prefix to avoid deleting mapbox tiles
                                if (cacheName.startsWith('version') && cacheName !== this.CACHE_VERSION) {
                                    console.log('[ServiceWorker] Deleting old code cache:', cacheName);
                                    return caches.delete(cacheName);
                                }

                                if (cacheName.startsWith('bsbi-data') && cacheName !== this.DATA_CACHE_VERSION) {
                                    console.log('[ServiceWorker] Deleting old data cache:', cacheName);
                                    return caches.delete(cacheName);
                                }
                            })
                        );
                    }).then(() => {
                        console.log('[ServiceWorker] Claiming clients for version', this.CACHE_VERSION);
                        return self.clients.claim();
                    })
                );
            });


        // // see https://davidwalsh.name/background-sync
        // // https://developers.google.com/web/updates/2015/12/background-sync
        // self.addEventListener('sync', function(event) {
        //
        // });

        // On fetch, use cache but update the entry with the latest contents
        // from the server.
        self.addEventListener('fetch', /** @param {FetchEvent} evt */ (evt) => {
            //console.log(`The service worker is serving: '${evt.request.url}'`);

            evt.preventDefault();

            if (evt.request.method === 'POST') {
                //console.log(`Got a post request`);

                if (POST_PASS_THROUGH_WHITELIST.test(evt.request.url)) {
                    //console.log(`Passing through whitelisted post request for: ${evt.request.url}`);
                    evt.respondWith(fetch(evt.request));
                } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
                    //console.log(`Passing through nocache list post request for: ${evt.request.url}`);
                    evt.respondWith(fetch(evt.request));
                } else {
                    const isSync = /issync/.test(evt.request.url);

                    if (POST_IMAGE_URL_MATCH.test(evt.request.url) && !isSync) {
                        //console.log(`Got an image post request: '${evt.request.url}'`);
                        this.handle_image_post(evt);
                    } else {
                        //console.log(`Got post request: '${evt.request.url}'`);
                        this.handle_post(evt, isSync);
                    }
                }
            } else {
                // test whether this is a direct link in to a page that should be substituted by
                // the single page app

                // console.log(`about to test url '${evt.request.url}'`);

                if (SERVICE_WORKER_INTERCEPT_URL_MATCHES.test(evt.request.url) &&
                    !SERVICE_WORKER_IGNORE_URL_MATCHES.test(evt.request.url)
                ) {
                    // serving single page app instead
                    console.log(`redirecting to the root of the SPA for '${evt.request.url}'`);
                    let spaRequest = new Request(INDEX_URL);
                    evt.respondWith(this.fromCache(spaRequest));

                    // don't need to check for fresh, stale is fine here
                    //evt.waitUntil(this.update(spaRequest));
                } else if (evt.request.url.match(GET_IMAGE_URL_MATCH)) {
                    console.log(`request is for an image '${evt.request.url}'`);
                    this.handleImageFetch(evt);
                } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
                    // typically for external content that can't/shouldn't be cached, e.g. MapBox tiles (which mapbox stores directly in the cache itself)
                    evt.respondWith(fetch(evt.request));
                } else if (SERVICE_WORKER_STATIC_URL_MATCHES?.test(evt.request.url)) {
                    // typically for content that won't change
                    evt.respondWith(this.fromCache(evt.request));
                } else {
                    let isStale = null;

                    //console.log(`request is for non-image '${evt.request.url}'`);

                    // You can use `respondWith()` to answer immediately, without waiting for the
                    // network response to reach the service worker...
                    evt.respondWith(this.fromCache(evt.request)
                        .then((response) => {
                            const dateAsString = response.headers.get('Date');

                            if (dateAsString) {
                                console.log(`Request for ${evt.request.url} date: ${dateAsString}`);

                                const dateStamp = Date.parse(dateAsString); // ms
                                isStale = (dateStamp + (3600000 * 48)) < Date.now();
                            }

                            return response;
                        })
                    );

                    if (isStale) {
                        // ...and `waitUntil()` to prevent the worker from being killed until the
                        // cache is updated.
                        evt.waitUntil(this.update(evt.request));
                    }
                }
            }
        });
    }


    /**
     * used to handle small posts (not images that require rapid return)
     * also used for images, as part of general re-sync
     * attempts remote save first then caches locally
     *
     * @param {FetchEvent} evt
     * @param {boolean} isSync set if this is called as part of a re-sync rather than as a first-time save
     */
    handle_post(evt, isSync = false) {
        let clonedRequest;
        try {
            clonedRequest = evt.request.clone();
        } catch (e) {
            console.log('Failed to clone request.');
            console.log({'Cloning error': e});
            return e;
        }

        evt.respondWith(fetch(evt.request)
            .then((response) => {
                // would get here if the server responds at all, but need to check that the response is ok (not a server error)
                if (response.ok) {
                    return Promise.resolve(response)
                        .then((response) => {
                            // save the response locally
                            // before returning it to the client

                            console.log('About to clone the json response.');

                            return response.clone().json();
                        })
                        .then((jsonResponseData) => {
                            console.log('Following successful remote post, about to save locally.');

                            return ResponseFactory
                                .fromPostResponse(jsonResponseData)
                                .setPrebuiltResponse(response)
                                .populateLocalSave()
                                .storeLocally(true);
                        })
                        .catch((error) => {
                            // for some reason local storage failed, after a successful server save
                            console.log({'local storage failed' : error});

                            return Promise.resolve(response); // pass through the server response
                        });
                } else {
                    console.log(`Failed to save, moving on to attempt IndexedDb`);
                    return Promise.reject(`Failed to save to server. (${response.status})`);
                }
            })
            .catch( (remoteReason) => {
                    console.log({'post fetch failed (probably no network)': remoteReason});

                    // would get here if the network is down
                    // or if got invalid response from the server

                    if (isSync) {
                        // don't need to store locally (as will already be present) and response is not needed
                        // so just reject

                        return Promise.reject({'remote failed' : true, isSync, remoteReason});
                    } else {

                        // /**
                        //  * simulated result of post, returned as JSON body
                        //  * @type {{surveyId: string, occurrenceId: string, imageId: string, saveState: string, [error]: string, [errorHelp]: string}}
                        //  */
                        // let returnedToClient = {};

                        return clonedRequest.formData()
                            .then((formData) => {
                                    console.log('got to form data handler, after failed remote store');
                                    //console.log({formData});

                                    return ResponseFactory
                                        .fromPostedData(formData)
                                        .populateClientResponse()
                                        .storeLocally(false)
                                        .catch((reason) => {
                                            let returnedToClient = {
                                                error: 'Store posted data locally after failed remote save. (internal error: local store)',
                                                errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                                                    'It wasn\'t possible to save a temporary copy on your device. (an unexpected saving error occurred) ' +
                                                    'Please try to re-establish a network connection and try again.' +
                                                    `Error was: ${JSON.stringify(reason)}`
                                            };

                                            return Promise.reject(packageClientResponse(returnedToClient));
                                        });
                                }, (reason) => {
                                    console.log({'failed to read form data locally': reason});

                                    /**
                                     * simulated result of post, returned as JSON body
                                     * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
                                     */
                                    let returnedToClient = {
                                        error: 'Failed to process posted response data. (internal error: decoding)',
                                        errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                                            'It wasn\'t possible to save a temporary copy on your device. (an unexpected decoding error occurred) ' +
                                            'Please try to re-establish a network connection and try again.' +
                                            `Error was: ${JSON.stringify(remoteReason)}`
                                    };

                                    return Promise.reject(packageClientResponse(returnedToClient));
                                }
                            );
                    }
                }
            ));
    }

    /**
     * used to handle image posts, which need to respond quickly even if the network is slow
     * attempts local cache first then saves out to network
     *
     * @param {FetchEvent} event
     */
    handle_image_post(event) {
        let clonedRequest;

        console.log('posting image for quick response');

        try {
            clonedRequest = event.request.clone();
        } catch (e) {
            console.log('Failed to clone request.');
            console.log({'Cloning error': e});
        }

        // send back a quick response to the client from local storage (before the server request completes)
        event.respondWith(
            clonedRequest.formData()
                .then((formData) => {
                        //console.log({'got to image form data handler' : formData});

                        return ResponseFactory
                            .fromPostedData(formData)
                            .populateClientResponse()
                            .storeLocally()
                            .then((response) => {

                                // separately send data to the server, but response goes to client before this completes
                                // am unsure if the return from the wait until part ever reaches the client
                                event.waitUntil(fetch(event.request)
                                    .then((response) => {
                                            console.log('posting image to server in waitUntil part of fetch cycle');

                                            // would get here if the server responds at all, but need to check that the response is ok (not a server error)
                                            if (response.ok) {
                                                console.log('posted image to server in waitUntil part of fetch cycle: got OK response');

                                                return Promise.resolve(response)
                                                    .then((response) => {
                                                        // save the response locally
                                                        // before returning it to the client

                                                        return response.clone().json();
                                                    })
                                                    .then((jsonResponseData) => {
                                                        return ResponseFactory
                                                            .fromPostResponse(jsonResponseData)
                                                            .setPrebuiltResponse(response)
                                                            .populateLocalSave()
                                                            .storeLocally();
                                                    })
                                                    .catch((error) => {
                                                        // for some reason local storage failed, after a successful server save
                                                        console.error({'local storage store failed' : error});

                                                        return Promise.resolve(response); // pass through the server response
                                                    });
                                            } else {
                                                console.log('posted image to server in waitUntil part of fetch cycle: got Error response');

                                                /**
                                                 * simulated result of post, returned as JSON body
                                                 * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
                                                 */
                                                let returnedToClient = {
                                                    error: 'Failed to save posted response data. (internal error)',
                                                    errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                                                        'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' +
                                                        'Please try to re-establish a network connection and try again.'
                                                };

                                                return packageClientResponse(returnedToClient);
                                            }
                                        }, (reason) => {
                                            console.log({'Rejected image post fetch from server - implies network is down' : reason});
                                        }
                                    ));

                                return response;
                            });
                    }, (reason) => {
                        console.log({'failed to read form data locally' : reason});

                        /**
                         * simulated result of post, returned as JSON body
                         * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
                         */
                        let returnedToClient = {
                            error: 'Failed to process posted response data. (internal error)',
                            errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                                'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' +
                                'Please try to re-establish a network connection and try again.'
                        };

                        return packageClientResponse(returnedToClient);
                    }
                )
        );
    }

    /**
     * Open a cache and use `addAll()` with an array of assets to add all of them
     * to the cache. Return a promise resolving when all the assets are added.
     *
     * @returns {Promise<void>}
     */
    precache() {
        return caches.open(this.CACHE_VERSION).then((cache) => {
            return cache.addAll(this.URL_CACHE_SET);
        }).catch((error) => {
            console.log({'Precache failed result' : error});
            return Promise.resolve();
        });
    }

    /**
     * Open the cache where the assets were stored and search for the requested
     * resource. Notice that in case of no matching, the promise still resolves,
     * but with `undefined` as value.
     *
     * @param {Request} request
     * @param {boolean} tryRemoteFallback
     * @param {number} remoteTimeoutMilliseconds (default 0 for no forced timeout)
     * @returns {Promise<Response | Promise<Response>>}
     */
    fromCache(request, tryRemoteFallback= true, remoteTimeoutMilliseconds = 0) {
        //console.log('attempting fromCache response');

        const cacheName = this.SERVICE_WORKER_DATA_URL_MATCHES.test(request.url) ?
            this.DATA_CACHE_VERSION : this.CACHE_VERSION;

        return caches.open(cacheName).then((cache) => {
            //console.log('cache is open');

            return cache.match(request, {ignoreVary : true, ignoreSearch : request.url.match(/\.css|\.mjs/)}).then((cachedResponse) => {
                // console.log(cachedResponse ?
                //     `cache matched ${request.url}`
                //     :
                //     `no cache match for ${request.url}`);

                return cachedResponse || (tryRemoteFallback && this.update(request, remoteTimeoutMilliseconds)); // return cache match or if not cached then go out to network (and then locally cache the response)

                // // see https://developer.chrome.com/docs/workbox/caching-strategies-overview/
                // return cachedResponse || fetch(new Request(request, {mode: 'cors', credentials: 'omit'})).then((fetchedResponse) => {
                //     // Add the network response to the cache for future visits.
                //     // Note: we need to make a copy of the response to save it in
                //     // the cache and use the original as the request response.
                //     cache.put(request, fetchedResponse.clone());
                //
                //     // Return the network response
                //     return fetchedResponse;
                // });
            });
        });
    }

    /**
     * Special case response for images
     * attempt to serve from local cache first,
     * if that fails then go out to network
     * finally see if there is an image in indexeddb
     *
     * @param {FetchEvent} evt
     */
    handleImageFetch(evt) {
        // tryRemoteFallback is set to false, to ensure a rapid response to client when bad network, at the cost of no access to remotely compressed image

        evt.respondWith(this.fromCache(evt.request, true, 5000).then((response) => {
                //console.log('In handleImageFetch promise');

                // response may be a 404
                if (response && response.ok) {
                    console.info('Responding with image from cache (or remotely if no cache).');
                    return response;
                } else {
                    // not cached and no network access
                    // try to respond from local storage

                    const url = evt.request.url;
                    console.info(`Attempting image match for '${url}'`);

                    const matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

                    if (matches) {
                        const imageId = matches[1];
                        console.info(`Returning image match for '${url}' from local database`);
                        return this.imageFromLocalDatabase(imageId);
                    } else {
                        console.error(`Failed to match image id in url '${url}'`);
                    }
                }
            })
                .catch((error) => {
                    const url = evt.request.url;
                    console.log({'caught' : error});
                    console.log(`In catch following failed network fetch, attempting image match for '${url}'`);

                    const matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

                    if (matches) {
                        const imageId = matches[1];
                        console.log(`(via catch) Returning image match for '${url}' from local database`);
                        return this.imageFromLocalDatabase(imageId);
                    } else {
                        console.error(`(via catch) Failed to match image id in url '${url}'`);
                        return Promise.reject(`(via catch) Failed to match image id in url '${url}'`);
                    }
                })
        );
    }

    /**
     *
     * @param {string} imageId
     * @returns {Promise}
     */
    imageFromLocalDatabase(imageId) {
        const image = new OccurrenceImage();

        console.info('attempting retrieval of image data from local database');

        return OccurrenceImage.retrieveFromLocal(imageId, image).then((image) => {
            console.log(`Retrieved image '${imageId}' from indexeddb.`);
            if (image.file) {
                const headers = new Headers();
                headers.append('Content-Type', image.file.type);

                return new Response(image.file, {
                    "status": 200,
                    "statusText": "OK image response from IndexedDb"
                });
            } else {
                console.error(`No local file object associated with retrieved image '${imageId}' from indexeddb.`);
                return Promise.reject(`No local file object associated with retrieved image '${imageId}' from indexeddb.`);
            }
        });
    }

    /**
     *
     * @param url
     */
    handleRecacheMessage(url) {
        let cacheName;

        if (this.SERVICE_WORKER_DATA_URL_MATCHES.test(url)) {
            cacheName = this.DATA_CACHE_VERSION;
        } else {
            cacheName = this.CACHE_VERSION;
        }

        return caches.open(cacheName).then((cache) => {
            return cache.add(url);
        }).catch((error) => {
            console.error({'Precache failed result' : error});
            return Promise.resolve();
        });
    }

    /**
     * Update consists in opening the cache, performing a network request and
     * storing the new response data.
     *
     * @param {Request} request
     * @param {number} timeout request timeout in milliseconds (or 0 for no timeout)
     * @returns {Promise<Response>}
     */
    update(request, timeout = 0) {
        let cacheName;

        if (this.SERVICE_WORKER_DATA_URL_MATCHES.test(request.url)) {
            cacheName = this.DATA_CACHE_VERSION;
        } else {
            cacheName = this.CACHE_VERSION;
        }

        request = new Request(request, {mode: 'cors', credentials: 'omit'});

        console.info(`Attempting fetch and cache update of ${request.url}`);

        return caches.open(cacheName).then((cache) => {
            let signalController;
            let timeoutId;
            const fetchOptions = {
                cache: "no-cache",
                mode: 'cors',
                credentials: 'omit',
            };

            if (timeout) {
                signalController = new AbortController();
                timeoutId = setTimeout(() => {
                    signalController.abort();
                    console.log(`User-define update fetch timeout expired after ${timeout} ms`);
                }, timeout);
                fetchOptions.signal = signalController.signal;
            }

            return fetch(request, fetchOptions).then((response) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                if (response.ok) {
                    console.info(`(re-)caching ${request.url}`);
                    return cache.put(request, response).then(() => {
                        return cache.match(request, {ignoreVary : true, ignoreSearch : request.url.match(/\.css|\.mjs/)});
                    });
                } else {
                    console.error(`Request during cache update failed for ${request.url}`);
                    console.error({'failed cache response': response});
                    return Promise.reject('Request during cache update failed, not caching.');
                }
            }).catch((error) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                console.log(`Cache attempt failed for ${request.url}: error was ${error}`);
                return Promise.reject(`Cache attempt failed for ${request.url}: error was ${error}`);
            });
        });
    }
}

/**
 *
 * @param {string} separator
 * @param {string} finalSeparator
 * @param {Array.<string>} list
 * @return string
 */
function formattedImplode(separator, finalSeparator, list) {
    if (list.length > 2) {
        const last = list.pop();
        return `${list.join(separator + ' ')} ${finalSeparator} ${last}`;
    } else {
        return list.join(` ${finalSeparator} `);
    }
}

/**
 * Yield execution
 * (implemented as scheduler.yield if available otherwise setTimeout(0) )
 * @type {{(): Promise<void>}}
 */
const schedulerYield = ('scheduler' in globalThis && 'yield' in scheduler) ?
    scheduler.yield
    :
    () => new Promise(resolve => {
        setTimeout(resolve, 0);
    });

// export schedulerYield () {
//     // Use scheduler.yield if it exists:
//     if ('scheduler' in globalThis && 'yield' in scheduler) {
//         return scheduler.yield();
//     }
//
//     // Fall back to setTimeout:
//     return new Promise(resolve => {
//         setTimeout(resolve, 0);
//     });
// }

export { APP_EVENT_ADD_SURVEY_USER_REQUEST, APP_EVENT_ALL_SYNCED_TO_SERVER, APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST, APP_EVENT_CONTROLLER_CHANGED, APP_EVENT_CURRENT_OCCURRENCE_CHANGED, APP_EVENT_CURRENT_SURVEY_CHANGED, APP_EVENT_NEW_SURVEY, APP_EVENT_OCCURRENCE_ADDED, APP_EVENT_OCCURRENCE_LOADED, APP_EVENT_OPTIONS_RESTORED, APP_EVENT_RESET_SURVEYS, APP_EVENT_SURVEYS_CHANGED, APP_EVENT_SURVEY_LOADED, APP_EVENT_SYNC_ALL_FAILED, APP_EVENT_USER_LOGIN, APP_EVENT_USER_LOGOUT, APP_EVENT_WATCH_GPS_USER_REQUEST, App, AppController, BSBIServiceWorker, DeviceType, EventHarness, IMAGE_CONTEXT_OCCURRENCE, IMAGE_CONTEXT_SURVEY, InternalAppError, Logger, MODEL_EVENT_DESTROYED, MODEL_EVENT_SAVED_REMOTELY, MODEL_TYPE_OCCURRENCE, Model, NotFoundError, OCCURRENCE_EVENT_MODIFIED, Occurrence, OccurrenceImage, PARTY_FORENAMES_INDEX, PARTY_ID_INDEX, PARTY_INITIALS_INDEX, PARTY_NAME_INDEX, PARTY_ORGNAME_INDEX, PARTY_ROLES_INDEX, PARTY_SURNAME_INDEX, PARTY_USERID_INDEX, Party, RAW_TAXON_ACCEPTED_ENTITY_ID, RAW_TAXON_ATLAS_DOCS, RAW_TAXON_AUTHORITY, RAW_TAXON_BRC_CODE, RAW_TAXON_CANONICAL, RAW_TAXON_CI_NATIONAL_STATUS, RAW_TAXON_GB_NATIONAL_STATUS, RAW_TAXON_GB_RARE_SCARCE, RAW_TAXON_HYBRID_CANONCIAL, RAW_TAXON_IE_NATIONAL_STATUS, RAW_TAXON_IE_RARE_SCARCE, RAW_TAXON_NAMESTRING, RAW_TAXON_NOT_FOR_NEW_RECORDING, RAW_TAXON_NYPH_RANKING, RAW_TAXON_PARENT_IDS, RAW_TAXON_QUALIFIER, RAW_TAXON_SORT_ORDER, RAW_TAXON_USED, RAW_TAXON_VERNACULAR, RAW_TAXON_VERNACULAR_NOT_FOR_ENTRY, RAW_TAXON_VERNACULAR_ROOT, SORT_ORDER_CULTIVAR, SORT_ORDER_GENUS, SORT_ORDER_SPECIES, SORT_ORDER_SUBSPECIES, SURVEY_EVENT_DELETED, SURVEY_EVENT_LIST_LENGTH_CHANGED, SURVEY_EVENT_MODIFIED, SURVEY_EVENT_OCCURRENCES_CHANGED, SURVEY_EVENT_TETRAD_SUBUNIT_CHANGED, StaticContentController, Survey, SurveyPickerController, Taxon, TaxonError, Track, UUID_REGEX, escapeHTML, formattedImplode, schedulerYield, uuid };
//# sourceMappingURL=index.js.map
