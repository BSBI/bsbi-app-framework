import {FormField} from "./FormField";
import {uuid} from "../../models/Model";
import {escapeHTML} from "../../utils/escapeHTML";
// import {LatLngWGS84} from "british-isles-gridrefs";
import {GridCoords, GridRef} from "british-isles-gridrefs";

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
     *
     * @type {string}
     * @private
     */
    _value = '';

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
     *
     * @type {?int}
     */
    baseSquareResolution = null;

    /**
     *
     * @param {{[label] : string, [helpText]: string, [options]: {}, [placeholder]: string, [type]: string, [autocomplete]: string, [baseSquareResolution]: ?number}} [params]
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

            if (params.autocomplete) {
                this._autocomplete = params.autocomplete;
            }

            if (params.baseSquareResolution) {
                this.baseSquareResolution = params.baseSquareResolution;
            }
        }
    }

    /**
     *
     * @param {(string|null|undefined)} textContent
     */
    set value(textContent) {
        this._value = (undefined === textContent || null == textContent) ? '' : textContent.trim();
        this.updateView();
    }

    /**
     *
     * @returns {string}
     */
    get value() {
        return this._value;
    }

    updateView() {
        if (this._fieldEl) {
            // do nothing until the view has been constructed

            const inputEl = document.getElementById(this._inputId);
            inputEl.value = FormField.cleanRawString(this._value);
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

            const buttonIconEl = gpsButton.appendChild(document.createElement('span'));
            buttonIconEl.className = 'material-icons';
            buttonIconEl.innerText = 'gps_not_fixed';

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

        console.log('got input field change event');

        this.value = FormField.cleanRawString(document.getElementById(this._inputId).value);
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
        //console.log('got gps button click event');

        navigator.geolocation.getCurrentPosition((position) => {
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

            this.processLatLngPosition(
                position.coords.latitude,
                position.coords.longitude,
                position.coords.accuracy * 2
            );
        }, (error) => {
            console.log('gps look-up failed');
            console.log(error);
        });
    }

    /**
     *
     * @param {number} latitude
     * @param {number} longitude
     * @param {number} precision diameter in metres
     */
    processLatLngPosition(latitude, longitude, precision) {
        const gridCoords = GridCoords.from_latlng(latitude, longitude);

        let scaledPrecision = GridRef.get_normalized_precision(precision);
        if (this.baseSquareResolution && scaledPrecision < this.baseSquareResolution) {
            scaledPrecision = this.baseSquareResolution;
        }

        const gridRef = gridCoords.to_gridref(scaledPrecision);

        console.log(`Got grid-ref: ${gridRef}`);
        this.value = gridRef;
        this.fireEvent(FormField.EVENT_CHANGE);
    }

    /**
     * by the time summariseImpl has been called have already checked that summary is wanted
     *
     * @param {string} key
     * @param {{field : TextGeorefField, attributes : {options : Object.<string, {label : string}>}, summary : {summaryPrefix: string}}} property properties of the form descriptor
     * @param {Object.<string, {}>} attributes attributes of the model object
     * @return {string}
     */
    static summariseImpl(key, property, attributes) {
        return (attributes[key] !== '' && attributes[key] !== null && attributes[key] !== undefined) ?
            escapeHTML(attributes[key].trim())
            : '';
    }
}
