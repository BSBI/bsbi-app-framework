import {PartyError} from "../utils/exceptions/PartyError";
import {escapeHTML} from "../utils/escapeHTML";

export class Party {
    /**
     * @typedef RawParty
     * @type {object}
     *
     * @property {string} 0 - name string
     * @property {array} 1 - dates (normally blank)
     * @property {string} 2 - surname
     * @property {string} 3 - forenames
     * @property {string} 4 - orgName
     * @property {string} 5 - initials
     * @property {string} 6 - id
     * @property {string} 7 - linked user id
     * @property {array} 8 - roles
     *
     * // these are not implemented
     * @property {string} [9] - type code
     * @property {string} [10] - prefix
     * @property {string} [11] - suffix
     * @property {string} [12] - disambiguation
     */

    static NAME_INDEX = 0;
    static SURNAME_INDEX = 2;
    static FORENAMES_INDEX = 3;
    static ORGNAME_INDEX = 4;
    static INITIALS_INDEX = 5;
    static ID_INDEX = 6;
    static USERID_INDEX = 7;
    static ROLES_INDEX = 8;

    /**
     * Generic party list, not tied to a particular user id
     *
     * @type {Array.<RawParty>}
     */
    static _baseParties = [];

    /**
     * Current party working set, combining base set with per-user extras
     *
     * @type {Array.<RawParty>}
     */
    static rawParties = [];

    /**
     *
     * @type {string|null}
     */
    static loadedUserId = null;

    static TYPE_PERSON = 'p';
    static TYPE_ORGANISATION = 'u';
    static TYPE_UNKNOWN = '?';

    static USER_PARTIES_URL = '/';

    /**
     * @type {string}
     */
    id;

    /**
     *
     * @type {string}
     */
    name = '';

    /**
     *
     * @type {string}
     */
    firstName = '';

    /**
     *
     * @type {string}
     */
    surnameName = '';

    /**
     *
     * @type {string}
     */
    orgName = '';

    /**
     *
     * @type {string}
     */
    type = '';

    /**
     *
     * @type {string}
     */
    prefix = '';

    /**
     *
     * @type {string}
     */
    suffix = '';

    /**
     *
     * @type {string}
     */
    disambiguation = '';

    // static setParties(parties) {
    //     Party.rawParties = parties;
    // }

    /**
     *
     * @param {Array.<RawParty>} parties
     * @param {string} sourceUrl
     */
    static initialiseParties(parties, sourceUrl) {
        Party._baseParties = parties;
        //Party.rawParties = [...Party._baseParties, ...parties];
        Party.rawParties = Party._baseParties;

        if ((parties.stamp + (3600 * 24 * 7)) < (Date.now() / 1000)) {
            console.log(`Party list may be stale (stamp is ${parties.stamp}), prompting re-cache.`);
            navigator?.serviceWorker?.ready?.then?.((registration) => {
                registration.active.postMessage(
                    {
                        action: 'recache',
                        url: sourceUrl
                    }
                );
            });
        }
    }

    /**
     *
     * @param {string} userId
     * @returns {Promise}
     */
    static addUserParties(userId) {
        // where parties are the newly-loaded extra set
        //Party.rawParties = [...Party._baseParties, ...parties];

        return Promise.resolve();
    }

    /**
     *
     * @param {string} id
     * @returns {Party}
     * @throws {PartyError}
     */
    static fromId (id) {
        if (!Party.rawParties) {
            throw new PartyError(`Party.fromId() called before list has been initialized.`);
        }

        if (!Party.rawParties.hasOwnProperty(id)) {
            throw new PartyError(`Party id '${id}' not found.`);
        }

        const raw = Party.rawParties[id];

        const party = new Party;

        party.id = id;
        party.surname = raw[0] || '';
        party.firstName = raw[1] || '';
        party.orgName = raw[2] || '';
        party.type = raw[3];
        party.prefix = raw[4] || '';
        party.suffix = raw[5] || '';
        party.disambiguation = raw[6] || '';
        // @todo need to set party.name

        return party;
    }

    /**
     *
     * @returns {string}
     */
    formattedHTML() {

        return this.type === Party.TYPE_PERSON ?
            escapeHTML(`${this.firstName} ${this.surnameName}`)
            :
            escapeHTML(this.orgName);

        // if (Taxon.showVernacular) {
        //     if (vernacularMatched) {
        //         return (acceptedTaxon) ?
        //             `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>` +
        //             ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
        //             :
        //             `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>`
        //             ;
        //     } else {
        //         return (acceptedTaxon) ?
        //             `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''
        //             } = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
        //             :
        //             `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''}`
        //             ;
        //     }
        // } else {
        //     return (acceptedTaxon) ?
        //         `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>` +
        //         ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
        //         :
        //         `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>`
        //         ;
        // }
    }
}
