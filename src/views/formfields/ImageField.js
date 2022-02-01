import {FormField} from "./FormField";
import {OccurrenceImage} from "../../models/OccurrenceImage";
import {doubleClickIntercepted} from "../../utils/stopDoubleClick";
import {GPSRequest} from "../../utils/GPSRequest";
import {Form} from "../forms/Form";
import {Modal} from 'bootstrap';

export const IMAGE_MODAL_ID = 'imagemodal';
export const IMAGE_MODAL_DELETE_BUTTON_ID = 'imagemodaldelete';
export const DELETE_IMAGE_MODAL_ID = 'deleteimagemodal';
export const EVENT_DELETE_IMAGE = 'deleteimage';

export class ImageField extends FormField {

    /**
     * @type {string}
     */
    #inputId;

    /**
     * @type {string}
     */
    #containerId;

    /**
     * @type {string}
     */
    #statusBlockId;

    /**
     * @type {OccurrenceForm}
     */
    parentForm;

    /**
     *
     * @type {{images: Array.<OccurrenceImage>}}
     * @private
     */
    _value = {
        images : []
    };

    /**
     *
     * @type {boolean}
     */
    includeCamera = true;

    /**
     *
     * @type {string}
     */
    placeholder = '';

    static LICENSE_MODAL = 'imagelicensemodal';

    static ORIGIN_CAMERA = 'cameraimage';
    static ORIGIN_FILE = 'fileimage';

    /**
     *
     * @param {{[label] : string, [helpText]: string, [placeholder]: string, [includeCamera]: boolean}} [params]
     */
    constructor (params) {
        super(params);

        if (params) {
            if (params.hasOwnProperty('includeCamera')) {
                this.includeCamera = params.includeCamera;
            }

            if (params.placeholder) {
                this.placeholder = params.placeholder;
            }
        }
    }

    /**
     * sets content as Images, not as raw files
     *
     * @param {(Array.<string>|null)} imageIds
     */
    set value(imageIds) {
        this._value = {
            images : []
        };

        if (imageIds) {
            for (let id of imageIds) {
                if (OccurrenceImage.imageCache.has(id)) {
                    this._value.images.push(OccurrenceImage.imageCache.get(id));
                } else {
                    console.log(`Creating placeholder image object '${id}'`);
                    this._value.images.push(OccurrenceImage.placeholder(id));
                }
            }
        }

        this.updateView();
    }

    /**
     *
     * @param {Array.<string>} value (list of image ids or null)
     * @returns {boolean}
     */
    static isEmpty(value) {
        return !value || value.length === 0;
    }

    /**
     *
     * @returns {Array.<string>}
     */
    get value() {
        let ids = [];
        if (this._value && this._value.images) {
            for (let image of this._value.images) {
                ids[ids.length] = image.id;
            }
        }

        return ids;
    }

