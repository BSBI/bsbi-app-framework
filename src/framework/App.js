// App.js
// base class for single page application
// allows binding of controllers and routes
import {EventHarness} from "./EventHarness";
import {Survey} from "../models/Survey";
import {InternalAppError} from "../utils/exceptions/InternalAppError";
import {Occurrence} from "../models/Occurrence";
import localforage from "localforage";
import {OccurrenceImage} from "../models/OccurrenceImage";
import {Logger} from "../utils/Logger";
import {uuid} from "../models/Model";
import {Track} from "../models/Track";
import {
    APP_EVENT_ADD_SURVEY_USER_REQUEST,
    APP_EVENT_ALL_SYNCED_TO_SERVER,
    APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST,
    APP_EVENT_CURRENT_OCCURRENCE_CHANGED,
    APP_EVENT_CURRENT_SURVEY_CHANGED,
    APP_EVENT_NEW_SURVEY,
    APP_EVENT_OCCURRENCE_ADDED,
    APP_EVENT_OCCURRENCE_LOADED,
    APP_EVENT_RESET_SURVEYS,
    APP_EVENT_SURVEY_LOADED,
    APP_EVENT_SURVEYS_CHANGED,
    APP_EVENT_SYNC_ALL_FAILED,
    APP_EVENT_USER_LOGIN,
    APP_EVENT_WATCH_GPS_USER_REQUEST,
    APP_EVENT_USER_LOGOUT,
    APP_EVENT_OPTIONS_RESTORED,
} from './AppEvents';

/**
 * @typedef {import('bsbi-app-framework-view').PatchedNavigo} PatchedNavigo
 * @typedef {import('bsbi-app-framework-view').Layout} Layout
 */

export class App extends EventHarness {
    /**
     * @type {PatchedNavigo}
     */
    _router;

    /**
     * @type {HTMLElement}
     */
    _containerEl;

    /**
     *
     * @type {Array.<AppController>}
     */
    controllers = [];

    /**
     * tracks the handle of the current page controller
     * updating this is the responsibility of the controller
     *
     * @type {number|boolean}
     */
    currentControllerHandle = false;

    /**
     *
     * @type {Array.<{url : string}>}
     */
    routeHistory = [];

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
     * Flags the occurrence of a pervasive Safari bug
     * see https://bugs.webkit.org/show_bug.cgi?id=197050
     * @type {boolean}
     */
    static indexedDbConnectionLost = false;

    /**
     * Event fired when user requests a new blank survey
     *
     * @type {string}
     */
    static EVENT_ADD_SURVEY_USER_REQUEST = APP_EVENT_ADD_SURVEY_USER_REQUEST;

    /**
     * Event fired when user requests a reset (local clearance) of all surveys
     * @type {string}
     */
    static EVENT_RESET_SURVEYS = APP_EVENT_RESET_SURVEYS;

    /**
     * Fired after App.currentSurvey has been set to a new blank survey
     * the survey will be accessible in App.currentSurvey
     *
     * @type {string}
     */
    static EVENT_NEW_SURVEY = APP_EVENT_NEW_SURVEY;

    static LOAD_SURVEYS_ENDPOINT = '/loadsurveys.php';

    /**
     * Fired when a brand-new occurrence is added
     *
     * @type {string}
     */
    static EVENT_OCCURRENCE_ADDED = APP_EVENT_OCCURRENCE_ADDED;

    /**
     * Fired when a survey is retrieved from local storage
     * parameter is {survey : Survey}
     *
     * @type {string}
     */
    static EVENT_SURVEY_LOADED = APP_EVENT_SURVEY_LOADED;

    /**
     * Fired when an occurrence is retrieved from local storage or newly initialised
     * parameter is {occurrence : Occurrence}
     *
     * @type {string}
     */
    static EVENT_OCCURRENCE_LOADED = APP_EVENT_OCCURRENCE_LOADED;

    static EVENT_CURRENT_OCCURRENCE_CHANGED = APP_EVENT_CURRENT_OCCURRENCE_CHANGED;

