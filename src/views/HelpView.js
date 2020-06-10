// Help page

import {Page} from "./Page";
//import htmlContent from "../templates/helpPage.html";

export class HelpView extends Page {

    /**
     * @abstract
     * @type {string}
     */
    htmlContent = 'Placeholder html help text in HelpView.js';

    body() {
        // at this point the entire content of #body should be safe to replace

        const bodyEl = document.getElementById('body');
        bodyEl.innerHTML = `${this.htmlContent}<p>Version VERSION</p>`;
    }
}
