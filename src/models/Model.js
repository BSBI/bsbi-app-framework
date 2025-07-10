import {EventHarness} from "../framework/EventHarness";
import localforage from 'localforage';
import {Logger} from "../utils/Logger";

/**
 * @typedef {import('bsbi-app-framework-view').FormField} FormField
 */

export function uuid(a){return a?(a^Math.random()*16>>a/4).toString(16):([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,uuid)}

/**
 * regex used to validate AppObject external ids
 * (UUID form is 8 digits followed by three groups of 4 digits followed by a group of 12)
 */
export const UUID_REGEX = /^[a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12}$/;

export const SAVE_STATE_LOCAL = 'SAVED_LOCALLY';
export const SAVE_STATE_SERVER = 'SAVED_TO_SERVER';

export const MODEL_EVENT_SAVED_REMOTELY = 'savedremotely';

export const MODEL_EVENT_DESTROYED = 'destroyed';

export class Model extends EventHarness {
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
     * modified stamp is generally server assigned - rather than using a potentially discrepant client clock,
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
