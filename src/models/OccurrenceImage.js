import {Model} from "./Model";

export const IMAGE_CONTEXT_SURVEY = 'survey';
export const IMAGE_CONTEXT_OCCURRENCE = 'occurrence';

export class OccurrenceImage extends Model {

    /**
     * mirrors constructor.name but doesn't get mangled by minification
     *
     * @type {string}
     */
    static className = 'OccurrenceImage';

    /**
     * raw file object retrieved from a file upload image element
     *
     * @type {File}
     */
    file;

    /**
     *
     * @type {Map.<string, OccurrenceImage>}
     */
    static imageCache = new Map;

    TYPE = 'image';

    /**
     * Only relevant for occurrence-linked images
     *
     * @type {string}
     */
    occurrenceId = '';

    surveyId = '';

    //projectId = '';

    //static CONTEXT_SURVEY = IMAGE_CONTEXT_SURVEY;
    //static CONTEXT_OCCURRENCE = IMAGE_CONTEXT_OCCURRENCE;

    context = IMAGE_CONTEXT_OCCURRENCE;

    /**
     * fetches a URL of the image
     * this might be a remote url (or one intercepted by a service worker)
     * or a data url of the raw image, (not yet uploaded)
     *
     * @returns {string}
     */
    getUrl () {
        throw new Error('OccurrenceImage getUrl() not implemented.')
    }

    SAVE_ENDPOINT = '/saveimage.php';

    /**
     *
     * @param {File} file
     */
    static fromFile(file) {
        const image = new OccurrenceImage;
        image.file = file;

        return image;
    }

    /**
     * if not securely saved then makes a post to /saveimage.php
     *
     * this may be intercepted by a service worker, which could write the image to indexeddb
     * a successful save will result in a json response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline)
     *
     * if saving fails then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexeddb
     *
     * must test indexeddb for this eventuality after the save has returned
     *
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{[surveyId] : string, [projectId] : number|null, [occurrenceId] : string}} [params]
     *
     * @returns {Promise<{}>}
     */
    save(forceSave = false, isSync = false, params) {
        if (params?.surveyId) {
            this.surveyId = params.surveyId;
        }

        if (params?.projectId) {
            this.projectId = params.projectId;
        }

        if (params?.occurrenceId) {
            this.occurrenceId = params.occurrenceId;
        }

        // kludge to avoid historical instances of corrupted surveyId
        if (this.surveyId === true || this.surveyId === false) {
            console.log(`Fixing damaged survey id for image '${this.id}'`);
            this.surveyId = '';
        }

        if (forceSave || this.unsaved()) {
            const formData = new FormData;
            formData.append('type', this.TYPE);
            formData.append('surveyId', params?.surveyId ? params.surveyId : (this.surveyId ? this.surveyId : '')); // avoid 'undefined'
            formData.append('projectId', params?.projectId ? params.projectId.toString() : '');
            formData.append('imageId', this.id);
            formData.append('id', this.id);
            if (!this.deleted) {
                formData.append('image', this.file);
            }
            formData.append('deleted', this.deleted.toString());
            formData.append('created', this.createdStamp?.toString?.() || '');
            formData.append('modified', this.modifiedStamp?.toString?.() || '');

            if (this.context === IMAGE_CONTEXT_SURVEY) {
                formData.append('context', this.context);
            } else {
                formData.append('occurrenceId', params?.occurrenceId ? params.occurrenceId : this.occurrenceId); // avoid 'undefined'
            }

            if (this.userId) {
                formData.append('userId', this.userId);
            }

            formData.append('appVersion', Model.bsbiAppVersion);

            console.log(`queueing image post, image id ${this.id}`);
            return this.queuePost(formData, isSync);
        } else {
            return Promise.reject(`Image ${this.id} has already been saved.`);
        }
    }

    /**
     * fired from Occurrence when the object's contents have been modified
     *
     * @type {string}
     */
    static EVENT_MODIFIED = 'modified';

    /**
     *
     * @param id
     * @returns {OccurrenceImage}
     */
    static placeholder(id) {
        let placeholderObject = new OccurrenceImage;
        //placeholderObject._id = id;
        placeholderObject.id = id; // should use setter, to enforce validation

        OccurrenceImage.imageCache.set(id, placeholderObject);

        return placeholderObject;
    }

    /**
     *
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
     *      surveyId: string,
     *      occurrenceId: string,
     *      [image]: File
     *      [context]: string
     *      }} descriptor
     * @private
     */
    _parseDescriptor(descriptor) {
        super._parseDescriptor(descriptor);
        this.surveyId = descriptor.surveyId;

        // kludge to deal with corrupted survey ids
        if (this.surveyId === true || this.surveyId === false) {
            this.surveyId = '';
            descriptor.surveyId = '';
        }

        if (descriptor.occurrenceId) {
            this.occurrenceId = descriptor.occurrenceId;
        }
        this.file = descriptor.image;

        if (descriptor.context) {
            this.context = descriptor.context;
        }
    }

    /**
     *
     * @param {string} id
     * @param {(number|null)} width
     * @param {(number|null)} height
     * @param {{[className] : string}} [attributes]
     * @return {string}
     */
    static imageLink(id, width, height, attributes) {
        width = width || 0;
        height = height || 0;

        let attributesString = '';

        if (attributes.className) {
            attributesString += ` class="${attributes.className}"`;
        }

        const renderingConstraint = (width > height) ?
            `width="${width}"`
            :
            `height="${height}"`;

        // try sized images first, before falling back to un-sized jpeg, that may match an offline cache
        return `<picture>` +
    //<source srcset="/image.php?imageid=${id}&amp;height=128&amp;format=avif" type="image/avif">
    `<source srcset="/image.php?imageid=${id}&amp;height=${width}&amp;format=webp" type="image/webp">
    <source srcset="/image.php?imageid=${id}&amp;width=${width}&amp;format=jpeg" type="image/jpeg">
    <img${attributesString} src="/image.php?imageid=${id}&amp;format=jpeg" ${renderingConstraint} alt="photo">
    </picture>`;
    }
}
