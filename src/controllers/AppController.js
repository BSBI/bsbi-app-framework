// AppController
// Abstract super-class for page controllers

/**
 * @typedef {import('bsbi-app-framework-view').Page} Page
 * @typedef {import('bsbi-app-framework-view').PatchedNavigo} PatchedNavigo
 */

export class AppController {

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

    static get nextHandle() {
        return AppController._handleIndex++;
    }

    /**
     * called from App.initialise() to trigger late-stage initialisation
     */
    initialise() {
        this.view.initialise();
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

        console.log({route : this.route});

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
}
