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

    static STOP_PROPAGATION = 'STOP_PROPAGATION';

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
