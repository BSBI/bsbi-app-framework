// A Survey Definition defines the common characteristics of a repeatable structured survey.

import {Model, SAVE_STATE_LOCAL, SAVE_STATE_SERVER, uuid} from "./Model";
import {SURVEY_DEFINITION_EVENT_MODIFIED, SURVEY_DEFINITION_EVENT_DELETED} from "../framework/AppEvents";
import {Logger} from "../utils/Logger";

/**
 * @typedef {import('bsbi-app-framework-view').Form} Form
 */

export class SurveyDefinition extends Model {

    /**
     * mirrors constructor.name but doesn't get mangled by minification
     *
     * @type {string}
     */
    static className = 'SurveyDefinition';

    SAVE_ENDPOINT = '/savesurveydefinition.php';

    TYPE = 'surveydefinition';

    /**
     *
     * @type {{
     *     [name] : string,
     * }}
     */
    attributes = {};

    /**
     * @type {string}
     */
    surveyType;

    /**
     * if set, then provide default values (e.g. GPS look-up of current geo-reference)
     *
     * @type {boolean}
     */
    isNew = false;

    /**
     * kludge to flag once the App singleton has set up a listener for changes on the survey
     *
     * @type {boolean}
     */
    hasAppModifiedListener = false;

    /**
     * kludge to flag once the App singleton has set up a listener for deletion on the survey
     *
     * @type {boolean}
     */
    hasDeleteListener = false;

    /**
     *
     * @type {string}
     */
    userId = '';

    /**
     * string
     */
    get id() {
        if (!this._id) {
            this._id = uuid();
        } else if (this._id === 'undefined') {
            console.error("id is literal 'undefined', am forcing new id");
            this._id = uuid();
        }

        return this._id;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * called after the form has changed, before the values have been read back in to the object.
     * read new values
     * validate
     * then fire its own change event (Survey.EVENT_MODIFIED)
     * @param {{form: Form}} params
     */
    formChangedHandler(params) {
        console.log('Survey definition change handler invoked.');

        const form = params.form;
        // noinspection JSValidateTypes
        params = null;

        form.updateModelFromContent().then(() => {

            console.log('Survey Definition calling conditional validation.');

            // refresh the form's validation state
            form.conditionallyValidateForm();

            this.touch();
            this.fireEvent(SURVEY_DEFINITION_EVENT_MODIFIED, {surveyId: this.id});
        })
        .catch((error) => {
            // if updateModelFromContent() fails, due to user rejection of dialogue box then intentionally don't want the survey to save
            console.log({"In survey definition form handler, promise rejected (probably normal cancellation of dialogue box)" : error});
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Used for special-case setting of a custom attribute
     * (i.e. not usually one linked to a form)
     * e.g. used for updating the NYPH null-list flag
     *
     * @param attributeName
     * @param value
     */
    setAttribute(attributeName, value) {
        if (this.attributes[attributeName] !== value) {
            this.attributes[attributeName] = value;

            this.touch();
            this.fireEvent(SURVEY_DEFINITION_EVENT_MODIFIED, {surveyDefinitionId : this.id});
        }
    }

    /**
     * if not securely saved, then makes a post to /savesurveydefinition.php
     *
     * This will be intercepted by a service worker.
     * A successful save will result in a JSON response containing the uri from which the object may be retrieved
     * and also the state of persistence (whether or not the object was intercepted by a service worker while offline)
     *
     * If saving fails, then the expectation is that there is no service worker, in which case should attempt to write
     * the object directly to IndexedDB
     *
     * must test IndexedDB for this eventuality after the save has returned
     *
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{}} [params]
     *
     * @returns {Promise}
     */
    save(forceSave = false, isSync = false, params) {
        if (forceSave || this.unsaved()) {
            //const formData = this.formData();

            console.log(`queueing survey definition post ${this.id}`);
            return this.queuePost(isSync);
        } else {
            return Promise.reject(`Survey definition ${this.id} has already been saved.`);
        }
    }

    /**
     *
     * @returns {FormData}
     */
    formData() {
        const formData = new FormData;

        formData.append('type', this.TYPE);
        formData.append('surveyDefinitionId', this.id);
        formData.append('id', this.id); // this is incorrect duplication
        formData.append('projectId', this.projectId.toString());
        formData.append('attributes', JSON.stringify(this.attributes));
        formData.append('deleted', this.deleted.toString());
        formData.append('created', this.createdStamp?.toString?.() || '');
        formData.append('userId', this.userId);

        formData.append('appVersion', Model.bsbiAppVersion);

        return formData;
    }

    /**
     *
     * @returns {Promise<void>}
     */
    storeLocally() {
        return this._storeLocalData({
            id : this.id,
            surveyDefinitionId : this.id, // unsure which id key should be preferred
            type : this.TYPE,
            attributes : this.attributes,
            created : this.createdStamp,
            modified : this.modifiedStamp,
            saveState : this.saveState === SAVE_STATE_SERVER ? SAVE_STATE_SERVER : SAVE_STATE_LOCAL,
            deleted : this.deleted,
            projectId : this.projectId,
            userId : this.userId,
        });
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * Low-level deletion of the survey definition.
     * Does not test whether there are dependencies.
     *
     */
    delete() {
        if (!this.deleted) {
            this.touch();
            this.deleted = true;
            this.save().finally(() => {
                this.fireEvent(SURVEY_DEFINITION_EVENT_DELETED, {surveyDefinitionId : this.id});
            });
        }
    }

    /**
     *
     * @param {{
     *      id : string,
     *      saveState: string,
     *      userId: string,
     *      attributes: Object.<string, *>,
     *      deleted: boolean|string,
     *      created: (number|string),
     *      modified: (number|string),
     *      projectId: (number|string),
     *      surveyType: string,
     *      }} descriptor
     */
    _parseDescriptor(descriptor) {
        this.surveyType = descriptor.surveyType;
        super._parseDescriptor(descriptor);
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {SurveyDefinition} newSurveyDefinition
     * @returns {SurveyDefinition}
     */
    mergeUpdate(newSurveyDefinition) {
        if (newSurveyDefinition.id !== this._id) {
            throw new Error(`Survey Definition merge id mismatch: ${newSurveyDefinition.id} !== ${this._id}`);
        }

        if (!(this.isPristine || this._savedLocally)) {
            console.error(`Dangerous merge with unsaved local survey definition, for id ${this._id}`);
            // noinspection JSIgnoredPromiseFromCall
            Logger.logError(`Dangerous merge with unsaved local survey definition, for id ${this._id}`);
        }

        Object.assign(this.attributes, newSurveyDefinition.attributes);

        this.userId = newSurveyDefinition.userId; // generally, this should be the same anyway
        this.deleted = newSurveyDefinition.deleted; // probably doesn't change here
        //this.createdStamp = newSurvey.createdStamp; // should be the same
        this.modifiedStamp = newSurveyDefinition.modifiedStamp;
        this.projectId = newSurveyDefinition.projectId; // generally, this should be the same anyway
        this.isPristine = newSurveyDefinition.isPristine;
        this.surveyType = newSurveyDefinition.surveyType;

        return this;
    }

    destructor() {
        super.destructor();
        this.hasAppModifiedListener = false;
        this.hasDeleteListener = false;
    }
}
