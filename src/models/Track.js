import {Model} from "./Model";
import {DeviceType} from "../utils/DeviceType";
import {
    APP_EVENT_CANCEL_WATCHED_GPS_USER_REQUEST,
    APP_EVENT_CURRENT_SURVEY_CHANGED,
    APP_EVENT_WATCH_GPS_USER_REQUEST,
    SURVEY_EVENT_MODIFIED,
    SURVEY_EVENT_OCCURRENCES_CHANGED
} from "../framework/AppEvents";

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

export class Track extends Model {

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
     * Unix timestamp of most recent co-ordinate ping, in ms
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
                app.addListener(APP_EVENT_CURRENT_SURVEY_CHANGED, () => {
                    const survey = Track._app.currentSurvey;

                    if (!survey || Track._currentlyTrackedSurveyId !== survey.id) {
                        /**
                         *
                         * @type {null|Survey}
                         */
                        let previouslyTrackedSurvey = null;

                        if (Track._currentlyTrackedSurveyId) {
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
                                    console.log(`Tracking for survey ${oldTrack.surveyId} saved following survey change.`)
                                });
                            } else {
                                console.error(`Failed to retrieve old track for survey ${Track._currentlyTrackedSurveyId} in survey changed event handler.`)
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
                            console.log(`Tracking for survey ${track.surveyId} saved following tracking change.`)
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
            // Resume existing tracking, or start a new track.

            console.log('continuing tracking for survey with common baseSurvey')
            Track._trackSurvey(survey);
            Track.trackingIsActive = true;
        } else if (survey && !survey.attributes?.casual && survey.isToday() !== false) {
            // Dependent on user preferences may restart tracking
            const trackingLocation = Track._app.getOption('trackLocation');

            if (trackingLocation) {
                // start tracking

                console.log('start tracking for survey based on user preference')
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
                        currentSurvey.save().then(() => {
                                return track.save();
                            }
                        );
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
                            console.log(`Tracking for survey ${this.surveyId} saved following survey date change.`)
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
                        console.log(`Tracking for survey ${this.surveyId} saved following occurrence change.`)
                    });
                }
            });
        }
    }

    removeSurveyChangeListener() {
        const survey = Track._app.surveys.get(this.surveyId);

        survey?.removeListener(SURVEY_EVENT_MODIFIED, this._surveyChangeListenerHandle);
        this._surveyChangeListenerHandle = undefined;
    }
}
