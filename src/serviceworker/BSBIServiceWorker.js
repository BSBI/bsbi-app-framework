// service worker for BSBI app

// based around the 'Cache and update' recipe along with many modifications
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
     * @var {RegExp}
     */
    SERVICE_WORKER_DATA_URL_MATCHES;

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
     *  [dataVersion] : string
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

        this.CACHE_VERSION = `version-BSBI_APP_VERSION-${configuration.version}`;
        this.DATA_CACHE_VERSION = `bsbi-data-${configuration.dataVersion || configuration.version}`;

        Model.bsbiAppVersion = configuration.version;
        Logger.bsbiAppVersion = configuration.version;

        const POST_PASS_THROUGH_WHITELIST = configuration.postPassThroughWhitelist;
        const POST_IMAGE_URL_MATCH = configuration.postImageUrlMatch;
        const GET_IMAGE_URL_MATCH = configuration.getImageUrlMatch;
        const SERVICE_WORKER_INTERCEPT_URL_MATCHES = configuration.interceptUrlMatches;
        const SERVICE_WORKER_IGNORE_URL_MATCHES = configuration.ignoreUrlMatches;
        const SERVICE_WORKER_PASS_THROUGH_NO_CACHE = configuration.passThroughNoCache;

        this.SERVICE_WORKER_DATA_URL_MATCHES = configuration.dataUrlMatches || /^NO_MATCHING$/;

        /**
         * Urls that should be cached, with no need for automatic refresh
         *
         * @type {RegExp|null}
         */
        const SERVICE_WORKER_STATIC_URL_MATCHES= configuration.staticUrlMatches;
        const INDEX_URL = configuration.indexUrl;

        this.URL_CACHE_SET = configuration.urlCacheSet;

        localforage.config({
            name: configuration.forageName
        });

        self.addEventListener("message", (event) => {
                console.log({"Message received": event.data});

                switch (event.data.action) {
                    case 'recache':
                        event.waitUntil(this.handleRecacheMessage(event.data.url));
                        break;
                }
            }
        );

        // On install, cache some resources.
        self.addEventListener('install', (evt) => {
            console.log('BSBI app service worker is being installed.');

            // noinspection JSIgnoredPromiseFromCall
            self.skipWaiting();

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

            event.waitUntil(
                self.clients.matchAll({
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
                                // test for 'version' prefix to avoid deleting mapbox tiles
                                if (cacheName.startsWith('version') && cacheName !== this.CACHE_VERSION) {
                                    console.log('[ServiceWorker] Deleting old code cache:', cacheName);
                                    return caches.delete(cacheName);
                                }

                                if (cacheName.startsWith('bsbi-data') && cacheName !== this.DATA_CACHE_VERSION) {
                                    console.log('[ServiceWorker] Deleting old data cache:', cacheName);
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

                if (POST_PASS_THROUGH_WHITELIST.test(evt.request.url)) {
                    //console.log(`Passing through whitelisted post request for: ${evt.request.url}`);
                    evt.respondWith(fetch(evt.request));
                } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
                    //console.log(`Passing through nocache list post request for: ${evt.request.url}`);
                    evt.respondWith(fetch(evt.request));
                } else {
                    const isSync = /issync/.test(evt.request.url);

                    if (POST_IMAGE_URL_MATCH.test(evt.request.url) && !isSync) {
                        //console.log(`Got an image post request: '${evt.request.url}'`);
                        this.handle_image_post(evt);
                    } else {
                        //console.log(`Got post request: '${evt.request.url}'`);
                        this.handle_post(evt, isSync);
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

                    // don't need to check for fresh, stale is fine here
                    //evt.waitUntil(this.update(spaRequest));
                } else if (evt.request.url.match(GET_IMAGE_URL_MATCH)) {
                    console.log(`request is for an image '${evt.request.url}'`);
                    this.handleImageFetch(evt);
                } else if (SERVICE_WORKER_PASS_THROUGH_NO_CACHE.test(evt.request.url)) {
                    // typically for external content that can't/shouldn't be cached, e.g. MapBox tiles (which mapbox stores directly in the cache itself)
                    evt.respondWith(fetch(evt.request));
                } else if (SERVICE_WORKER_STATIC_URL_MATCHES?.test(evt.request.url)) {
                    // typically for content that won't change
                    evt.respondWith(this.fromCache(evt.request));
                } else {
                    let isStale = null;

                    //console.log(`request is for non-image '${evt.request.url}'`);

                    // You can use `respondWith()` to answer immediately, without waiting for the
                    // network response to reach the service worker...
                    evt.respondWith(this.fromCache(evt.request)
                        .then((response) => {
                            const dateAsString = response.headers.get('Date');

                            if (dateAsString) {
                                console.log(`Request for ${evt.request.url} date: ${dateAsString}`);

                                const dateStamp = Date.parse(dateAsString); // ms
                                isStale = (dateStamp + (3600000 * 48)) < Date.now();
                            }

                            return response;
                        })
                    );

                    if (isStale) {
                        // ...and `waitUntil()` to prevent the worker from being killed until the
                        // cache is updated.
                        evt.waitUntil(this.update(evt.request));
                    } else {
                        //console.log(`Request for ${evt.request.url} is still fresh.`);
                    }
                }
            }
        });
    }


    /**
     * used to handle small posts (not images that require rapid return)
     * also used for images, as part of general re-sync
     * attempts remote save first then caches locally
     *
     * @param {FetchEvent} evt
     * @param {boolean} isSync set if this is called as part of a re-sync rather than as a first-time save
     */
    handle_post(evt, isSync = false) {
        let clonedRequest;
        try {
            clonedRequest = evt.request.clone();
        } catch (e) {
            console.log('Failed to clone request.');
            console.log({'Cloning error': e});
            return e;
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
                                .storeLocally(true);
                        })
                        .catch((error) => {
                            // for some reason local storage failed, after a successful server save
                            console.log({'local storage failed' : error});

                            return Promise.resolve(response); // pass through the server response
                        });
                } else {
                    console.log(`Failed to save, moving on to attempt IndexedDb`);
                    return Promise.reject(`Failed to save to server. (${response.status})`);
                }
            })
            .catch( (remoteReason) => {
                    console.log({'post fetch failed (probably no network)': remoteReason});

                    // would get here if the network is down
                    // or if got invalid response from the server

                    if (isSync) {
                        // don't need to store locally (as will already be present) and response is not needed
                        // so just reject

                        return Promise.reject({'remote failed' : true, isSync, remoteReason});
                    } else {

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
                                        .storeLocally(false);
                                }, (reason) => {
                                    console.log({'failed to read form data locally': reason});

                                    /**
                                     * simulated result of post, returned as JSON body
                                     * @type {{[surveyId]: string, [occurrenceId]: string, [imageId]: string, [saveState]: string, [error]: string, [errorHelp]: string}}
                                     */
                                    let returnedToClient = {
                                        error: 'Failed to process posted response data. (internal error)',
                                        errorHelp: 'Your internet connection may have failed (or there could be a problem with the server). ' +
                                            'It wasn\'t possible to save a temporary copy on your device. (an unexpected error occurred) ' +
                                            'Please try to re-establish a network connection and try again.' +
                                            `Error was: ${JSON.stringify(remoteReason)}`
                                    };

                                    return packageClientResponse(returnedToClient);
                                }
                            );
                    }
                }
            ));
    }

    /**
     * used to handle image posts, which need to respond quickly even if the network is slow
     * attempts local cache first then saves out to network
     *
     * @param {FetchEvent} event
     */
    handle_image_post(event) {
        let clonedRequest;

        console.log('posting image for quick response');

        try {
            clonedRequest = event.request.clone();
        } catch (e) {
            console.log('Failed to clone request.');
            console.log({'Cloning error': e});
        }

        // send back a quick response to the client from local storage (before the server request completes)
        event.respondWith(
            clonedRequest.formData()
                .then((formData) => {
                        //console.log({'got to image form data handler' : formData});

                        return ResponseFactory
                            .fromPostedData(formData)
                            .populateClientResponse()
                            .storeLocally()
                            .then((response) => {

                                // separately send data to the server, but response goes to client before this completes
                                // am unsure if the return from the wait until part ever reaches the client
                                event.waitUntil(fetch(event.request)
                                    .then((response) => {
                                            console.log('posting image to server in waitUntil part of fetch cycle');

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
                                                        console.error({'local storage store failed' : error});

                                                        return Promise.resolve(response); // pass through the server response
                                                    });
                                            } else {
                                                console.log('posted image to server in waitUntil part of fetch cycle: got Error response');

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
                                        }, (reason) => {
                                            console.log({'Rejected image post fetch from server - implies network is down' : reason});
                                        }
                                    ));

                                return response;
                            });
                    }, (reason) => {
                        console.log({'failed to read form data locally' : reason});

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
        }).catch((error) => {
            console.log({'Precache failed result' : error});
            return Promise.resolve();
        });
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

        const cacheName = this.SERVICE_WORKER_DATA_URL_MATCHES.test(request.url) ?
            this.DATA_CACHE_VERSION : this.CACHE_VERSION;

        return caches.open(cacheName).then((cache) => {
            //console.log('cache is open');

            return cache.match(request, {ignoreVary : true, ignoreSearch : request.url.match(/\.css|\.mjs/)}).then((cachedResponse) => {
                console.log(cachedResponse ?
                    `cache matched ${request.url}`
                    :
                    `no cache match for ${request.url}`);

                return cachedResponse || (tryRemoteFallback && this.update(request, remoteTimeoutMilliseconds)); // return cache match or if not cached then go out to network (and then locally cache the response)

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
     * Special case response for images
     * attempt to serve from local cache first,
     * if that fails then go out to network
     * finally see if there is an image in indexeddb
     *
     * @param {FetchEvent} evt
     */
    handleImageFetch(evt) {
        // tryRemoteFallback is set to false, to ensure a rapid response to client when bad network, at the cost of no access to remotely compressed image

        evt.respondWith(this.fromCache(evt.request, true, 5000).then((response) => {
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

        return OccurrenceImage.retrieveFromLocal(imageId, image).then((image) => {
            console.log(`Retrieved image '${imageId}' from indexeddb.`);
            if (image.file) {
                const headers = new Headers();
                headers.append('Content-Type', image.file.type);

                return new Response(image.file, {
                    "status": 200,
                    "statusText": "OK image response from IndexedDb"
                });
            } else {
                console.error(`No local file object associated with retrieved image '${imageId}' from indexeddb.`);
                return Promise.reject(`No local file object associated with retrieved image '${imageId}' from indexeddb.`);
            }
        });
    }

    /**
     *
     * @param url
     */
    handleRecacheMessage(url) {
        let cacheName;

        if (this.SERVICE_WORKER_DATA_URL_MATCHES.test(url)) {
            cacheName = this.DATA_CACHE_VERSION
        } else {
            cacheName = this.CACHE_VERSION;
        }

        return caches.open(cacheName).then((cache) => {
            return cache.add(url);
        }).catch((error) => {
            console.error({'Precache failed result' : error});
            return Promise.resolve();
        });
    }

    /**
     * Update consists in opening the cache, performing a network request and
     * storing the new response data.
     *
     * @param {Request} request
     * @param {number} timeout request timeout in milliseconds (or 0 for no timeout)
     * @returns {Promise<Response>}
     */
    update(request, timeout = 0) {
        let cacheName;

        if (this.SERVICE_WORKER_DATA_URL_MATCHES.test(request.url)) {
            cacheName = this.DATA_CACHE_VERSION
        } else {
            cacheName = this.CACHE_VERSION;
        }

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
                    return cache.put(request, response).then(() => {
                        return cache.match(request, {ignoreVary : true, ignoreSearch : request.url.match(/\.css|\.mjs/)});
                    });
                } else {
                    console.error(`Request during cache update failed for ${request.url}`);
                    console.error({'failed cache response': response});
                    return Promise.reject('Request during cache update failed, not caching.');
                }
            }).catch((error) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    timeoutId = null;
                }

                console.log(`Cache attempt failed for ${request.url}: error was ${error}`);
                return Promise.reject(`Cache attempt failed for ${request.url}: error was ${error}`);
            });
        });
    }
}