    updateView() {
        if (this._fieldEl) {
            // do nothing until the view has been constructed

            const idList = [];
            for (let image of this._value.images) {
                idList.push(`<picture style="cursor: pointer;" data-imageid="${image.id}"><source srcset="/image.php?imageid=${image.id}&amp;height=128&amp;format=webp" type="image/webp"><img data-imageid="${image.id}" src="/image.php?imageid=${image.id}&amp;height=128&amp;format=jpeg" height="128" alt="photo"></picture>`);
            }

            const statusEl = document.getElementById(this.#statusBlockId);
            statusEl.innerHTML = idList.join("\n");
        }
    }

    /**
     * initialises this._fieldEl
     *
     * @returns {void}
     */
    buildField() {
        // <div class="custom-file">
        //     <input type="file" class="custom-file-input" id="customFile">
        //     <label class="custom-file-label" for="customFile">Choose file</label>
        // </div>

        const container = document.createElement('div');
        container.className = 'form-group';

        this.#containerId = container.id = FormField.nextId;
        this.#inputId = FormField.nextId;

        const labelEl = container.appendChild(document.createElement('label'));
        labelEl.htmlFor = this.#inputId;
        labelEl.textContent = this.label;

        const inputGroupEl = container.appendChild(document.createElement('div'));
        inputGroupEl.className = 'input-group';

        const filePickerWrapper = document.createElement('div');
        filePickerWrapper.className = 'custom-file';
        inputGroupEl.appendChild(filePickerWrapper);

        const filePickerField = filePickerWrapper.appendChild(document.createElement('input'));
        filePickerField.type = 'file';
        filePickerField.className = "custom-file-input";
        filePickerField.id = this.#inputId;
        filePickerField.accept = ".jpeg, .jpg, image/png, image/jpeg";
        filePickerField.multiple = true;

        if (this.placeholder) {
            const pickerLabelEl = filePickerWrapper.appendChild(document.createElement('label'));
            pickerLabelEl.className = 'custom-file-label';
            pickerLabelEl.htmlFor = this.#inputId;
            pickerLabelEl.textContent = this.placeholder;
        }

        if (this.includeCamera && (GPSRequest.getDeviceType() !== GPSRequest.DEVICE_TYPE_IMMOBILE)) {
            const cameraButtonContainer = document.createElement('div');
            cameraButtonContainer.className = 'input-group-append';

            const cameraSpan = cameraButtonContainer.appendChild(document.createElement('span'));
            cameraSpan.className = 'input-group-text';

            const cameraLabel = cameraSpan.appendChild(document.createElement('label'));
            cameraLabel.className = 'pl-0 pr-0 ml-0 mr-0 mt-0 mb-0 pt-0 pb-0 material-icons';

            const cameraIcon = cameraLabel.appendChild(document.createElement('i'));
            cameraIcon.className = 'material-icons pl-0 pr-0 ml-0 mr-0 mt-0 mb-0 pt-0 pb-0';
            cameraIcon.textContent = 'add_a_photo';

            const cameraInput = cameraLabel.appendChild(document.createElement('input'));
            cameraInput.type = 'file';
            cameraInput.capture = 'environment';
            cameraInput.accept = 'image/*';
            cameraInput.style.display = 'none';
            cameraInput.id = FormField.nextId;

            inputGroupEl.appendChild(cameraButtonContainer);
            cameraInput.addEventListener('change', this.inputChangeHandler.bind(this, {inputId : cameraInput.id, origin : ImageField.ORIGIN_CAMERA}));
        }

        // styling save buttons: https://www.abeautifulsite.net/whipping-file-inputs-into-shape-with-bootstrap-3
        // (partially relevant)

        // <label class="img-picker icon icon-camera">
        // <input type="file" accept="image/*" capture="environment"/>
        // </label>

        if (this.helpText) {
            const helpTextField = container.appendChild(document.createElement('small'));
            helpTextField.innerHTML = this.helpText;
        }

        const statusBlockEl = container.appendChild(document.createElement('p'));
        this.#statusBlockId = statusBlockEl.id = FormField.nextId;

        // register a click handler for images (to open a modal)
        statusBlockEl.addEventListener('click', this.imageClickHandler.bind(this));

        if (this.validationMessage) {
            const validationMessageElement = container.appendChild(document.createElement('div'));
            validationMessageElement.className = 'invalid-feedback';
            validationMessageElement.innerHTML = this.validationMessage;
        }

        filePickerField.addEventListener('change', this.inputChangeHandler.bind(this, {inputId : filePickerField.id, origin : ImageField.ORIGIN_FILE}));

        this._fieldEl = container;

        this.parentForm.addListener(EVENT_DELETE_IMAGE, this.deleteImageHandler.bind(this));
    }

    /**
     * called after user has clicked delete button on an image
     *
     * @param {{imageId : string}} params
     */
    deleteImageHandler(params) {
        console.log(`delete image ${params.imageId}`);

        let image;

        for (let key in this._value.images) {
            if (this._value.images.hasOwnProperty(key)) {
                if (this._value.images[key].id === params.imageId) {
                    image = this._value.images.splice(key, 1)[0];
                    break;
                }
            }
        }

        if (!image) {
            console.log(`Failed to find image id ${params.imageId}`);
        } else {
            // re-save image to flag as deleted
            image.deleted = true;
            this.#save([image]);

            this.updateView();
            this.fireEvent(FormField.EVENT_CHANGE);
        }
    }

    /**
     *
     * @param {MouseEvent} event
     */
    imageClickHandler (event) {
        if (doubleClickIntercepted(event)) {
            return;
        }

        let targetEl = event.target.closest('picture');

        if (!targetEl) {
            targetEl = event.target.closest('img');
        }

        // console.log({'clicked image' : targetEl});

        const imageId = targetEl.getAttribute('data-imageid');

        if (imageId) {
            const imageModal = document.getElementById(IMAGE_MODAL_ID);
            const pictureEl = imageModal.getElementsByTagName('picture')[0];
            pictureEl.innerHTML = `<source srcset="/image.php?imageid=${imageId}&amp;width=${window.innerWidth}&amp;format=webp" type="image/webp">
                <img src="/image.php?imageid=${imageId}&amp;width=${window.innerWidth}&amp;format=jpeg" width="auto" style="max-height: 48vh; max-width: 100%;" alt="photo">`;

            const deleteButton = document.getElementById(IMAGE_MODAL_DELETE_BUTTON_ID);
            deleteButton.setAttribute('data-imageid', imageId);

            //$(`#${IMAGE_MODAL_ID}`).modal({});
            //Modal.getOrCreateInstance(document.getElementById(IMAGE_MODAL_ID), {}).show();
            ImageField.imageModal.show();
        }
    }

    /**
     * called with an additional bound element id parameter
     * (this allows the handler to easily distinguish between the two file pickers)
     *
     * @param {{inputId : string, origin : string}} params
     * @param {Event} event
     */
    inputChangeHandler (params, event) {
        event.stopPropagation(); // don't allow the change event to reach the form-level event handler (will handle it here instead)

        console.log({'got image field input change event' : params});

        let imageEl = document.getElementById(params.inputId);

        if (imageEl.files.length) {
            this.#addFiles(imageEl.files)
                .then(() => {
                    this.fireEvent(FormField.EVENT_CHANGE);
                });

            if (params.origin === ImageField.ORIGIN_CAMERA) {
                // if origin of image was camera button click then it's useful to fire event
                // as this might be a good time to take a GPS fix
                this.parentForm.fireEvent(Form.EVENT_CAMERA);
            }
        } else {
            this.fireEvent(FormField.EVENT_CHANGE);
        }
    }

    /**
     *
     * @param {FileList} fileList
     * @return {Promise<void>}
     */
    #addFiles (fileList) {
        // cannot save until parent occurrence has been saved
        // so pre-trigger a save event
        this.parentForm.pingOccurrence();

        const images = [];

        for (let file of fileList) {
            images.push(OccurrenceImage.fromFile(file));
        }

        return this.#save(images);
    }

