// service worker for BSBI app

// currently based around the 'Cache and update' recipe along with many modifications
// see https://serviceworke.rs

'use strict';

import {BSBIServiceWorker} from "./BSBIServiceWorker";
import {ExampleApp} from "../framework/ExampleApp";

const serviceWorker = new BSBIServiceWorker();
serviceWorker.initialise({
    forageName : ExampleApp.forageName,
    postPassThroughWhitelist : /^https:\/\/example\.org\/loadsurveys.php/,
    postImageUrlMatch : /^https:\/\/example\.org\/saveimage.php/,
    getImageUrlMatch : /^https:\/\/example\.org\/image\.php/,
    interceptUrlMatches : /(?:^https:\/\/example\.org\/app\/|^https:\/\/example\.org\/app$)/,
    ignoreUrlMatches : /(?:^https:\/\/example\.org\/app\/app\.js|^https:\/\/example\.org\/app\/serviceworker\.js|^https:\/\/example\.org\/app\/manifest\.webmanifest|^https:\/\/example\.org\/app\/index\.html)/,
    indexUrl : 'https://example.org/app/index.html',
    urlCacheSet : [
        './index.html',
        './manifest.webmanifest',
        '/appcss/app.css', // note no leading '.' - this is an absolute path
        '/appcss/theme.css',
        '/img/gwh_logo1_tsp.png',
        '/img/icons/favicon-32x32.png',
        '/img/icons/favicon-16x16.png',
        '/img/icons/android-icon-192x192.png',
        '/img/icons/gwh_logo1_tsp-512x512.png',
        '/img/BSBIlong.png',
        'https://fonts.googleapis.com/icon?family=Material+Icons|Material+Icons+Round',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css',
        'https://database.bsbi.org/js/taxonnames.js.php',
        'https://code.jquery.com/jquery-3.3.1.slim.min.js',
        'https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js',
        'https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js',
        'https://fonts.googleapis.com/css2?family=Gentium+Basic&display=swap'
    ],
    version : 'VERSION'
});

