// a Survey captures the currentSurvey meta data
// i.e. it captures site details (name, location); user details (name, email)
//
// if a user were to submit multiple surveys then they would end up in the contact database multiple times
// this is probably unavoidable. Not worth the effort and risk of automatic de-duplication. Email preferences would be
// shared, keyed by email.

import {Model} from "./Model";
//import {SurveyForm} from "../views/forms/SurveyForm";
import {escapeHTML} from "../utils/escapeHTML";
//import {TextGeorefField} from "../views/formfields/TextGeorefField";
//import {Form} from "../views/forms/Form";

export class Survey extends Model {

    /**
     * fired from Survey when the object's contents have been modified
     *
     * @type {string}
     */
    static EVENT_MODIFIED = 'modified';

    SAVE_ENDPOINT = '/savesurvey.php';

    TYPE = 'survey';

    /**
     *
     * @type {Object.<string, *>}
     */
    attributes = {

    };

    /**
     * if set then provide default values (e.g. GPS look-up of current geo-reference)
     *
     * @type {boolean}
     */
    isNew = false;

    /**
     * kludge to flag once the App singleton has set up a listner for changes on the survey
     * @type {boolean}
     */
    hasAppModifiedListener = false;

    /**
     *
     * @returns {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: ({lat: number, lng: number}|null)}|null)}
     */
    get geoReference() {
        return this.attributes.georef || {
            gridRef: '',
            rawString: '', // what was provided by the user to generate this grid-ref (might be a postcode or placename)
            source: 'unknown', //TextGeorefField.GEOREF_SOURCE_UNKNOWN,
            latLng: null,
            precision: null
        };
    };

    get date() {
        return this.attributes.date || '';
    }

    get place() {
        return this.attributes.place || '';
    }

    /**
     * called after the form has changed, before the values have been read back in to the occurrence
     *
     * @param {{form: SurveyForm}} params
     */
    formChangedHandler(params) {
        console.log('Survey change handler invoked.');

        // read new values
        // then fire its own change event (Occurrence.EVENT_MODIFIED)
        params.form.updateModelFromContent();

        console.log('Survey calling conditional validation.');

        // refresh the form's validation state
        params.form.conditionallyValidateForm();

        this.touch();
        this.fireEvent(Survey.EVENT_MODIFIED, {surveyId : this.id});
    }

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
            this.fireEvent(Survey.EVENT_MODIFIED, {surveyId : this.id});
        }
    }

    // /**
    //  *
    //  * @param {SurveyForm} form
    //  */
    // registerForm(form) {
    //     form.model = this;
    //     form.addListener('change', this.formChangedHandler.bind(this));
    //
    //     if (this.isNew) {
    //         form.fireEvent('initialisenew', {}); // allows first-time initialisation of dynamic default data, e.g. starting a GPS fix
    //         form.liveValidation = false;
    //     } else {
    //         form.liveValidation = true;
    //     }
    // }

    /**
     * if not securely saved then makes a post to /savesurvey.php
     *
     * this may be intercepted by a service worker, which could write the image to indexdb
     * a successful save will result in a json response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexdb
     *
     * must test indexdb for this eventuality after the save has returned
     *
     * @returns {Promise}
     */
    save() {
        if (!this._savedRemotely) {
            const formData = new FormData;

            formData.append('type', this.TYPE);
            formData.append('surveyId', this.id);
            formData.append('id', this.id);
            formData.append('projectId', this.projectId.toString());
            formData.append('attributes', JSON.stringify(this.attributes));
            formData.append('deleted', this.deleted.toString());
            formData.append('created', this.createdStamp.toString());

            console.log('queueing survey post');
            return this.queuePost(formData);
        } else {
            return Promise.reject(`${this.id} has already been saved.`);
        }
    }

    /**
     *
     * @returns {string} an html-safe string based on the locality and creation date
     */
    generateSurveyName() {
        let place = (this.attributes.place || (this.attributes.georef && this.attributes.georef.gridRef) || '(unlocalised)').trim();

        const userDate = this.date;
        let dateString;

        if (userDate) {
            dateString = userDate;
        } else {
            const createdDate = new Date(this.createdStamp * 1000);

            try {
                // 'default' locale fails on Edge
                dateString = createdDate.toLocaleString('default', {year: 'numeric', month: 'long', day: 'numeric'});
            } catch (e) {
                dateString = createdDate.toLocaleString('en-GB', {year: 'numeric', month: 'long', day: 'numeric'});
            }
        }

        return `${escapeHTML(place)} ${dateString}`;
    }
}
