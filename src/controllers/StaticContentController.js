// StaticContentController

import {AppController} from './AppController';
/**
 * @typedef {import('bsbi-app-framework-view').Page} Page
 */

export class StaticContentController extends AppController {
    /**
     * @type {string}
     */
    route;

    /**
     *
     * @param {Page} view
     * @param {string} route
     */
    constructor (view, route) {
        super();

        this.view = view;
        this.route = route;

        this.handle = AppController.nextHandle;
    }

    routeHandler(context, subcontext, rhs, queryParameters) {
        // console.log("reached route handler for StaticContentController.js");

        this.app.currentControllerHandle = this.handle;
        this.view.display();
    }
}
