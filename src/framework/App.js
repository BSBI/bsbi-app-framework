// App.js
// base class for single page application
// allows binding of controllers and routes
import {EventHarness} from "./EventHarness";
import {
    Survey,
    SURVEY_EVENT_LIST_LENGTH_CHANGED,
} from "../models/Survey";
import {InternalAppError} from "../utils/exceptions/InternalAppError";
import {Occurrence, OCCURRENCE_EVENT_MODIFIED} from "../models/Occurrence";
import localforage from "localforage";
import {MODEL_TYPE_IMAGE, OccurrenceImage} from "../models/OccurrenceImage";
import {Logger} from "../utils/Logger";
import {Model, SAVE_STATE_SERVER, uuid} from "../models/Model";
import {Track} from "../models/Track";
import {
    //APP_EVENT_ADD_SURVEY_USER_REQUEST,
    APP_EVENT_ALL_SYNCED_TO_SERVER,
    //APP_EVENT_CURRENT_OCCURRENCE_CHANGED,
    APP_EVENT_CURRENT_SURVEY_CHANGED,
    APP_EVENT_NEW_SURVEY,
    APP_EVENT_OCCURRENCE_ADDED,
    APP_EVENT_OCCURRENCE_LOADED,
    //APP_EVENT_RESET_SURVEYS,
    APP_EVENT_SURVEY_LOADED,
    APP_EVENT_SURVEYS_CHANGED,
    APP_EVENT_SYNC_ALL_FAILED,
    //APP_EVENT_USER_LOGIN,
    //APP_EVENT_USER_LOGOUT,
    APP_EVENT_OPTIONS_RESTORED,
    SURVEY_EVENT_MODIFIED,
    SURVEY_EVENT_OCCURRENCES_CHANGED, SURVEY_EVENT_DELETED
} from './AppEvents';
import {PurgeInconsistencyError} from "../utils/exceptions/PurgeInconsistencyError";
import {DEVICE_TYPE_IMMOBILE, DeviceType} from "../utils/DeviceType";
import {schedulerYield} from "../utils/schedulerYield";

/**
 * never retain longer than 14 days
 *
 * @type {number}
 */