    /**
     * Fired when the selected current survey id is changed
     * parameter is {newSurvey : Survey|null}
     *
     * (this is not fired for modification of the survey content)
     *
     * @type {string}
     */
    static EVENT_CURRENT_SURVEY_CHANGED = APP_EVENT_CURRENT_SURVEY_CHANGED;

    /**
     * Fired if the surveys list might need updating (as a survey has been added, removed or changed)
     *
     * @type {string}
     */
    static EVENT_SURVEYS_CHANGED = APP_EVENT_SURVEYS_CHANGED;

    /**
     * Fired after fully-successful sync-all
     * (or if sync-all resolved with nothing to send)
     *
     * @todo this is misleading as in fact is fired when all saved to indexeddb or to server
     *
     * @type {string}
     */
    static EVENT_ALL_SYNCED_TO_SERVER = APP_EVENT_ALL_SYNCED_TO_SERVER;

    /**
     * fired if sync-all called, but one or more objects failed to be stored
     *
     * @type {string}
     */
    static EVENT_SYNC_ALL_FAILED = APP_EVENT_SYNC_ALL_FAILED;

    static EVENT_USER_LOGIN = APP_EVENT_USER_LOGIN;

    static EVENT_USER_LOGOUT = APP_EVENT_USER_LOGOUT;

    /**
     * Fired when watching of GPS has been granted following user request.
     *
     * @type {string}
     */
    static EVENT_WATCH_GPS_USER_REQUEST = APP_EVENT_WATCH_GPS_USER_REQUEST;

    static EVENT_CANCEL_WATCHED_GPS_USER_REQUEST = APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST;

