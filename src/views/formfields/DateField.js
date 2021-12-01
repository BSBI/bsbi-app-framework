import {FormField} from "./FormField";
import {uuid} from "../../models/Model";
import {escapeHTML} from "../../utils/escapeHTML";

export class DateField extends FormField {

    /**
     * @type {string}
     */
    #inputId;

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
    _inputType = 'date';

    /**
     *
     * @type {string}
     * @private
     */
    _autocomplete = '';

    /**
     * minimum date (inclusive) or null if no constraint
     */
    _minDate = null;

    /**
     * minimum date (inclusive) or null if no constraint
     */
    _maxDate = null;

    /**
     *
     * @param {{
     * [label] : string,
     * [helpText]: string,
     * [options]: {},
     * [placeholder]: string,
     * [type]: string,
     * [autocomplete]: string,
     * [minDate] : string,
     * [maxDate] : string,
     * }} [params]
     */
    constructor (params) {
        super(params);

        this._value = (new Date).toJSON().slice(0,10); // default to current date

        if (params) {
            if (params.placeholder) {
                this.placeholder = params.placeholder;
            }

            if (params.autocomplete) {
                this._autocomplete = params.autocomplete;
            }

            if (params.minDate) {
                this._minDate = params.minDate;
            }

            if (params.maxDate) {
                this._maxDate = params.maxDate;
            }
        }
    }

    /**
     *
     * @param {(string|null|undefined)} textContent
     */
    set value(textContent) {
        this._value = (undefined === textContent || null == textContent) ?
            (new Date).toJSON().slice(0,10) // current date in ISO format
            :
            textContent.trim();
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

            const inputEl = document.getElementById(this.#inputId);
            inputEl.value = FormField.cleanRawString(this._value);
        }
    }

    /**
     * initialises this._fieldEl
     *
     * @returns {void}
     */
    buildField() {
        const container = document.createElement('div');
        container.className = 'form-group';
        this.#containerId = container.id = FormField.nextId;

        this.#inputId = FormField.nextId;

        const labelEl = container.appendChild(document.createElement('label'));
        labelEl.htmlFor = this.#inputId;
        labelEl.textContent = this.label;

        const inputField = container.appendChild(document.createElement('input'));
        inputField.className = "form-control";
        inputField.id = this.#inputId;

        try { // this is needed for compatibility with IE11
            inputField.type = this._inputType;
        } catch (e) {
            console.log(`Failed to set type '${this._inputType}'`);
        }

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
     * @param {string} key
     * @param {{
     * field : typeof DateField,
     * attributes : {
         * [label] : string,
         * [helpText]: string,
         * [options]: {},
         * [placeholder]: string,
         * [type]: string,
         * [autocomplete]: string,
         * [minDate] : string,
         * [maxDate] : string
         * }
     * }} property properties of the form descriptor
     * @param attributes attributes of the model object
     * @return {(boolean|null)} returns null if validity was not assessed
     */
    static isValid(key, property, attributes) {
        if (property.attributes.completion &&
            (property.attributes.completion === FormField.COMPLETION_COMPULSORY || property.attributes.completion === FormField.COMPLETION_DESIRED)
        ) {
            // test whether required field is missing
            if (!attributes.hasOwnProperty(key) || property.field.isEmpty(attributes[key])) {
                return false;
            } else {
                // check if range constraints are met
                let dateValue = attributes[key];

                if (property.attributes.minDate && dateValue < property.attributes.minDate) {
                    return false;
                }

                if (property.attributes.maxDate && dateValue > property.attributes.maxDate) {
                    return false;
                }

                let today = (new Date).toJSON().slice(0,10);
                if (dateValue > today) {
                    return false;
                }
            }
        }
        // field is present or optional
        // report as valid unless content is corrupt

        return null; // field not assessed
    }

    /**
     *
     * @param {(boolean|null)} isValid
     */
    markValidity(isValid) {
        const el = document.getElementById(this.#inputId);

        if (null === isValid) {
            el.classList.remove('is-invalid', 'is-valid');
        } else {
            el.classList.remove(isValid ? 'is-invalid' : 'is-valid');
            el.classList.add(isValid ? 'is-valid' : 'is-invalid');
        }
    }

    inputChangeHandler (event) {
        event.stopPropagation(); // don't allow the change event to reach the form-level event handler (will handle it here instead)

        console.log('got date field change event');

        this.value = FormField.cleanRawString(document.getElementById(this.#inputId).value);
        this.fireEvent(FormField.EVENT_CHANGE);
    }

    /**
     * by the time summariseImpl has been called have already checked that summary is wanted
     *
     * @param {string} key
     * @param {{field : DateField, attributes : {options : Object.<string, {label : string}>}, summary : {summaryPrefix: string}}} property properties of the form descriptor
     * @param {Object.<string, {}>} attributes attributes of the model object
     * @return {string}
     */
    static summariseImpl(key, property, attributes) {
        return (attributes[key] !== '' && attributes[key] !== null && attributes[key] !== undefined) ?
            escapeHTML(attributes[key].trim())
            : '';
    }
}
