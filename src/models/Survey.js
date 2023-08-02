// a Survey captures the currentSurvey meta-data
// i.e. it captures site details (name, location); user details (name, email)
//
// if a user were to submit multiple surveys then they would end up in the contact database multiple times
// this is probably unavoidable. Not worth the effort and risk of automatic de-duplication. Email preferences would be
// shared, keyed by email.

import {Model} from "./Model";
import {escapeHTML} from "../utils/escapeHTML";
import {GridRef} from 'british-isles-gridrefs'

export class Survey extends Model {

    /**
     * fired from Survey when the object's contents have been modified
     *
     * parameter is {surveyId : string}
     *
     * @type {string}
     */
    static EVENT_MODIFIED = 'modified';

    /**
     * fired on Survey when one of its occurrences has been modified, added, deleted or reloaded
     *
     * no parameters
     *
     * @type {string}
     */
    static EVENT_OCCURRENCES_CHANGED = 'occurrenceschanged';

    /**
     * parameter is {currentHectadSubunit : string}
     *
     * @type {string}
     */
    static EVENT_TETRAD_SUBUNIT_CHANGED = 'tetradsubunitchanged';

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
     * kludge to flag once the App singleton has set up a listener for changes on the survey
     * @type {boolean}
     */
    hasAppModifiedListener = false;

    /**
     *
     * @type {string}
     */
    userId = '';

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

    /**
     * Set for tetrad structured surveys, where user may be working within a monad subdivision
     *
     * @type {string}
     */
    currentHectadSubunit = '';

    /**
     * Get a (current) grid-square from the survey geo-reference
     * If the user has explicitly specified a centroid-based survey then the result will instead be a centroid
     *
     * For structured tetrad surveys squareReference will return the currently selected monad within the tetrad (or tetrad if 2km scale selected)
     * For monad or 100m square surveys will return grid-ref at that resolution
     *
     * @returns {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: ({lat: number, lng: number}|null)}|null)}
     */
    get squareReference() {
        if (this.attributes?.sampleUnit?.selection?.[0]) {
            let n = parseInt(this.attributes.sampleUnit.selection[0], 10);

            if (n > 0) {
                // have user-specified square precision value

                if (n === 2000 && this.currentHectadSubunit) {
                    // special-case treatment of tetrad surveys using a monad subdivision

                    return {
                        gridRef: this.currentHectadSubunit,
                        rawString: this.currentHectadSubunit,
                        source: 'unknown',
                        latLng: null,
                        precision: /[A-Z]$/.test(this.currentHectadSubunit) ? 2000 : 1000
                    }
                }

                const ref = this.geoReference;
                const gridRef = GridRef.from_string(ref.gridRef);

                if (gridRef && gridRef.length <= n) {
                    const newRef = gridRef.gridCoords.to_gridref(n);

                    if (n === 2000) {
                        this.currentHectadSubunit = newRef;
                    }

                    return {
                        gridRef: newRef,
                        rawString: newRef,
                        source: 'unknown',
                        latLng: null,
                        precision: n
                    }
                } else {
                    return {
                        gridRef: '',
                        rawString: '',
                        source: 'unknown',
                        latLng: null,
                        precision: null
                    }
                }
            } else {
                switch (this.attributes.sampleUnit.selection[0]) {
                    case 'centroid':
                        return this.geoReference;

                    case 'other':
                        return this._infer_square_ref_from_survey_ref();

                    default:
                        throw new Error(`Unrecognized sample unit value '${this.attributes.sampleUnit.selection[0]}'`);
                }
            }
        } else {
            return this._infer_square_ref_from_survey_ref();
        }
    }

    /**
     *
     * @returns {{rawString: string, precision: null, source: string, gridRef: string, latLng: null}|{rawString, precision: null, source: string, gridRef, latLng: null}}
     * @private
     */
    _infer_square_ref_from_survey_ref() {
        if (this.attributes.georef && this.attributes.georef.gridRef && this.attributes.georef.precision <= 2000) {
            let newRef;

            if (this.attributes.georef.precision === 2000 || this.attributes.georef.precision === 1000) {
                newRef = this.attributes.georef.gridRef;
            } else {
                // this is really inefficient
                const context = this.getGeoContext();
                newRef = context.monad || context.tetrad;
            }

            return {
                gridRef: newRef,
                rawString: newRef,
                source: 'unknown',
                latLng: null,
                precision: this.attributes.georef.precision
            }
        } else {
            return {
                gridRef: '',
                rawString: '', // what was provided by the user to generate this grid-ref (might be a postcode or placename)
                source: 'unknown', //TextGeorefField.GEOREF_SOURCE_UNKNOWN,
                latLng: null,
                precision: null
            }
        }
    }

    /**
     *
     * @returns {string}
     */
    get date() {
        return this.attributes.date || '';
    }

    /**
     * @returns {boolean}
     */
    isToday() {
        //const date = this.date;
        //const now = (new Date).toJSON().slice(0,10);

        //console.log(`Date matching '${date}' with '${now}'`);
        return this.date === (new Date).toJSON().slice(0,10);
    }

    get place() {
        return this.attributes.place || '';
    }

