import {Form} from "./Form";

export class SurveyForm extends Form {

    /**
     * sections keyed by numerical order
     *
     * @type {Array.<typeof SurveyFormSection>}
     */
    static sections = [];

    /**
     *
     * @type {Object.<string, typeof SurveyFormSection>}
     */
    static sectionsByKey = {};

    /**
     * @protected
     * @type {Survey}
     */
    _survey;

    /**
     * @type {typeof SurveyFormSection}
     */
    section;

    /**
     *
     * @param {typeof SurveyFormSection} section
     */
    constructor(section) {
        super();
        this.section = section;
    }

    /**
     *
     * @returns {HTMLElement}
     */
    get formElement() {
        let el = super.formElement;

        if (!this._formFieldsBuilt) {
            this.buildFormFields();
        }

        return el;
    }

    updateModelFromContent() {
        console.log('updating survey from SurveyForm content');

        for (let key in this.fields) {
            if (this.fields.hasOwnProperty(key)) {
                let field = this.fields[key];

                this._survey.attributes[key] = field.value;
            }
        }

        console.log({survey: this._survey});
    }

    /**
     *
     * @param {Survey} model
     */
    set model (model) {
        this._survey = model;
        this.populateFormContent();
    }

    get model() {
        return this._survey;
    }

    /**
     * the change event triggers after a field has changed, before the value has been read back into the model
     *
     * @param event
     */
    changeHandler(event) {
        console.log('survey form change event');
        console.log({event});

        this.fireEvent(Form.CHANGE_EVENT, {form: this});
    }

    destructor() {
        super.destructor();
        this._survey = null;
    }

    /**
     *
     * @param {typeof SurveyFormSection} formClass
     */
    static registerSection(formClass) {
        SurveyForm.sections[formClass.sectionSortOrder] = formClass;
        SurveyForm.sectionsByKey[formClass.sectionNavigationKey] = formClass;
    }

    /**
     *
     */
    initialiseFormFields() {
        const properties = this.section.properties;

        this.fields = {};

        for (let key in properties) {
            if (properties.hasOwnProperty(key)) {
                // noinspection JSPotentiallyInvalidConstructorUsage
                this.fields[key] = new properties[key].field(properties[key].attributes);
            }
        }
    }

    /**
     *
     * @returns {Object<string, {field: FormField, attributes: {label: string, helpText: string, placeholder: string, autocomplete: string}}>}
     */
    getFormSectionProperties() {
        return this.section.properties;
    }
}