    /**
     *
     * @param {Array.<OccurrenceImage>} images
     * @returns {Promise.<void>|Promise.<T>}
     */
    #save (images) {
        if (images.length) {
            const image = images.shift();
            return image.save(this.parentForm.surveyId, this.parentForm.occurrenceId, this.parentForm.projectId)
                .then((jsonImageDescriptor) => {

                    if (!image.deleted) {
                        console.log(`Added image '${image.id}'`);
                        console.log({jsonDescription: jsonImageDescriptor});
                        this._value.images.push(image);
                        this.updateView(); // excessive view updates, should do once when all promises have succeeded
                        // this may break with multiple images if fileList is live and is cleared when input is cleared
                        // during view update, need to test
                    } else {
                        console.log({'deleted image' : image.id});
                    }
                }, (reason) => {
                    console.log(`Failed to add image ${image.id}`);
                    console.log({"Failure reason": reason});
                })
                .finally(() => {
                    return this.#save(images);
                });
        } else {
            return Promise.resolve();
        }
    }

    /**
     * @type {Modal}
     */
    static imageModal;

    /**
     * image display modal div
     * includes a button to delete the image
     *
     * @param {HTMLDivElement} container
     * @param {MainView} mainView
     */
    static registerImageModalElement(container, mainView) {
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
        ImageField.imageModal = Modal.getOrCreateInstance(document.getElementById(IMAGE_MODAL_ID));

        document.getElementById(IMAGE_MODAL_DELETE_BUTTON_ID).addEventListener('click', (event) => {
            if (doubleClickIntercepted(event)) {
                return;
            }

            const deleteButtonEl = event.target.closest('button');

            if (deleteButtonEl && deleteButtonEl.hasAttribute('data-imageid')) {
                const imageId = deleteButtonEl.getAttribute('data-imageid');
                //console.log(`Deleting image ${occurrenceId}.`);

                mainView.getOccurrenceForm().fireEvent(EVENT_DELETE_IMAGE, {imageId});
                ImageField.imageModal.hide();
                //$(`#${IMAGE_MODAL_ID}`).modal('hide');
            }
        });
    }

    /**
     * @type {Modal}
     */
    static licenseModal;

    /**
     *
     * @param {HTMLDivElement} container
     */
    static registerLicenseModal(container) {
        // 'image license' modal
        // this pop-up is informational only
        const modalEl = document.createElement('div');
        modalEl.innerHTML = `<div class="modal fade" id="${ImageField.LICENSE_MODAL}" tabindex="-1" role="dialog" aria-labelledby="${ImageField.LICENSE_MODAL}Title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="${ImageField.LICENSE_MODAL}Title">Image licensing</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>By choosing to submit images with your Garden Wildflower Hunt records you agree to license the image under the terms of the Creative Common Attribution 4.0 International license (CC BY 4.0).</p>
        <p>The following is a summary of (and not a substitute for) the <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">license</a>.</p>
        <p>Licensees are free to:</p>
        <ul class="license-properties">
<li>
<strong>Share</strong> — copy and redistribute the material in any medium or format
</li>
<li>
<strong>Adapt</strong> — remix, transform, and build upon the material for any purpose, even commercially.
</li>
</ul>
<p>Licensees are most follow these term:</p>
<ul>
<li>
<p>
<strong>Attribution</strong> — licensees must give appropriate credit, provide a link to the license, and indicate if changes were made.
</p>
</li>
</ul>
<p>Full details of the license are here: <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank">CC BY 4.0 license</a></p>

      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>`;

        container.appendChild(modalEl.firstChild);

        ImageField.licenseModal = Modal.getOrCreateInstance(document.getElementById(ImageField.LICENSE_MODAL));
    }
}
