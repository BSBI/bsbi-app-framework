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
import {PurgeInconsistencyError} from "../utils/exceptions/PurgeInconsistencyError";

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

            let surveyId = survey?.id;
            localforage.setItem(App.CURRENT_SURVEY_KEY_NAME, surveyId)
                .finally(() => {
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
     * @param {string|null} surveyId only used as a sanity check
     *
     * @returns {Promise<void | null>}
     */
    clearCurrentSurvey(surveyId = null) {
        if (surveyId && this._currentSurvey && surveyId !== this._currentSurvey.id) {
            // theoretical weird error state where the current survey has changed prior to clear being called
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

        for (let controller of this.controllers) {
            controller.initialise();
        }
    }

    display() {
        //console.log('App display');
        this._router.resolve();

        // it's opportune at this point to try to ping the server again to save anything left outstanding
        // this.syncAll(true).then(() => {
        //     this._router.resolve();
        // });
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
     *
     * @param {Survey} survey
     */
    addSurvey(survey) {
        if (!this.projectIdIsCompatible(survey.projectId)) {
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
        occurrence.addListener(Occurrence.EVENT_MODIFIED,
            () => {
                const survey = this.surveys.get(occurrence.surveyId);
                if (!survey) {
                    throw new Error(`Failed to look up survey id ${occurrence.surveyId}`);
                } else {
                    survey.isPristine = false;

                    // need to ensure that currentSurvey is saved before occurrence
                    // rather than using a promise chain here, instead rely on enforced queuing of post requests in Model
                    // otherwise there are problems with queue-jumping (e.g. when an image needs to be saved after both previous requests)
                    if (survey.unsaved()) {
                        // noinspection JSIgnoredPromiseFromCall
                        survey.save(true);
                    }

                    // // against a backdrop where surveys are somehow going unsaved, always force a survey re-save
                    // // @todo need to watch if this is creating a mess of identical survey revisions
                    // // noinspection JSIgnoredPromiseFromCall
                    // survey.save(true);

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
     * @param {boolean} specifiedSurveysOnly if set then don't return a full extended refresh, only the specified surveys
     * @return {Promise}
     */
    refreshFromServer(surveyIds, specifiedSurveysOnly = false) {
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
    purgeStale(fastReturn = true) {
        const storedObjectKeys = {
            survey : [],
            occurrence : [],
            image : [],
            track : [],
        };

        let promise = this.seekKeys(storedObjectKeys)
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
     * @returns {Promise<{savedCount : {}}>}
     */
    syncAll(fastReturn = true) {
        if (App._syncAllInProgress && fastReturn) {
            console.info("Skipped sync all as another sync is already in progress.");
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
                //console.log('got to 1139');
                if (errorFlag) {
                    console.log({'local sync failed with errors': errors});
                    return Promise.reject({
                        savedCount,
                        errors,
                        savedFlag
                    });
                }

                this._updateUnsavedMarkerCss();
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
            );
        }

        // at this point all surveys will have been checked by the time the next thenables are processed
        for (let occurrenceKey of storedObjectKeys.occurrence) {
            purgePromise = purgePromise.then(() => Occurrence.retrieveFromLocal(occurrenceKey, new Occurrence))
                .then((/** Occurrence */ occurrence) => {

                    if (!occurrence.deleted) {
                        // see if occurrence belongs to one of the threshold recent surveys
                        // if so then the survey should be kept (so removed from the imperiled recent list)
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
        deletionCandidateKeys.survey.push(recentSurveyKeys);

        purgePromise = purgePromise.then(
            () => {
                //console.log({'Purging' : deletionCandidateKeys});

                return this._applyPurge(deletionCandidateKeys);
            },
            (reason) => {
                console.error({'purge failed reason' : reason});
                console.log({'would have purged' : deletionCandidateKeys});

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

        for (let type in deletionIds) {
            for (let key of deletionIds[type]) {
                purgePromise = purgePromise.then(() => this.forageRemoveItem(`${type}.${key}`));
            }
        }

        if (deletionIds.image.length > 0) {
            purgePromise = purgePromise.then(() => this._purgeCachedImages(deletionIds.image));
        }

        if (deletionIds.survey.length > 0) {
            purgePromise = purgePromise.then(() => {
                for (let key of deletionIds.survey) {
                    this.surveys.delete(key);
                }

                this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
            });
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
     * @return {Promise}
     */
    restoreOccurrences(targetSurveyId = '', neverAddBlank = false, setCurrentSurvey = true) {
        console.log(`Invoked restoreOccurrences, target survey id: ${targetSurveyId}`);

        if (targetSurveyId === 'undefined') {
            console.error(`Attempt to restore occurrences for literal 'undefined' survey id.`);
            targetSurveyId = '';
        }

        return (targetSurveyId) ?
            this._restoreOccurrenceImp(targetSurveyId, neverAddBlank, setCurrentSurvey)
            :
            this.getLastSurveyId().then(
                (lastSurveyId) => {
                    console.log(`Retrieved last used survey id '${lastSurveyId}'`);

                    return this._restoreOccurrenceImp(lastSurveyId, neverAddBlank, setCurrentSurvey).catch(() => {
                        console.log(`Failed to retrieve lastSurveyId ${lastSurveyId}. Resetting current survey and retrying.`);

                        this.currentSurvey = null;
                        return this._restoreOccurrenceImp('', neverAddBlank, setCurrentSurvey);
                    });
                },
                // probably can't reach this catch phase
                () => this._restoreOccurrenceImp('', neverAddBlank, setCurrentSurvey)
            );
    }

    /**
     *
     * @param {string} [targetSurveyId] default ''
     * @param {boolean} [neverAddBlank] if set then don't add a new blank survey if none available, default false
     * @param {boolean} [setCurrentSurvey] default true
     * @returns {Promise<void>|Promise<unknown>}
     * @protected
     */
    _restoreOccurrenceImp(targetSurveyId = '', neverAddBlank = false, setCurrentSurvey = true) {
        // need to check for a special case where restoring a survey that has never been saved even locally
        // i.e. new and unmodified
        // only present in current App.surveys
        // this occurs if user creates a new survey, makes no changes, switches away from it then switches back
        // and also in some other automated navigation sequences
        if (targetSurveyId && this.surveys.has(targetSurveyId)) {
            const localSurvey = this.surveys.get(targetSurveyId);

            if (localSurvey.isPristine) {
                // local survey is not current then
                // clear occurrences from the previous survey

                if (localSurvey !== this._currentSurvey) {
                    return this.clearCurrentSurvey().then(() => {
                        this.currentSurvey = localSurvey;
                        this.fireEvent(APP_EVENT_SURVEYS_CHANGED); // current survey should be set now, so menu needs refresh
                        return Promise.resolve();
                    });
                } else {
                    return Promise.resolve();
                }
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
                        this.refreshFromServer(storedObjectKeys.survey)
                            // re-seek keys from indexed db, to take account of any new occurrences received from the server
                            // do this for both promise states (can't use finally as it doesn't chain returned promises)
                            .then(
                                () => this.seekKeys(storedObjectKeys),
                                () => this.seekKeys(storedObjectKeys),
                            )
                            .finally(() => {
                                if (timer) {
                                    clearTimeout(timer);
                                }
                            })
                    ];

                    // The split approach below isn't yet safe
                    /*
                    if (targetSurveyId) {
                        // as single batch try to get just the survey of interest

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
                // storedObjectKeys and indexed db should be as up-to-date as possible

                //console.log({storedObjectKeys});

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
                                return this._restoreSurveyFromLocal(surveyKey, storedObjectKeys, setCurrentSurvey && ((targetSurveyId === surveyKey) || (!targetSurveyId && n++ === 0)));
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

                            if (!this.currentSurvey && neverAddBlank && setCurrentSurvey) {
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
     * specialized surveys might return an HTML <img> tag string
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
                //console.log(`retrieving local survey ${surveyId}`);

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

