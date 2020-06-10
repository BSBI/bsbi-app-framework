import {Form} from "./Form";

export class OccurrenceForm extends Form {
    /**
     * @protected
     * @type {Occurrence}
     */
    _occurrence;

    /**
     * nasty tight coupling, but is needed for saving of images
     * set by MainView immediately after the form is constructed
     *
     * @type {string}
     */
    surveyId = '';

    /**
     * @abstract
     * @type {Object.<string,{field: typeof FormField, attributes: {label: string, helpText: string, placeholder: string, autocomplete: string}}>}
     */
    static properties;

    /**
     * @abstract
     * @type {string}
     */
    static sectionTitle = 'Occurrence form';

    /**
     * @type {string}
     */
    static help = 'Records help text, should normally be initialised with an imported html template';

    constructor(occurrence) {
        super();

        if (new.target === OccurrenceForm) {
            throw new TypeError("Cannot construct OccurrenceForm instances directly, class should be overridden.");
        }

        if (occurrence) {
            this.model = occurrence;
        }
    }

    /**
     *
     * @returns {HTMLElement}
     */
    get formElement() {
        let el = super.formElement;

        if (!this._formFieldsBuilt) {
            this.buildFormFields();

            el.addEventListener('change', () => {
                console.log('occurrence form change event');
                console.log(arguments);
            }, {capture: false});
        }

        return el;
    }

    /**
     * sets this._formContentContainer to the container that should contain the form fields
     *
     * if no wrapper then can re-use the outer container id (this.#formEl
     */
    buildContentContainer(outerContainer) {
        const cardEl = outerContainer.appendChild(document.createElement('div'));
        cardEl.className = 'card mt-3 ml-0 mr-0 mb-3';

        const cardHeaderEl = cardEl.appendChild(document.createElement('div'));
        cardHeaderEl.className = 'card-header';

        cardHeaderEl.textContent = OccurrenceForm.sectionTitle;

        this._formContentContainer = cardEl.appendChild(document.createElement('div'));
        this._formContentContainer.className = 'card-body';

        return this._formContentContainer;
    }

    /**
     *
     * @returns {(string|null)}
     */
    get occurrenceId() {
        return this._occurrence ? this._occurrence.id : null;
    }

    /**
     *
     * @returns {(number|null)}
     */
    get projectId() {
        return this._occurrence ? this._occurrence.projectId : null;
    }

    /**
     *
     */
    initialiseFormFields() {
        const properties = OccurrenceForm.properties;

        this.fields = {};

        for (let key in properties) {
            if (properties.hasOwnProperty(key)) {
                // noinspection JSPotentiallyInvalidConstructorUsage
                this.fields[key] = new properties[key].field(properties[key].attributes);
            }
        }
    }

    updateModelFromContent() {
        console.log('updating occurrence from OccurrenceForm content');

        for (let key in this.fields) {
            if (this.fields.hasOwnProperty(key)) {
                let field = this.fields[key];

                this._occurrence.attributes[key] = field.value;
            }
        }

        console.log({occurrence: this._occurrence});
    }

    /**
     *
     * @param {Occurrence} model
     */
    set model (model) {
        this._occurrence = model;
        this.populateFormContent();
    }

    get model() {
        return this._occurrence;
    }

    changeHandler(event) {
        console.log('occurrence form change event');
        console.log({event});

        this.fireEvent(Form.CHANGE_EVENT, {form: this});
    }

    pingOccurrence() {
        if (this._occurrence.unsaved()) {
            this.fireEvent(Form.CHANGE_EVENT, {form: this});
        }
    }

    destructor() {
        this._occurrence = null;

        super.destructor();
    }

    getFormSectionProperties() {
        return OccurrenceForm.properties;
    }
}

