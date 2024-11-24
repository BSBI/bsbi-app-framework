// SurveyPickerController
//

import {AppController} from './AppController';
import {NotFoundError} from "../utils/exceptions/NotFoundError";
import {UUID_REGEX} from "../models/Model";
//import {App} from "../framework/App";
import {Logger} from "../utils/Logger";
import {
    APP_EVENT_ADD_SURVEY_USER_REQUEST,
    APP_EVENT_RESET_SURVEYS,
    APP_EVENT_SURVEYS_CHANGED
} from "../framework/AppEvents";

/**
 * @typedef {import('bsbi-app-framework-view').SurveyPickerView} SurveyPickerView
 * @typedef {import('bsbi-app-framework-view').PatchedNavigo} PatchedNavigo
 */

export class SurveyPickerController extends AppController {
    route = '/survey/:action/:id';

    static EVENT_BACK = 'back';

    title = 'Survey picker';

    /**
     *
     * @type {SurveyPickerView}
     */
    view;

    /**
     *
     * @returns {Survey}
     */
    get survey() {
        return this.app.currentSurvey;
    }

    /**
     *
     * @param {SurveyPickerView} view
     */
    constructor (view) {
        super();

        this.view = view;
        view.controller = this;

        this.handle = AppController.nextHandle;
    }

    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */
    registerRoute(router) {
        // router.on(
        //     '/survey',
        //     this.mainRouteHandler.bind(this, 'survey', '', ''),
        //     {
        //         // before : this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
        //         // after : this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
        //         // leave : this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
        //         // already : this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
        //     }
        // );

        router.on(
            '/survey/new',
            this.newSurveyHandler.bind(this, 'survey', 'new', ''),
            {
                before : this.beforeNewHandler.bind(this)
            }
        );

        router.on(
            '/survey/reset',
            this.mainRouteHandler.bind(this, 'survey', 'reset', ''),
            {
                before : this.beforeResetHandler.bind(this)
            }
        );

        router.on(
            '/survey/save',
            this.mainRouteHandler.bind(this, 'survey', 'save', ''),
            {
                before : this.beforeSaveAllHandler.bind(this)
            }
        );

        router.on(
            '/survey/add/:surveyId/:occurrenceId',
            this.addSurveyHandler.bind(this, 'survey', 'add', '')
        );

        router.on(
            '/survey/add/:surveyId',
            this.addSurveyHandler.bind(this, 'survey', 'add', '')
        );



        this.app.addListener(APP_EVENT_ADD_SURVEY_USER_REQUEST, this.addNewSurveyHandler.bind(this));
        this.app.addListener(APP_EVENT_RESET_SURVEYS, this.resetSurveysHandler.bind(this));
    }

    beforeNewHandler(done) {
        this.view.newSurveyDialog();

        this.app.router.pause();

        //console.log({'route history' : this.app.routeHistory});

        if (window.history.state) {
            window.history.back(); // this could fail if previous url was not under the single-page-app umbrella (should test)
        }
        this.app.router.resume();

        done(false); // block navigation
    }

    beforeResetHandler(done) {
        this.view.showResetDialog();

        this.app.router.pause();
        if (window.history.state) {
            window.history.back(); // this could fail if previous url was not under the single-page-app umbrella (should test)
        }
        this.app.router.resume();

        done(false); // block navigation
    }

