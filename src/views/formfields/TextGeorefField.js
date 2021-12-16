import {FormField} from "./FormField";
import {uuid} from "../../models/Model";
import {escapeHTML} from "../../utils/escapeHTML";
// import {LatLngWGS84} from "british-isles-gridrefs";
import {GridCoords, GridRef} from "british-isles-gridrefs";
import {GPSRequest} from "../../utils/GPSRequest";
import {doubleClickIntercepted} from "../../utils/stopDoubleClick";

export class TextGeorefField extends FormField {

    /**
     * @type {string}
     */
    _inputId;

    /**
     * @type {string}
     */
    #containerId;

    /**
     * set if map has a well-defined zoom and centre
     * (i.e. has been initialised from a typed grid-ref, a manual re-centre or user-click)
     *
     * @type {boolean}
     */
    mapPositionIsCurrent = false;

    /**
     *
     * @type {{
     * rawString: string,
     * precision: number|null,
     * source: string,
     * gridRef: string,
     * latLng: ({lat:number,lng:number}|null)
     * }}
     * @private
     */
    _value = {
        gridRef: '',
        rawString: '', // what was provided by the user to generate this grid-ref (might be a postcode or placename)
        source: TextGeorefField.GEOREF_SOURCE_UNKNOWN,
        latLng: null,
        precision: null
    };

    static GEOREF_SOURCE_UNKNOWN = 'unknown';
    static GEOREF_SOURCE_GRIDREF = 'gridref';
    static GEOREF_SOURCE_MAP = 'map';
    static GEOREF_SOURCE_GPS = 'gps';
    static GEOREF_SOURCE_POSTCODE = 'postcode';
    static GEOREF_SOURCE_PLACE = 'place';

    /**
     *
     * @type {string}
     * @private
     */
    _inputType = 'text';

    /**
     *
     * @type {string}
     * @private
     */
    _autocomplete = '';

    /**
     * the maximum precision to use for geocoded results
     *
     * @type {?int}
     */
    baseSquareResolution = null;

    /**
     * minimum resolution (m) to allow
     *
     * @type {number}
     */
    minResolution = 2000;

    /**
     * if set then as well as labelling the GPS button with a symbol, also include text 'GPS'
     * @type {boolean}
     */
    gpsTextLabel = false;

    /**
     *
     * @type {string}
     */
    gpsPermissionsPromptText = '<p class="gps-nudge">Allowing access to GPS will save you time by allowing the app to locate your records automatically.</p>';

    /**
     *
     * @type {boolean}
     */
    initialiseFromDefaultSurveyGeoref = false;

    /**
     *
     * @type {boolean}
     */
    showGPSEnableLinkIfNotActiveOnMobile = true;

    // /**
    //  * if set (default false) then the field's placeholder changes dynamically, e.g. depending on the surveys base georef.
    //  *
    //  * @type {boolean}
    //  */
    // dynamicPlaceholderFlag = false;

    /**
     *
     * @type {null|string}
     * @private
     */
    _gpsPermissionsPromptId = null;

    /**
     *
     * @param {{
     * [label] : string,
     * [helpText]: string,
     * [options]: {},
     * [placeholder]: string,
     * [type]: string,
     * [autocomplete]: string,
     * [baseSquareResolution]: ?number,
     * [gpsPermissionPromptText]: string,
     * [initialiseFromDefaultSurveyGeoref] : boolean,
     * [gpsTextLabel] : boolean,
     * [showGPSEnableLinkIfNotActiveOnMobile] : boolean,
     * }} [params]
     */
    constructor (params) {
        super(params);

        if (params) {
            if (params.type) {
                this._inputType = params.type;
            }

            if (params.placeholder) {
                this.placeholder = params.placeholder;
            }

            // if (params.dynamicPlaceholder) {
            //     this.dynamicPlaceholder = params.dynamicPlaceholder;
            // }

            if (params.autocomplete) {
                this._autocomplete = params.autocomplete;
            }

            if (params.baseSquareResolution) {
                this.baseSquareResolution = params.baseSquareResolution;
            }

            if (params.gpsPermissionPromptText) {
                this.gpsPermissionsPromptText = params.gpsPermissionPromptText;
            }

            if (params.gpsTextLabel) {
                this.gpsTextLabel = params.gpsTextLabel;
            }

            if (params.hasOwnProperty('initialiseFromDefaultSurveyGeoref')) {
                this.initialiseFromDefaultSurveyGeoref = params.initialiseFromDefaultSurveyGeoref;
            }

            if (params.hasOwnProperty('showGPSEnableLinkIfNotActiveOnMobile')) {
                this.showGPSEnableLinkIfNotActiveOnMobile = params.showGPSEnableLinkIfNotActiveOnMobile;
            }
        }
    }

