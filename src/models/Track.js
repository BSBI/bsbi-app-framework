import {Model} from "./Model";
//import {Survey} from "./Survey";

export class Track extends Model {

    /**
     * @typedef PointTriplet
     * @type {array}
     * @property {number} 0 lng
     * @property {number} 1 lat
     * @property {number} 2 stamp (seconds since epoch)
     */

    /**
     * @typedef PointSeries
     * @type {array}
     * @property {Array<PointTriplet>} 0 points
     * @property {string} 1 end reason code
     */

    /**
     *
     * @type {Object}
     */
    attributes = {};

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
     * @param {boolean} [forceSave]
     * @returns {Promise}
     */
    save(forceSave = false) {
        if (this.unsaved() || forceSave) {
            const formData = new FormData;

            if (!this.surveyId) {
                throw new Error(`Survey id must be set before saving an occurrence.`);
            }

            if (!this.deviceId) {
                throw new Error(`Device id must be set before saving an occurrence.`);
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
            return this.queuePost(formData);
        } else {
            return Promise.reject(`Track for survey ${this.surveyId} has already been saved.`);
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
     *      points: string,
     *      }} descriptor
     * @param {string} descriptor.points JSON-serialized Array<PointSeries>
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this.surveyId = descriptor.surveyId;
        this.deviceId = descriptor.deviceId;
        this.pointIndex = parseInt(descriptor.pointIndex, 10);
        this.points = JSON.parse(descriptor.points);
    }

    /**
     * @todo implement Track.registerSurvey()
     *
     * @param {Survey} survey
     * @param {App} app
     *
     */
    registerSurvey(survey, app) {

    }
}
