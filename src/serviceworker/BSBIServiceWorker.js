// service worker for BSBI app

// currently based around the 'Cache and update' recipe along with many modifications
// see https://serviceworke.rs

import localforage from 'localforage';
import {ResponseFactory} from "./responses/ResponseFactory";
import {ImageResponse} from "./responses/ImageResponse";
import {packageClientResponse} from "./packageClientResponse";
import {SurveyResponse} from "./responses/SurveyResponse";
import {OccurrenceResponse} from "./responses/OccurrenceResponse";
import {OccurrenceImage} from "..";
import {Model} from "..";

export class BSBIServiceWorker {

    /**
     * @var {Array.<string>}
     */
    URL_CACHE_SET;

    /**
     *
     * @param {{
     *  forageName : string,
     *  postPassThroughWhitelist : RegExp,
     *  postImageUrlMatch : RegExp,
     *  getImageUrlMatch : RegExp,
     *  interceptUrlMatches : RegExp,
     *  ignoreUrlMatches : RegExp,
     *  passThroughNoCache : RegExp,
     *  indexUrl : string,
     *  urlCacheSet : Array.<string>,
     *  version : string
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

        this.CACHE_VERSION = `version-VERSION-${configuration.version}`;

        const POST_PASS_THROUGH_WHITELIST = configuration.postPassThroughWhitelist;
        const POST_IMAGE_URL_MATCH = configuration.postImageUrlMatch;
        const GET_IMAGE_URL_MATCH = configuration.getImageUrlMatch;
        const SERVICE_WORKER_INTERCEPT_URL_MATCHES = configuration.interceptUrlMatches;
        const SERVICE_WORKER_IGNORE_URL_MATCHES = configuration.ignoreUrlMatches;
        const SERVICE_WORKER_PASS_THROUGH_NO_CACHE = configuration.passThroughNoCache;
        const INDEX_URL = configuration.indexUrl;

        this.URL_CACHE_SET = configuration.urlCacheSet;

        localforage.config({
            name: configuration.forageName
        });

        // On install, cache some resources.
        self.addEventListener('install', (evt) => {
            console.log('BSBI app service worker is being installed.');

            // noinspection JSIgnoredPromiseFromCall
            self.skipWaiting();

            // Ask the service worker to keep installing until the returning promise
            // resolves.
            evt.waitUntil(
                this.precache()
                    // see https://serviceworke.rs/immediate-claim_service-worker_doc.html
                    .then(() => self.skipWaiting()));
        });

        self.addEventListener('activate', (event) => {

            event.waitUntil(self.clients.matchAll({
                includeUncontrolled: true
            }).then((clientList) => {
                const urls = clientList.map((client) => {
                    return client.url;
                });
                console.log('[ServiceWorker] Matching clients:', urls.join(', '));
            }).then(() => caches.keys())
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            if (cacheName !== this.CACHE_VERSION) {
                                console.log('[ServiceWorker] Deleting old cache:', cacheName);
                                return caches.delete(cacheName);
                            }
                        })
                    );
                }).then(() => {
                    console.log('[ServiceWorker] Claiming clients for version', this.CACHE_VERSION);
                    return self.clients.claim();
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

            evt.preventDefault();

            if (evt.request.method === 'POST') {
                //console.log(`Got a post request`);

                //if (evt.request.url.match(POST_PASS_THROUGH_WHITELIST)) {
                if (POST_PASS_THROUGH_WHITELIST.test(evt.request.url)) {
                    console.log(`Passing through whitelisted post request for: ${evt.request.url}`);
                    evt.respondWith(fetch(evt.request));
                } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
                    console.log(`Passing through nocache list post request for: ${evt.request.url}`);
                    evt.respondWith(fetch(evt.request));
                } else {
                    //if (evt.request.url.match(POST_IMAGE_URL_MATCH)) {
                    if (POST_IMAGE_URL_MATCH.test(evt.request.url)) {
                        console.log(`Got an image post request: '${evt.request.url}'`);
                        this.handle_image_post(evt);
                    } else {
                        console.log(`Got post request: '${evt.request.url}'`);
                        this.handle_post(evt);
                    }
                }
            } else {
                // test whether this is a direct link in to a page that should be substituted by
                // the single page app

                // console.log(`about to test url '${evt.request.url}'`);

                if (SERVICE_WORKER_INTERCEPT_URL_MATCHES.test(evt.request.url) &&
                    !SERVICE_WORKER_IGNORE_URL_MATCHES.test(evt.request.url)
                ) {
                    // serving single page app instead
                    console.log(`redirecting to the root of the SPA for '${evt.request.url}'`);
                    let spaRequest = new Request(INDEX_URL);
                    evt.respondWith(this.fromCache(spaRequest));
                    evt.waitUntil(this.update(spaRequest));
                } else if (evt.request.url.match(GET_IMAGE_URL_MATCH)) {
                    console.log(`request is for an image '${evt.request.url}'`);
                    this.handleImageFetch(evt);
                } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
                    // typically for external content that can't/shouldn't be cached, e.g. MapBox tiles (which mapbox stores directly in the cache itself)
                    evt.respondWith(fetch(evt.request));
                } else {
                    console.log(`request is for non-image '${evt.request.url}'`);
                    // You can use `respondWith()` to answer immediately, without waiting for the
                    // network response to reach the service worker...
                    evt.respondWith(this.fromCache(evt.request));
                    // ...and `waitUntil()` to prevent the worker from being killed until the
                    // cache is updated.
                    evt.waitUntil(this.update(evt.request));
                }
            }
        });
    }


    /**
     * used to handle small posts (not images)
     * attempts remote save first then caches locally
     *
     * @param {FetchEvent} evt
     */
    handle_post(evt) {
        let clonedRequest;
        try {
            clonedRequest = evt.request.clone();
        } catch (e) {
            console.log('Failed to clone request.');
            console.log({'Cloning error': e});
        }

        evt.respondWith(fetch(evt.request)
            .then((response) => {
                // would get here if the server responds at all, but need to check that the response is ok (not a server error)
                if (response.ok) {
                    return Promise.resolve(response)
                        .then((response) => {
                            // save the response locally
                            // before returning it to the client

                            console.log('About to clone the json response.')

                            return response.clone().json();
                        })
                        .then((jsonResponseData) => {
                            console.log('Following successful remote post, about to save locally.');

                            return ResponseFactory
                                .fromPostResponse(jsonResponseData)
                                .setPrebuiltResponse(response)
                                .populateLocalSave()
                                .storeLocally();
                        })
                        .catch((error) => {
                            // for some reason local storage failed, after a successful server save
                            console.log({error});

                            return Promise.resolve(response); // pass through the server response
                        });
                } else {
                    console.log(`Failed to save, moving on to attempt IndexedDb`);
                    return Promise.reject('Failed to save to server.');
                }
            })
            .catch((reason) => {
                // would get here if the network is down
                // or if got invalid response from the server

                console.log(`post fetch failed (probably no network), (reason: ${reason})`);
                //console.log({'post failure reason' : reason});

                // /**
                //  * simulated result of post, returned as JSON body
                //  * @type {{surveyId: string, occurrenceId: string, imageId: string, saveState: string, [error]: string, [errorHelp]: string}}
                //  */
                // let returnedToClient = {};

                return clonedRequest.formData()
                    .then((formData) => {
                            console.log('got to form data handler');
                            //console.log({formData});

                            return ResponseFactory
                                .fromPostedData(formData)
                                .populateClientResponse()
                                .storeLocally();
                        }, reason => {
                            console.log('failed to read form data locally');
                            console.log({reason});

                            /**
                             * simulated result of post, returned as JSON body
                             * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
                             */
                            let returnedToClient = {
                                error: 'Failed to process posted response data. (internal error)',
                                errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                                    'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' +
                                    'Please try to re-establish a network connection and try again.'
                            };

                            return packageClientResponse(returnedToClient);
                        }
                    );
            }));
    }

