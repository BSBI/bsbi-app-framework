import {Model, uuid} from "./Model";
import {ResponseFactory} from "../serviceworker/responses/ResponseFactory.js";
import {Logger} from "../utils/Logger.js";

export const IMAGE_CONTEXT_SURVEY = 'survey';
export const IMAGE_CONTEXT_OCCURRENCE = 'occurrence';

export const MODEL_TYPE_IMAGE = 'image';

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
     * @type {File|null}
     */
    file = null;

    /**
     *
     * @type {Map.<string, OccurrenceImage>}
     */
    static imageCache = new Map;

    /**
     *
     * @type {App|null}
     */
    static app = null;

    TYPE = MODEL_TYPE_IMAGE;

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

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {File} file
     * @returns {OccurrenceImage}
     */
    static fromFile(file) {
        const image = new OccurrenceImage;
        image.id; // trigger id assigment
        image.file = file;

        return image;
    }

    /**
     * If not securely saved, then makes a post to /saveimage.php
     *
     * This will be intercepted by a service worker that will write the image to IndexedDB.
     * A successful save will result in a JSON response containing the uri from which the image may be retrieved
     * and also the state of persistence (whether or not the image was intercepted by a service worker while offline).
     *
     * If saving fails, then the expectation is that there is no service worker, in which case should attempt to write
     * the image directly to indexeddb.
     *
     * Must test indexeddb for this eventuality after the save has returned.
     *
     * @param {boolean} forceSave
     * @param {boolean} [isSync]
     * @param {{[surveyId] : string, [projectId] : number|null, [occurrenceId] : string}} [params]
     * @param {boolean} [skipQueue] default FALSE, if set then skip the normal save queue (first attempts should skip as the image is needed for display quickly, syncs should be queued)
     *
     * @returns {Promise<{}>}
     */
    save(forceSave = false, isSync = false, params, skipQueue = false) {
        if (params?.surveyId) {
            this.surveyId = params.surveyId;
        }

        if (params?.projectId) {
            this.projectId = params.projectId;
        }

        if (this.context === IMAGE_CONTEXT_OCCURRENCE && params?.occurrenceId) {
            this.occurrenceId = params.occurrenceId;
        }

        if (!this.deleted && !this.file) {
            return Promise.reject(`Cannot save image id '${this.id}' with no local image data.`);
        }

        // kludge to avoid historical instances of corrupted surveyId
        if (this.surveyId === true || this.surveyId === false) {
            console.log(`Fixing damaged survey id for image '${this.id}'`);
            this.surveyId = '';
        }

        if (forceSave || this.unsaved()) {
            // const formData = this.formData();

            if (!OccurrenceImage.imageCache.has(this.id)) {
                OccurrenceImage.imageCache.set(this.id, this);
            }

            console.log(`queueing image post, image id ${this.id}`);
            //return skipQueue ? this.postImmediately(isSync) : this.queuePost(isSync);

            //skipQueue = false; // for testing of queued path

            return skipQueue ? this.directSave() : this.queuePost(isSync);
        } else {
            return Promise.reject(`Image ${this.id} has already been saved.`);
        }
    }

    /**
     *
     * @returns {FormData}
     */
    formData() {
        const formData = new FormData;

        const id = this.id;

        formData.append('type', this.TYPE);
        formData.append('surveyId', this.surveyId ? this.surveyId : ''); // avoid 'undefined'
        formData.append('projectId', this.projectId ? this.projectId : '');
        formData.append('imageId', id); // this shouldn't be needed
        formData.append('id', id);
        formData.append('deleted', this.deleted.toString());
        formData.append('created', this.createdStamp?.toString?.() || '');
        formData.append('modified', this.modifiedStamp?.toString?.() || '');

        formData.append('context', this.context);

        if (this.context === IMAGE_CONTEXT_OCCURRENCE) {
            formData.append('occurrenceId', this.occurrenceId);
        }

        // Note that image attributes are saved as part of the associated image field data rather than with the image.

        if (this.userId) {
            formData.append('userId', this.userId);
        }

        formData.append('appVersion', Model.bsbiAppVersion);

        if (!this.deleted) {
            if (this.file) {
                formData.append('image', this.file);
            } else {
                throw new Error(`While retrieving form data, cannot save image id '${this.id}' with no local image data.`);
            }
        }

        return formData;
    }

    dataForSaving() {
        const id = this.id;

        const modelData = {
            type : this.TYPE,
            surveyId : this.surveyId ? this.surveyId : '', // avoid 'undefined'
            projectId : this.projectId ? this.projectId : '',
            imageId : id, // this shouldn't be needed
            id : id,
            deleted : this.deleted.toString(),
            created : this.createdStamp?.toString?.() || '',
            modified : this.modifiedStamp?.toString?.() || '',
            context : this.context,
            appVersion : Model.bsbiAppVersion,
        };

        if (this.context === IMAGE_CONTEXT_OCCURRENCE) {
            modelData.occurrenceId = this.occurrenceId;
        }

        // Note that image attributes are saved as part of the associated image field data rather than with the image.

        if (this.userId) {
            modelData.userId = this.userId;
        }

        if (!this.deleted) {
            if (this.file) {
                modelData.image = this.file;
            } else {
                throw new Error(`While retrieving model data, cannot save image id '${this.id}' with no local image data.`);
            }
        }

        return modelData;
    }

    /**
     * Saves to IndexedDB and then to the server.
     * The promise returns after the initial IndexedDB save has completed.
     *
     * @returns {Promise<Response>}
     */
    directSave() {
        //const modifiedStampWhenQueued = this.modifiedStamp;
        this.lastQueuedPostAbsoluteStamp = Date.now();
        this.saveSnapshotAbsoluteStamp = Date.now();
        this.saveSnapshotModifiedToken = this.modifiedToken;
        this.saveSnapshotStamp = Math.floor(this.saveSnapshotAbsoluteStamp  / 1000); // any new changes from this point on will be saved without skipping

        // save to indexedDb first and then to server after promise has resolved
        // mimics the service worker pattern but in the main thread, avoiding Safari issues with reading formData in the service worker

        return ResponseFactory
            .fromModelData(this.dataForSaving())
            .populateClientResponse()
            .storeLocally(false)
            .then((response) => {
                // Separately, send data to the server, but the initial local save has already completed.

                // fetch('/saveimagedirectly.php', {
                //         method: 'POST',
                //         body: this.formData(),
                //     })
                this._postChunked()
                    .then((response) => {
                        console.log('posting image after local db save');

                        // would get here if the server responds at all, but need to check that the response is OK (not a server error)
                        if (response.ok) {
                            console.log('posted image to server after local storage: got OK response');

                            return Promise.resolve(response)
                                .then((response) => response.json())
                                .then((jsonResponseData) => {

                                    return ResponseFactory.fromPostResponse(jsonResponseData)
                                        .setPrebuiltResponse(response)
                                        .populateLocalSave()
                                        .storeLocally()
                                        .then(() => {
                                            // call back to indicate that the image has been saved remotely
                                            OccurrenceImage.app?._handleImageSavedRemotely?.(this.id);
                                        });
                                })
                                .catch((error) => {
                                    // for some reason, local storage failed, after a successful server save
                                    console.error({'local storage store of image failed': error});
                                });
                        } else {
                            response.json().then(jsonError => {
                                jsonError.imageId = this.id;
                                jsonError.fileLength = this.file?.size;
                                jsonError.fileType = this.file?.type;
                                return Logger.logError(`JSON error response to image post to server after local storage: ${JSON.stringify(jsonError)}`)
                                    .then(() => {
                                        console.error({'JSON error response to image post to server after local storage': jsonError});
                                    });
                            }, error => {
                                return Logger.logError(`Error response to image post to server after local storage: ${Logger.stringifyObject(error)}`)
                                    .then(() => {
                                        console.error({'Error response to image post to server after local storage': error});
                                    });
                            });
                        }
                    }, (reason) => {
                        return Logger.logError(`Rejected image post fetch from server: ${Logger.stringifyObject(reason)}`)
                            .then(() => {
                                console.error({'Rejected image post fetch from server - implies network is down': reason});
                            });
                    });


                return response; // immediate return from local save before server save has gone through
            });
    }

    isIOS() {
        const ua = globalThis?.navigator?.userAgent;

        // 1. Direct check for iPhone, iPod, or legacy iPad strings
        const standardMatch = /iPhone|iPad|iPod/i.test(ua);

        // 2. Detect Modern iPads and iPhones running in "Desktop Mode"
        // These masquerade as a "Macintosh" but natively support multi-touch points.
        const isDesktopModeApple = /Macintosh/i.test(ua) &&
            globalThis?.navigator?.maxTouchPoints > 1;

        return standardMatch || isDesktopModeApple;
    };

    /**
     *
     * @param {boolean} isSync
     * @returns {Promise<Response>}
     * @private
     */
    async _postChunked(isSync = false) {
        const chunkSize = this.isIOS() ? (400 * 1024) : (2 * 1024 * 900); // 400k for IOS or ~ 1800k slices for sane devices

        // Strictly, only retrieving the form data now, may result in a discrepancy between what was
        // previously saved locally. That's not going to happen for images, but the same approach can't be replicated
        // for other object types that undergo rapid changes.

        if (!this.file || this.file.size <= chunkSize) {
            return await fetch('/saveimagedirectly.php', {
                method: 'POST',
                body: this.formData(),
            });
        }

        const totalChunks = Math.ceil(this.file.size / chunkSize);

        let response;

        const transactionId = uuid(); // required to avoid conflict between simultaneous uploads of the same image

        for (let i = 0; i < totalChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min(start + chunkSize, this.file.size);
            const chunk = this.file.slice(start, end);

            const formData = new FormData();
            formData.append('fileChunk', chunk);
            formData.append('chunkIndex', i.toString());
            formData.append('totalChunks', totalChunks.toString());
            formData.append('transactionId', transactionId);
            formData.append('imageId', this.id);

            if (i === totalChunks - 1) {
                // for the final chunk, include the full metadata

                formData.append('type', this.TYPE);
                formData.append('surveyId', this.surveyId ? this.surveyId : ''); // avoid 'undefined'
                formData.append('projectId', this.projectId ? this.projectId : '');
                formData.append('deleted', this.deleted.toString());
                formData.append('created', this.createdStamp?.toString?.() || '');
                formData.append('modified', this.modifiedStamp?.toString?.() || '');

                formData.append('context', this.context);

                if (this.context === IMAGE_CONTEXT_OCCURRENCE) {
                    formData.append('occurrenceId', this.occurrenceId);
                }

                // Note that image attributes are saved as part of the associated image field data rather than with the image.

                if (this.userId) {
                    formData.append('userId', this.userId);
                }

                formData.append('appVersion', Model.bsbiAppVersion);
            }

            response = await fetch(`/saveimagedirectly.php?chunk=${i}&chunksize=${chunkSize}${isSync ? '&issync' : ''}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                break;
            }
        }

        return response;
    }

    /**
     * Makes a post to saveimagedirectly.php largely bypassing the service worker
     * *Does not save the original image to IndexedDB as this is intended to be used in a sync context*
     * *Does save server acknowledgement, if received*
     *
     * @protected
     * @param {FormData} formData
     * @param {boolean} isSync default false, set if request is part of sync all rather than a regular save
     * @returns {Promise}
     */
    _post(formData, isSync = false) {

        // save to server and update IndexedDB and the local copy.
        // mimics the service worker sync pattern but in the main thread, avoiding Safari issues with reading formData in the service worker

        // return fetch(`/saveimagedirectly.php${isSync ? '?issync' : ''}`, {
        //             method: 'POST',
        //             body: this.formData(),
        //         })
        return this._postChunked(isSync)
                .then((response) => {
                    console.log('posting image after local db save');

                    // would get here if the server responds at all, but need to check that the response is OK (not a server error)
                    if (response.ok) {
                        console.log('posted image to server: got OK response');

                        return Promise.resolve(response)
                            .then((response) => response.json())
                            .then((jsonResponseData) => {

                                return ResponseFactory.fromPostResponse(jsonResponseData)
                                    .setPrebuiltResponse(response)
                                    .populateLocalSave()
                                    .storeLocally()
                                    .then(() => {
                                        // call back to indicate that the image has been saved remotely
                                        OccurrenceImage.app?._handleImageSavedRemotely?.(this.id);

                                        // note that, as images don't undergo repeated updates, we can be sloppy here
                                        // and not test whether a subsequent update has occurred.
                                        this._savedLocally = true;
                                        this.savedRemotely = true;

                                        return jsonResponseData;
                                    });
                            })
                            .catch((error) => {
                                // for some reason, local storage failed, after a successful server save
                                console.error({'local post storage store of image failed': error});
                            });
                    } else {
                        return response.json().then(jsonError => {
                            const errorString = `JSON error response to direct image post to server after local storage: ${JSON.stringify(jsonError)}`;

                            return Logger.logError(errorString)
                                .then(() => {
                                    console.error({'JSON error response to direct image post to server': jsonError});
                                })
                                .then(() => Promise.reject(errorString));
                        }, error => {
                            const errorString = `Error response to direct image post to server after local storage: ${Logger.stringifyObject(error)}`;

                            return Logger.logError(errorString)
                                .then(() => {
                                    console.error({'Error response to direct image post to server': error});
                                })
                                .then(() => Promise.reject(errorString));
                        });
                    }
                }, (reason) => {
                    const errorString = `Rejected image post fetch from server: ${Logger.stringifyObject(reason)}`;
                    return Logger.logError(errorString)
                        .then(() => {
                            console.error({'Rejected image post fetch from server - implies network is down': reason});
                        })
                        .then(() => Promise.reject(errorString));
                });
    }

    // /**
    //  * fired from Occurrence when the object's contents have been modified
    //  *
    //  * @type {string}
    //  */
    // static EVENT_MODIFIED = 'modified';

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {string} id
     * @returns {OccurrenceImage}
     */
    static placeholder(id) {
        let placeholderObject = new OccurrenceImage;
        placeholderObject.id = id; // should use the setter, to enforce validation
        placeholderObject.isPlaceholder = true;

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

        if (descriptor.image) {
            this.file = descriptor.image;
        }

        if (descriptor.context) {
            this.context = descriptor.context;
        }
    }

    // noinspection JSUnusedGlobalSymbols
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

        // should try the other options only if the image has been saved to the server
        const image = OccurrenceImage.imageCache.get(id);

        if (image && image.savedRemotely) {
            // Try sized images first, before falling back to an unsized JPEG that may match an offline cache.
            return `<picture>` +
                //<source srcset="/image.php?imageid=${id}&amp;height=128&amp;format=avif" type="image/avif">
                `<source srcset="/image.php?imageid=${id}&amp;height=${width}&amp;format=webp" type="image/webp">
    <source srcset="/image.php?imageid=${id}&amp;width=${width}&amp;format=jpeg" type="image/jpeg">
    <img${attributesString} src="/image.php?imageid=${id}&amp;format=jpeg" ${renderingConstraint} alt="photo">
    </picture>`;
        } else {
            // use empty alt text to hide broken images
            return `<img${attributesString} src="/image.php?imageid=${id}&amp;format=jpeg" ${renderingConstraint} alt="">`;
        }
    }

    storeLocally() {
        throw new Error("OccurrenceImages don't implement storeLocally(). Instead save requests should be posted.")
    }
}
