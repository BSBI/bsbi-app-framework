// service worker for BSBI app

// currently based around the 'Cache and update' recipe along with many modifications
// see https://serviceworke.rs

import {BSBIServiceWorker} from "./BSBIServiceWorker";
import {ExampleApp} from "../framework/ExampleApp";

const serviceWorker = new BSBIServiceWorker();
serviceWorker.initialise({
    forageName : ExampleApp.forageName,
    postPassThroughWhitelist : /^https:\/\/gardenwildflowerhunt\.org\/loadsurveys.php/,
    postImageUrlMatch : /^https:\/\/gardenwildflowerhunt\.org\/saveimage.php/,
    getImageUrlMatch : /^https:\/\/gardenwildflowerhunt\.org\/image\.php/,
    interceptUrlMatches : /(?:^https:\/\/gardenwildflowerhunt\.org\/app\/|^https:\/\/gardenwildflowerhunt\.org\/app$)/,
    ignoreUrlMatches : /(?:^https:\/\/gardenwildflowerhunt\.org\/app\/app\.js|^https:\/\/gardenwildflowerhunt\.org\/app\/serviceworker\.js|^https:\/\/gardenwildflowerhunt\.org\/app\/manifest\.webmanifest|^https:\/\/gardenwildflowerhunt\.org\/app\/index\.html)/,
    indexUrl : 'https://gardenwildflowerhunt.org/app/index.html',
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

