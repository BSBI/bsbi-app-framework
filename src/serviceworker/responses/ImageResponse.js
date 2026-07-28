import {ResponseFactory} from "./ResponseFactory";
import {LocalResponse} from "./LocalResponse";
import {SAVE_STATE_LOCAL, SAVE_STATE_SERVER} from "../../utils/constants";
import {IMAGE_CONTEXT_OCCURRENCE, IMAGE_CONTEXT_SURVEY} from "../../models/OccurrenceImage";
import {ImageFileStore} from "../../framework/ImageFileStore.js";

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
        // kludge to deal with corrupted survey ids
        if (this.toSaveLocally.surveyId === true
            || this.toSaveLocally.surveyId === false
            || this.toSaveLocally.surveyId === 'true'
            || this.toSaveLocally.surveyId === 'false'
        ) {
            this.toSaveLocally.surveyId = '';
        }

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
        this.returnedToClient.hasFile = !!this.toSaveLocally.hasFile;
        this.returnedToClient.fileSize = this.toSaveLocally.fileSize || 0;
        this.returnedToClient.fileType = this.toSaveLocally.fileType || '';

        if (this.toSaveLocally.context !== IMAGE_CONTEXT_SURVEY) {
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
        this.toSaveLocally.created = parseInt(this.returnedToClient.created, 10);
        this.toSaveLocally.modified = parseInt(this.returnedToClient.modified, 10);
        this.toSaveLocally.saveState = this.returnedToClient.saveState || SAVE_STATE_SERVER; //SAVE_STATE_SERVER;
        this.toSaveLocally.deleted = (this.returnedToClient.deleted === true || this.returnedToClient.deleted === 'true');
        this.toSaveLocally.projectId = parseInt(this.returnedToClient.projectId, 10);
        this.toSaveLocally.context = this.returnedToClient.context || IMAGE_CONTEXT_OCCURRENCE;

        if (this.returnedToClient.context !== IMAGE_CONTEXT_SURVEY) {
            this.toSaveLocally.occurrenceId = this.returnedToClient.occurrenceId;
        }

        // A server acknowledgement means the binary is safely uploaded, so the local copy is dropped
        // (this was previously implicit, as the record was overwritten without its inline image).
        // Now that binaries live in their own store, hasFile: false drives their explicit removal
        // in storeLocally(), otherwise they would accumulate indefinitely.
        this.toSaveLocally.hasFile = false;
        this.toSaveLocally.fileSize = 0;
        this.toSaveLocally.fileType = '';

        return this;
    }

    /**
     * Diverts the binary to ImageFileStore so that it never enters the image record itself.
     *
     * @param {boolean} remoteSuccess
     * @returns {Promise}
     */
    storeLocally(remoteSuccess = true) {
        const imageId = this.toSaveLocally.imageId || this.toSaveLocally.id;

        // 'image' is only ever a transient carrier — strip it before the record is written.
        const file = this.toSaveLocally.image;
        delete this.toSaveLocally.image;

        // hasFile is the single source of truth: false means any stored binary is now redundant,
        // whether because the server has acknowledged it or because the image was deleted.
        const filePromise = file ?
            ImageFileStore.setFile(imageId, file)
            :
            (this.toSaveLocally.hasFile ? Promise.resolve() : ImageFileStore.removeFile(imageId));

        // The binary is written first: a record claiming hasFile with no binary behind it is worse
        // than a binary with no record, which the purge will collect as an orphan.
        return filePromise.then(() => super.storeLocally(remoteSuccess));
    }

    /**
     *
     * @returns {string}
     */
    localKey() {
        return `image.${this.toSaveLocally.imageId || this.toSaveLocally.id}`; // shouldn't need to hedge this
    }

    static register() {
        ResponseFactory.responses.image = ImageResponse;
    }
}
