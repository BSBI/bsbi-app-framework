import {Model} from "./Model";
import {Taxon} from "./Taxon";
import {GridRef} from 'british-isles-gridrefs'

export class Occurrence extends Model {

    /**
     *
     * @type {Object.<string, *>}
     */
    attributes = {
        // taxon: {
        //     taxonId: '',
        //     taxonName: '',
        //     vernacularMatch: false
        // }
    };

    /**
     *
     * @type {string}
     */
    userId = '';

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

    SAVE_ENDPOINT = '/saveoccurrence.php';

    TYPE = 'occurrence';

    /**
     * fired from Occurrence when the object's contents have been modified
     *
     * @type {string}
     */
    static EVENT_MODIFIED = 'modified';

    /**
     * set if this is a new entry (before user has moved on to the next entry)
     * influences whether form validation errors are displayed
     *
     * @type {boolean}
     */
    isNew = false;

    /**
     *
     * @returns {(Taxon|null)} returns null for unmatched taxa specified by name
     */
    get taxon() {
        return this.attributes.taxon && this.attributes.taxon.taxonId ? Taxon.fromId(this.attributes.taxon.taxonId) : null;
    };

    // /**
    //  *
    //  * @param {OccurrenceForm} form
    //  * @returns {OccurrenceForm}
    //  */
    // setForm(form) {
    //     form.addListener(Form.CHANGE_EVENT, this.formChangedHandler.bind(this));
    //
    //     if (!this.isNew) {
    //         form.liveValidation = true;
    //     }
    //     return form;
    // }

    /**
     * called after the form has changed, before the values have been read back in to the occurrence
     *
     * @param {{form: Form}} params
     */
    formChangedHandler(params) {
        console.log('Occurrence change handler invoked.');

        // read new values
        // then fire its own change event (Occurrence.EVENT_MODIFIED)
        params.form.updateModelFromContent();

        // refresh the form's validation state
        params.form.conditionallyValidateForm();

        this.touch();
        this.fireEvent(Occurrence.EVENT_MODIFIED, {occurrenceId : this.id});
    }

    delete() {
        if (!this.deleted) {
            this.touch();
            this.deleted = true;

            this.fireEvent(Occurrence.EVENT_MODIFIED, {occurrenceId : this.id});
        }
    }

    /**
     * if not securely saved then makes a post to /saveoccurrence.php
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
     * @param {string} surveyId
     * @returns {Promise}
     */
    save(surveyId) {
        if (!this._savedRemotely) {
            const formData = new FormData;

            if (!surveyId && this.surveyId) {
                surveyId = this.surveyId;
            }

            formData.append('type', this.TYPE);
            formData.append('surveyId', surveyId);
            formData.append('occurrenceId', this.id);
            formData.append('id', this.id);
            formData.append('projectId', this.projectId.toString());
            formData.append('attributes', JSON.stringify(this.attributes));
            formData.append('deleted', this.deleted.toString());
            formData.append('created', this.createdStamp?.toString() || '');
            formData.append('modified', this.modifiedStamp?.toString() || '');

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            console.log('queueing occurrence post');
            return this.queuePost(formData);
        } else {
            return Promise.reject(`${this.id} has already been saved.`);
        }
    }

    /**
     *
     * @param {{id : string, saveState: string, attributes: Object.<string, *>, deleted: boolean|string, created: number, modified: number, projectId: number, surveyId: string}} descriptor
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this.surveyId = descriptor.surveyId;
    }

    /**
     * returns interpreted grid-ref / vc summary, used to look-up meta-data for the taxon list
     *
     * @return {{
     *     hectad : string,
     *     tetrad : string,
     *     monad : string,
     *     country : string,
     *     vc : int[]
     * }}
     */
    getGeoContext() {
        const geoRef = this.geoReference;

        const result = {};

        if (this.attributes.vc?.selection) {
            result.vc = [...this.attributes.vc.selection]; // clone rather than reference the VC selection
        } else {
            result.vc = [];
        }

        if (geoRef?.gridRef) {
            const gridRef = GridRef.from_string(geoRef.gridRef);

            if (gridRef) {
                if (gridRef.length <= 1000) {
                    result.monad = gridRef.gridCoords.to_gridref(1000);
                }

                if (gridRef.length <= 2000) {
                    result.tetrad = gridRef.gridCoords.to_gridref(2000);
                }

                result.country = gridRef.country;
            }

            result.hectad = gridRef.gridCoords.to_gridref(10000);
        }

        return {...{hectad : '', tetrad : '', monad : '', country : '', vc : []}, ...result};
    }

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
}