    /**
     *
     * @param {({rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: Array|null}|string|null)} georefSpec
     */
    set value(georefSpec) {
        //this._value = (undefined === textContent || null == textContent) ? '' : textContent.trim();

        if (georefSpec) {
            if (typeof (georefSpec) === 'string') {
                // backward compatible string gridref
                this._value = {
                    gridRef: georefSpec,
                    rawString: georefSpec, // what was provided by the user to generate this grid-ref (might be a postcode or placename)
                    source: TextGeorefField.GEOREF_SOURCE_UNKNOWN,
                    latLng: null,
                    precision: null
                };
            } else {
                this._value = georefSpec;
            }
        } else {
            this._value = {
                gridRef: '',
                rawString: '', // what was provided by the user to generate this grid-ref (might be a postcode or placename)
                source: null,
                latLng: null,
                precision: null
            };
        }

        this.updateView();
    }

    /**
     *
     * @returns {{rawString: string, precision: number|null, source: string|null, gridRef: string, latLng: Array|null}}
     */
    get value() {
        return this._value;
    }

    updateView() {
        if (this._fieldEl) {
            // do nothing until the view has been constructed

            const inputEl = document.getElementById(this._inputId);
            inputEl.value = FormField.cleanRawString(this._value.gridRef);
        }
    }

    /**
     * initialises this._fieldEl
     *
     * @returns {void}
     */
    buildField() {
        // <div class="form-group">
        //     <label for="{baseId}gridref">Postcode or grid-reference</label>
        //     <input type="text" class="form-control" id="{baseId}gridref" aria-describedby="{baseId}grHelp" placeholder="Grid-reference or postcode">
        //     <small id="{baseId}grHelp" class="form-text text-muted">We need to be able to put your survey on our map. Detailed locations won't be made public.</small>
        // </div>

        // <div class="form-group">
        //     <label for="{baseId}gridref">Postcode or grid-reference</label>
        //     <div class="input-group">
        //         <input id="{baseId}gridref" aria-describedby="{baseId}grHelp" type="text" class="form-control" placeholder="Grid-reference or postcode" autocomplete="postal-code" required>
        //         <span class="input-group-btn">
        //             <button id="gps" type="button" class="btn btn-outline-secondary btn-sm" title="use GPS">
        //                 <span class="material-icons">gps_not_fixed</span>
        //             </button>
        //         </span>
        //     </div>
        //     <small id="{baseId}grHelp" class="form-text text-muted">We need to be able to put your survey on our map. Detailed locations won't be made public.</small>
        // </div>

        const container = document.createElement('div');
        container.className = 'form-group';
        this.#containerId = container.id = FormField.nextId;

        this._inputId = FormField.nextId;

        if (navigator.geolocation && this.showGPSEnableLinkIfNotActiveOnMobile && GPSRequest.getDeviceType() === GPSRequest.DEVICE_TYPE_MOBILE) {
            // if on a mobile device and GPS is not turned on

            const gpsEnabledLinkEl = document.createElement('a');
            gpsEnabledLinkEl.className = 'no-gps-link-prompt'; // will be visible only if document body doesn't have a 'gps-enabled' class
            gpsEnabledLinkEl.href = '#';
            gpsEnabledLinkEl.innerText = 'Please enable GPS';
            container.appendChild(gpsEnabledLinkEl);

            gpsEnabledLinkEl.addEventListener('click', this.gpsButtonClickHandler.bind(this));
        }

        const labelEl = container.appendChild(document.createElement('label'));
        labelEl.htmlFor = this._inputId;
        labelEl.textContent = this.label;

        const inputGroupEl = container.appendChild(document.createElement('div'));
        inputGroupEl.className = 'input-group';

        const inputField = inputGroupEl.appendChild(document.createElement('input'));
        inputField.className = "form-control";
        inputField.id = this._inputId;
        inputField.type = 'text';

        if (this.placeholder) {
            inputField.placeholder = this.placeholder;
        }

        if (this._autocomplete) {
            inputField.autocomplete = this._autocomplete;

            if ('off' === this._autocomplete) {
                // browsers tend to ignore autocomplete off, so also assign a random 'name' value
                inputField.name = uuid();
            }
        }

        const buttonContainerEl = inputGroupEl.appendChild(document.createElement('span'));
        buttonContainerEl.className = 'input-group-btn';

        if (navigator.geolocation) {
            const gpsButton = buttonContainerEl.appendChild(document.createElement('button'));
            gpsButton.id = FormField.nextId;
            gpsButton.type = 'button';
            gpsButton.className = 'btn btn-outline-secondary btn-sm';
            gpsButton.title = 'use GPS';

            if (this.gpsTextLabel) {
                const gpsTextLabel = gpsButton.appendChild(document.createElement('span'));
                gpsTextLabel.style.verticalAlign = 'middle';
                gpsTextLabel.innerText = 'GPS ';
            }

            const buttonIconEl = gpsButton.appendChild(document.createElement('span'));
            buttonIconEl.className = 'material-icons';
            buttonIconEl.innerText = 'gps_not_fixed';

            if (this.gpsTextLabel) {
                buttonIconEl.style.verticalAlign = 'middle';
            }

            gpsButton.addEventListener('click', this.gpsButtonClickHandler.bind(this));
        }

        if (this.completion === FormField.COMPLETION_COMPULSORY) {
            inputField.required = true;
        }

        if (this.validationMessage) {
            const validationMessageElement = container.appendChild(document.createElement('div'));
            validationMessageElement.className = 'invalid-feedback';
            validationMessageElement.innerHTML = this.validationMessage;
        }

        if (this.gpsPermissionsPromptText && navigator.geolocation) {
            const gpsPermissionsPromptField = container.appendChild(document.createElement('small'));
            this._gpsPermissionsPromptId = gpsPermissionsPromptField.id = FormField.nextId;
            gpsPermissionsPromptField.style.display = 'none'; // hidden initially
            gpsPermissionsPromptField.innerHTML = this.gpsPermissionsPromptText;
        }

        if (this.helpText) {
            const helpTextField = container.appendChild(document.createElement('small'));
            helpTextField.innerHTML = this.helpText;
        }

        inputField.addEventListener('change', this.inputChangeHandler.bind(this));

        this._fieldEl = container;
    }