    /**
     * called after the form has changed, before the values have been read back in to the occurrence
     * read new values
     * validate
     * then fire its own change event (Survey.EVENT_MODIFIED)
     * @param {{form: SurveyForm}} params
     */
    formChangedHandler(params) {
        console.log('Survey change handler invoked.');

        params.form.updateModelFromContent().then(() => {

            console.log('Survey calling conditional validation.');

            // refresh the form's validation state
            params.form.conditionallyValidateForm();

            this.touch();
            this.fireEvent(Survey.EVENT_MODIFIED, {surveyId: this.id});
        });
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

    /**
     * returns interpreted grid-ref / vc summary, used to look-up meta-data for the taxon list
     *
     * @return {{
     *     hectad : string,
     *     tetrad : string,
     *     monad : string,
     *     country : string,
     *     vc : int[],
     *     interleavedGridRef : string,
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

            result.interleavedGridRef = GridRef.interleave(geoRef.gridRef);
        }

        return {...{hectad : '', tetrad : '', monad : '', country : '', vc : [], interleavedGridRef : ''}, ...result};
    }

    /**
     * if not securely saved then makes a post to /savesurvey.php
     *
     * this may be intercepted by a service worker, which could write the image to indexdb
     * a successful save will result in a json response containing the uri from which the object may be retrieved
     * and also the state of persistence (whether or not the object was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the object directly to indexdb
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
            formData.append('created', this.createdStamp?.toString() || '');

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            console.log('queueing survey post');
            return this.queuePost(formData);
        } else {
            return Promise.reject(`${this.id} has already been saved.`);
        }
    }

    /**
     * @param {{summarySquarePrecision : number, summarizeTetrad : boolean}} options
     * @returns {string} an html-safe string based on the locality and creation date
     */
    generateSurveyName(options = {
        summarySquarePrecision : 1000,
        summarizeTetrad : false,
    }) {

        if (this.attributes.casual) {
            // special-case treatment of surveys with 'casual' attribute (which won't have a locality or date as part of the survey)

            return this.attributes.surveyName ?
                escapeHTML(this.attributes.surveyName)
                :
                `Data-set created on ${this._createdDateString()}`;
        } else {
            let place;

            if (this.attributes.place) {
                let summaryGridRef = this._summarySquareString(options.summarySquarePrecision);

                // if (options.summarySquarePrecision && this.attributes.georef?.gridRef) {
                //     // '<' replacement used simplistically to sanitize against script injection
                //     const gridRef = GridRef.from_string(this.attributes.georef.gridRef.replace(/[<&]/g, ''));
                //
                //     summaryGridRef = ` ${gridRef?.gridCoords?.to_gridref(gridRef.length <= options.summarySquarePrecision ? options.summarySquarePrecision : gridRef.length) || this.attributes.georef.gridRef}`;
                // } else {
                //     summaryGridRef = '';
                // }

                place = `${this.attributes.place}${summaryGridRef ? ` ${summaryGridRef}` : ''}`;
            } else if (this.attributes.georef && this.attributes.georef.gridRef) {
                place = this._summarySquareString(options.summarySquarePrecision);
            } else {
                place = '(unlocalized)';
            }

            return `${escapeHTML(place)} ${this.date || this._createdDateString()}`;
        }
    }

    /**
     * if survey has specified grid-unit then use that instead of the fallBackPrecision option
     *
     * @param {number|null} fallBackPrecision
     * @returns {string}
     * @private
     */
    _summarySquareString(fallBackPrecision) {
        if (this.attributes.georef?.gridRef) {
            let sampleUnit;

            // '<' replacement used simplistically to sanitize against script injection
            const rawGridRef = this.attributes.georef.gridRef.replace(/[<&\s]/g, '');

            if (this.attributes.sampleUnit) {
                sampleUnit = parseInt(this.attributes.sampleUnit?.selection[0], 10) || null;
            }

            const precision = sampleUnit || fallBackPrecision;

            if (precision) {
                const gridRef = GridRef.from_string(rawGridRef);

                return gridRef?.gridCoords?.to_gridref(gridRef.length <= precision ? precision : gridRef.length) || this.attributes.georef.gridRef;
            } else {
                return rawGridRef;
            }
        } else {
            return '';
        }
    }

    _createdDateString() {
        const createdDate = new Date(this.createdStamp * 1000);
        let dateString;

        try {
            // 'default' locale fails on Edge
            dateString = createdDate.toLocaleString('default', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (e) {
            dateString = createdDate.toLocaleString('en-GB', {year: 'numeric', month: 'long', day: 'numeric'});
        }

        return dateString;
    }

    /**
     *
     * @type {Set<string>}
     *
     */
    extantOccurrenceKeys = new Set();

    /**
     * @todo need to exclude deleted records
     * @returns {number}
     *
     */
    countRecords() {
        return this.extantOccurrenceKeys.size;
    }

    /**
     * @returns {Survey}
     */
    duplicate(newAttributes = {}, properties = {}) {
        const newSurvey = new Survey();

        newSurvey.attributes = Object.assign(structuredClone(this.attributes), newAttributes);
        newSurvey.userId = properties.hasOwnProperty('userId') ? properties.userId : this.userId;
        newSurvey.isPristine = true;
        newSurvey.isNew = false; // don't want GPS override of geo-ref
        newSurvey._savedLocally = false;
        newSurvey._savedRemotely = false;
        newSurvey.deleted = false;
        newSurvey.projectId = this.projectId;

        return newSurvey;
    }
}
