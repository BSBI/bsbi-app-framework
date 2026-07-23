import {EventHarness} from "../framework/EventHarness";
import localforage from 'localforage';
import {Logger} from "../utils/Logger";
import {ResponseFactory} from "../serviceworker/responses/ResponseFactory.js";

/**
 * @typedef {import('bsbi-app-framework-view').FormField} FormField
 */

/**
 *
 * @param {number} [a]
 * @returns {string}
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
     * ms stamp of last queued change
     * set when a post is queued
     * @type {number}
     */
    lastQueuedPostAbsoluteStamp = 0;

    /**
     * ms stamp of last save snapshot
     * set when form data is prepared for saving
     * @type {number}
     */
    saveSnapshotAbsoluteStamp = 0;

    /**
     * The state of the modified token at the point of the last save
     * (a fine-grained way to catch changes between starting a post and marking the result as saved)
     * (ms timestamps may be too course for this)
     *
     * @type {number}
     */
    saveSnapshotModifiedToken;

    /**
     * Random number set whenever the model is touched
     *
     * @type {number}
     */
    modifiedToken;

    saveSnapshotStamp = 0;

    /**
     * @return {string}
     */
    get localKey() {
        return `${this.TYPE}.${this.id}`;
    }

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
        this.modifiedStamp = this.createdStamp;
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

        if (!newId?.match?.(UUID_REGEX)) {
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
     * @param {number} modifiedStampWhenQueued
     * @returns {boolean}
     * @protected
     */
    _cannotSkipAsObsolete(modifiedStampWhenQueued) {
        return true;
    }

    /**
     * Add a post request to the queue
     * Requests run in sequence.
     * Returns a promise that resolves once the queued request completes
     *
     * The queue reduces the chance of requests being sent to the server out-of-order (which can lead to race conditions)
     *
     * @param {boolean} isSync default false, set if request is part of sync all rather than a regular save
     * @returns {Promise}
     */
    queuePost(isSync = false) {
        const modifiedStampWhenQueued = this.modifiedStamp;
        this.lastQueuedPostAbsoluteStamp = Date.now();

        return new Promise((resolve, reject) => {
            /**
             * @returns {Promise}
             */
            const task = () => {

                if (isSync || this._cannotSkipAsObsolete(modifiedStampWhenQueued)) {
                    this.saveSnapshotAbsoluteStamp = Date.now();
                    this.saveSnapshotModifiedToken = this.modifiedToken;
                    this.saveSnapshotStamp = Math.floor(this.saveSnapshotAbsoluteStamp  / 1000); // any new changes from this point on will be saved without skipping

                    //console.log({'posting form data': formData});
                    return this._post(this.formData(), isSync)
                        .catch((reason) => {
                            // noinspection JSIgnoredPromiseFromCall
                            Logger.logError(`Failed to post '${Logger.stringifyObject(reason)}' for ${this.constructor.className} id ${this.id} isSync: ${isSync ? 'true' : 'false'}.`);

                            return Promise.reject(reason);
                        })
                        .then((result) => resolve(result), (reason) => reject(reason));
                } else {
                    console.log(`Skipped queued save as superseded, for ${this.constructor.className} id ${this.id}`);
                    resolve(`Skipped queued save as superseded.`);
                    return Promise.resolve();
                }
            };

            Model._tasks.push(task);

            if (Model._tasks.length > 1) {
                console.log(`Added post request to the queue.`);
            } else {
                console.log(`No pending tasks, starting post request immediately.`);
                task().finally(() => {
                    Model._next();
                });
            }
        });
    }

    /**
     * Post immediately (no queue).
     * Returns a promise that resolves once the POST request completes.
     *
     * @param {boolean} isSync default false, set if request is part of sync all rather than a regular save
     * @returns {Promise}
     */
    postImmediately(isSync = false) {
        const modifiedStampWhenQueued = this.modifiedStamp;
        this.lastQueuedPostAbsoluteStamp = Date.now();

        return new Promise((resolve, reject) => {
            if (isSync || this._cannotSkipAsObsolete(modifiedStampWhenQueued)) {
                this.saveSnapshotAbsoluteStamp = Date.now();
                this.saveSnapshotModifiedToken = this.modifiedToken;
                this.saveSnapshotStamp = Math.floor(this.saveSnapshotAbsoluteStamp  / 1000); // any new changes from this point on will be saved without skipping

                //console.log({'posting form data': formData});
                this._post(this.formData(), isSync)
                    .catch((reason) => {
                        // noinspection JSIgnoredPromiseFromCall
                        Logger.logError(`Failed to post '${Logger.stringifyObject(reason)}' for ${this.constructor.className} id ${this.id} isSync: ${isSync ? 'true' : 'false'}.`);

                        return Promise.reject(reason);
                    })
                    .then((result) => resolve(result), (reason) => reject(reason));
            } else {
                console.log(`Skipped immediate save as superseded, for ${this.constructor.className} id ${this.id}`);
                resolve(`Skipped immediate save as superseded.`);
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
     * Makes a post to <this.SAVE_ENDPOINT>.
     *
     * This should be intercepted by a serviceworker that, for non-sync requests, will attempt to write to indexedDb.
     *
     * @protected
     * @param {FormData} formData
     * @param {boolean} isSync default false, set if request is part of sync all rather than a regular save
     * @returns {Promise}
     */
    _post(formData, isSync = false) {
        try {
            return fetch(`${this.SAVE_ENDPOINT}${isSync ? '?issync' : ''}`, {
                method: 'POST',
                body: formData,
                // keepalive: true, // can't use keepalive, as it limits the request's size to 64kb
            }).then(response => {
                if (response.ok) {
                    return response.json()
                        .then((jsonResponseData) => ResponseFactory.fromPostResponse(jsonResponseData)
                        .setPrebuiltResponse(response)
                        .populateLocalSave()
                        .storeLocally(true)
                        .then((responseData) => {
                            if (responseData.modified >= this.modifiedStamp
                                && this.saveSnapshotAbsoluteStamp >= this.lastQueuedPostAbsoluteStamp
                                && this.saveSnapshotModifiedToken === this.modifiedToken
                            ) {
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
                            } else {
                                console.info(`Object ${this.localKey} has been modified since post request, post stamp ${responseData.modified} < ${this.modifiedStamp}.`)
                            }

                            return responseData;
                        }, (reason) => {
                            // failed to save locally

                            this._savedLocally = false;
                            this.savedRemotely = false;
                            }
                        ), reason => {
                            console.error({'fetch error (at JSON decoding stage)': reason});

                            ResponseFactory
                                .fromPostedData(formData)
                                .populateClientResponse()
                                .storeLocally(false)
                                .then(() => {
                                    if (responseData.modified >= this.modifiedStamp
                                        && this.saveSnapshotAbsoluteStamp >= this.lastQueuedPostAbsoluteStamp
                                        && this.saveSnapshotModifiedToken === this.modifiedToken
                                    ) {
                                        this.savedRemotely = false;
                                        this._savedLocally = true;
                                    }
                                });

                            return Promise.reject(`fetch error (at JSON decoding stage): ${Logger.stringifyObject(reason)}`);
                        }
                    );
                } else {
                    console.error(`Save failed (reason ${response.status} '${response.statusText}'), presumably service worker is missing and there is no network connection.`);

                    // don't update the saved status flags as don't know if the return is out of sequence or whether a subsequent save request has gone through.

                    // see if a json error message is available in the response
                    return response.json().then((responseData) => {
                        return Promise.reject(`${isSync ? 'Sync save' : 'Save'} failed (reason ${response.status} '${response.statusText}') when saving ${this.constructor.className}, '${JSON.stringify(responseData)}'`);
                    }, (error) => {
                        return Promise.reject(isSync ?
                            `Sync save failed, possibly no network connection. (${response.status}) when saving ${this.constructor.className}, error: ${Logger.stringifyObject(error)}`
                            :
                            `Save failed, (??no service worker). (${response.status}) when saving ${this.constructor.className}, error: ${Logger.stringifyObject(error)}`);
                    });

                    // return Promise.reject(isSync ?
                    //     `Sync save failed, probably no network connection. (${response.status}) when saving ${this.constructor.className}`
                    //     :
                    //     `Save failed, (??no service worker). (${response.status}) when saving ${this.constructor.className}`);
                }
            }, (error) => {
                return Promise.reject(`fetch network or permissions error: ${Logger.stringifyObject(error)}`);
            });
        } catch (e) {
            return Promise.reject(`fetch exception: ${Logger.stringifyObject(e)}`);
        }
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
            return Promise.reject(`Cannot retrieve empty or 'undefined' key from local '${key}', type '${typeof key}'.`);
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
            return Promise.reject(`Cannot retrieve empty or 'undefined' key from local '${key}', type '${typeof key}'.`);
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

        this.modifiedToken = Math.random();

        if (this.isPristine) {
            this.isPristine = false;
            this.createdStamp = this.modifiedStamp;
        }

        this._savedLocally = false;
        this.savedRemotely = false;
    }

    // noinspection JSUnusedGlobalSymbols
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

    /**
     * @abstract
     * @returns {FormData}
     */
    formData() {

    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * @abstract
     * @returns {Promise}
     */
    storeLocally() {

    }

    /**
     *
     * @param {{}} data
     * @returns {Promise<void>}
     * @protected
     */
    _storeLocalData(data) {

        return localforage.setItem(this.localKey, data)
            .then(() => {
                    console.log(`Stored object ${this.localKey} locally`);
                    if (this.saveState !== SAVE_STATE_SERVER) {
                        this.saveState = SAVE_STATE_LOCAL;
                    }
                },
                (reason) => {
                    console.log({[`Failed to store object ${this.localKey} locally`] : reason});
                    return Promise.reject({[`Failed to store object ${this.localKey} locally`] : reason});
                }
            );
    }
}
