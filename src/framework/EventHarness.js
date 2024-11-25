/**
 * @typedef {number} EventHarness~Handle
 */
import {Logger} from "../utils/Logger";

export class EventHarness {
    /**
     *
     * @type {Object<string,Array<function>>}
     */
    _eventListeners = {};

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
        }

        if (this._eventListeners[eventName]) {
            return (this._eventListeners[eventName].push(handlerFunction)) - 1;
        } else {
            this._eventListeners[eventName] = [handlerFunction];
            return 0; // first element in array
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
        //this._eventListeners = this._eventListeners || [];

        const handlerFunction = (context, eventName, invocationParam = {}) =>
            handler({context, eventName, ...invocationParam, ...constructionParam});

        if (this._eventListeners[eventName]) {
            return (this._eventListeners[eventName].push(handlerFunction)) - 1;
        } else {
            this._eventListeners[eventName] = [handlerFunction];
            return 0; // first element in array
        }
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
}
