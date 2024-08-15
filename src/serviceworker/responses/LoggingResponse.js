import {ResponseFactory} from "./ResponseFactory";
import {LocalResponse} from "./LocalResponse";
import {SAVE_STATE_LOCAL, SAVE_STATE_SERVER} from "../../models/Model";

export class LoggingResponse extends LocalResponse {
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
        this.returnedToClient.type = 'log';
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
     * @param {boolean} remoteSuccess set if object has been saved remotely
     * @returns {Promise<Response>}
     */
    storeLocally(remoteSuccess = true) {
        if (remoteSuccess) {
            // log has been sent to the server so no need to save locally
            return this.prebuiltResponse ? this.prebuiltResponse : packageClientResponse(this.returnedToClient);
        } else {
            return super.storeLocally(remoteSuccess);
        }
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `log.${this.toSaveLocally.id}`;
    }

    static register() {
        ResponseFactory.responses.log = LoggingResponse;
    }
}