    /**
     *
     * @param {(boolean|null)} isValid
     */
    markValidity(isValid) {
        const el = document.getElementById(this._inputId);

        if (null === isValid) {
            el.classList.remove('is-invalid', 'is-valid');
        } else {
            el.classList.remove(isValid ? 'is-invalid' : 'is-valid');
            el.classList.add(isValid ? 'is-valid' : 'is-invalid');
        }
    }

    inputChangeHandler (event) {
        event.stopPropagation(); // don't allow the change event to reach the form-level event handler (will handle it here instead)

        //console.log('got input field change event');

        let rawValue = FormField.cleanRawString(document.getElementById(this._inputId).value);
        const gridRefParser = GridRef.from_string(rawValue);

        this.mapPositionIsCurrent = false; // any linked map ought to be re-centred & zoomed

        if (gridRefParser) {
            this.value = {
                gridRef: gridRefParser.preciseGridRef,
                rawString: rawValue, // what was provided by the user to generate this grid-ref (might be a postcode or placename)
                source: TextGeorefField.GEOREF_SOURCE_GRIDREF,
                latLng: null,
                precision: null
            };
        } else {
            // should try geo-coding the value

            this.value = {
                gridRef: '',
                rawString: rawValue, // what was provided by the user to generate this grid-ref (might be a postcode or placename)
                source: TextGeorefField.GEOREF_SOURCE_UNKNOWN,
                latLng: null,
                precision: null
            };
        }

        this.fireEvent(FormField.EVENT_CHANGE);
    }

    // /**
    //  *
    //  * @param {MouseEvent} event
    //  */
    // gpsButtonClickHandler (event) {
    //     console.log('got gps button click event');
    //
    //     navigator.geolocation.getCurrentPosition((position) => {
    //         const latitude  = position.coords.latitude;
    //         const longitude = position.coords.longitude;
    //
    //         console.log(`Got GPS fix ${latitude} , ${longitude}`);
    //
    //         // const latLng = new LatLngWGS84(latitude, longitude);
    //         const gridCoords = GridCoords.from_latlng(latitude, longitude);
    //         const gridRef = gridCoords.to_gridref(1000);
    //
    //         console.log(`Got grid-ref: ${gridRef}`);
    //         this.value = gridRef;
    //         this.fireEvent(FormField.EVENT_CHANGE);
    //     }, (error) => {
    //         console.log('gps look-up failed');
    //         console.log(error);
    //     });
    // }

