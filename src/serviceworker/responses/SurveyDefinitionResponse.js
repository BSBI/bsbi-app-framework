import {ResponseFactory} from "./ResponseFactory";
import {LocalResponse} from "./LocalResponse";
import {SAVE_STATE_LOCAL, SAVE_STATE_SERVER} from "../../models/Model";

export class SurveyDefinitionResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store survey definition.';
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
        this.returnedToClient.surveyDefinitionId = this.toSaveLocally.id || this.toSaveLocally.surveyDefinitionId; // hedging
        this.returnedToClient.id = this.toSaveLocally.id ? this.toSaveLocally.id : this.toSaveLocally.surveyDefinitionId; // hedging
        this.returnedToClient.type = 'surveydefinition';
        this.returnedToClient.attributes = this.toSaveLocally.attributes;
        this.returnedToClient.created = this.toSaveLocally.created; // stamps from server always take precedence
        this.returnedToClient.modified = this.toSaveLocally.modified;
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted;
        this.returnedToClient.projectId = this.toSaveLocally.projectId;
        this.returnedToClient.userId = this.toSaveLocally.userId || '';
        this.returnedToClient.surveyType = this.toSaveLocally.surveyType;
        this.returnedToClient.inUse = this.toSaveLocally.inUse;
        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.surveyDefinitionId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyDefinitionId;
        this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyDefinitionId;
        this.toSaveLocally.type = 'surveydefinition';
        this.toSaveLocally.attributes = this.returnedToClient.attributes;
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = this.returnedToClient.deleted;
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.userId = this.returnedToClient.userId || '';
        this.toSaveLocally.surveyType = this.returnedToClient.surveyType;
        this.toSaveLocally.inUse = this.returnedToClient.inUse;
        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `surveydefinition.${this.toSaveLocally.surveyDefinitionId}`;
    }

    static register() {
        ResponseFactory.responses.surveydefinition = SurveyDefinitionResponse;
    }
}
