// a Survey captures the currentSurvey meta-data
// i.e. it captures site details (name, location); user details (name, email)
//
// if a user were to submit multiple surveys then they would end up in the contact database multiple times
// this is probably unavoidable. Not worth the effort and risk of automatic de-duplication. Email preferences would be
// shared, keyed by email.

import {Model, uuid} from "./Model";
import {escapeHTML} from "../utils/escapeHTML";
import {GridRef} from 'british-isles-gridrefs'
import {Track} from "./Track";

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
     * fired on Survey when one of its occurrences has been added, deleted or reloaded
     *
     * no parameters
     *
     * @type {string}
     */
    static EVENT_LIST_LENGTH_CHANGED = 'listlengthchanged';

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
     * @type {{
     *     [sampleUnit] : {selection : Array<string>, [precision] : number}
     *     [georef] : {
     *          rawString: string,
     *          precision: number|null,
     *          source: string|null,
     *          gridRef: string,
     *          latLng: {lat : number, lng : number}|null,
     *          [defaultSurveyGridRef]: string|null,
     *          [defaultSurveyPrecision]: number|null
     *          },
     *     [date] : string|null,
     *     [place] : string|null,
     *     [surveyName] : string|null,
     *     [casual] : "1"|null,
     *     [defaultCasual] : "1"|null,
     *     [vc] : {selection : Array<string>, inferred: (boolean|null)}|null
     * }}
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
     * @type {Track|null}
     * @private
     */
    _track = null;

    /**
     * Used to tie together linked surveys
     * (e.g. deliberately duplicated, or generated automatically by movement to a new grid-square)
     *
     * Tracking of location can continue seamlessly across linked surveys.
     *
     * @type {string}
     */
     _baseSurveyId = '';

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
     * @returns {string}
     */
    get baseSurveyId() {
        if (!this._baseSurveyId || this._baseSurveyId === 'undefined') {
            this._baseSurveyId = this._id;
        }

        return this._baseSurveyId;
    }

    /**
     *
     * @param {string} id
     */
    set baseSurveyId(id) {
        this._baseSurveyId = id;
    }

    /**
     * string
     */
    get id() {
        if (!this._id) {
            this._id = uuid();

            if (!this._baseSurveyId) {
                this._baseSurveyId = this._id;
            }
        } else if (this._id === 'undefined') {
            console.error("id is literal 'undefined', am forcing new id");
            this._id = uuid();

            if (!this._baseSurveyId) {
                this._baseSurveyId = this._id;
            }
        }

        return this._id;
    }

    /**
     * Set for tetrad structured surveys, where user may be working within a monad subdivision
     *
     * @type {string}
     */
    currentTetradSubunit = '';

    /**
     * Get a summarised geo-ref from the survey geo-reference, based on the survey unit type and precision
     * If the user has explicitly specified a centroid-based survey then the result will instead be a centroid
     *
     * For structured tetrad surveys squareReference will return the currently selected monad within the tetrad (or tetrad if 2km scale selected)
     * For monad or 100m square surveys will return grid-ref at that resolution
     *
     * @returns {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: ({lat: number, lng: number}|null)}|null)}
     */
    get summaryReference() {
        if (this.attributes.sampleUnit?.selection?.[0]) {
            let n = parseInt(this.attributes.sampleUnit.selection[0], 10);

            if (n > 0) {
                // have user-specified square precision value

                if (n === 2000 && this.currentTetradSubunit) {
                    // special-case treatment of tetrad surveys using a monad subdivision

                    return {
                        gridRef: this.currentTetradSubunit,
                        rawString: this.currentTetradSubunit,
                        source: 'unknown',
                        latLng: null,
                        precision: /[A-Z]$/.test(this.currentTetradSubunit) ? 2000 : 1000
                    }
                }

                const ref = this.geoReference;
                const gridRef = GridRef.fromString(ref.gridRef);

                if (gridRef && gridRef.length <= n) {
                    const newRef = gridRef.gridCoords.to_gridref(n);

                    if (n === 2000) {
                        this.currentTetradSubunit = newRef;
                    } else {
                        this.currentTetradSubunit = '';
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
                        const georef = this.geoReference; // avoid calling getter repeatedly

                        return {
                            gridRef: georef.gridRef,
                            rawString: '',
                            source: 'unknown',
                            latLng: georef.latLng,
                            precision: this.attributes.sampleUnit.precision || 1000
                        };

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
        if (this.attributes.georef?.gridRef && this.attributes.georef.precision <= 2000) {
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
     * returns survey date string, with special formatting for 'today' and 'yesterday'
     *
     * @returns {string}
     */
    get prettyDate() {
        const date = this.attributes.date || '';
        const today = new Date;

        if (date === today.toISOString().slice(0,10)) {
            return 'today';
        } else if (date === (new Date(today.valueOf() - (3600*24*1000))).toISOString().slice(0,10)) {
            return 'yesterday';
        } else {
            return date;
        }
    }

    /**
     * Returns true or false based on date compatibility, or null if the survey is undated (e.g. ongoing casual)
     *
     * @returns {boolean|null}
     */
    isToday() {
        const date = this.date;

        return date === '' ? null : (date === (new Date).toISOString().slice(0,10));
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
        })
        .catch((error) => {
            // if updateModelFromContent() fails, due to user rejection of dialogue box then intentionally don't want survey to save
            console.log({"In survey form handler promise rejected (probably normal cancellation of dialogue box)" : error});
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
     *     vc : number[],
     *     interleavedGridRef : string,
     *     [surveyGridUnit] : number,
     *     [hectare] : string,
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

        const surveyGridUnit = parseInt(this.attributes.sampleUnit?.selection?.[0], 10) || null;

        if (surveyGridUnit) {
            result.surveyGridUnit = surveyGridUnit;
        }

        if (geoRef?.gridRef) {
            const gridRef = GridRef.fromString(geoRef.gridRef);

            if (gridRef) {
                if (gridRef.length <= 100 && surveyGridUnit === 100) {
                    result.hectare = gridRef.gridCoords.to_gridref(100);
                }

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

        return {...{hectad : '', tetrad : '', monad : '', hectare : '', country : '', vc : [], interleavedGridRef : ''}, ...result};
    }

    /**
     * if not securely saved then makes a post to /savesurvey.php
     *
     * this may be intercepted by a service worker, which could write the image to indexeddb
     * a successful save will result in a json response containing the uri from which the object may be retrieved
     * and also the state of persistence (whether or not the object was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the object directly to indexeddb
     *
     * must test indexeddb for this eventuality after the save has returned
     *
     * @param {boolean} [forceSave]
     *
     * @returns {Promise}
     */
    save(forceSave = false) {
        if (forceSave || this.unsaved()) {
            const formData = new FormData;

            formData.append('type', this.TYPE);
            formData.append('surveyId', this.id);
            formData.append('id', this.id); // this is incorrect duplication
            formData.append('projectId', this.projectId.toString());
            formData.append('attributes', JSON.stringify(this.attributes));
            formData.append('deleted', this.deleted.toString());
            formData.append('created', this.createdStamp?.toString?.() || '');
            formData.append('baseSurveyId', this.baseSurveyId || this.id);

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            formData.append('appVersion', Model.bsbiAppVersion);

            console.log('queueing survey post');
            return this.queuePost(formData);
        } else {
            return Promise.reject(`Survey ${this.id} has already been saved.`);
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

                place = `${this.attributes.place}${summaryGridRef ? ` ${summaryGridRef}` : ''}`;
            } else if (this.attributes.georef?.gridRef) {
                place = this._summarySquareString(options.summarySquarePrecision);
            } else {
                place = '(unlocalized)';
            }

            return `${escapeHTML(place)} ${this.prettyDate || this._createdDateString()}`;
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
                const gridRef = GridRef.fromString(rawGridRef);

                return gridRef?.gridCoords?.to_gridref?.(gridRef.length <= precision ? precision : gridRef.length) || this.attributes.georef.gridRef;
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
     *
     * @param {{
     *      id : string,
     *      saveState: string,
     *      [userId]: string,
     *      attributes: Object.<string, *>,
     *      deleted: boolean|string,
     *      created: (number|string),
     *      modified: (number|string),
     *      projectId: (number|string),
     *      [baseSurveyId]: (string),
     *      }} descriptor
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this._baseSurveyId = descriptor.baseSurveyId;
    }

    /**
     * @returns {Survey}
     */
    duplicate(newAttributes = {}, properties = {}) {
        const newSurvey = new Survey();

        // @todo need to be certain that are not cloning image attribute
        newSurvey.attributes = Object.assign(structuredClone(this.attributes), newAttributes);
        newSurvey.userId = properties.hasOwnProperty('userId') ? properties.userId : this.userId;
        newSurvey.isPristine = true;
        newSurvey.isNew = false; // don't want GPS override of geo-ref
        newSurvey._savedLocally = false;
        newSurvey._savedRemotely = false;
        newSurvey.deleted = false;
        newSurvey.projectId = this.projectId;
        newSurvey.baseSurveyId = this.baseSurveyId;
        newSurvey.id; // trigger id generation

        return newSurvey;
    }

    /**
     *
     * @param {App} app
     * @returns {Track}
     */
    initialiseNewTracker(app) {
        const track = new Track();
        track.surveyId = this.id;
        track.deviceId = app.deviceId;
        track.projectId = app.projectId;
        track.isPristine = true;

        this.track = track;
        track.registerSurvey(this);

        return track;
    }

    /**
     * returns the currently active track (other tracks may exist if the survey has shifted between devices etc.)
     *
     * @returns {Track|null}
     */
    get track() {
        return this._track;
    }

    /**
     *
     * @param {Track|null} track
     */
    set track(track) {
        this._track = track;
    }
}
