/**
 * @typedef {number} EventHarness~Handle
 */
import {Logger} from "../utils/Logger";

export const EVENT_HARNESS_STOP_PROPAGATION = 'STOP_PROPAGATION';

export class EventHarness {
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
     * @type {Array<{element: Node, type: string, handler: EventListenerOrEventListenerObject, options: AddEventListenerOptions}|null>}
     * @private
     */
    _domEventListeners = [];

    // static STOP_PROPAGATION = EVENT_HARNESS_STOP_PROPAGATION;

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {Node} element
     * @param {string} type
     * @param {EventListenerOrEventListenerObject} handler
     * @param {AddEventListenerOptions=} options
     * @returns {number}
     */
    addDomEventListener(element, type, handler, options) {
        element.addEventListener(type, handler, options);
        return this._domEventListeners.push({element, type, handler, options}) - 1;
    }

    /**
     *
     * @param {number} handle
     */
    removeDomEventListener(handle) {
        if (this._domEventListeners[handle]) {
            const listener = this._domEventListeners[handle];
            listener.element.removeEventListener(listener.type, listener.handler, listener.options);
            listener.handler = null;
            listener.element = null;
            this._domEventListeners[handle] = null;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {Array<number>} handles
     */
    removeDomEventListeners(handles) {
        handles.forEach(this.removeDomEventListener.bind(this));
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} eventName
     * @param {{}} handlerObject
     * @param {string} handlerMethodName
     * @param {*=} constructionParam
     * @returns {number}
     */
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
        }

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

    // noinspection JSUnusedGlobalSymbols
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

    /**
     *
     * @param {{}} staticTarget
     * @param {string} eventName
     * @param {number} handle
     */
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
                    if (this._eventListeners[eventName][f](this, eventName, arguments[1]) === EVENT_HARNESS_STOP_PROPAGATION) {
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

    // noinspection JSUnusedGlobalSymbols
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
                    if (eventListeners[eventName][f](this, eventName, arguments[2]) === EVENT_HARNESS_STOP_PROPAGATION) {
                        break;
                    }
                } catch (exception) {
                    console.error({'Exception thrown in static event handler': {eventName, exception}});
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