    /**
     * used to handle image posts, which need to respond quickly even if the network is slow
     * attempts local cache first then saves out to network
     *
     * @param {FetchEvent} event
     */
    handle_image_post(event) {
        let clonedRequest;

        console.log('posting image');

        try {
            clonedRequest = event.request.clone();
        } catch (e) {
            console.log('Failed to clone request.');
            console.log({'Cloning error': e});
        }

        event.respondWith(
            clonedRequest.formData()
                .then((formData) => {
                        console.log('got to form data handler');
                        //console.log({formData});

                        return ResponseFactory
                            .fromPostedData(formData)
                            .populateClientResponse()
                            .storeLocally();
                    }, reason => {
                        console.log('failed to read form data locally');
                        console.log({reason});

                        /**
                         * simulated result of post, returned as JSON body
                         * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
                         */
                        let returnedToClient = {
                            error: 'Failed to process posted response data. (internal error)',
                            errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                                'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' +
                                'Please try to re-establish a network connection and try again.'
                        };

                        return packageClientResponse(returnedToClient);
                    }
                )
        );

        event.waitUntil(fetch(event.request)
            .then((response) => {
                console.log('posted image to server in waitUntil part of fetch cycle');

                // would get here if the server responds at all, but need to check that the response is ok (not a server error)
                if (response.ok) {
                    console.log('posted image to server in waitUntil part of fetch cycle: got OK response');

                    return Promise.resolve(response)
                        .then((response) => {
                            // save the response locally
                            // before returning it to the client

                            return response.clone().json();
                        })
                        .then((jsonResponseData) => {
                            return ResponseFactory
                                .fromPostResponse(jsonResponseData)
                                .setPrebuiltResponse(response)
                                .populateLocalSave()
                                .storeLocally();
                        })
                        .catch((error) => {
                            // for some reason local storage failed, after a successful server save
                            console.log({error});

                            return Promise.resolve(response); // pass through the server response
                        });
                } else {
                    // console.log(`Failed to save, moving on to attempt IndexedDb`);
                    // return Promise.reject('Failed to save to server.');

                    /**
                     * simulated result of post, returned as JSON body
                     * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
                     */
                    let returnedToClient = {
                        error: 'Failed to save posted response data. (internal error)',
                        errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                            'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' +
                            'Please try to re-establish a network connection and try again.'
                    };

                    return packageClientResponse(returnedToClient);
                }
            }))
    }