    /**
     * IndexedDb key used for storing id of current (last accessed) survey (or null)
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

            let surveyId = survey?.id;
            localforage.setItem(App.CURRENT_SURVEY_KEY_NAME, surveyId)
                .then(() => {
                    this.fireEvent(APP_EVENT_CURRENT_SURVEY_CHANGED, {newSurvey: survey});
                });
        }
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

    setOption(key, value) {
        const userId = this.userId;

        if (userId) {
            this._options[key] = JSON.parse(JSON.stringify(value));

            return localforage.setItem(`${App.LOCAL_OPTIONS_KEY_NAME}.${userId}`, this._options);
        } else {
            throw new Error(`User ID unset when setting option '${key}'.`);
        }
    }

    getOption(key) {
        return this._options?.hasOwnProperty?.(key) ? JSON.parse(JSON.stringify(this._options[key])) : undefined;
    }

    /**
     * @return Promise<string>
     */
    initialiseDeviceId() {
        if (!this._deviceId) {
            return localforage.getItem(App.DEVICE_ID_KEY_NAME)
                .then((deviceId) => {
                    if (deviceId) {
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
     *
     * @returns {?Survey}
     */
    get currentSurvey() {
        return this._currentSurvey;
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
     * @returns {Promise<void | null>}
     */
    clearCurrentSurvey() {
        this.occurrences = new Map();
        this._currentSurvey = null; // must not use setter here otherwise local storage saved previous id will be lost
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

        this._router.notFound((query) => {
            // called when there is path specified but
            // there is no route matching

            console.log(`no route found for '${query}'`);
            //this._router.navigate('/list');

            // const view = new NotFoundView();
            // view.display();
            this.notFoundView();
        });

        //default homepage
        this._router.on(() => {
            // special-case redirect (replacing in history) from '/' to '/list' without updating browser history

            console.log("redirecting from '/' to '/list'");

            this._router.pause();

            if (this.currentSurvey && this.currentSurvey.isPristine) {
                this._router.navigate('/list/survey/welcome').resume();
            } else {
                this._router.navigate('/list').resume();
            }
            this._router.resolve();
        });

        for (let controller of this.controllers) {
            controller.initialise();
        }
    }

    display() {
        //console.log('App display');

        // it's opportune at this point to try to ping the server again to save anything left outstanding
        this.syncAll(true).then(() => {
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
     *
     * @param {Survey} survey
     */
    addSurvey(survey) {
        if (survey.projectId !== this.projectId) {
            throw new Error(`Survey project id '${survey.projectId} does not match with current project ('${this.projectId}')`);
        }

        if (!survey.hasAppModifiedListener) {
            survey.hasAppModifiedListener = true;

            //console.log("setting survey's modified/save handler");
            survey.addListener(
                Survey.EVENT_MODIFIED,
                () => {
                    survey.save().finally(() => {
                        this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
                    });
                }
            );
        }

        this.surveys.set(survey.id, survey);
        this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
    }

    /**
     * tests whether occurrences have been defined, excluding any that have been deleted
     *
     * @returns {boolean}
     */
    haveExtantOccurrences() {
        for (let occurrence of this.occurrences) {
            if (!occurrence.deleted) {
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

        occurrence.addListener(Occurrence.EVENT_MODIFIED,
            // possibly this should be async, with await on the survey and occurrence save
            () => {
                const survey = this.surveys.get(occurrence.surveyId);
                if (!survey) {
                    throw new Error(`Failed to look up survey id ${occurrence.surveyId}`);
                } else {
                    survey.isPristine = false;

                    // need to ensure that currentSurvey is saved before occurrence
                    // rather than using a promise chain here, instead rely on enforced queuing of post requests in Model
                    // otherwise there are problems with queue-jumping (e.g. when an image needs to be saved after both previous requests)
                    // if (survey.unsaved()) {
                    //     // noinspection JSIgnoredPromiseFromCall
                    //     survey.save();
                    // }

                    // against a backdrop where surveys are somehow going unsaved, always force a survey re-save
                    // @todo need to watch if this is creating a mess of identical survey revisions
                    // noinspection JSIgnoredPromiseFromCall
                    survey.save(true);

                    occurrence.save().finally(() => {
                        survey.fireEvent(Survey.EVENT_OCCURRENCES_CHANGED, {occurrenceId: occurrence.id});
                    });
                }
            });

        this.fireEvent(APP_EVENT_OCCURRENCE_LOADED, {occurrence: occurrence});
    }

    /**
     * attempts to refresh the state of local storage for the specified survey ids
     * if fetch fails then return a failed promise
     *
     * updates local copy of surveys and occurrences
     *
     * no service worker interception of this call - passed through and not cached
     *
     * @param {Array.<string>} surveyIds
     * @return {Promise}
     */
    refreshFromServer(surveyIds) {
        console.log({'Refresh from server, ids' : surveyIds});
        const formData = new FormData;

        let n = 0;
        for (let key of surveyIds) {
            if (key && key !== 'undefined') {
                formData.append(`surveyId[${n++}]`, key);
            }
        }

        if (this.session?.userId) {
            formData.append('userId', this.session.userId);
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

            console.log({'refresh from server json response' : jsonResponse});

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

            // const promises = [];
            //
            // for (let type in jsonResponse) {
            //     if (jsonResponse.hasOwnProperty(type)) {
            //         for (let object of jsonResponse[type]) {
            //             promises.push(this._conditionallyReplaceObject(object));
            //         }
            //     }
            // }
            //
            // return Promise.all(promises);

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
                        console.info(`Local copy of ${key} is the same or newer than the server copy. (${localVersion.modified} >= ${externalVersion.modified}) `);
                        return Promise.resolve();
                    }
                }

                // no local copy or stale copy
                // so store response locally
                console.info(`Adding or replacing local copy of ${key}`);
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
    seekKeys(storedObjectKeys) {
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
                            storedObjectKeys[type].push(id);
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
     * Purge local entries that are older than threshold or orphaned and which have been saved externally
     *
     * @returns {Promise}
     */
    purgeStale() {
        const storedObjectKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        return this.seekKeys(storedObjectKeys)
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
                        // cope with pervasive Safari crash
                        // see https://bugs.webkit.org/show_bug.cgi?id=197050
                        if (failedResult.toString().includes('Connection to Indexed Database server lost')) {
                            App.indexedDbConnectionLost = true;
                            location.reload();
                        }
                    });

                //this.fireEvent(APP_EVENT_PURGE_FAILED);
                return false;
            });
    }

    /**
     * @param {boolean} fastReturn If set then the promise returns more quickly once the saves have been queued but not all effected
     * This should allow surveys to be switched etc. without disrupting the ongoing save process.
     * @returns {Promise<{savedCount : {}}>}
     */
    syncAll(fastReturn = true) {
        const storedObjectKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        return this.seekKeys(storedObjectKeys)
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
                        return Promise.reject(failedResult);
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
            });
    }

    /**
     *
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
     * @returns {Array<Survey>}
     */
    queryLocalSurveys(queryFilters) {
        const matches = [];

        for (const surveyTuple of this.surveys) {
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
                // test if survey belongs to session user by default (only relevant if an explicit userId selector wasn't applied)
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
        // synchronises surveys first, then occurrences, then images from indexedDb

        const tasks = [];

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
         * @private
         *
         */
        const queueSync = (objectKey, objectClass) => {
            const classLowerName = objectClass.name.toLowerCase();


                /**
                 * @returns {Promise}
                 */
                return () => {
                    console.log({'queueing sync': {key: objectKey, type: classLowerName}});
                    return objectClass.retrieveFromLocal(objectKey, new objectClass)
                        .then((/** Model */ model) => {
                            if (model.unsaved()) {
                                return model.save(true, true)
                                    .then(() => {
                                        // for sync, only a remote save should count as successful
                                        if (!model.savedRemotely) {
                                            return Promise.reject(`Failed to save ${classLowerName} to server.`);
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
                            console.log({'processed sync': {key: objectKey, type: classLowerName}});
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
                //console.log('got to 1139');
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

    // /**
    //  *
    //  * @param {{survey : Array<string>, occurrence : Array<string>, image : Array<string>, [track] : Array<string>}} storedObjectKeys
    //  * @param {boolean} fastReturn default false
    //  * @returns {Promise}
    //  * @private
    //  */
    // _syncLocalUnsaved(storedObjectKeys, fastReturn = false) {
    //     // synchronises surveys first, then occurrences, then images from indexedDb
    //
    //     const surveyPromises = [];
    //
    //     for(let surveyKey of storedObjectKeys.survey) {
    //         surveyPromises.push(Survey.retrieveFromLocal(surveyKey, new Survey)
    //             .then((/** Survey */ survey) => {
    //                 if (survey.unsaved()) { //} || this.session?.userId === '2cd4p9h.31ecsw') {
    //                     return survey.save(true);
    //                 }
    //             })
    //         );
    //     }
    //
    //     let errors = false;
    //
    //     // this ensures that saves happen in order (surveys > occurrences > images > tracks)
    //     const savePromise = Promise.allSettled(surveyPromises)
    //         .catch((reason) => {
    //             console.log({'save survey errors' : reason});
    //             errors = true;
    //             return Promise.resolve()
    //         })
    //         .finally(() => {
    //             const occurrencePromises = [];
    //
    //             for(let occurrenceKey of storedObjectKeys.occurrence) {
    //                 occurrencePromises.push(Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence)
    //                     .then((/** Occurrence */ occurrence) => {
    //                         if (occurrence.unsaved()) { // || this.session?.userId === '2cd4p9h.31ecsw') {
    //                             return occurrence.save('', true);
    //                         }
    //                     })
    //                 );
    //             }
    //
    //             return Promise.allSettled(occurrencePromises);
    //         })
    //         .catch((reason) => {
    //             console.log({'save occurrence errors' : reason});
    //             errors = true;
    //             return Promise.resolve()
    //         })
    //         .finally(() => {
    //             const imagePromises = [];
    //
    //             for(let imageKey of storedObjectKeys.image) {
    //                 imagePromises.push(OccurrenceImage.retrieveFromLocal(imageKey, new OccurrenceImage)
    //                     .then((/** OccurrenceImage */ image) => {
    //                         if (image.unsaved()) {
    //                             return image.save();
    //                         }
    //                     })
    //                 );
    //             }
    //
    //             return Promise.allSettled(imagePromises);
    //         })
    //         .catch((reason) => {
    //             console.log({'save image errors' : reason});
    //             errors = true;
    //             return Promise.resolve()
    //         })
    //         .finally(() => {
    //             const trackPromises = []
    //
    //             for(let trackKey of storedObjectKeys.track) {
    //                 trackPromises.push(Track.retrieveFromLocal(trackKey, new Track)
    //                     .then((/** Track */ track) => {
    //                         if (track.unsaved()) {
    //                             return track.save();
    //                         }
    //                     })
    //                 );
    //             }
    //
    //             return Promise.allSettled(trackPromises);
    //         })
    //         .catch((reason) => {
    //             console.log({'save track errors' : reason});
    //             errors = true;
    //             return Promise.resolve()
    //         })
    //         .finally(() => {
    //             if (errors) {
    //                 return Promise.reject();
    //             } else {
    //                 return Promise.resolve();
    //             }
    //         })
    //     ;
    //
    //     if (fastReturn) {
    //         // this will return near instantaneously as there is an already resolved promise at the head of the array
    //         // the other promises will continue to resolve
    //         //return Promise.race(promises);
    //         return Promise.race([
    //             Promise.resolve(true), // as shortcut queue an already resolved promise, so that later Promise.race returns immediately.
    //             savePromise
    //         ]);
    //     } else {
    //         //return Promise.all(promises).catch((result) => {
    //         return savePromise.catch((result) => {
    //             console.log(`Save failure: ${result}`);
    //             return Promise.reject(result); // pass on the failed save (catch was only for logging, not to allow subsequent success)
    //         });
    //     }
    // }

    /**
     *
     * @param {{survey : Array<string>, occurrence : Array<string>, image : Array<string>, [track] : Array<string>}} storedObjectKeys
     *
     * @returns {Promise}
     *
     * @todo implement this
     * @private
     */
    _purgeLocalFOO(storedObjectKeys) {
        // synchronises surveys first, then occurrences, then images from indexedDb

        const promises = [];

        const deletionCandidateKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        // if (fastReturn) {
        //     // as shortcut queue an already resolved promise, so that later Promise.race returns immediately.
        //     promises[0] = Promise.resolve(true);
        // }

        const thresholdStamp = Math.floor(Date.now() / 1000) - this.staleThreshold;

        for(let surveyKey of storedObjectKeys.survey) {
            promises.push(Survey.retrieveFromLocal(surveyKey, new Survey)
                .then((/** Survey */ survey) => {
                    if (survey.savedRemotely && survey.modifiedStamp <= thresholdStamp) {
                        // survey hasn't been modified recently

                        if (!(survey.attributes?.defaultCasual && survey.createdInCurrentYear() && survey.userId === this.userId)) {
                            // survey isn't the set of casual records for the current year for the current user

                        }
                    }
                })
            );
        }

        for(let occurrenceKey of storedObjectKeys.occurrence) {
            promises.push(Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence)
                .then((/** Occurrence */ occurrence) => {
                    if (occurrence.unsaved()) { // || this.session?.userId === '2cd4p9h.31ecsw') {
                        return occurrence.save('', true);
                    }
                })
            );
        }

        for(let imageKey of storedObjectKeys.image) {
            promises.push(OccurrenceImage.retrieveFromLocal(imageKey, new OccurrenceImage)
                .then((/** OccurrenceImage */ image) => {
                    if (image.unsaved()) {
                        return image.save();
                    }
                })
            );
        }

        for(let trackKey of storedObjectKeys.track) {
            promises.push(Track.retrieveFromLocal(trackKey, new Track)
                .then((/** Track */ track) => {
                    if (track.unsaved()) {
                        return track.save();
                    }
                })
            );
        }


        return Promise.all(promises).catch((result) => {
            console.log(`Save failure: ${result}`);
            return Promise.reject(result); // pass on the failed save (catch was only for logging, not to allow subsequent success)
        });

    }

    /**
     * restore previous state, pulling back from local and external store
     * @todo this needs a save phase, so that local changes are saved back to the server
     *
     * @param {string} [targetSurveyId] if specified then select this id as the current survey
     * @param {boolean} [neverAddBlank] if set then don't add a new blank survey if none available, default false
     * @return {Promise}
     */
    restoreOccurrences(targetSurveyId = '', neverAddBlank = false) {
        console.log(`Invoked restoreOccurrences, target survey id: ${targetSurveyId}`);

        if (targetSurveyId === 'undefined') {
            console.error(`Attempt to restore occurrences for literal 'undefined' survey id.`);
            targetSurveyId = '';
        }

        return (targetSurveyId) ?
            this._restoreOccurrenceImp(targetSurveyId, neverAddBlank)
            :
            this.getLastSurveyId().then(
                (lastSurveyId) => {
                    console.log(`Retrieved last used survey id '${lastSurveyId}'`);

                    return this._restoreOccurrenceImp(lastSurveyId, neverAddBlank).catch(() => {
                        console.log(`Failed to retrieve lastSurveyId ${lastSurveyId}. Resetting current survey and retrying.`);

                        this.currentSurvey = null;
                        return this._restoreOccurrenceImp('', neverAddBlank);
                    });
                },
                // probably can't reach this catch phase
                () => this._restoreOccurrenceImp('', neverAddBlank)
            );
    }

    /**
     *
     * @param {string} [targetSurveyId] default ''
     * @param {boolean} [neverAddBlank] if set then don't add a new blank survey if none available, default false
     * @returns {Promise<void>|Promise<unknown>}
     * @protected
     */
    _restoreOccurrenceImp(targetSurveyId = '', neverAddBlank = false) {
        // need to check for a special case where restoring a survey that has never been saved even locally
        // i.e. new and unmodified
        // only present in current App.surveys
        // this occurs if user creates a new survey, makes no changes, switches away from it then switches back
        if (targetSurveyId && this.surveys.has(targetSurveyId)) {
            const localSurvey = this.surveys.get(targetSurveyId);

            if (localSurvey.isPristine) {
                // clear occurrences from the previous survey
                return this.clearCurrentSurvey().then(() => {
                    this.currentSurvey = localSurvey;
                    this.fireEvent(APP_EVENT_SURVEYS_CHANGED); // current survey should be set now, so menu needs refresh
                    return Promise.resolve();
                });
            }
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
        }

        return this.clearCurrentSurvey().then(() => this.seekKeys(storedObjectKeys))
            .then((storedObjectKeys) => {
                if (storedObjectKeys.survey.length || this.session?.userId) {
                    return this.refreshFromServer(storedObjectKeys.survey)
                        // re-seek keys from indexed db, to take account of any new occurrences received from the server
                        // do this for both promise states (can't use finally has it doesn't chain returned promises
                        .then(
                            () => this.seekKeys(storedObjectKeys),
                            () => this.seekKeys(storedObjectKeys),
                        );
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
                // storedObjectKeys and indexed db should be as up-to-date as possible

                console.log({storedObjectKeys});

                if (storedObjectKeys?.survey?.length) {

                    const surveyFetchingPromises = [];
                    let n = 0;

                    let restorePromise = Promise.resolve();

                    for (let surveyKey of storedObjectKeys.survey) {
                        // arbitrarily set first survey key as current if a target id hasn't been specified

                        // surveyFetchingPromises.push(
                        //     this._restoreSurveyFromLocal(surveyKey, storedObjectKeys, (targetSurveyId === surveyKey) || (!targetSurveyId && n++ === 0))
                        // );

                        restorePromise = restorePromise
                            .then(() => {
                                return this._restoreSurveyFromLocal(surveyKey, storedObjectKeys, (targetSurveyId === surveyKey) || (!targetSurveyId && n++ === 0));
                            })
                            .catch((reason) => {
                                console.log({'failed to restore from local' : {surveyKey, reason}});
                                return Promise.resolve();
                            })
                    }

                    // can use Promise.all as don't want these to run concurrently
                    // which may overwhelm Safari
                    // instead need a chain of then()s
                    //return Promise.all(surveyFetchingPromises)

                    return restorePromise
                        .finally(() => {
                            //this.currentSurvey = this.surveys.get(storedObjectKeys.survey[0]);

                            if (!this.currentSurvey && neverAddBlank) {
                                // survey doesn't actually exist
                                // this could have happened in an invalid survey id was provided as a targetSurveyId
                                console.log(`Failed to retrieve survey id '${targetSurveyId}'`);
                                return Promise.reject(new Error(`Failed to retrieve survey id '${targetSurveyId}'`));
                            }

                            if (this.currentSurvey?.deleted) {
                                // unusual case where survey is deleted or was not found
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
                            this.currentSurvey?.fireEvent?.(Survey.EVENT_OCCURRENCES_CHANGED);
                            this.currentSurvey?.fireEvent?.(Survey.EVENT_LIST_LENGTH_CHANGED);

                            //return Promise.resolve();
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
     *
     * @param {{}|null} [attributes]
     */
    setNewSurvey(attributes) {
        const newSurvey = new Survey();

        newSurvey.id; // trigger id initialisation

        if (attributes) {
            newSurvey.attributes = {...newSurvey.attributes, ...attributes};
        }

        newSurvey.projectId = this.projectId;
        newSurvey.isPristine = true;
        newSurvey.isNew = true;

        if (this.session?.userId) {
            newSurvey.userId = this.session.userId;
        }

        // Important: don't set this.currentSurvey until default attributes have been set,
        // as currentSurvey setter fires an event that may depend on these attributes
        this.currentSurvey = newSurvey;
        this.addSurvey(newSurvey);
        this.fireEvent(APP_EVENT_NEW_SURVEY);

        Track.applyChangedSurveyTrackingResumption(newSurvey);
    }

    /**
     * Add and set a *new* survey
     *
     * @param survey
     */
    addAndSetSurvey(survey) {
        this.currentSurvey = survey;
        this.addSurvey(survey);
        this.fireEvent(APP_EVENT_NEW_SURVEY);
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
        occurrence.projectId = this.projectId;

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

        currentSurvey.fireEvent(Survey.EVENT_OCCURRENCES_CHANGED, {occurrenceId : occurrence.id});
        currentSurvey.fireEvent(Survey.EVENT_LIST_LENGTH_CHANGED);

        // occurrence modified event fired to ensure that the occurrence is saved
        occurrence.fireEvent(Occurrence.EVENT_MODIFIED);

        return occurrence;
    }

    /**
     *
     * @param {string} surveyId
     * @param {{survey: Array, occurrence: Array, image: Array}} storedObjectKeys
     * @param {boolean} setAsCurrent
     * @returns {Promise}
     * @private
     */
    _restoreSurveyFromLocal(surveyId, storedObjectKeys, setAsCurrent) {
        // retrieve surveys first, then occurrences, then images from indexedDb

        let userIdFilter = this.session?.userId;

        let promise = Survey.retrieveFromLocal(surveyId, new Survey)
            .then((survey) => {
                console.log(`retrieving local survey ${surveyId}`);

                this.fireEvent(APP_EVENT_SURVEY_LOADED, {survey}); // provides a hook point in case any attributes need to be re-initialised

                if ((!userIdFilter && !survey.userId) || survey.userId === userIdFilter || this.session?.superAdmin) {
                    if (setAsCurrent) {
                        // the apps occurrences should only relate to the current survey
                        // (the reset records are remote or in IndexedDb)
                        return this.clearCurrentSurvey().then(() => {
                            this.addSurvey(survey);
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
                                                // not part of current survey but should still add to key list for counting purposes

                                                this.surveys.get(occurrence.surveyId)?.extantOccurrenceKeys?.add?.(occurrence.id);
                                            }

                                        })
                                    )
                                    .catch((reason) => {
                                        console.error({'Failed to fetch occurrence for current survey' : {occurrenceKey, reason}});
                                        return Promise.resolve();
                                    });

                                // occurrenceFetchingPromises.push(Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence)
                                //     .then((occurrence) => {
                                //         if (occurrence.surveyId === surveyId) {
                                //             //console.log(`adding occurrence ${occurrenceKey}`);
                                //             this.addOccurrence(occurrence);
                                //
                                //             survey.extantOccurrenceKeys.add(occurrence.id);
                                //         } else {
                                //             // not part of current survey but should still add to key list for counting purposes
                                //
                                //             this.surveys.get(occurrence.surveyId)?.extantOccurrenceKeys?.add?.(occurrence.id);
                                //         }
                                //
                                //     }));
                            }

                            //return Promise.all(occurrenceFetchingPromises);
                            return occurrenceFetchingPromise;
                        });
                    } else {
                        // not the current survey, so just add it but don't load occurrences
                        this.addSurvey(survey);
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
                    return Promise.reject()
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

