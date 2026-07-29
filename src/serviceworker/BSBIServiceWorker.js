// service worker for BSBI app

// Based around the 'Cache and update' recipe, along with many modifications.
// see https://serviceworke.rs

import localforage from 'localforage';
import {ResponseFactory} from "./responses/ResponseFactory";
import {ImageResponse} from "./responses/ImageResponse";
import {packageClientResponse} from "./packageClientResponse";
import {SurveyResponse} from "./responses/SurveyResponse";
import {OccurrenceResponse} from "./responses/OccurrenceResponse";
import {OccurrenceImage} from "../models/OccurrenceImage";
import {Model} from "../models/Model";
import {TrackResponse} from "./responses/TrackResponse";
import {Logger} from "../utils/Logger";
import {SurveyDefinitionResponse} from "./responses/SurveyDefinitionResponse";
import {ImageFileStore} from "../framework/ImageFileStore.js";
import {PINNED_FORAGE_DRIVER, reportForageDriver} from "../utils/forageDriver.js";

export class BSBIServiceWorker {

    /**
     * @var {Array.<string>}
     */
    URL_CACHE_SET;

    /**
     * @var {string}
     */
    CACHE_VERSION;

    /**
     * @var {string}
     */
    DATA_CACHE_VERSION;

    /**
     * @var {string}
     */
    IMAGE_CACHE_VERSION;

    /**
     * @var {RegExp}
     */
    SERVICE_WORKER_DATA_URL_MATCHES;

    SERVICE_WORKER_IMAGE_URL_MATCHES = /\/image.php/;

