import {SAVE_STATE_LOCAL} from "../../models/Model";

export class ResponseFactory {
    static responses = {};

    /**
     *
     * @param {FormData} formData
     * @returns {LocalResponse}
     * @throws {Error}
     */
    static fromPostedData(formData) {
        /**
         * the object that will be saved to IndexedDb
         *
         * this needs to be in scope for several stages of the promise chain
         * @type {{[saved]: string, [type]: string, [imageId]: string, [surveyId]: string, [occurrenceId]: string, [image]: file, [projectId]: number, saveState: string }}
         */
        const toSaveLocally = {
            saveState: SAVE_STATE_LOCAL // mark as not saved externally
        };

        for(let pair of formData.entries()) {
            toSaveLocally[pair[0]] = pair[1];
        }

        if (!toSaveLocally.type) {
            throw new Error('Missing type in form data.');
        }

        if (ResponseFactory.responses.hasOwnProperty(toSaveLocally.type)) {
            return new ResponseFactory.responses[toSaveLocally.type](toSaveLocally, {});
        } else {
            throw new Error(`Unrecognised post type '${toSaveLocally.type}'`);
        }
    }

    /**
     *
     * @param {{}} modelData the object that will be saved to IndexedDb
     * @returns {LocalResponse}
     * @throws {Error}
     */
    static fromModelData(modelData) {
        modelData.saveState = SAVE_STATE_LOCAL;

        if (!modelData.type) {
            throw new Error('Missing type in model data.');
        }

        if (ResponseFactory.responses.hasOwnProperty(modelData.type)) {
            return new ResponseFactory.responses[modelData.type](modelData, {});
        } else {
            throw new Error(`Unrecognised post type '${modelData.type}'`);
        }
    }

    /**
     *
     * @returns {LocalResponse} returnedToClient
     */
    static fromPostResponse(returnedToClient) {
        if (!returnedToClient) {
            throw new Error('Invalid empty post response.');
        }

        if (!returnedToClient.type) {
            throw new Error('Missing type in returned response.');
        }

        if (ResponseFactory.responses.hasOwnProperty(returnedToClient.type)) {
            //console.log(`in fromPostResponse returning a ${returnedToClient.type}`);
            return new ResponseFactory.responses[returnedToClient.type]({}, returnedToClient);
        } else {
            throw new Error(`Unrecognised post type '${returnedToClient.type}'`);
        }
    }
}
