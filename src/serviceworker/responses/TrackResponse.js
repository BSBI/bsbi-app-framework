import {ResponseFactory} from "./ResponseFactory";
import {LocalResponse} from "./LocalResponse";
import {SAVE_STATE_LOCAL, SAVE_STATE_SERVER} from "../../models/Model";

export class TrackResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store tracking data.';
    failureErrorHelp = 'Your internet connection may have failed (or there could be a problem with the server). ' +
        'It wasn\'t possible to save a temporary copy on your device. Perhaps there is insufficient space? ' +
        'Please try to re-establish a network connection and try again.';

    /**
     * called to build the response to the post that is returned to the client
     * in the absence of the remote server
     *
     * @returns {this}
     */
    populateClientResponse() {
        this.returnedToClient.surveyId = this.toSaveLocally.surveyId;
        this.returnedToClient.deviceId = this.toSaveLocally.deviceId;
        this.returnedToClient.type = 'track';
        this.returnedToClient.attributes = this.toSaveLocally.attributes;
        this.returnedToClient.created = this.toSaveLocally.created; // stamps from server always take precedence
        this.returnedToClient.modified = this.toSaveLocally.modified;
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted || '';
        this.returnedToClient.projectId = this.toSaveLocally.projectId;
        this.returnedToClient.userId = this.toSaveLocally.userId || '';
        this.returnedToClient.pointIndex = this.toSaveLocally.pointIndex;
        this.returnedToClient.points = this.toSaveLocally.points;
        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.surveyId = this.returnedToClient.surveyId;
        this.toSaveLocally.deviceId = this.returnedToClient.deviceId;
        this.toSaveLocally.type = 'track';
        this.toSaveLocally.attributes = this.returnedToClient.attributes;
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = this.returnedToClient.deleted;
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.userId = this.returnedToClient.userId || '';
        this.toSaveLocally.pointIndex = parseInt(this.returnedToClient.pointIndex, 10);
        this.toSaveLocally.points = this.returnedToClient.points; // may eventually want to truncate this to save local space
        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        if (!this.toSaveLocally.deviceId || this.toSaveLocally.deviceId === 'undefined') {
            throw new Error(`Cannot generate a localKey for track, as the device id is undefined.`);
        }

        return `track.${this.toSaveLocally.surveyId}.${this.toSaveLocally.deviceId}`;
    }

    static register() {
        ResponseFactory.responses.track = TrackResponse;
    }
}
