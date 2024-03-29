import {ResponseFactory} from "./ResponseFactory";
import {LocalResponse} from "./LocalResponse";
import {SAVE_STATE_LOCAL, SAVE_STATE_SERVER} from "../../models/Model";

export class SurveyResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store survey.';
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
        this.returnedToClient.surveyId = this.toSaveLocally.id || this.toSaveLocally.surveyId; // hedging
        this.returnedToClient.id = this.toSaveLocally.id ? this.toSaveLocally.id : this.toSaveLocally.surveyId; // hedging
        this.returnedToClient.baseSurveyId = this.toSaveLocally.baseSurveyId || this.returnedToClient.id;
        this.returnedToClient.type = 'survey';
        this.returnedToClient.attributes = this.toSaveLocally.attributes;
        this.returnedToClient.created = this.toSaveLocally.created; // stamps from server always take precedence
        this.returnedToClient.modified = this.toSaveLocally.modified;
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted;
        this.returnedToClient.projectId = this.toSaveLocally.projectId;
        this.returnedToClient.userId = this.toSaveLocally.userId || '';
        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.surveyId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId;
        this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.surveyId;
        this.toSaveLocally.baseSurveyId = this.returnedToClient.baseSurveyId || this.toSaveLocally.id;
        this.toSaveLocally.type = 'survey';
        this.toSaveLocally.attributes = this.returnedToClient.attributes;
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = this.returnedToClient.deleted;
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.userId = this.returnedToClient.userId || '';
        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `survey.${this.toSaveLocally.surveyId}`;
    }

    static register() {
        ResponseFactory.responses.survey = SurveyResponse;
    }
}