    /**
     * Open a cache and use `addAll()` with an array of assets to add all of them
     * to the cache. Return a promise resolving when all the assets are added.
     *
     * @returns {Promise<void>}
     */
    precache() {
        return caches.open(this.CACHE_VERSION).then((cache) => {
            return cache.addAll(this.URL_CACHE_SET);
        });
    }

    /**
     * Open the cache where the assets were stored and search for the requested
     * resource. Notice that in case of no matching, the promise still resolves
     * but it does with `undefined` as value.
     *
     * @param {Request} request
     * @returns {Promise<Response | Promise<Response>>}
     */
    fromCache(request) {
        // @todo need to serve index.html in place of all Navigo-served pages
        // (an issue if someone returns to a bookmarked page within the app)

        console.log('attempting fromCache response');

        return caches.open(this.CACHE_VERSION).then((cache) => {
            console.log('cache is open');

            return cache.match(request).then((matching) => {
                console.log(matching ?
                    `cache matched ${request.url}`
                    :
                    `no cache match for ${request.url}`);

                //return matching || fetch(request); // return cache match or if not cached then go out to network
                return matching || this.update(request); // return cache match or if not cached then go out to network (and then locally cache the response)
            });
        });
    }

    /**
     * Special case response for images
     * attempt to serve from local cache first,
     * if that fails then go out to network
     * finally see if there is an image in indexeddb
     *
     * @param {FetchEvent} evt
     */
    handleImageFetch(evt) {
        evt.respondWith(this.fromCache(evt.request).then((response) => {
                console.log('In handleImageFetch promise');

                // response may be a 404
                if (response && response.ok) {
                    console.log('Responding with image from cache (or remotely if no cache).');
                    return response;
                } else {
                    // not cached and no network access
                    // try to respond from local storage

                    const url = evt.request.url;
                    console.log(`Attempting image match for '${url}'`);

                    const matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

                    if (matches) {
                        const imageId = matches[1];
                        console.log(`Returning image match for '${url}' from local database`);
                        return this.imageFromLocalDatabase(imageId);
                    } else {
                        console.log(`Failed to match image id in url '${url}'`);
                    }
                }
            })
                .catch((error) => {
                    const url = evt.request.url;
                    console.log(error);
                    console.log(`caught ${error}`);
                    console.log(`In catch following failed network fetch, attempting image match for '${url}'`);

                    const matches = url.match(/imageid=([a-fA-F0-9]{8}-(?:[a-fA-F0-9]{4}-){3}[a-fA-F0-9]{12})/);

                    if (matches) {
                        const imageId = matches[1];
                        console.log(`(via catch) Returning image match for '${url}' from local database`);
                        return this.imageFromLocalDatabase(imageId);
                    } else {
                        console.log(`(via catch) Failed to match image id in url '${url}'`);
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

        console.log('attempting retrieval of image data from local database');

        return Model.retrieveFromLocal(imageId, image).then((image) => {
            console.log(`Retrieved image '${imageId}' from indexeddb.`);
            if (image.file) {
                const headers = new Headers();
                headers.append('Content-Type', image.file.type);

                return new Response(image.file, {
                    "status": 200,
                    "statusText": "OK image response from IndexedDb"
                });
            } else {
                console.log(`No local file object associated with retrieved image '${imageId}' from indexeddb.`);
            }
        });
    }

    /**
     * Update consists in opening the cache, performing a network request and
     * storing the new response data.
     *
     * @param {Request} request
     * @returns {Promise<Response>}
     */
    update(request) {
        request = new Request(request, {mode: 'cors', credentials: 'omit'});

        console.log(`Attempting fetch and cache update of ${request.url}`);

        return caches.open(this.CACHE_VERSION).then((cache) => {
            return fetch(request, {cache: "no-cache"}).then((response) => {
                if (response.ok) {
                    console.log(`(re-)caching ${request.url}`);
                    return cache.put(request, response).then(() => {
                        return cache.match(request);
                    });
                } else {
                    console.log(`Request during cache update failed for ${request.url}`);
                    console.log({'failed cache response': response});
                    return Promise.reject('Request during cache update failed, not caching.');
                }
            }).catch((error) => {
                console.log(`Cache attempt failed for ${request.url}: error was ${error}`);
            });
        });
    }
}
