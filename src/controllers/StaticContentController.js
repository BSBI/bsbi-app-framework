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

        this.app.currentControllerHandle = this.handle;
        this.view.display();
    }
}
