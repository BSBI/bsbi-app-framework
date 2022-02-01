// Example of using the BSBI app framework
// version BSBI_APP_VERSION

import {ExampleApp} from './framework/ExampleApp';
import {MainController} from "./controllers/MainController";
import {MainView} from "./views/MainView.example";
import {StaticContentController} from "./controllers/StaticContentController";
import {HelpView} from "./views/HelpView";
import {PatchedNavigo} from "./utils/PatchedNavigo";
import {SurveyPickerController} from "./controllers/SurveyPickerController";
import {SurveyPickerView} from "./views/SurveyPickerView";
import {ExampleAppLayout} from "./views/layout/ExampleAppLayout";
import {TaxaLoadedHook} from "./utils/TaxaLoadedHook";
import './theme.scss';

// localforage.config({
//     name: ExampleApp.forageName
// });

// work around Edge bug
if (!Promise.prototype.finally) {
    Promise.prototype.finally = function(callback) {
        return this.then(callback)
            .catch(callback);
    };
}

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.example.js:5 -->');

if (navigator.serviceWorker) {
    // Register the ServiceWorker limiting its action to those URL starting
    // by `controlled`. The scope is not a path but a prefix. First, it is
    // converted into an absolute URL, then used to determine if a page is
    // controlled by testing it is a prefix of the request URL.
    navigator.serviceWorker.register('/app/serviceworker.js', {
        // scope: './controlled'
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload(true);
    });
}

const app = new ExampleApp;

app.router = new PatchedNavigo('https://example.com/app/');

app.containerId = 'appcontainer';
app.setLayout(new ExampleAppLayout());

app.registerController(new StaticContentController(new HelpView, '/help'));
app.registerController(new MainController(new MainView));
app.registerController(new SurveyPickerController(new SurveyPickerView));

app.setLocalForageName(ExampleApp.forageName);

// test detection of cameras
// see https://stackoverflow.com/questions/23288918/check-if-user-has-webcam-or-not-using-javascript-only
// navigator.mediaDevices.enumerateDevices()
//     .then(function(devices) {
//         devices.forEach(function(device) {
//             console.log(device.kind + ": " + device.label +
//                 " id = " + device.deviceId);
//         });
//     });

app.restoreOccurrences().then((result) => {
    console.log({'result from restoreOccurrences' : result});},
    (result) => {
            console.log({'failed result from restoreOccurrences' : result});
}).finally(() => {
    // the taxon list may be slow to load
    TaxaLoadedHook.onceTaxaLoaded()
        .then(() => {
            app.initialise();
            app.display();
        });
});



