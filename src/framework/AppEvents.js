/**
 * Event fired when user requests a new blank survey
 *
 * @type {string}
 */
export const APP_EVENT_ADD_SURVEY_USER_REQUEST = 'useraddsurveyrequest';

/**
 * Event fired when user requests a reset (local clearance) of all surveys
 * @type {string}
 */
export const APP_EVENT_RESET_SURVEYS = 'userresetsurveys';

/**
 * Fired after App.currentSurvey has been set to a new blank survey
 * the survey will be accessible in App.currentSurvey
 *
 * @type {string}
 */
export const APP_EVENT_NEW_SURVEY = 'newsurvey';

/**
 * Fired when a brand-new occurrence is added
 *
 * @type {string}
 */
export const APP_EVENT_OCCURRENCE_ADDED = 'occurrenceadded';

/**
 * Fired when new user preferences are first restored from local storage
 *
 * @type {string}
 */
export const APP_EVENT_OPTIONS_RESTORED = 'optionsrestored';

/**
 * Fired when a survey is retrieved from local storage
 * parameter is {survey : Survey}
 *
 * @type {string}
 */
export const APP_EVENT_SURVEY_LOADED = 'surveyloaded';

/**
 * Fired when an occurrence is retrieved from local storage or newly initialised
 * parameter is {occurrence : Occurrence}
 *
 * @type {string}
 */
export const APP_EVENT_OCCURRENCE_LOADED = 'occurrenceloaded';

export const APP_EVENT_CURRENT_OCCURRENCE_CHANGED = 'currentoccurrencechanged';

/**
 * Fired when the selected current survey id is changed
 * parameter is {newSurvey : Survey|null}
 *
 * (this is not fired for modification of the survey content)
 *
 * @type {string}
 */
export const APP_EVENT_CURRENT_SURVEY_CHANGED = 'currentsurveychanged';

/**
 * Fired if the surveys list might need updating (as a survey has been added, removed or changed)
 *
 * @type {string}
 */
export const APP_EVENT_SURVEYS_CHANGED = 'surveyschanged';

/**
 * Fired after fully-successful sync-all
 * (or if sync-all resolved with nothing to send)
 *
 * @todo this is misleading as in fact is fired when all saved to indexeddb or to server
 *
 * @type {string}
 */
export const APP_EVENT_ALL_SYNCED_TO_SERVER = 'allsyncedtoserver';

/**
 * fired if sync-all called, but one or more objects failed to be stored
 *
 * @type {string}
 */
export const APP_EVENT_SYNC_ALL_FAILED = 'syncallfailed';

export const APP_EVENT_USER_LOGIN = 'login';

export const APP_EVENT_USER_LOGOUT = 'logout';

/**
 * Fired when watching of GPS has been granted following user request.
 *
 * @type {string}
 */
export const APP_EVENT_WATCH_GPS_USER_REQUEST = 'watchgps';

/**
 * fired when GPS tracking should cease
 * parameter 'auto' set if this was triggered by a non-explicit user action
 *
 * @type {string}
 */
export const APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST = 'cancelgpswatch';