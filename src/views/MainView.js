// Overall view for the main list page *and occurrence side panels*

import {Page} from "./Page";
import htmlLayout from "../templates/mainViewLayout.html";
import {SurveyForm} from "./forms/SurveyForm";
//import $ from "jquery";
import {MainController} from "../controllers/MainController";
import {Occurrence} from "../models/Occurrence";
import {InternalAppError} from "../utils/exceptions/InternalAppError";
import {Form} from "./forms/Form";
import {escapeHTML} from "../utils/escapeHTML";
import {OccurrenceForm} from "./forms/OccurrenceForm";
import {OccurrenceImage} from "../models/OccurrenceImage";
import {EVENT_DELETE_IMAGE, IMAGE_MODAL_ID, IMAGE_MODAL_DELETE_BUTTON_ID, ImageField, DELETE_IMAGE_MODAL_ID} from "./formfields/ImageField";
import {App} from "..";

const LEFT_PANEL_ID = 'col1panel';
const RIGHT_PANEL_ID = 'col2panel';
const CONTROL_PANEL_ID = 'ctrlpanel';

const PANEL_BACK_BUTTON_ID = 'right-panel-back';

const PANEL_LEFT = 'left';
const PANEL_RIGHT = 'right';

const DELETE_OCCURRENCE_MODAL_ID = 'deleteoccurrencemodal';
const FINISH_MODAL_ID = 'finishmodal';

const OCCURRENCE_LIST_CONTAINER_ID = 'occurrencelistcontainer';

//SurveyForm.registerSection(GardenFlowerSurveyFormAboutSection);
//SurveyForm.registerSection(GardenFlowerSurveyFormGardenSection);

export class MainView extends Page {

    /**
     * @type {MainController}
     */
    controller;

    /**
     *
     * @type {Object.<string, SurveyForm>}
     */
    #surveyFormSections = {};

    /**
     *
     * @type {OccurrenceForm}
     */
    #occurrenceForm;

    /**
     * keyed by occurrence id
     *
     * @type {{}}
     */
    #occurrenceChangeHandles = {};

    /**
     * @type {(''|'help'|'form')}
     */
    panelKey = '';

    /**
     * configuration flag
     * modify this for alternative survey types that finish with a general form section
     *
     * @type {boolean}
     */
    OCCURRENCES_ARE_LAST_SECTION = true;

    /**
     * @abstract
     * @type {string}
     */
    occurrenceSummaryText = 'Placeholder occurrence summary text in MainView.js';

    /**
     * @abastract
     * @type {string}
     */
    welcomeContent = 'Placeholder welcome text in MainView.js';

    /**
     * @abastract
     * @type {string}
     */
    defaultRightHandSideHelp = 'Default right-hand side help text in MainView.js';

    /**
     * called once during late-stage app initialisation
     * (NB this may not be the current view when called)
     *
     * an opportunity to register listeners on this.controller.app
     */
    initialise() {
        this.controller.app.addListener(App.EVENT_OCCURRENCE_ADDED, this.occurrenceAddedHandler.bind(this));
    }

    /**
     * called before display to initialise a two-panel layout
     */
    setLayout() {
        const bodyEl = document.getElementById('body');
        bodyEl.innerHTML = htmlLayout;

        // register handler on right-pane back button
        document.getElementById(PANEL_BACK_BUTTON_ID).addEventListener('click', (event) => {
            event.stopPropagation();
            event.preventDefault();

            this.fireEvent(MainController.EVENT_BACK);
        });
    }

    /**
     * need to ensure that the open accordion sections match the url
     * do this by class tweaking, so that handlers do not fire
     */
    refreshLeftPanelAccordionState() {
        const cards = document.querySelectorAll(`div#${this.leftPanelAccordionId} div[data-parent="#${this.leftPanelAccordionId}"].collapse`);
        let targetMatch;

        if (this.controller.viewSubcontext) {
            targetMatch = (this.controller.viewSubcontext === 'record') ?
                'record' : this.controller.surveySection;
        } else {
            targetMatch = '';
        }

        for (let card of cards) {
            let cardSection = card.getAttribute('data-sectionkey');

            if (cardSection === targetMatch) {
                card.classList.add('show');
            } else {
                card.classList.remove('show');
            }
        }

        this._refreshOccurrenceAccordionState();
    }

