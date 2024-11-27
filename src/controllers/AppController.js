// AppController
// Abstract super-class for page controllers

import {EventHarness} from "../framework/EventHarness";

/**
 * @typedef {import('bsbi-app-framework-view').Page} Page
 * @typedef {import('bsbi-app-framework-view').PatchedNavigo} PatchedNavigo
 */

export class AppController extends EventHarness {

    /**
     *
     * @type {(null|string)}
     */
    route = null;

    /**
     *
     * @type {Page}
     */
    view;

    title = 'untitled';

    /**
     *
     * @type {number}
     */
    handle;

    /**
     *
     * @type {App}
     */
    app;

    /**
     *
     * @type {function|null}
     */
    beforeRouteHandler = null;

    /**
     *
     * @type {function|null}
     */
    afterRouteHandler = null;

    // /**
    //  *
    //  * @type {function|null}
    //  */
    // leaveRouteHandler = null;

    /**
     *
     * @type {function|null}
     */
    alreadyRouteHandler = null;

    static _handleIndex = 0;

    /**
     * @type {function}
     */
    viewClass;

    static get nextHandle() {
        return AppController._handleIndex++;
    }

    isCurrent() {
        return this.app.currentControllerHandle === this.handle;
    }

    /**
     * Called when the app's current controller is about to change
     * The controller may want to clear view listeners
     */
    makeNotActive() {

    }

    /**
     * Called after the app's current controller has changed, to make this the current controller
     */
    makeActive() {

    }

    /**
     * called from App.initialise() to trigger late-stage initialisation
     */
    initialise() {

        // remove this once all controllers shift to having on-demand rather than permanent views
        this.view?.initialise?.();
    }

    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */
    registerRoute(router) {
        if (null === this.route) {
            throw new Error(`No route set for '${this.title}' controller.`);
        }

        //console.log({route : this.route});

        router.on(
            this.route,
            this.routeHandler.bind(this),
            {
                before : this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
                after : this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
                leave : this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
                already : this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
            }
        );
    }


    routeHandler(context, subcontext, rhs, queryParameters) {

    }

    leaveRouteHandler(params) {
        console.log('leave route handler');
        document.body.classList.remove('hide-controls');

        for(let element of document.querySelectorAll('.needs-bsbi-controls')) {
            if (!element.classList.contains('bsbi-controls')) {
                element.classList.add('bsbi-controls');
            }
        }

        for(let element of document.querySelectorAll('.dropdown-focused')) {
            element.classList.remove('dropdown-focused');
        }
    }

    /**
     * If the controller currently allows a dynamic survey change to happen (triggered by GPS) then return true
     *
     * @returns {boolean}
     * @protected
     */
    _allowGPSTriggeredSurveyChanges() {
        return false;
    }
}