    beforeSaveAllHandler(done) {

        if (navigator.onLine) {
            // invoke sync of any/all unsaved data
            // show pop-ups on success and failure
            this.app.syncAll(false).then((result) => {
                //console.log({'In save all handler, success result': result});

                this.view.showSaveAllSuccess(result);

                return this.app.refreshFromServer(Array.from(this.app.surveys.keys()))
                    .then(() => {
                        console.log('Surveys refreshed from the server');
                        this.fireEvent(APP_EVENT_SURVEYS_CHANGED);

                        // @todo should now update the current survey from indexDb without clearing existing entries
                    });

                //const currentSurvey = this.app.currentSurvey
                // this.app.restoreOccurrences(currentSurvey?.id || '', true, !!currentSurvey)
                //     .then((result) => {
                //             console.log({'result from restoreOccurrences': result});
                //         },
                //         (result) => {
                //             console.log({'failed result from restoreOccurrences': result});
                //         }
                //     );

                // if (Array.isArray(result)) {
                //     this.view.showSaveAllSuccess();
                // } else {
                //     Logger.logError(`Failed to sync all (line 138): ${result}`);
                //     this.view.showSaveAllFailure();
                // }
            }, (result) => {
                console.log({'In save all handler, failure result': result});
                // noinspection JSIgnoredPromiseFromCall
                Logger.logError(`Failed to sync all (line 143): ${JSON.stringify(result)}`);
                this.view.showSaveAllFailure(result);
            }).finally(() => {
                // stop the spinner
            });
        }

        this.app.router.pause();
        if (window.history.state) {
            window.history.back(); // this could fail if previous url was not under the single-page-app umbrella (should test)
        }
        this.app.router.resume();

        done(false); // block navigation
    }

    /**
     *
     * @param {string} context typically 'survey'
     * @param {('new'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */
    newSurveyHandler(context, subcontext, rhs, queryParameters) {
        // should not get here, as beforeNewHandler ought to have been invoked first
    }

    /**
     * called after user has confirmed add new survey dialog box
     *
     */
    addNewSurveyHandler() {
        console.log("reached addNewSurveyHandler");
        this.app.currentControllerHandle = this.handle; // when navigate back need to list need to ensure full view refresh

        // it's opportune at this point to try to ping the server again to save anything left outstanding
        this.app.syncAll(true).finally(() => {

            // the apps occurrences should only relate to the current survey
            // (the reset are remote or in IndexedDb)
            this.app.clearCurrentSurvey().then(() => {

                this.app.setNewSurvey();

                this.app.router.pause();
                this.app.router.navigate('/list/survey/about').resume(); // jump straight into the survey rather than to welcome stage
                this.app.router.resolve();
            });
        });
    }

    /**
     * called after user has confirmed reset surveys dialog box
     */
    resetSurveysHandler() {
        this.app.clearLocalForage().then(() => {
            return this.app.reset();
        }).finally(() => {
            this.addNewSurveyHandler();
        });
    }

    /**
     * url fragment to redirect to, following addition of an existing survey, e.g. a pick from the selection list
     *
     * should be '/list' or '/list/record'
     *
     * @type {string}
     */
    restoredSurveyNavigationTarget = '/list';

    /**
     *
     * @param {string} context typically 'survey'
     * @param {('add'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */
    addSurveyHandler(context, subcontext, rhs, queryParameters) {
        console.log("reached addSurveyHandler");
        //console.log({context: context, params: subcontext, query: queryParameters});

        this.app.currentControllerHandle = this.handle; // when navigate back need to list need to ensure full view refresh

        let surveyId = queryParameters.surveyId;

        if (!surveyId || !surveyId.match(UUID_REGEX)) {
            throw new NotFoundError(`Failed to match survey id '${surveyId}', the id format appears to be incorrect`);
        }

        surveyId = surveyId.toLowerCase();

        // hide the left panel before loading, otherwise there can be a confusing delay
        this.view.hideLeftPanel();

        this.app.restoreOccurrences(surveyId)
            .then(() => {
                this.app.markAllNotPristine();

                this.app.router.pause();
                this.app.router.navigate(this.restoredSurveyNavigationTarget).resume();
                this.app.router.resolve();
            }, (error) => {
                console.log({'failed survey restoration' : error});

                // should display a modal error message
                // either the survey was not found or there was no network connection

                // should switch to displaying a list of available surveys and an option to start a new survey
            })
            .finally(() => {
                this.view.restoreLeftPanel();
            })
        ;
    }

    /**
     *
     * @param {string} context typically 'survey'
     * @param {('add'|'')} subcontext
     * @param {(''|'help')} rhs currently not used
     * @param {Object.<string, string>} queryParameters surveyId
     */
    mainRouteHandler(context, subcontext, rhs, queryParameters) {
        console.log("reached special route handler for SurveyPickerController.js");
        //console.log({context: context, params: subcontext, query: queryParameters});
    }
}