    /**
     *
     * @param {MouseEvent} event
     */
    gpsButtonClickHandler (event) {
        if (doubleClickIntercepted(event)) {
            return;
        }

        this.seekGPS().catch((error) => {
            console.log({'gps look-up failed, error' : error});
        });

        event.preventDefault();
        event.stopPropagation();
    }

    /**
     *
     * @returns {Promise<unknown>}
     */
    seekGPS() {
        return GPSRequest.seekGPS(this._gpsPermissionsPromptId).then((position) => {
            // const latitude  = position.coords.latitude;
            // const longitude = position.coords.longitude;

            // console.log(`Got GPS fix ${latitude} , ${longitude}`);
            //
            // const gridCoords = GridCoords.from_latlng(latitude, longitude);
            // const gridRef = gridCoords.to_gridref(1000);
            //
            // console.log(`Got grid-ref: ${gridRef}`);
            // this.value = gridRef;
            // this.fireEvent(FormField.EVENT_CHANGE);

            //@todo maybe should prevent use of readings if speed is too great (which might imply use of GPS in a moving vehicle)

            console.log({'gps position' : position});
            let accuracy = position.coords.accuracy * 2;

            this.mapPositionIsCurrent = false; // force zoom and re-centre

            this.processLatLngPosition(
                position.coords.latitude,
                position.coords.longitude,
                accuracy,
                TextGeorefField.GEOREF_SOURCE_GPS
            );
        });
    }

    /**
     *
     * @param {number} latitude
     * @param {number} longitude
     * @param {number} precision diameter in metres
     * @param {string} source
     * @param {string} rawString
     */
    processLatLngPosition(latitude, longitude, precision, source, rawString = '') {
        const gridCoords = GridCoords.from_latlng(latitude, longitude);

        let scaledPrecision = GridRef.get_normalized_precision(precision);
        if (this.baseSquareResolution && scaledPrecision < this.baseSquareResolution) {
            scaledPrecision = this.baseSquareResolution;
        }

        if (this.minResolution && scaledPrecision > this.minResolution) {
            scaledPrecision = this.minResolution;
        }

        const gridRef = gridCoords.to_gridref(scaledPrecision);

        console.log(`Got grid-ref: ${gridRef}`);
        //this.value = gridRef;
        this.value = {
            gridRef: gridRef,
            rawString: rawString,
            source: source,
            latLng: {lat:latitude,lng:longitude},
            precision: precision
        };

        this.fireEvent(FormField.EVENT_CHANGE);
    }

    /**
     * by the time summariseImpl has been called have already checked that summary is wanted
     *
     * @param {string} key
     * @param {{
     *          field : TextGeorefField,
     *          attributes : {options : Object.<string, {label : string}>},
     *          summary : {summaryPrefix: string}
     *          }} property properties of the form descriptor
     * @param {Object.<string, {}>} attributes attributes of the model object
     * @return {string}
     */
    static summariseImpl(key, property, attributes) {
        return (attributes[key] !== '' && attributes[key] !== null && attributes[key] !== undefined) ?
            escapeHTML(attributes[key].trim())
            : '';
    }

    /**
     *
     * @param value
     * @returns {boolean}
     */
    static isEmpty(value) {
        return !(value && value.gridRef);
    }

    /**
     *
     *
     * @param {string} key
     * @param property
     * @param attributes
     * @returns {null|boolean}
     */
    static isValid(key, property, attributes) {
        //console.log("in TextGeorefField isValid");

        if (property.attributes.completion &&
            (property.attributes.completion === FormField.COMPLETION_COMPULSORY || property.attributes.completion === FormField.COMPLETION_DESIRED)
        ) {
            // test whether required field is missing
            if (!attributes.hasOwnProperty(key) || property.field.isEmpty(attributes[key])) {
                return false;
            } else {
                // check if grid-ref is set
                let geoRef = attributes[key];

                console.log({"testing gr validity" : geoRef});

                return !!(geoRef && geoRef.gridRef);
            }
        }
        // field is present or optional
        // report as valid unless content is corrupt

        return null; // field not assessed
    }
}
