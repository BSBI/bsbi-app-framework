// StaticContentController

import {AppController} from './AppController';
/**
 * @typedef {import('bsbi-app-framework-view').Page} Page
 */

export class StaticContentController extends AppController {
    /**
     * @type {Array<string>|null}
     */
    _routes = [];

    /**
     *
     * @param {?Page} [view]
     * @param {Array<string>|null} [route]
     */
    constructor (view = null, route = null) {
        super();

        if (view) {
            this.view = view;
            this.view.controller = this;
        }

        if (route) {
            this._routes = route;
        }

        this.handle = AppController.nextHandle;
    }

    /**
     * registers the default route from this.route
     * or alternatively is overridden in a child class
     *
     * @param {PatchedNavigo} router
     */
    registerRoute(router) {

        for (const route of this._routes) {
            router.on(
                route,
                this.routeHandler.bind(this),
                {
                    before: this.beforeRouteHandler ? this.beforeRouteHandler.bind(this) : null,
                    after: this.afterRouteHandler ? this.afterRouteHandler.bind(this) : null,
                    leave: this.leaveRouteHandler ? this.leaveRouteHandler.bind(this) : null,
                    already: this.alreadyRouteHandler ? this.alreadyRouteHandler.bind(this) : null
                }
            );
        }
    }

    routeHandler(context, subcontext, rhs, queryParameters) {
        // console.log("reached route handler for StaticContentController.js");
        this.app.saveRoute();

        this.app.currentControllerHandle = this.handle;
        this.view.display();
    }

    // noinspection JSUnusedGlobalSymbols
    backHandler() {
        // backHandler may still be attached to other inactive controllers
        // need to check that only the current one takes effect
        if (this.isCurrent()) {

            // check that previous page is within app (i.e. that someone hasn't bizarrely navigated from outside, straight to this page)
            if (this.app.routeHistory.length >= 2) {
                this.app.routeHistory.length--;
                console.log('using standard back navigation');

                window.history.back();
            } else {
                console.log(`navigating back to home page '${this.app.homeRoute}'`);

                if (this.app.routeHistory.length > 0) {
                    this.app.routeHistory.length--;
                } else {
                    console.error(`In static content controller back handler route history length was ${this.app.routeHistory.length} before back navigation.`)
                }

                // pause so that replace rather than push history state
                this.app.router.pause();
                this.app.router.navigate(this.app.homeRoute).resume();
                this.app.router.resolve();
            }
        }
    }
}
