import {PartyError} from "../utils/exceptions/PartyError";
import {escapeHTML} from "../utils/escapeHTML";

export const PARTY_NAME_INDEX = 0;
export const PARTY_SURNAME_INDEX = 2;
export const PARTY_FORENAMES_INDEX = 3;
export const PARTY_ORGNAME_INDEX = 4;
export const PARTY_INITIALS_INDEX = 5;
export const PARTY_ID_INDEX = 6;
export const PARTY_USERID_INDEX = 7;
export const PARTY_ROLES_INDEX = 8;

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

    // static NAME_INDEX = PARTY_NAME_INDEX;
    // static SURNAME_INDEX = PARTY_SURNAME_INDEX;
    // static FORENAMES_INDEX = PARTY_FORENAMES_INDEX;
    // static ORGNAME_INDEX = PARTY_ORGNAME_INDEX;
    // static INITIALS_INDEX = PARTY_INITIALS_INDEX;
    // static ID_INDEX = PARTY_ID_INDEX;
    // static USERID_INDEX = PARTY_USERID_INDEX;
    // static ROLES_INDEX = PARTY_ROLES_INDEX;

    /**
     * Generic party list, not tied to a particular user id
     *
     * @type {Array.<RawParty>}
     */
    static _baseParties = [];

    /**
     * Current party working set, combining the base set with per-user extras
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
     * @param {number} parties.stamp
     * @param {string|null} sourceUrl
     */
    static initialiseParties(parties, sourceUrl = null) {
        Party._baseParties = parties;
        //Party.rawParties = [...Party._baseParties, ...parties];
        Party.rawParties = Party._baseParties;

        if (sourceUrl) {
            Party.testPartyRecache(parties.stamp, sourceUrl);
        }
    }

    static clearUserParties() {
        Party.rawParties = Party._baseParties;
    }

    /**
     *
     * @param {number|null} stamp
     * @param {string} sourceUrl
     * @param {number} interval
     * @todo default interval for re-cache should be shorter on desktops than on mobile
     */
    static testPartyRecache(stamp, sourceUrl, interval = (3600 * 24 * 7)) {
        if (navigator.onLine && stamp && (stamp + interval) < (Date.now() / 1000)) {
            console.log(`Party list may be stale (stamp is ${stamp}), prompting re-cache from ${sourceUrl}.`);
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

    static additionalPartiesUrl = 'https://database.bsbi.org/js/appuserpartylist.mjs.php?user=';

    /**
     *
     * @param {string} userId
     * @returns {Promise}
     */
    static addUserParties(userId) {
        // where parties are the newly loaded extra set

        const url = `${Party.additionalPartiesUrl}${userId}`;

        return import(url).then((imported) => {
            const newParties = imported?.default;

            if (newParties?.length) {
                /**
                 *
                 * @type {Map<string, array<RawParty>>}
                 */
                const unique = new Map;

                // base parties must come first as these will be tied to registered DDb users
                // dynamically added in-app names must come last
                for (let party of [...Party._baseParties, ...newParties]) {
                    /**
                     * either the packed entity id, or a string-serialised forename-surname-orgname
                     * @type {string}
                     */
                    let key = (party?.[PARTY_ID_INDEX]) || JSON.stringify([party?.[PARTY_FORENAMES_INDEX], party?.[PARTY_SURNAME_INDEX], party?.[PARTY_ORGNAME_INDEX]]);

                    if (!unique.has(key)) {
                        unique.set(key, party);
                    }
                }

                Party.rawParties = Array.from(unique.values());
            }
            Party.testPartyRecache(newParties?.stamp, url);

            return newParties;
        }, (reason) => {
            console.error({"Failed to import user parties" : reason});
            return null;
        });
    }

    // /**
    //  * @todo this does not work as rawParties are not keyed by ID (as newly added parities in app won't have an entity id)
    //  *
    //  * @param {string} id
    //  * @returns {Party}
    //  * @throws {PartyError}
    //  */
    // static fromId (id) {
    //     if (!Party.rawParties) {
    //         throw new PartyError(`Party.fromId() called before list has been initialized.`);
    //     }
    //
    //     if (!Party.rawParties.hasOwnProperty(id)) {
    //         throw new PartyError(`Party id '${id}' not found.`);
    //     }
    //
    //     const raw = Party.rawParties[id];
    //
    //     const party = new Party;
    //
    //     party.id = id;
    //     party.surname = raw[0] || '';
    //     party.firstName = raw[1] || '';
    //     party.orgName = raw[2] || '';
    //     party.type = raw[3];
    //     party.prefix = raw[4] || '';
    //     party.suffix = raw[5] || '';
    //     party.disambiguation = raw[6] || '';
    //     // @todo need to set party.name
    //
    //     return party;
    // }

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