    /**
     * collapse open occurrence cards that don't match the current occurrence id
     *
     * @private
     */
    _refreshOccurrenceAccordionState() {
        const occurrenceCards = document.querySelectorAll(`div#${OCCURRENCE_LIST_CONTAINER_ID} div[data-parent="#${OCCURRENCE_LIST_CONTAINER_ID}"].collapse`);

        const targetMatch = this.controller.currentOccurrenceId;

        for (let card of occurrenceCards) {
            let cardOccurrenceId = card.getAttribute('data-occurrenceid');

            if (cardOccurrenceId === targetMatch) {
                card.classList.add('show');
            } else {
                card.classList.remove('show');
            }
        }
    }

    display() {
        if (this.controller.needsFullRefresh) {
            console.log('Full refresh triggered.');
            this.setLayout();
            this.#populateLeftPanel();
        } else {
            // need to ensure that the open accordion sections match the url
            this.refreshLeftPanelAccordionState();
        }

        if (this.controller.needRightPanelRefresh) {
            // the view of the current record (in the right-hand editor pane)
            // has changed and needs rebuilding from scratch
            switch (this.controller.viewSubcontext) {
                case 'record':
                    this.#refreshOccurrenceEditor();
                    break;

                case 'survey':
                    this.#refreshSurveyHelpPanel();
                    break;

                default:
                    this.#displayDefaultRightPanel();
            }
        }

        this.setResponsivePanel('' === this.panelKey ?
            PANEL_LEFT
            :
            PANEL_RIGHT
        );
    }

    #refreshSurveyHelpPanel() {
        let rightPanelContainer = document.getElementById(RIGHT_PANEL_ID);

        const sectionKey = this.controller.surveySection;

        // section key can be 'welcome' which is a special case that doesn't match a section form
        let help = SurveyForm.sectionsByKey[sectionKey] ?
            SurveyForm.sectionsByKey[sectionKey].help
            :
            '';

