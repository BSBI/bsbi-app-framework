import {PartyError} from "../utils/exceptions/PartyError";
import {escapeHTML} from "../utils/escapeHTML";

export class Party {
    /**
     * @typedef RawParty
     * @type {array}
     * @property {string} 0 - surname
     * @property {string} 0 - firstName
     * @property {string} 0 - orgName
     * @property {string} 0 - type code
     * @property {string} 0 - prefix
     * @property {string} 0 - suffix
     * @property {string} 0 - disambiguation
     */

    /**
     *
     * @type {Object.<string, RawParty>}
     */
    static rawParties;

    static TYPE_PERSON = 'p';
    static TYPE_ORGANISATION = 'u';
    static TYPE_UNKNOWN = '?';

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

    static setParties(parties) {
        Party.rawParties = parties;
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
