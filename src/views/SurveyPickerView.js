// Survey picker page

import {Page} from "./Page";

export class SurveyPickerView extends Page {

    content = '<p>Placeholder survey picker content.</p>';

    body() {
        // at this point the entire content of #body should be safe to replace

        const bodyEl = document.getElementById('body');
        bodyEl.innerHTML = this.content;
    }
}
