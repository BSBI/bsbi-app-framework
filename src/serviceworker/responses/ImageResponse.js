import {ResponseFactory} from "./ResponseFactory";
import {LocalResponse} from "./LocalResponse";
import {SAVE_STATE_LOCAL, SAVE_STATE_SERVER} from "../../models/Model";
import {IMAGE_CONTEXT_OCCURRENCE} from "../../models/OccurrenceImage";

export class ImageResponse extends LocalResponse {
    failureErrorMessage = 'Failed to store image.';
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
        this.returnedToClient.id = this.toSaveLocally.imageId ? this.toSaveLocally.imageId : this.toSaveLocally.id;
        this.returnedToClient.imageId = this.toSaveLocally.imageId ? this.toSaveLocally.imageId : this.toSaveLocally.id;
        this.returnedToClient.type = 'image';
        this.returnedToClient.surveyId = this.toSaveLocally.surveyId;
        this.returnedToClient.created = parseInt(this.toSaveLocally.created, 10); // stamps from server always take precedence
        this.returnedToClient.modified = parseInt(this.toSaveLocally.modified, 10);
        this.returnedToClient.saveState = SAVE_STATE_LOCAL;
        this.returnedToClient.deleted = this.toSaveLocally.deleted;
        this.returnedToClient.projectId = parseInt(this.toSaveLocally.projectId, 10);
        this.returnedToClient.context = this.toSaveLocally.context || IMAGE_CONTEXT_OCCURRENCE;

        if (this.toSaveLocally.context !== 'survey') {
            this.returnedToClient.occurrenceId = this.toSaveLocally.occurrenceId;
        }

        return this;
    }

    /**
     * called to mirror a response from the server locally
     *
     * @returns {this}
     */
    populateLocalSave() {
        this.toSaveLocally.surveyId = this.returnedToClient.surveyId;
        this.toSaveLocally.type = 'image';
        this.toSaveLocally.imageId = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.imageId; // hedging
        this.toSaveLocally.id = this.returnedToClient.id ? this.returnedToClient.id : this.returnedToClient.imageId; // hedging
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10); // stamps from server always take precedence
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = (this.returnedToClient.deleted === true || this.returnedToClient.deleted === 'true');
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.context = this.returnedToClient.context || 'occurrence'; // don't use OccurrenceImage.CONTEXT_OCCURRENCE as don't otherwise need the import

        if (this.returnedToClient.context !== 'survey') {
            this.toSaveLocally.occurrenceId = this.returnedToClient.occurrenceId;
        }

        return this;
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `image.${this.toSaveLocally.imageId}`;
    }

    static register() {
        ResponseFactory.responses.image = ImageResponse;
    }
}