    versionSpec;

    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @param {{
     *  forageName : string,
     *  postPassThroughWhitelist : RegExp,
     *  postImageUrlMatch : RegExp,
     *  getImageUrlMatch : RegExp,
     *  interceptUrlMatches : RegExp,
     *  [dataUrlMatches] : RegExp,
     *  ignoreUrlMatches : RegExp,
     *  staticUrlMatches : RegExp|null,
     *  passThroughNoCache : RegExp,
     *  indexUrl : string,
     *  urlCacheSet : Array.<string>,
     *  version : string,
     *  [dataVersion] : string,
     *  [imageVersion] : string,
     *  upgrading : {},
     * }} configuration
     */
    initialise(configuration) {
        if (!Promise.prototype.finally) {
            Promise.prototype.finally = function (callback) { // must use 'function' here rather than arrow, due to this binding requirement
                return this.then(callback)
                    .catch(callback);
            };
        }

        ImageResponse.register();
        SurveyResponse.register();
        OccurrenceResponse.register();
        TrackResponse.register();
        SurveyDefinitionResponse.register();

        this.CACHE_VERSION = `version-BSBI_APP_VERSION-${configuration.version}`;
        this.DATA_CACHE_VERSION = `bsbi-data-${configuration.dataVersion || configuration.version}`;
        this.IMAGE_CACHE_VERSION = `bsbi-images-${configuration.imageVersion || configuration.dataVersion || configuration.version}`;

        Model.bsbiAppVersion = configuration.version;
        Logger.bsbiAppVersion = configuration.version;

        const POST_PASS_THROUGH_WHITELIST = configuration.postPassThroughWhitelist;
        const POST_IMAGE_URL_MATCH = configuration.postImageUrlMatch;
        const GET_IMAGE_URL_MATCH = configuration.getImageUrlMatch;
        const SERVICE_WORKER_INTERCEPT_URL_MATCHES = configuration.interceptUrlMatches;
        const SERVICE_WORKER_IGNORE_URL_MATCHES = configuration.ignoreUrlMatches;
        const SERVICE_WORKER_PASS_THROUGH_NO_CACHE = configuration.passThroughNoCache;

        this.SERVICE_WORKER_DATA_URL_MATCHES = configuration.dataUrlMatches || /^NO_MATCHING$/;

        this.versionSpec = configuration.upgrading;

        /**
         * Urls that should be cached, with no need for automatic refresh
         *
         * @type {RegExp|null}
         */
        const SERVICE_WORKER_STATIC_URL_MATCHES= configuration.staticUrlMatches;
        const INDEX_URL = configuration.indexUrl;

        this.URL_CACHE_SET = configuration.urlCacheSet;

        const forageConfigResult = localforage.config({
            name: configuration.forageName,
            driver: PINNED_FORAGE_DRIVER, // never silently fall back — see forageDriver.js
        });

        // noinspection JSIgnoredPromiseFromCall
        reportForageDriver(localforage, forageConfigResult, 'records (service worker)');

        // image binaries are held in a separate database, derived from the same name
        ImageFileStore.configure(configuration.forageName);

        //self.onerror = Logger.serviceWorkerLogError;

        self.addEventListener("message", (event) => {
                console.log({"Message received": event.data});

                switch (event.data.action) {
                    case 'recache':
                        event.waitUntil(this.handleRecacheMessage(event.data.url));
                        break;

                    case 'userchange':
                        event.waitUntil(this.handleUserChangeMessage(event.data.userId));
                        break;

                    case 'getVersion':
                        // A worker that is installed but waiting can still answer messages, which is
                        // how the client obtains the details of a pending update now that activate()
                        // (and its versionChanged broadcast) is deferred until the user accepts.
                        //
                        // The reply deliberately uses the same shape as the activate broadcast, so
                        // the existing client-side handling applies unchanged.
                        {
                            const versionMessage = {reason: 'versionChanged', upgrading: this.versionSpec};

                            if (event.ports?.length) {
                                event.ports[0].postMessage(versionMessage);
                            } else if (event.source) {
                                event.source.postMessage(versionMessage);
                            }
                        }
                        break;

                    case 'skipWaiting':
                        // Sent by the client only once the user has accepted an update, so that the
                        // takeover is always immediately followed by a reload. See the note against
                        // the install handler for why this isn't done automatically.
                        console.log('Service worker skipping waiting at the client\'s request.');

                        // noinspection JSIgnoredPromiseFromCall
                        self.skipWaiting();
                        break;
                }
            }
        );

        // On install, cache some resources.
        self.addEventListener('install', (evt) => {
            console.log('BSBI app service worker is being installed.');

            // skipWaiting() is *not* called here.
            //
            // Taking over a running client mid-session means the page carries on executing the
            // previously loaded application code under a newer worker. That combination is unsafe
            // whenever the two disagree about which side is responsible for writing to IndexedDb,
            // and it happens silently while the user is recording.
            //
            // Instead the new worker waits until every client of the old worker has gone, or until
            // the user accepts an update, which posts a 'skipWaiting' message (see below). That way
            // a takeover is always paired with a reload.

            // Ask the service worker to keep installing until the returning promise
            // resolves.
            evt.waitUntil(
                this.precache()
                    .catch(() => true) // allow installation even if not everything got cached, can avoid problems if a once-cached file has now been deleted

                    // see https://serviceworke.rs/immediate-claim_service-worker_doc.html
                    // .finally(() => {
                    //     console.log("Service worker skip waiting after precache.");
                    //
                    //     return self.skipWaiting();
                    // })
            );
        });

        self.addEventListener('activate', (event) => {
            console.log({'service worker activate event' : event});

            // Claiming comes first, before the caches are tidied.
            //
            // It used to run last, behind the deletion of the old code, data and image caches.
            // Deleting a large image cache is slow, so the client could wait many seconds for the
            // controllerchange that tells it the takeover succeeded - and if any deletion rejected,
            // Promise.all rejected and clients.claim() never ran at all, leaving the takeover stuck
            // permanently. Neither matters to the client, which reads from the new cache regardless
            // of whether the old ones have gone yet.
            event.waitUntil(
                self.clients.matchAll({
                    includeUncontrolled: true
                }).then((clientList) => {
                    const urls = clientList.map((client) => {
                        return client.url;
                    });
                    console.log('[ServiceWorker] Matching clients:', urls.join(', '));
                }).then(() => {
                    console.log('[ServiceWorker] Claiming clients for version', this.CACHE_VERSION);
                    return self.clients.claim();
                }).then(() => self.clients.matchAll({type: 'all'}))
                .then((clients) => {
                    for (const client of clients) {
                        client.postMessage({reason: 'versionChanged', upgrading: this.versionSpec});
                    }
                }).then(() => caches.keys())
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            // test for a 'version' prefix to avoid deleting mapbox tiles
                            if (cacheName.startsWith('version') && cacheName !== this.CACHE_VERSION) {
                                console.log(`[ServiceWorker] Deleting old code cache: ${cacheName}`);
                                return caches.delete(cacheName);
                            }

                            if (cacheName.startsWith('bsbi-data') && cacheName !== this.DATA_CACHE_VERSION) {
                                console.log(`[ServiceWorker] Deleting old data cache: ${cacheName}`);
                                return caches.delete(cacheName);
                            }

                            if (cacheName.startsWith('bsbi-images') && cacheName !== this.IMAGE_CACHE_VERSION) {
                                console.log(`[ServiceWorker] Deleting old image cache: ${cacheName}`);
                                return caches.delete(cacheName);
                            }
                        })
                    ).catch((error) => {
                        // Cache tidying is housekeeping: a failure must not be allowed to look like
                        // a failed activation.
                        console.error({'[ServiceWorker] Failed to delete an old cache': error});
                    });
                })
            );
        });

        // // see https://davidwalsh.name/background-sync
        // // https://developers.google.com/web/updates/2015/12/background-sync
        // self.addEventListener('sync', function(event) {
        //
        // });

        // On fetch, use cache but update the entry with the latest contents
        // from the server.
        self.addEventListener('fetch', /** @param {FetchEvent} evt */ (evt) => {
            //console.log(`The service worker is serving: '${evt.request.url}'`);

            if (evt.request.method === 'POST') {
                return; // rely on the default behaviour
            } else {
                // test whether this is a direct link in to a page that should be substituted by
                // the single page app

                // console.log(`about to test url '${evt.request.url}'`);

                if (SERVICE_WORKER_INTERCEPT_URL_MATCHES.test(evt.request.url) &&
                    !SERVICE_WORKER_IGNORE_URL_MATCHES.test(evt.request.url)
                ) {
                    // serving single page app instead
                    evt.preventDefault();

                    console.log(`redirecting to the root of the SPA for '${evt.request.url}'`);
                    let spaRequest = new Request(INDEX_URL);
                    evt.respondWith(this.fromCache(spaRequest));

                    // don't need to check for fresh, stale is fine here
                    //evt.waitUntil(this.update(spaRequest));
                } else if (evt.request.url.match(GET_IMAGE_URL_MATCH)) {
                    evt.preventDefault();
                    console.log(`request is for an image '${evt.request.url}'`);
                    this.handleImageFetch(evt);
                } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
                    // typically for external content that can't/shouldn't be cached, e.g. MapBox tiles (which mapbox stores directly in the cache itself)
                    //evt.respondWith(fetch(evt.request));
                    return; // use default response
                } else if (SERVICE_WORKER_STATIC_URL_MATCHES?.test?.(evt.request.url)) {
                    // typically for content that won't change
                    evt.preventDefault();

                    evt.respondWith(this.fromCache(evt.request));
                } else {
                    evt.preventDefault();

                    // You can use `respondWith()` to answer immediately, without waiting for the
                    // network response to reach the service worker...
                    evt.respondWith(this.fromCache(evt.request)
                        .then((response) => {
                            const dateAsString = response.headers.get('Date');

                            if (dateAsString) {
                                console.log(`Request for ${evt.request.url} date: ${dateAsString}`);

                                const dateStamp = Date.parse(dateAsString); // ms
                                // isStale = (dateStamp + (3600000 * 48)) < Date.now();

                                if ((dateStamp + (3600000 * 48)) < Date.now()) {
                                    // response is stale so re-cache
                                    evt.waitUntil(this.update(evt.request));
                                }
                            }

                            return response;
                        })
                    );
                }
            }
        });
    }


    // /**
    //  * used to handle small posts (not initial posts of images that require rapid return)
    //  * but is used for images as part of general re-sync
    //  * attempts remote save first then caches locally
    //  *
    //  * @param {FetchEvent} fetchEvent
    //  * @param {boolean} isSync set if this is called as part of a re-sync rather than as a first-time save
    //  */
    // handle_post(fetchEvent, isSync = false) {
    //     const url = fetchEvent.request.url;
    //     const clonedRequest = fetchEvent.request.clone();
    //
    //     //let clonedFormData;
    //
    //     // /**
    //     //  * @type {Request}
    //     //  */
    //     // let clonedRequest;
    //     // try {
    //     //     clonedRequest = fetchEvent.request.clone();
    //     // } catch (e) {
    //     //     console.log({'Failed to clone request': e});
    //     //
    //     //     let returnedToClient = {
    //     //         error: 'Failed to clone post request',
    //     //         errorHelp: 'Post failed as the request object could not be cloned.' +
    //     //             `Error was: ${e?.message}`
    //     //     };
    //     //
    //     //     fetchEvent.respondWith(packageClientResponse(returnedToClient)); // presence of error field will give the response a 500 status code
    //     //     return;
    //     // }
    //
    //     fetchEvent.respondWith(clonedRequest.formData().then((formData) => {
    //
    //         return fetch(url, {
    //             method: 'POST',
    //             body: formData
    //         }).then((response) => {
    //                 // would get here if the server responds at all, but need to check that the response is OK (not a server error)
    //                 if (response.ok) {
    //                     //fetchEvent.waitUntil(Logger.logMessage('Testing got OK post response in service worker.'));
    //
    //                     // clone the response and save it locally
    //                     // before returning it to the client
    //                     return response.clone().json()
    //                         .then((jsonResponseData) => {
    //                             //console.log('Following successful remote post, about to save locally.');
    //
    //                             return ResponseFactory.fromPostResponse(jsonResponseData)
    //                                 .setPrebuiltResponse(response)
    //                                 .populateLocalSave()
    //                                 .storeLocally(true)
    //                                 .then((returnedToClient) => {
    //                                     if (jsonResponseData.type === 'image') {
    //                                         fetchEvent.waitUntil(self.clients.get(fetchEvent.clientId)
    //                                             .then((client) => {
    //                                                 // post a message to the client to indicate that the image has been saved remotely
    //                                                 client.postMessage({
    //                                                     reason: 'imageSavedRemotely',
    //                                                     imageId: jsonResponseData.id || jsonResponseData.imageId,
    //                                                 });
    //
    //                                                 console.log('Sent image saved message to client from non-interactive post path.');
    //                                             }));
    //                                     }
    //                                     return returnedToClient;
    //                                 });
    //                         })
    //                         .catch((error) => {
    //                             // for some reason, local storage failed, after a successful server save
    //                             console.log({'local storage failed' : error});
    //
    //                             // log error and then pass through the server response
    //                             return Logger.logError(`In SW handle_post local storage failed: ${Logger.stringifyObject(error)}`).then(() => response);
    //                         });
    //                 } else {
    //                     if (isSync) {
    //                         console.log(`Failed to save for sync`);
    //                     } else {
    //                         console.log(`Failed to save, moving on to attempt IndexedDb`);
    //                     }
    //
    //                     return response.json().then((jsonError) => {
    //                         const stringMessage = `Failed to save to server. (${response.status}) error ${JSON.stringify(jsonError)}`;
    //                         return Logger.logError(stringMessage).then(() => Promise.reject(stringMessage));
    //                     }, () => {
    //                         const stringMessage = `Failed to save to server. (${response.status}) with no json response.`;
    //                         return Logger.logError(stringMessage).then(() => Promise.reject(stringMessage));
    //                     });
    //                 }
    //             })
    //             .catch( (remoteReason) => {
    //                     console.log({'post fetch failed (possibly no network)': remoteReason});
    //
    //                     fetchEvent.waitUntil(Logger.logError(`In SW handle_post remote fetch failed, sync=${isSync ? 'true' : 'false'} error: ${Logger.stringifyObject(remoteReason)}`));
    //
    //                     // would get here if the network is down
    //                     // or if got an invalid response from the server
    //
    //                     if (isSync) {
    //                         // We don't need to store locally (as will already be present) and response is not needed,
    //                         // so reject.
    //
    //                         let returnedToClient = {
    //                             isSync,
    //                             error: 'remote sync failed',
    //                             errorHelp: 'During a sync request your internet connection may have failed (or there could be a problem with the server). ' +
    //                                 `Error was: ${Logger.stringifyObject(remoteReason)}`
    //                         };
    //
    //                         return packageClientResponse(returnedToClient); // presence of error field will give the response a 500 status code
    //                     } else {
    //
    //                         // /**
    //                         //  * simulated result of post, returned as JSON body
    //                         //  * @type {{surveyId: string, occurrenceId: string, imageId: string, saveState: string, [error]: string, [errorHelp]: string}}
    //                         //  */
    //                         // let returnedToClient = {};
    //
    //                         console.log('got to form data handler, after failed remote store');
    //                         return ResponseFactory
    //                             .fromPostedData(formData)
    //                             .populateClientResponse()
    //                             .storeLocally(false)
    //                             .catch((reason) => {
    //                                 let returnedToClient = {
    //                                     error: 'Store posted data locally after failed remote save. (internal error: local store)',
    //                                     errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
    //                                         'It wasn\'t possible to save a temporary copy on your device. (an unexpected saving error occurred) ' +
    //                                         'Please try to re-establish a network connection and try again.' +
    //                                         `Error was: ${Logger.stringifyObject(reason)}`
    //                                 };
    //
    //                                 return packageClientResponse(returnedToClient); // presence of error field will give the response a 500 status code
    //                             });
    //                     }
    //                 }
    //             )
    //     }, (reason) => {
    //         fetchEvent.waitUntil(Logger.logError(`Failed to read posted form data. ${Logger.stringifyObject(reason)}`));
    //
    //         // as a fallback post the request directly to the server without local handling
    //         return fetch(fetchEvent.request);
    //
    //         // /**
    //         //  * simulated result of post, returned as JSON body
    //         //  * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
    //         //  */
    //         // let returnedToClient = {
    //         //     error: 'Failed to read image form data. (internal error)',
    //         //     errorHelp: 'Sorry, the image save has failed.'
    //         // };
    //         //
    //         // return packageClientResponse(returnedToClient);
    //     }));
    // }

    // /**
    //  * Used to handle image posts, which need to respond quickly even if the network is slow.
    //  * Stores to the local cache first, then saves out to the network.
    //  *
    //  * @param {FetchEvent} event
    //  */
    // handle_image_post(event) {
    //     //let clonedRequest;
    //     let clonedFormData;
    //
    //     //console.log('posting image for quick response');
    //
    //     const clonedRequest = event.request.clone();
    //
    //     // try {
    //     //     clonedRequest = event.request.clone();
    //     //
    //     // } catch (e) {
    //     //     //console.log('Failed to clone request.');
    //     //     console.log({'Failed to clone image request': e});
    //     //     let returnedToClient = {
    //     //         error: 'Failed to clone image post request',
    //     //         errorHelp: 'Image post failed as the request object could not be cloned.' +
    //     //             `Error was: ${e?.message}`
    //     //     };
    //     //
    //     //     event.respondWith(packageClientResponse(returnedToClient)); // presence of error field will give the response a 500 status code
    //     //     return;
    //     // }
    //
    //     const headerValues = Array.from(event.request.headers.values());
    //
    //     // send back a quick response to the client from local storage (before the server request completes)
    //     event.respondWith(clonedRequest.formData()
    //         .then(formData => {
    //             try {
    //                 clonedFormData = formData;
    //
    //                 return ResponseFactory
    //                     .fromPostedData(formData)
    //                     .populateClientResponse()
    //                     .storeLocally(false)
    //                     .then((response) => {
    //
    //                             // Separately, send data to the server, but the response has already gone to the client before this completes.
    //                             // The return from the waitUntil is discarded.
    //                             event.waitUntil(fetch('/saveimage.php', {
    //                                     method: 'POST',
    //                                     body: clonedFormData
    //                                 })
    //                                     .then((response) => {
    //                                             console.log('posting image to server in waitUntil part of fetch cycle');
    //
    //                                             // would get here if the server responds at all, but need to check that the response is OK (not a server error)
    //                                             if (response.ok) {
    //                                                 console.log('posted image to server in waitUntil part of fetch cycle: got OK response');
    //
    //                                                 return Promise.resolve(response)
    //                                                     .then((response) => {
    //                                                         // save the response locally
    //                                                         // before returning it to the client
    //
    //                                                         return response.clone().json(); // clone is required here as the original unmolested response object is still needed for the client
    //                                                     })
    //                                                     .then((jsonResponseData) => {
    //                                                         // Use event.handled (which is a promise that resolves once the original fetch event has returned to the client)
    //                                                         // to delay the update to local storage until after the original update has completed.
    //                                                         // This probably isn't critical but may add some safety.
    //                                                         return event.handled.then(() => ResponseFactory.fromPostResponse(jsonResponseData)
    //                                                             .setPrebuiltResponse(response)
    //                                                             .populateLocalSave()
    //                                                             .storeLocally())
    //                                                             .then(() => self.clients.get(event.clientId))
    //                                                             .then((client) => {
    //                                                                 // post a message to the client to indicate that the image has been saved remotely
    //                                                                 client.postMessage({
    //                                                                     reason: 'imageSavedRemotely',
    //                                                                     imageId: jsonResponseData.id || jsonResponseData.imageId,
    //                                                                 });
    //                                                             });
    //                                                     })
    //                                                     .catch((error) => {
    //                                                         // for some reason, local storage failed, after a successful server save
    //                                                         console.error({'local storage store of image failed': error});
    //                                                     });
    //                                             } else {
    //                                                 response.json().then(jsonError => {
    //                                                     jsonError.requestHeaders = headerValues;
    //                                                     return Logger.logError(`JSON error response to image post to server in waitUntil part of fetch cycle: ${JSON.stringify(jsonError)}`)
    //                                                         .then(() => {
    //                                                             console.error({'JSON error response to image post to server in waitUntil part of fetch cycle': jsonError});
    //                                                         });
    //                                                 }, error => {
    //                                                     error.requestHeaders = headerValues;
    //                                                     return Logger.logError(`Error response to image post to server in waitUntil part of fetch cycle: ${Logger.stringifyObject(error)}`)
    //                                                         .then(() => {
    //                                                             console.error({'Error response to image post to server in waitUntil part of fetch cycle': error});
    //                                                         });
    //                                                 });
    //                                             }
    //                                         }, (reason) => {
    //                                             return Logger.logError(`Rejected image post fetch from server: ${Logger.stringifyObject(reason)}`)
    //                                                 .then(() => {
    //                                                     console.error({'Rejected image post fetch from server - implies network is down': reason});
    //                                                 });
    //                                         }
    //                                     )
    //                             );
    //
    //                             return response;
    //                         }, (reason) => {
    //                             console.error({'in image post failed to store form data locally': reason});
    //
    //                             // in error state, still try to post the image to the server
    //                             event.waitUntil(fetch('/saveimage.php', {
    //                                 method: 'POST',
    //                                 body: clonedFormData
    //                             }).then(response => {
    //                                 if (response.ok) {
    //                                     return Logger.logMessage('posted image to server in waitUntil part of fetch cycle: got OK response after failed local store');
    //                                     //console.log('posted image to server in waitUntil part of fetch cycle: got OK response after failed local store');
    //                                 } else {
    //                                     response.json().then(jsonError => {
    //                                         return Logger.logError({'Error response to image post to server in waitUntil part of fetch cycle': jsonError});
    //                                         //console.error({'Error response to image post to server in waitUntil part of fetch cycle': jsonError});
    //                                     }, error => {
    //                                         return Logger.logError({'Error response to image post to server in waitUntil part of fetch cycle': error});
    //                                         //console.error({'Error response to image post to server in waitUntil part of fetch cycle': error});
    //                                     });
    //                                 }
    //                             }, error => {
    //                                 return Logger.logError({'subsequent postponed image post to server failed with network error': error});
    //                             }));
    //
    //                             /**
    //                              * simulated result of post, returned as JSON body
    //                              * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
    //                              */
    //                             let returnedToClient = {
    //                                 error: 'Failed to store image data locally data. (internal error)',
    //                                 errorHelp: 'A save to server will still be attempted, but image saving should be retried.'
    //                             };
    //
    //                             return packageClientResponse(returnedToClient);
    //                         }
    //                     );
    //                 } catch (e) {
    //                     // an exception here implies that have form data but failed to prepare it for local saving
    //                     // before the promise chain resumed.
    //                     event.waitUntil(Logger.logError(`Failed to prepare image form data for local saving. ${Logger.stringifyObject(e)}`));
    //
    //                     let returnedToClient = {
    //                         error: 'Failed to read image form data. (internal error)',
    //                         errorHelp: 'Sorry, the image save has failed.'
    //                     };
    //
    //                     return packageClientResponse(returnedToClient);
    //                 }
    //             }, (reason) => {
    //                 event.waitUntil(Logger.logError(`Failed to read image form data. ${Logger.stringifyObject(reason)}`));
    //
    //                 // as a fallback post the request directly to the server without local handling
    //                 return fetch(event.request);
    //
    //                 // /**
    //                 //  * simulated result of post, returned as JSON body
    //                 //  * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
    //                 //  */
    //                 // let returnedToClient = {
    //                 //     error: 'Failed to read image form data. (internal error)',
    //                 //     errorHelp: 'Sorry, the image save has failed.'
    //                 // };
    //                 //
    //                 // return packageClientResponse(returnedToClient);
    //             }
    //         )
    //     );
    // }

    /**
     * Open a cache and use `addAll()` with an array of assets to add all of them
     * to the cache. Return a promise resolving when all the assets are added.
     *
     * @returns {Promise<void>}
     */
    precache() {
        return caches.open(this.CACHE_VERSION).then((cache) => {
            return cache.addAll(this.URL_CACHE_SET);
        }).catch((error) => {
            console.log({'Precache failed result' : error});
            return Promise.resolve();
        });
    }

    getCacheName(url) {
        return this.SERVICE_WORKER_DATA_URL_MATCHES.test(url) ?
            this.DATA_CACHE_VERSION : (this.SERVICE_WORKER_IMAGE_URL_MATCHES.test(url) ? this.IMAGE_CACHE_VERSION : this.CACHE_VERSION);
    }

    /**
     * Open the cache where the assets were stored and search for the requested
     * resource. Notice that in case of no matching, the promise still resolves,
     * but with `undefined` as value.
     *
     * @param {Request} request
     * @param {boolean} tryRemoteFallback
     * @param {number} remoteTimeoutMilliseconds (default 0 for no forced timeout)
     * @returns {Promise<Response | Promise<Response>>}
     */
    fromCache(request, tryRemoteFallback= true, remoteTimeoutMilliseconds = 0) {
        //console.log('attempting fromCache response');

        // const cacheName = this.SERVICE_WORKER_DATA_URL_MATCHES.test(request.url) ?
        //     this.DATA_CACHE_VERSION : this.CACHE_VERSION;
        const cacheName = this.getCacheName(request.url);

        return caches.open(cacheName).then((cache) => {
            //console.log('cache is open');

            return cache.match(request, {ignoreVary : true, ignoreSearch : /\.css|\.mjs/.test(request.url)}).then((cachedResponse) => {
                console.log(cachedResponse ?
                    `cache matched ${request.url}`
                    :
                    `no cache match for ${request.url}`);

                return cachedResponse || (tryRemoteFallback && this.update(request, remoteTimeoutMilliseconds)); // return cache match or, if not cached, then go out to network (and then locally cache the response)

                // // see https://developer.chrome.com/docs/workbox/caching-strategies-overview/
                // return cachedResponse || fetch(new Request(request, {mode: 'cors', credentials: 'omit'})).then((fetchedResponse) => {
                //     // Add the network response to the cache for future visits.
                //     // Note: we need to make a copy of the response to save it in
                //     // the cache and use the original as the request response.
                //     cache.put(request, fetchedResponse.clone());
                //
                //     // Return the network response
                //     return fetchedResponse;
                // });
            });
        });
    }

    /**
     * A special-case response for images.
     * Attempts to serve from the local cache first.
     * If that fails, then go out to the network.
     * Finally, see if there is an image in indexeddb.
     *
     * @param {FetchEvent} evt
     */
    handleImageFetch(evt) {
        // tryRemoteFallback is set to false to ensure a rapid response to the client when the network is down, at the cost of no access to remotely compressed image

        evt.respondWith(this.fromCache(evt.request, true, 5000)
            .then((response) => {
                //console.log('In handleImageFetch promise');

                // response may be a 404
                if (response && response.ok) {
                    console.info('Responding with image from cache (or remotely if no cache).');
                    return response;
                } else {
                    // not cached and no network access
                    // try to respond from local storage

                    const url = evt.request.url;
                    console.info(`Attempting image match for '${url}'`);

                    const matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

                    if (matches) {
                        const imageId = matches[1];
                        console.info(`Returning image match for '${url}' from local database`);
                        return this.imageFromLocalDatabase(imageId);
                    } else {
                        console.error(`Failed to match image id in url '${url}'`);
                    }
                }
            })
            .catch((error) => {
                const url = evt.request.url;
                console.log({'caught' : error});
                console.log(`In catch following failed network fetch, attempting image match for '${url}'`);

                const matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

                if (matches) {
                    const imageId = matches[1];
                    console.log(`(via catch) Returning image match for '${url}' from local database`);
                    return this.imageFromLocalDatabase(imageId);
                } else {
                    console.error(`(via catch) Failed to match image id in url '${url}'`);
                    return Promise.reject(`(via catch) Failed to match image id in url '${url}'`);
                }
            })
        );
    }

    /**
     *
     * @param {string} imageId
     * @returns {Promise}
     */
    imageFromLocalDatabase(imageId) {
        const image = new OccurrenceImage();

        console.info('attempting retrieval of image data from local database');

        return OccurrenceImage.retrieveFromLocal(imageId, image)
            // the record carries metadata only, so the binary has to be fetched explicitly
            .then((image) => image.loadFile().then(() => image))
            .then((image) => {
                console.log(`Retrieved image '${imageId}' from indexeddb.`);
                if (image.file) {
                    const headers = new Headers();
                    headers.append('Content-Type', image.file.type);

                    return new Response(image.file, {
                        "status": 200,
                        "statusText": "OK image response from IndexedDb"
                    });
                } else {
                    console.error(`No local file object associated with retrieved image '${imageId}' from IndexedDB.`);
                    return Promise.reject(`No local file object associated with retrieved image '${imageId}' from IndexedDB.`);
                }
            });
    }

    /**
     *
     * @param url
     */
    handleRecacheMessage(url) {
        // let cacheName;
        //
        // if (this.SERVICE_WORKER_DATA_URL_MATCHES.test(url)) {
        //     cacheName = this.DATA_CACHE_VERSION
        // } else {
        //     cacheName = this.CACHE_VERSION;
        // }

        const cacheName = this.getCacheName(url);

        return caches.open(cacheName).then((cache) => {
            return cache.add(url);
        }).catch((error) => {
            console.error({'Precache failed result' : error});
            return Promise.resolve();
        });
    }

    handleUserChangeMessage(userId) {
        Logger.userId = userId;
        return Promise.resolve();
    }

    /**
     * Update consists of opening the cache, performing a network request, and
     * storing the new response data.
     *
     * @param {Request} request
     * @param {number} timeout request timeout in milliseconds (or 0 for no timeout)
     * @returns {Promise<Response>}
     */
    update(request, timeout = 0) {
        // const cacheName = this.SERVICE_WORKER_DATA_URL_MATCHES.test(request.url) ?
        //     this.DATA_CACHE_VERSION : this.CACHE_VERSION;
        const cacheName = this.getCacheName(request.url);

        request = new Request(request, {mode: 'cors', credentials: 'omit'});

        console.info(`Attempting fetch and cache update of ${request.url}`);

        return caches.open(cacheName).then((cache) => {
            let signalController;
            let timeoutId;
            const fetchOptions = {
                cache: "no-cache",
                mode: 'cors',
                credentials: 'omit',
            };

            if (timeout) {
                signalController = new AbortController();
                timeoutId = setTimeout(() => {
                    signalController.abort();
                    console.log(`User-define update fetch timeout expired after ${timeout} ms`);
                }, timeout);
                fetchOptions.signal = signalController.signal;
            }

            return fetch(request, fetchOptions).then((response) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                if (response.ok) {
                    console.info(`(re-)caching ${request.url}`);
                    return cache.put(request, response)
                        .then(() => cache.match(request, {ignoreVary : true, ignoreSearch : /\.css|\.mjs/.test(request.url)}));
                } else {
                    console.error(`Request during cache update failed for ${request.url} (${response.status})`);

                    if (response.status !== 404) {
                        console.error({'failed cache response': response});
                    }
                    return Promise.reject('Request during cache update failed, not caching.');
                }
            }).catch((error) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                console.error(`Cache attempt failed for ${request.url}: error was ${error}`);
                return Promise.reject(`Cache attempt failed for ${request.url}: error was ${error}`);
            });
        });
    }
}