        if (help) {
            rightPanelContainer.innerHTML = help;
        } else if (sectionKey === 'welcome') {
            rightPanelContainer.innerHTML = this.defaultRightHandSideHelp;
        } else {
            // shouldn't get here
            rightPanelContainer.innerHTML = `<p>placeholder survey help content for '${sectionKey}'</p>`;
        }
    }

    #refreshOccurrenceEditor() {
        try {
            let occurrence = this.controller.currentOccurrence;

            let editorContainer = document.getElementById(RIGHT_PANEL_ID);
            if (occurrence) {
                if (!this.#occurrenceForm || this.#occurrenceForm.occurrenceId !== occurrence.id) {
                    if (this.#occurrenceForm) {
                        this.#occurrenceForm.destructor();
                    }

                    // form has not been initialised or current occurrence has changed
                    this.#occurrenceForm = occurrence.setForm(new OccurrenceForm(occurrence));
                    //this.#occurrenceForm = occurrence.getForm();
                    this.#occurrenceForm.surveyId = this.controller.app.currentSurvey.id;

                    // scroll to the top of the panel
                    editorContainer.scrollTop = 0;
                }
                editorContainer.innerHTML = '';

                const formEl = this.#occurrenceForm.formElement;

                editorContainer.appendChild(formEl);
                this.#occurrenceForm.populateFormContent();

                this.refreshOccurrenceFooterControls(editorContainer);

                // ensures that the accordion matches the navigation state
                $(`#description_${occurrence.id}`).collapse('show');
            } else {
                this.#displayDefaultRightPanel(OccurrenceForm.help);
            }
        } catch (error) {
            console.log({error});
            let editorContainer = document.getElementById(RIGHT_PANEL_ID);

            if (editorContainer) {
                editorContainer.innerHTML = `<p>${error.message}</p>`;
            } else {
                document.body.innerHTML = `<h2>Internal error</h2><p>Please report this problem:</p><p>${error.message}</p>`;
            }
        }
    }

    /**
     * adds next/new and finish/close button to below right-panel occurrence editor
     * @param {HTMLElement} editorContainer
     */
    refreshOccurrenceFooterControls(editorContainer) {
        let nextSection;
        const buttonContainer = editorContainer.appendChild(document.createElement('div'));

        const backButton = buttonContainer.appendChild(document.createElement('button'));
        backButton.className = 'btn btn-secondary btn-md-lg mt-2 mb-3 mr-2';
        backButton.type = 'button';
        backButton.textContent = 'back to list';
        backButton.setAttribute('data-buttonaction', 'back');

        if (this.occurrenceIsMostRecent(this.controller.currentOccurrence)) {
            const addNewButton = buttonContainer.appendChild(document.createElement('button'));
            addNewButton.className = 'btn btn-primary btn-md-lg mt-2 mb-3 mr-2';
            addNewButton.type = 'button';
            addNewButton.textContent = 'add another';
            addNewButton.setAttribute('data-buttonaction', 'new');
        }

        if (this.OCCURRENCES_ARE_LAST_SECTION) {
            const finishButton = buttonContainer.appendChild(document.createElement('button'));
            finishButton.className = 'btn btn-primary btn-md-lg mt-2 mb-3';
            finishButton.type = 'button';
            finishButton.textContent = 'finish';
            finishButton.setAttribute('data-buttonaction', 'finish');
        } else {
            const nextFormIndex = 1;
            nextSection = SurveyForm.sections[nextFormIndex];

            const nextButton = buttonContainer.appendChild(document.createElement('button'));
            nextButton.className = 'btn btn-primary btn-md-lg mt-2 mb-3';
            nextButton.type = 'button';
            nextButton.textContent = 'next »';
            nextButton.setAttribute('data-buttonaction', 'next');
            nextButton.title = nextSection.sectionTitle;
        }

        buttonContainer.addEventListener('click', (event) => {
            const buttonEl = event.target.closest('button');

            if (buttonEl && buttonEl.hasAttribute('data-buttonaction')) {
                switch (buttonEl.getAttribute('data-buttonaction')) {
                    case 'new':
                        this.fireEvent(MainController.EVENT_NEW_RECORD);
                        break;

                    case 'back':
                        this.controller.app.router.navigate('/list/record/');
                        break;

                    case 'finish':
                        this.controller.app.router.navigate('/list/record/');
                        // display the finish dialogue box
                        $(`#${FINISH_MODAL_ID}`).modal();
                        break;

                    case 'next':
                        this.controller.app.router.navigate(`/list/survey/${nextSection.sectionNavigationKey}`);
                        break;

                    default:
                        throw new Error(`Unrecognised button action ${buttonEl.getAttribute('data-buttonaction')}`);
                }
            }
        });
    }

    /**
     *
     * @param {Occurrence} occurrence
     * @returns {boolean}
     */
    occurrenceIsMostRecent(occurrence) {
        // loop through entries sorted by creation date, most recent first
        for (let occurrenceTuple of this.controller.occurrences.entries()) {
            if (occurrenceTuple[1].createdStamp > occurrence.createdStamp && !occurrenceTuple[1].deleted) {
                return false;
            }
        }
        return true;
    }

    /**
     *
     * @param {string} [htmlText]
     */
    #displayDefaultRightPanel(htmlText) {
        let editorContainer = document.getElementById(RIGHT_PANEL_ID);
        editorContainer.innerHTML = htmlText || this.defaultRightHandSideHelp;
    }

    #clearOccurrenceListeners() {
        for(let id in this.#occurrenceChangeHandles) {
            let occurrence = this.controller.occurrences.get[id];
            if (occurrence) {
                occurrence.removeListener(Occurrence.EVENT_MODIFIED, this.#occurrenceChangeHandles[id]);
            }
        }

        this.#occurrenceChangeHandles = {};
    }

    static NEXT_RECORDS = 'records';
    static NEXT_SURVEY_SECTION = 'survey';
    static NEXT_IS_FINAL = 'last';

    /**
     * sets up the accordion list of welcome text, survey form and occurrence sections
     */
    #populateLeftPanel() {
        const leftPanel = document.getElementById(LEFT_PANEL_ID);
        const accordionEl = leftPanel.appendChild(document.createElement('div'));
        accordionEl.className = "accordion";
        this.leftPanelAccordionId = accordionEl.id = Form.nextId;

        this.#appendWelcomeSection();
        this.#appendSurveyForm(0, accordionEl, MainView.NEXT_RECORDS); // about you

        this.#appendOccurrenceListContainer();

        // Keep this as is useful as guide for building other app layouts
        //this.#appendSurveyForm(1, accordionEl, MainView.NEXT_IS_FINAL); // about your garden

        this.#buildOccurrenceList();

        /**
         * need to manually intercept clicks on the form help buttons
         * to prevent click also triggering an accordion toggle
         */
        accordionEl.addEventListener('click', /** @param {MouseEvent} event */ (event) => {
            const targetLinkEl = event.target.closest('a');

            if (targetLinkEl && targetLinkEl.hasAttribute('data-help-link')) {
                event.preventDefault();
                event.stopPropagation();

                this.controller.app.router.navigate(targetLinkEl.getAttribute('data-help-link'));
            }
        });

        this.#registerLeftPanelAccordionEvent();
        this.#registerModals();
    }

    #registerModals() {
        //const container = document.getElementById(LEFT_PANEL_ID);
        const container = document.body;

        // Delete record modal
        const deleteOccurrenceModalHTML = `<div class="modal fade" id="${DELETE_OCCURRENCE_MODAL_ID}" tabindex="-1" role="dialog" aria-labelledby="${DELETE_OCCURRENCE_MODAL_ID}Title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="${DELETE_OCCURRENCE_MODAL_ID}Title">Delete record?</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        Please confirm that you wish to delete the record.
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Back</button>
        <button type="button" class="btn btn-danger" data-dismiss="modal" id="${DELETE_OCCURRENCE_MODAL_ID}confirmed">Delete record</button>
      </div>
    </div>
  </div>
</div>`;

        const deleteOccurrenceModalEl = document.createElement('div');
        deleteOccurrenceModalEl.innerHTML = deleteOccurrenceModalHTML;

        container.appendChild(deleteOccurrenceModalEl.firstChild);

        $(`#${DELETE_OCCURRENCE_MODAL_ID}`).on('show.bs.modal', (event) => {
            const button = $(event.relatedTarget); // Button that triggered the modal

            // button will not be valid if modal has been invoked directly from script,
            // in which case the occurrence id attribute will already have been set
            if (button && button.data('occurrenceid')) {
                const occurrenceId = button.data('occurrenceid');
                document.getElementById(`${DELETE_OCCURRENCE_MODAL_ID}confirmed`).setAttribute('data-occurrenceid', occurrenceId);
            }
        });

        document.getElementById(`${DELETE_OCCURRENCE_MODAL_ID}confirmed`).addEventListener('click', (event) => {
            const confirmButtonEl = event.target.closest('button');

            if (confirmButtonEl && confirmButtonEl.hasAttribute('data-occurrenceid')) {
                const occurrenceId = confirmButtonEl.getAttribute('data-occurrenceid');
                console.log(`Deleting occurrence ${occurrenceId}.`);

                this.fireEvent(MainController.EVENT_DELETE_OCCURRENCE, {occurrenceId});
            }
        });


        // 'finish' modal
        // this pop-up is informational only
        const finishModalEl = document.createElement('div');
        finishModalEl.innerHTML = `<div class="modal fade" id="${FINISH_MODAL_ID}" tabindex="-1" role="dialog" aria-labelledby="${FINISH_MODAL_ID}Title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="${FINISH_MODAL_ID}Title">Thank you</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Thank you! Your form responses have been sent. If you wish, you can continue to make changes and edit or add further records.</p>
        <p>If you provided an email address, then we will send you a message with a link to this form, so that you can return to it later if needed.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;

        container.appendChild(finishModalEl.firstChild);

        container.appendChild(ImageField.licenseModal());

        // image modal
        // includes a button to delete the image
        const imageModalEl = document.createElement('div');
        imageModalEl.innerHTML = `<div class="modal fade" id="${IMAGE_MODAL_ID}" tabindex="-1" role="dialog" aria-labelledby="${IMAGE_MODAL_ID}Title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header d-none d-md-flex">
        <h5 class="modal-title" id="${IMAGE_MODAL_ID}Title">Photo</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body" style="position: relative;">
        <picture>
        </picture>
      </div>
      <div class="modal-footer">
        <button type="button" id="${IMAGE_MODAL_DELETE_BUTTON_ID}" class="btn btn-outline-danger delete-occurrence-button mr-3" data-toggle="modal" data-target="#${DELETE_IMAGE_MODAL_ID}" data-imageid=""><i class="material-icons">delete</i></button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;
        container.appendChild(imageModalEl.firstChild);

        document.getElementById(IMAGE_MODAL_DELETE_BUTTON_ID).addEventListener('click', (event) => {
            const deleteButtonEl = event.target.closest('button');

            if (deleteButtonEl && deleteButtonEl.hasAttribute('data-imageid')) {
                const imageId = deleteButtonEl.getAttribute('data-imageid');
                //console.log(`Deleting image ${occurrenceId}.`);

                this.#occurrenceForm.fireEvent(EVENT_DELETE_IMAGE, {imageId});
                $(`#${IMAGE_MODAL_ID}`).modal('hide');
            }
        });
    }

    #registerLeftPanelAccordionEvent() {
        // console.log('Registering left panel accordion event handler.');

        $(`#${LEFT_PANEL_ID}`).on('show.bs.collapse', (event) => {
            // this will fire for both selection events within the records list and for changes to the top-level accordion

            if (event.target.dataset.occurrenceid) {
                console.log({'left panel accordion show event (with occ id)' : event});
                this.fireEvent(MainController.EVENT_SELECT_OCCURRENCE, {occurrenceId: event.target.dataset.occurrenceid});
            } else if (event.target.dataset.sectionkey) {
                console.log({'left panel accordion show event (with section key)' : event});
                this.fireEvent(MainController.EVENT_SELECT_SURVEY_SECTION, {sectionKey: event.target.dataset.sectionkey});
            } else {
                console.log({'left panel accordion show event (other)' : event});
            }
        }).on('hidden.bs.collapse', (event) => {
            // this will fire for both selection events within the records list and for changes to the top-level accordion

            console.log({'left panel accordion hide event' : event});

            if (event.target.dataset.occurrenceid) {
                // should evaluate the validity of the individual occurrence

                const occurrence = this.controller.occurrences.get(event.target.dataset.occurrenceid);

                if (occurrence.isNew && !occurrence.isPristine) {
                    // closing of the slider is an action suggesting that user has moved on and validation should start
                    occurrence.isNew = false;
                    this.refreshOccurrenceValiditySummary(occurrence);
                }

                // only trigger a navigation if the occurrence was the current one
                if (this.controller.currentOccurrenceId === event.target.dataset.occurrenceid) {
                    this.fireEvent(MainController.EVENT_SELECT_OCCURRENCE, {occurrenceId: ''});
                }
            } else if (event.target.dataset.sectionkey) {
                if (event.target.dataset.sectionkey === 'record') {
                    // closing the top-level occurrences list
                    // need to propagate validation down to the occurrences

                    // only trigger a navigation if the view context was the current one
                    if (this.controller.viewSubcontext === 'record') {
                        this.fireEvent(MainController.EVENT_SELECT_SURVEY_SECTION, {sectionKey: ''});
                    }
                } else {
                    if (this.#surveyFormSections[event.target.dataset.sectionkey]) {
                        const isValid = this.#surveyFormSections[event.target.dataset.sectionkey].validateForm();
                        console.log({'survey section validity': isValid});

                        // only trigger a navigation if the section was the current one
                        if (this.controller.surveySection === event.target.dataset.sectionkey) {
                            this.fireEvent(MainController.EVENT_SELECT_SURVEY_SECTION, {sectionKey: ''});
                        }
                    }
                }
            }
        });
    }

    #appendWelcomeSection() {
        const accordionEl = document.getElementById(this.leftPanelAccordionId);

        // add 'next' button to the bottom of the survey form
        const nextButton = document.createElement('button');
        nextButton.className = 'btn btn-primary';
        nextButton.type = 'button';
        nextButton.textContent = 'get started »';
        nextButton.setAttribute('data-toggle', 'collapse');
        nextButton.setAttribute('data-target', '#survey-0-about');

        let cardId = Form.nextId;

        const sectionElement = document.createElement('div');
        sectionElement.innerHTML = this.welcomeContent;

        sectionElement.appendChild(nextButton);

        const helpLink = document.createElement('span');
        helpLink.className = 'd-md-none pl-2';
        // noinspection HtmlUnknownTarget
        helpLink.innerHTML = `(<a href="/app/list/survey/welcome/help" data-navigo="list/survey/welcome/help">more info</a>)`;
        sectionElement.appendChild(helpLink);

        accordionEl.appendChild(this.card({
            cardId: cardId,
            cardHeadingId: Form.nextId,
            collapsed: this.controller.surveySection !== 'welcome',
            headingButtonId: Form.nextId,
            headingHTML:
                '<img src="/img/BSBIlong.png" alt="" style="float:right; max-width: 40%; max-height: 48px;">' +
                '<div style="float: left;">Welcome</div>', // was 'Welcome'
            buttonStyleString: 'width: 100%',
            headingNonbuttonHTML: '', // `<small class="btn d-md-none">(<a href="/app/list/survey/${sectionClass.sectionNavigationKey}/help" data-help-link="/list/survey/${sectionClass.sectionNavigationKey}/help">help</a>)</small>`,
            headingValidationWarningHTML: '',
            cardDescriptionId: `survey-welcome`,// Form.nextId,
            parentContainerId: accordionEl.id,
            bodyContentElement: sectionElement,
            dataAttributes : {sectionkey : "welcome"}
        }));
    }

    /**
     *
     * @param {number} formIndex
     * @param {HTMLElement} accordionEl
     * @param {'records','survey','last'} next
     */
    #appendSurveyForm(formIndex, accordionEl, next) {
        const sectionClass = SurveyForm.sections[formIndex];

        let surveyFormSection = new SurveyForm(sectionClass);

        this.#surveyFormSections[sectionClass.sectionNavigationKey] = surveyFormSection;

        let formElement = surveyFormSection.formElement;

        // add 'next' button to the bottom of the survey form
        let nextButton = document.createElement('button');
        nextButton.className = 'btn btn-primary';
        nextButton.type = 'button';
        nextButton.textContent = 'next »';

        switch (next) {
            case MainView.NEXT_RECORDS:
                // records section is next
                // if there are no records then clicking the button should add a new one automatically
                // the complexity of this dual action requires a click handler

                nextButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();

                    this.fireEvent(MainController.EVENT_NEXT_TO_RECORDS);
                });
                break;

            case MainView.NEXT_SURVEY_SECTION:
                // there's another survey section
                const nextSection = SurveyForm.sections[formIndex + 1];

                nextButton.setAttribute('data-toggle', 'collapse');
                nextButton.setAttribute('data-target', `#survey-${formIndex + 1}-${nextSection.sectionNavigationKey}`);
                nextButton.title = nextSection.sectionTitle;
                break;

            case MainView.NEXT_IS_FINAL:
                nextButton.textContent = 'finish';
                nextButton.className = 'btn btn-primary btn-md-lg mt-2 mb-3';
                nextButton.type = 'button';

                nextButton.addEventListener('click', (/* event */) => {
                    this.controller.app.router.navigate('/list/');
                    // display the finish dialogue box
                    $(`#${FINISH_MODAL_ID}`).modal();
                });
                break;

            default:
                throw new Error(`Unrecognized next section keyword '${next}'`);
        }

        formElement.appendChild(nextButton);

        let cardId = Form.nextId;

        accordionEl.appendChild(this.card({
            cardId: cardId,
            cardHeadingId: Form.nextId,
            collapsed: this.controller.surveySection !== sectionClass.sectionNavigationKey,
            headingButtonId: Form.nextId,
            headingHTML: sectionClass.sectionTitle,
            headingNonbuttonHTML: `<small class="btn d-md-none" style="margin: 0; padding: 0;">(<a href="/app/list/survey/${sectionClass.sectionNavigationKey}/help" data-help-link="/list/survey/${sectionClass.sectionNavigationKey}/help">help</a>)</small>`,
            headingValidationWarningHTML: 'Please check the form for some missing responses.',
            cardDescriptionId: `survey-${formIndex}-${sectionClass.sectionNavigationKey}`,// Form.nextId,
            parentContainerId: accordionEl.id,
            bodyContentElement: formElement,
            dataAttributes : {sectionkey : sectionClass.sectionNavigationKey}
        }));

        // cannot call registerForm until the form is part of the document
        this.controller.survey.registerForm(surveyFormSection);

        surveyFormSection.addListener(SurveyForm.EVENT_VALIDATION_STATE_CHANGE, (params) => {
            const cardEl = document.getElementById(cardId);
            if (params.isValid) {
                cardEl.classList.remove('is-invalid');
            } else {
                cardEl.classList.add('is-invalid');
            }
        });
    }

    #appendOccurrenceListContainer() {
        const accordionEl = document.getElementById(this.leftPanelAccordionId);

        const content = document.createDocumentFragment();
        const summaryEl = content.appendChild(document.createElement('p'));
        // noinspection HtmlUnknownTarget
        summaryEl.innerHTML = `${this.occurrenceSummaryText}<small class="d-block d-md-none"><a href="/app/list/record/help">(help)</a></small>`;

        const newButtonEl = content.appendChild(document.createElement('button'));
        newButtonEl.type = 'button';
        newButtonEl.className = 'btn btn-primary btn-lg mb-2';
        newButtonEl.innerText = 'Add a plant record.';

        newButtonEl.addEventListener('click', this.newButtonClickHandler.bind(this));

        const recordListContainer = content.appendChild(document.createElement('div'));
        recordListContainer.id = OCCURRENCE_LIST_CONTAINER_ID;

        accordionEl.appendChild(this.card({
            cardId: Form.nextId,
            cardHeadingId: Form.nextId,
            collapsed: this.controller.viewSubcontext !== 'record',
            headingButtonId: Form.nextId,
            headingHTML: 'Your plant records',
            cardDescriptionId: Form.nextId,
            parentContainerId: accordionEl.id,
            bodyContentElement: content,
            dataAttributes : {sectionkey : 'record'}
        }));
    }

    /**
     * @param {MouseEvent} event
     */
    newButtonClickHandler(event) {
        event.preventDefault();
        event.stopPropagation();

        this.fireEvent(MainController.EVENT_NEW_RECORD);
    }

    /**
     *
     */
    #buildOccurrenceList() {
        const listContainer = document.getElementById(OCCURRENCE_LIST_CONTAINER_ID);
        if (!listContainer) {
            throw new InternalAppError("Failed to find list container.");
        }

        this.#clearOccurrenceListeners();

        const occurrencesHtml = [];

        // loop through entries sorted by creation date, most recent first
        for (let occurrenceTuple of [...this.controller.occurrences.entries()].sort((a, b) => b[1].createdStamp - a[1].createdStamp)) {
            let occurrence = occurrenceTuple[1];
            console.log(`displaying '${occurrence.id}'`);
            if (!occurrence.deleted) {
                const valid = occurrence.isNew || occurrence.evaluateCompletionStatus(OccurrenceForm.properties).requiredFieldsPresent;

                occurrencesHtml.push(
`<div class="card${valid ? '' : ' is-invalid'}" id="card_${occurrence.id}">
    ${this.#occurrenceSummaryHTML(occurrence)}
</div>`);

                this.#occurrenceChangeHandles[occurrence.id] = occurrence.addListener(
                    Occurrence.EVENT_MODIFIED,
                    this.occurrenceChangeHandler.bind(this),
                    {occurrenceId: occurrence.id}
                );
            }
        }

        listContainer.className = 'accordion';
        listContainer.innerHTML = occurrencesHtml.join('');

        /**
         * need to manually intercept clicks on the delete occurrence button
         * to prevent click also triggering an accordion toggle
         */
        listContainer.addEventListener('click', /** @param {MouseEvent} event */ (event) => {
            const targetButtonEl = event.target.closest('button');

            if (targetButtonEl && targetButtonEl.hasAttribute('data-toggle') && targetButtonEl.getAttribute('data-toggle') === 'modal') {
                // annotate the delete record modal dialogue box with the occurrence id
                document.getElementById(`${DELETE_OCCURRENCE_MODAL_ID}confirmed`)
                    .setAttribute('data-occurrenceid', targetButtonEl.getAttribute('data-occurrenceid'));

                // display the dialogue box
                $(targetButtonEl.getAttribute('data-target')).modal();

                event.preventDefault();
                event.stopPropagation();
            }
        });
    }

    /**
     * called after the one-off addition of a new occurrence
     *
     * @param {{occurrenceId: string, surveyId: string}} params
     */
    occurrenceAddedHandler(params) {
        const occurrenceList = document.getElementById(OCCURRENCE_LIST_CONTAINER_ID);

        if (occurrenceList) {
            const occurrence = this.controller.occurrences.get(params.occurrenceId);
            const itemCard = document.createElement('div');
            itemCard.className = 'card';
            itemCard.id = `card_${occurrence.id}`;
            itemCard.innerHTML = this.#occurrenceSummaryHTML(occurrence);

            this.#occurrenceChangeHandles[occurrence.id] = occurrence.addListener(
                Occurrence.EVENT_MODIFIED,
                this.occurrenceChangeHandler.bind(this),
                {occurrenceId: occurrence.id}
            );

            occurrenceList.insertBefore(itemCard, occurrenceList.firstChild);
        }
    }

    /**
     * sets validity flag in occurrence accordion header
     *
     * @param {Occurrence} occurrence
     */
    refreshOccurrenceValiditySummary(occurrence) {
        const cardEl = document.getElementById(`card_${occurrence.id}`);
        if (cardEl) {
            const validity = occurrence.evaluateCompletionStatus(OccurrenceForm.properties);

            if (validity.requiredFieldsPresent) {
                cardEl.classList.remove('is-invalid');
            } else {
                cardEl.classList.add('is-invalid');
            }
        }
    }

    /**
     *
     * @param {{occurrenceId : string}} params
     */
    occurrenceChangeHandler(params) {
        const occurrence = this.controller.occurrences.get(params.occurrenceId);
        const el = document.getElementById(`card_${params.occurrenceId}`);

        if (el) {
            if (!occurrence.deleted) {
                el.innerHTML = this.#occurrenceSummaryHTML(occurrence);
                this.refreshOccurrenceValiditySummary(occurrence);
            } else {
                el.parentElement.removeChild(el);

                // remove the event listener
                if (this.#occurrenceChangeHandles[params.occurrenceId]) {
                    occurrence.removeListener(Occurrence.EVENT_MODIFIED, this.#occurrenceChangeHandles[params.occurrenceId]);
                    this.#occurrenceChangeHandles[params.occurrenceId] = null;
                }
            }
        }
    }

    /**
     *
     * @param {Occurrence} occurrence
     * @returns {string}
     */
    occurrenceSummaryBodyHTML(occurrence) {
        let html = '';

        for (let key in occurrence.attributes) {
            if (occurrence.attributes.hasOwnProperty(key)
                && OccurrenceForm.properties.hasOwnProperty(key)
                && !OccurrenceForm.properties[key].field.isEmpty(occurrence.attributes[key])
            ) {
                let summaryHTML = OccurrenceForm.properties[key].field.summarise(key, OccurrenceForm.properties[key], occurrence.attributes);

                if (summaryHTML) {
                    html += `<p class="ellipsed-line mb-0">${summaryHTML}</p>`;
                }
            }
        }

        if (App.devMode) {
            html += `<p class="mb-0">(<i>id ${occurrence.id}</i>)</p>`;
        }
        return html;
    }

    /**
     *
     * @param {Occurrence} occurrence
     * @returns {string}
     */
    occurrenceSummaryHeadingHTML(occurrence) {
        let html = '';

        if (occurrence.attributes.hasOwnProperty('images') && occurrence.attributes.images.length) {
            const firstImageId = occurrence.attributes.images[0];
            html += OccurrenceImage.imageLink(firstImageId, 48, 48, {className : 'mr-1'});
        }

        if (occurrence.attributes.taxon && occurrence.attributes.taxon.taxonId) {
            // have an well-formed taxon
            html += occurrence.taxon.formattedHTML(occurrence.attributes.taxon.vernacularMatch);
        } else if (occurrence.attributes.taxon && occurrence.attributes.taxon.taxonName) {
            // match with unrecognised taxon name
            html += escapeHTML(occurrence.attributes.taxon.taxonName);
        } else {
            html += '<span>(unnamed plant)</span>';
        }

        return html;
    }

    /**
     * cardHeadingEl.setAttribute('data-toggle', 'collapse');
     cardHeadingEl.setAttribute('data-target', `#${descriptor.cardDescriptionId}`);
     *
     * @param {Occurrence} occurrence
     * @return {string}
     */
    #occurrenceSummaryHTML (occurrence) {
        return `<div class="card-header pointer pl-2 pr-2 pt-2 pb-2" id="heading_${occurrence.id}" data-toggle="collapse" data-target="#description_${occurrence.id}">
    <div class="float-right">
        <button type="button" class="btn btn-outline-danger delete-occurrence-button" data-toggle="modal" data-target="#${DELETE_OCCURRENCE_MODAL_ID}" data-occurrenceid="${occurrence.id}"><i class="material-icons">delete</i></button>
    </div>
    <h2 class="mb-0 pb-0 mt-0 pt-0 pl-0 ml-0">
        <button class="btn btn-link${(this.controller.currentOccurrenceId === occurrence.id ? '' : ' collapsed')} pt-0 pb-0 pl-0" id="headingbutton_${occurrence.id}" type="button" data-toggle="collapse" data-target="#description_${occurrence.id}" aria-expanded="${(this.controller.currentOccurrenceId === occurrence.id ? 'true' : 'false')}" aria-controls="description_${occurrence.id}">
          ${this.occurrenceSummaryHeadingHTML(occurrence)}
        </button>
    </h2>
    <div class="card-invalid-feedback">
        <small>Please check for errors or missing details.</small>
    </div>
</div>
<div id="description_${occurrence.id}" class="collapse${(this.controller.currentOccurrenceId === occurrence.id ? ' show' : '')}" aria-labelledby="heading_${occurrence.id}" data-parent="#${OCCURRENCE_LIST_CONTAINER_ID}" data-occurrenceid="${occurrence.id}">
  <div class="card-body">
    ${this.occurrenceSummaryBodyHTML(occurrence)}
  </div>
</div>`;
    }

    /**
     *
     * @param {('left'|'right')} panel
     */
    setResponsivePanel(panel) {
        const rightPanel = document.getElementById(RIGHT_PANEL_ID);
        const leftPanel = document.getElementById(LEFT_PANEL_ID);
        const midPanel = document.getElementById(CONTROL_PANEL_ID);

        switch (panel) {
            case PANEL_LEFT:
                leftPanel.classList.remove('d-none');
                leftPanel.classList.add('d-block');
                rightPanel.classList.remove('d-block');
                rightPanel.classList.add('d-none');
                midPanel.classList.remove('d-md-none');
                midPanel.classList.add('d-none');
                break;

            case PANEL_RIGHT:
                leftPanel.classList.remove('d-block');
                leftPanel.classList.add('d-none');
                rightPanel.classList.remove('d-none');
                rightPanel.classList.add('d-block');
                midPanel.classList.remove('d-none');
                midPanel.classList.add('d-md-none');
                break;

            default:
                throw new Error(`Unrecognised panel value '${panel}`);
        }
    }
}