export const OCCURRENCE_MAXIMUM_RETENTION_LIMIT_DAYS = 14;

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
     * Set while a purge is in progress, to prevent overlapping conflicting purge operations
     *
     * @type {boolean}
     * @private
     */
    _doingPurge = false;

    /**
     * Set if the app should potentially allow tracking (if enabled by the user and supported by the device etc.)
     *
     * true for RecordingApp, false for PlantAlert
     *
     * @type {boolean}
     */
    supportsTracking = false;

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

    // noinspection JSUnusedGlobalSymbols
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

    // noinspection JSUnusedGlobalSymbols
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
                        // apply user's options over the top of a copy of the defaults
                        this._options = Object.assign(JSON.parse(JSON.stringify(this.constructor.DEFAULT_OPTIONS)), options);
                    } else {
                        this._options = JSON.parse(JSON.stringify(this.constructor.DEFAULT_OPTIONS));
                    }

                    // return a clone of the options (to prevent improper direct modification
                    const clonedOptions = JSON.parse(JSON.stringify(this._options));

                    this.fireEvent(APP_EVENT_OPTIONS_RESTORED, clonedOptions);

                    return clonedOptions;
                });
        } else {
            return Promise.reject('User ID unset when restoring options.');
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     */
    clearOptions() {
        this._options = null;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {{}} rawOptions
     * @returns {Promise<Record<string, number|string|{}>>}
     */
    setOptions(rawOptions) {
        const userId = this.userId;

        if (userId) {
            if (!this.options) {
                this.options = {};
            }

            Object.assign(this._options, rawOptions);

            return localforage.setItem(`${App.LOCAL_OPTIONS_KEY_NAME}.${userId}`, this._options);
        } else {
            return Promise.reject(`User ID unset when setting options.`);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} key
     * @param value
     * @returns {Promise<Record<string, number|string|{}>>}
     */
    setOption(key, value) {
        const userId = this.userId;

        if (userId) {
            this._options[key] = JSON.parse(JSON.stringify(value));

            return localforage.setItem(`${App.LOCAL_OPTIONS_KEY_NAME}.${userId}`, this._options);
        } else {
            return Promise.reject(`User ID unset when setting option '${key}'.`);
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

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} key
     * @returns {boolean}
     */
    hasOption(key) {
        return this._options?.hasOwnProperty?.(key) || false;
    }

    // noinspection JSUnusedGlobalSymbols
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

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} key
     * @param value
     * @returns {Promise<*>}
     */
    forageSetItem(key, value) {
        return localforage.setItem(key, value);
    }

    // noinspection JSUnusedGlobalSymbols
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

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} name
     */
    setLocalForageName(name) {
        localforage.config({
            name: name
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Try to enable persistent storage if installed and running on mobile.
     *
     * @param always
     * @returns {Promise<void>|Promise<boolean>}
     */
    tryPersistStorage(always = false) {
        if ((always || (window.matchMedia('(display-mode: standalone)').matches) &&
            navigator?.storage?.persist && navigator?.storage?.persisted &&
            DeviceType.getDeviceType() !== DEVICE_TYPE_IMMOBILE)
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
                console.error({'Failure reading state of persistent storage' : error});
                return Promise.reject({'Failure reading state of persistent storage' : error});
            });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * This is a soft-reset (e.g. after log-out) rather than a hard clear of storage
     *
     * @returns {Promise<void | null>}
     */
    reset() {
        this.surveys = new Map();
        Track.reset();
        return this.clearCurrentSurvey().then(this.clearLastSurveyId);
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

    // noinspection JSUnusedGlobalSymbols
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

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} containerId
     */
    set containerId(containerId) {
        const el = document.getElementById(containerId);
        if (!el) {
            throw new Error(`App container '${containerId}' not found.`);
        } else {
            this._containerEl = el;
        }
    }

    // noinspection JSUnusedGlobalSymbols
    get container() {
        return this._containerEl;
    }

    // noinspection JSUnusedGlobalSymbols
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
            //before: (done, params) => { ... },
            after: () => {
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

    // noinspection JSUnusedGlobalSymbols
    /**
     * Returns a promise that resolves after the initial navigation completes
     *
     * @returns {Promise<void>}
     */
    display() {
        return new Promise((resolve) => {
            this.afterFirstNavigationHandler = resolve;
            this._router.resolve();
        });
    }

    /**
     *
     */
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

    // noinspection JSUnusedGlobalSymbols
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

    // noinspection JSUnusedGlobalSymbols
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

                    schedulerYield().then(() => occurrence.save()).finally(() => {
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
     * @param {number|null} maxAge maximum age (in seconds) of surveys to retrieve (excluding specified ids, which are unconstrained), applicable only if a user id is provided, default null
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

            if (!maxAge) {
                const retentionDays = this.getOption('retentionTime');

                if (retentionDays && retentionDays <= OCCURRENCE_MAXIMUM_RETENTION_LIMIT_DAYS) {
                    maxAge = retentionDays * 3600 * 24; // convert from days to seconds
                }
            }

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

            // if the external object is newer than the local version then place in local storage
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

    // noinspection JSUnusedGlobalSymbols
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

        const thresholdDays = this.getOption('retentionTime');
        if (thresholdDays >= 1 && thresholdDays <= OCCURRENCE_MAXIMUM_RETENTION_LIMIT_DAYS) {
            this.staleThreshold = thresholdDays * 3600 * 24;
        }

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
                console.error({'Failed to purge': failedResult});
                Logger.logError(`Failed to purge: ${JSON.stringify(failedResult)}`)
                    .finally(() => {
                        // cope with the pervasive Safari crash
                        // see https://bugs.webkit.org/show_bug.cgi?id=197050
                        if (failedResult.toString().includes('Connection to Indexed Database server lost')) {
                            App.indexedDbConnectionLost = true;
                            location.reload();
                        }
                    });

                //this.fireEvent(APP_EVENT_PURGE_FAILED);
                return Promise.reject(failedResult);
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
     * Timestamp (ms unixtime) of last successful sync all attempt
     *
     * @type {number}
     */
    static lastSyncAllTimestamp = 0;

    /**
     * Minimum interval after last sync all to attempt another automatically
     *
     * 15 min in milliseconds
     */
    static syncAllInterval = 15 * 60 * 1000;

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     */
    registerSyncAllOnVisibleListener () {
        document.addEventListener('visibilitychange',  () => {
            if (document.visibilityState === "visible"
                && navigator.onLine
                && !App._syncAllInProgress
                && (App.lastSyncAllTimestamp + App.syncAllInterval) < Date.now()) {

                console.info('Sync all attempt triggered by visibility change.');

                schedulerYield().then(() => this.syncAll().finally(() => {
                    console.info('Sync all attempt triggered by visibility change - finished.');
                }));
            }
        });
    }

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
        App.lastSyncAllTimestamp = Date.now();

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

                            // cope with a pervasive Safari crash issue
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

    // noinspection JSUnusedGlobalSymbols
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
     * @returns {Promise<{savedCount : {survey: number, occurrence: number, occurrenceimage: number, track: number}, errors : null|Object<string,Array<{key: string, reason: string}>>, savedFlag : boolean}|void>}
     * @private
     */
    _syncLocalUnsaved(storedObjectKeys, fastReturn = false) {
        // synchronises surveys first, then occurrences, then images from indexedDb

        //const tasks = [];

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
         * @type {{survey: number, occurrence: number, occurrenceimage: number, track: number}}
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
                            if (model.TYPE === MODEL_TYPE_IMAGE && !model.deleted && !model.file) {
                                // special case where image data is no longer in local storage (but not flagged as deleted)
                                // (assume that image has already been saved)

                                return;
                            }

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
                        })
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
        syncPromise = syncPromise.then(schedulerYield);

        for(let occurrenceKey of storedObjectKeys.occurrence) {
            syncPromise =syncPromise.then(() => queueSync(occurrenceKey, Occurrence)());

            // queueSync(occurrenceKey, Occurrence);
        }
        syncPromise = syncPromise.then(schedulerYield);

        for(let imageKey of storedObjectKeys.image) {
            syncPromise = syncPromise.then(() => queueSync(imageKey, OccurrenceImage)());


            // queueSync(imageKey, OccurrenceImage);
        }
        syncPromise = syncPromise.then(schedulerYield);

        for(let trackKey of storedObjectKeys.track) {
            syncPromise = syncPromise.then(() => queueSync(trackKey, Track)());
            // queueSync(trackKey, Track);
        }
        syncPromise = syncPromise.then(schedulerYield);

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
            return Promise.resolve();
        } else {
            return syncPromise.then(() => {

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

        /**
         * Recent surveys, that if found to be empty should be purged
         * @type {Set<string>}
         */
        const recentSurveyKeys = new Set();

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
                        // The survey hasn't been modified recently or belongs to a different user

                        if (!(survey.attributes?.defaultCasual && survey.createdInCurrentYear() && survey.userId === this.userId)) {
                            // The survey isn't the set of casual records for the current year for the current user

                            deletionCandidateKeys.survey.push(survey.id);
                        } else {
                            if (survey.modifiedStamp <= recentThresholdStamp &&
                                !survey.attributes?.defaultCasual &&
                                !survey.attributes?.nulllist // NYPH-specific
                            ) {
                                recentSurveyKeys.add(survey.id);
                            }

                            preservedKeys.survey.push(survey.id);
                        }
                    } else {
                        preservedKeys.survey.push(survey.id);
                    }
                })
            );
        }

        const occurrenceMetaData = [];

        for (let occurrenceKey of storedObjectKeys.occurrence) {
            purgePromise = purgePromise.then(() => Model.retrieveRawFromLocal(occurrenceKey, 'occurrence'))
                .then((occurrenceDescriptor) => {
                    occurrenceMetaData[occurrenceMetaData.length] = {
                        id : occurrenceDescriptor.id,
                        surveyId : occurrenceDescriptor.surveyId,
                        deleted : occurrenceDescriptor.deleted,
                        modifiedStamp :  occurrenceDescriptor.modifiedStamp,
                        saveState : occurrenceDescriptor.saveState,
                    };
                });
        }

        purgePromise = purgePromise.then(() => {
            // first pass removes any surveys as deletion candidates if they include occurrences from within the current timeframe
            // (regardless of whether saved or not)
            for (let occurrenceDescriptor of occurrenceMetaData) {
                // occurrence has been modified within the retained window (or is unsaved)
                // then keep the associated survey even if the survey itself is unmodified
                if (
                    ((occurrenceDescriptor.modifiedStamp > thresholdStamp && !occurrenceDescriptor.deleted)
                        || occurrenceDescriptor.saveState !== SAVE_STATE_SERVER)
                    && deletionCandidateKeys.survey.includes(occurrenceDescriptor.surveyId)
                ) {
                    delete deletionCandidateKeys.survey[occurrenceDescriptor.surveyId];

                    if (!preservedKeys.survey.includes(occurrenceDescriptor.surveyId)) {
                        preservedKeys.survey.push(occurrenceDescriptor.surveyId);
                    }
                }

                if (recentSurveyKeys.has(occurrenceDescriptor.surveyId) && !(occurrenceDescriptor.deleted && occurrenceDescriptor.saveState === SAVE_STATE_SERVER)) {
                    // If the occurrence belongs to one of the threshold recent surveys
                    // and hasn't been persistently deleted already, then the survey is not empty so should be retained.
                    //
                    recentSurveyKeys.delete(occurrenceDescriptor.surveyId);
                }
            }

            // having pruned the survey deletion candidates list, mark occurrences from surveys that are still on the deletion list.
            for (let occurrenceDescriptor of occurrenceMetaData) {
                if (deletionCandidateKeys.survey.includes(occurrenceDescriptor.surveyId) || (occurrenceDescriptor.deleted && occurrenceDescriptor.saveState === SAVE_STATE_SERVER)) {
                    deletionCandidateKeys.occurrence.push(occurrenceDescriptor.id);
                } else {
                    preservedKeys.occurrence.push(occurrenceDescriptor.id);
                }
            }

            // add remaining recentish surveys that have no records to the purge list
            deletionCandidateKeys.survey.push(...recentSurveyKeys);

            // allow garbage collection
            occurrenceMetaData.length = 0;
        });

        // // at this point all surveys will have been checked by the time the next thenables are processed
        // for (let occurrenceKey of storedObjectKeys.occurrence) {
        //     purgePromise = purgePromise.then(() => Model.retrieveRawFromLocal(occurrenceKey, 'occurrence'))
        //         .then((occurrenceDescriptor) => {
        //
        //             if (!occurrenceDescriptor.deleted) {
        //                 // See if the occurrence belongs to one of the threshold recent surveys.
        //                 // If so, then the survey is non-empty, so should be kept (so removed from the imperilled recent list)
        //                 recentSurveyKeys.delete(occurrenceDescriptor.surveyId);
        //             }
        //
        //             if (occurrenceDescriptor.saveState !== SAVE_STATE_SERVER) {
        //                 // unsaved remotely
        //                 if (deletionCandidateKeys.survey.includes(occurrenceDescriptor.surveyId)) {
        //                     throw new PurgeInconsistencyError(`Occurrence ${occurrenceDescriptor.id} from deletable survey ${occurrenceDescriptor.surveyId} is unsaved.`);
        //                 } else {
        //                     preservedKeys.occurrence.push(occurrenceDescriptor.id);
        //                 }
        //
        //                 if (occurrenceDescriptor.deleted) {
        //                     // as special-case check for unsaved occurrences newly deleted offline on the recent list
        //                     // which should cause a survey to be retained
        //
        //                     recentSurveyKeys.delete(occurrenceDescriptor.surveyId);
        //
        //                 }
        //             } else if (deletionCandidateKeys.survey.includes(occurrenceDescriptor.surveyId) || occurrenceDescriptor.deleted) {
        //                 deletionCandidateKeys.occurrence.push(occurrenceDescriptor.id);
        //             } else if (!preservedKeys.survey.includes(occurrenceDescriptor.surveyId)) {
        //                 // have an orphaned occurrence
        //                 console.log(`Queueing purge of orphaned occurrence id ${occurrenceDescriptor.id}`);
        //                 deletionCandidateKeys.occurrence.push(occurrenceDescriptor.id);
        //             } else {
        //                 preservedKeys.occurrence.push(occurrenceDescriptor.id);
        //             }
        //         });
        // }

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

        // purgePromise = purgePromise.then(() => {
        //     // add remaining recent surveys that have no records to the purge list
        //     deletionCandidateKeys.survey.push(...recentSurveyKeys);
        // });

        purgePromise = purgePromise.then(
            () => {
                // console.log({'Purging' : deletionCandidateKeys});

                return this._applyPurge(deletionCandidateKeys);
            },
            (reason) => {
                console.error({'purge failed reason' : reason});
                console.log({'would have purged' : deletionCandidateKeys});

                return Logger.logError(`Purge failed: ${JSON.stringify(reason)}`)
                    .then(() => Promise.reject(`Purge failed: ${JSON.stringify(reason)}`));
            });

        return purgePromise;
    }

    /**
     *
     * @param {{survey : Array<string>, occurrence : Array<string>, image : Array<string>, track : Array<string>}} deletionIds
     * @return {Promise<void>}
     * @private
     */
    _applyPurge(deletionIds) {
        let purgePromise = Promise.resolve();

        // local survey list should be cleared first, to avoid the risk of the user selecting a survey mid-purge
        if (deletionIds.survey.length > 0) {
            purgePromise = purgePromise.then(() => {
                    // re-check for the current survey amongst the deletion ids, in case the survey has changed since the purge process started.
                    if (this._currentSurvey?.id && deletionIds.survey.includes(this._currentSurvey.id)) {
                        return Promise.reject(`Cannot purge current survey, '${this._currentSurvey.id}'`);
                    }

                    for (let key of deletionIds.survey) {
                        console.info(`Purging survey id ${key}.`);
                        this.surveys.delete(key);
                    }

                    this.fireEvent(APP_EVENT_SURVEYS_CHANGED);
                })
                .catch((error) => {
                    console.error({'survey deletion error' : {surveyskeys: deletionIds.survey, error}})
                    return Promise.reject({'survey deletion error' : {surveyskeys: deletionIds.survey, error}});
                });
        }

        for (let type in deletionIds) {
            for (let key of deletionIds[type]) {
                purgePromise = purgePromise.then(() => this.forageRemoveItem(`${type}.${key}`))
                    .catch((error) => {
                        console.error({'purge error' : {key: `${type}.${key}`, error}});
                        return Promise.reject({'purge error' : {key: `${type}.${key}`, error}});
                    });
            }
        }

        if (deletionIds.image.length > 0) {
            purgePromise = purgePromise.then(() => this._purgeCachedImages(deletionIds.image))
                .catch((error) => {
                    console.error({'purge images error' : {imagekeys: deletionIds.image, error}});
                    return Promise.reject({'purge images error' : {imagekeys: deletionIds.image, error}});
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
                            // // noinspection JSIgnoredPromiseFromCall
                            // Logger.logError(`Failed to retrieve lastSurveyId ${lastSurveyId}. Resetting current survey and retrying.`);
                            this.currentSurvey = null;
                            return this._restoreOccurrenceImp('', neverAddBlank, setCurrentSurvey, false, false);
                        });
                    } else {
                        // // noinspection JSIgnoredPromiseFromCall
                        // Logger.logError('Failed to retrieve lastSurveyId.');
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
        // noinspection JSUnresolvedReference
        if (navigator.storage?.estimate || performance?.measureUserAgentSpecificMemory) {
            let memory, storage, promise;

            promise = Promise.resolve();

            // noinspection JSUnresolvedReference
            if (performance?.measureUserAgentSpecificMemory) {
                promise = promise.then(() => {
                    // noinspection JSUnresolvedReference
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
                    // // noinspection JSIgnoredPromiseFromCall
                    // Logger.logError(`Switching to pristine survey ${targetSurveyId}.`);

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
                            } else if (!this.currentSurvey && !neverAddBlank && setCurrentSurvey) {
                                // survey doesn't exist
                                // this could have happened in an invalid survey id was provided as a targetSurveyId
                                console.log(`Setting a new survey as current`);
                                this.setNewSurvey();
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

                            this.fireEvent(APP_EVENT_SURVEYS_CHANGED); // the current survey should be set now, so the menu needs refreshing
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
                        })
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
        // as the currentSurvey setter fires an event that may depend on these attributes
        this.currentSurvey = this.addSurvey(newSurvey);
        this.fireEvent(APP_EVENT_NEW_SURVEY);

        if (this.supportsTracking) {
            Track.applyChangedSurveyTrackingResumption(newSurvey);
        }
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Add and set a *new* survey
     *
     * @param survey
     */
    addAndSetSurvey(survey) {
        this.currentSurvey = this.addSurvey(survey);
        this.fireEvent(APP_EVENT_NEW_SURVEY);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * specialised surveys might return an HTML <img> tag string
     *
     * @abstract
     * @param {Survey} survey
     * @returns {string}
     */
    getSurveyTypeMarkerIcon(survey) {
        return '';
    }

    // noinspection JSUnusedGlobalSymbols
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

        // In some cases, more than one project id may be in use (e.g. RecordingApp v's NYPH),
        // so when adding occurrences, use the survey rather than app project id as the source-of-truth.
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
            // unlike above, setting these attributes doesn't affect the modified state of the object
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
                                        console.error({'Failed to retrieve an image': reason});
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
                    return Logger.logError(`Failed to retrieve survey id '${surveyId}' from local set in _restoreSurveyFromLocal().`)
                        .then(() => Promise.reject(`Failed to restore survey id '${surveyId}' from local set.`));
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

    static deleteCacheByPrefix(prefix) {
        return caches.keys()
            .then((cacheNames) => Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName.startsWith(prefix)) {
                            console.log(`Deleting cache: ${cacheName}`);
                            return caches.delete(cacheName);
                        }
                    })
                )
            );
    }
}

