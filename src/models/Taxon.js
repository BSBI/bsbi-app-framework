import {TaxonError} from "../utils/exceptions/TaxonError";
import {escapeHTML} from "../utils/escapeHTML";

export class Taxon {
    /**
     * @typedef RawTaxon
     * @type {array}
     * @property {string} 0 - nameString
     * @property {(string|number)} 1 - canonical
     * @property {string} 2 hybridCanonical, raw entry is 0/undefined if canonical == hybridCanonical
     * @property {(string|number)} 3 acceptedEntityId or 0/undefined if name is accepted
     * @property {string} 4 qualifier
     * @property {string} 5 authority
     * @property {string} 6 vernacular
     * @property {string} 7 vernacularRoot
     * @property {number} 8 used
     * @property {number} 9 sortOrder
     * @property {Array.<string>} 10 parentIds
     * @property {number} [11] notForEntry (1 === not for entry)
     * @property {string} [12] GB national status
     * @property {string} [13] IE national status
     * @property {string} [14] CI national status
     * @property {string} [15] GB rare/scarce conservation status
     * @property {string} [16] IE rare/scarce conservation status
     *
     * // properties beyond this point are not part of the source file
     * @property {{}} [17] Presence in grid-squares (top-level object is keyed by grid-ref)
     * @property {{}} [18] Presence on rpr
     */

    static GR_PRESENCE_KEY = 17;
    static RPR_KEY = 18;

    /**
     *
     * @type {Object.<string, RawTaxon>}
     */
    static rawTaxa;

    /**
     * @type {string}
     */
    id;

    /**
     *
     * @type {string}
     */
    nameString = '';

    /**
     *
     * @type {string}
     */
    canonical = '';

    /**
     *
     * @type {string}
     */
    hybridCanonical = '';

    /**
     *
     * @type {string}
     */
    acceptedEntityId = '';

    /**
     *
     * @type {string}
     */
    qualifier = '';

    /**
     *
     * @type {string}
     */
    authority = '';

    /**
     *
     * @type {string}
     */
    vernacular = '';

    /**
     *
     * @type {string}
     */
    vernacularRoot = '';

    /**
     * if set then the vernacular name should not be allowed for data entry
     *
     * @type {boolean}
     */
    badVernacular = false;

    /**
     * @type {boolean}
     */
    used;

    /**
     * @type {number}
     */
    sortOrder;

    /**
     *
     * @type {Array.<string>}
     */
    parentIds = [];

    /**
     *
     * @type {{CI: null|string, GB: null|string, IE: null|string}}
     */
    nationalStatus = {
        GB : null,
        IE : null,
        CI : null
    }

    /**
     *
     * @type {{GB: null|string, IE: null|string}}
     */
    rareScarceStatus = {
        GB : null,
        IE : null
    }

    /**
     *
     * @type {{number, (string|true)}}
     */
    rprStatus = {}

    /**
     *
     * @type {{current : number, previous : number, [year] : number}|null}
     */
    occurrenceCoverage = null;

    /**
     *
     * @type {boolean}
     */
    static showVernacular = true;

    static setTaxa(taxa) {
        Taxon.rawTaxa = taxa;
    }

    static initialiseTaxa(taxa, sourceUrl) {
        Taxon.rawTaxa = taxa;

        if ((taxa.stamp + (3600 * 24 * 7)) < (Date.now() / 1000)) {
            console.log(`Taxon list may be stale (stamp is ${taxa.stamp}), prompting re-cache.`);
            navigator.serviceWorker.ready.then((registration) => {
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
     * @param {string} id
     * @returns {Taxon}
     * @throws {TaxonError}
     */
    static fromId (id) {
        if (!Taxon.rawTaxa) {
            throw new TaxonError(`Taxon.fromId() called before taxon list has been initialized.`);
        }

        if (!Taxon.rawTaxa.hasOwnProperty(id)) {
            throw new TaxonError(`Taxon id '${id}' not found.`);
        }

        const raw = Taxon.rawTaxa[id];

        const taxon = new Taxon;

        taxon.id = id;
        taxon.nameString = raw[0];
        taxon.canonical = raw[1] || raw[0]; // raw entry is blank if namesString == canonical
        taxon.hybridCanonical = raw[2] || taxon.canonical; // raw entry is blank if canonical == hybridCanonical
        taxon.acceptedEntityId = raw[3] || id;
        taxon.qualifier = raw[4] || '';
        taxon.authority = raw[5] || '';
        taxon.vernacular = raw[6] || '';
        taxon.vernacularRoot = raw[7] || '';
        taxon.used = !!raw[8];
        taxon.sortOrder = raw[9];
        taxon.parentIds = raw[10];
        taxon.badVernacular = !!raw[11];

        taxon.nationalStatus = {
            GB: raw[12] || null,
            IE: raw[13] || null,
            CI: raw[14] || null
        };

        taxon.rareScarceStatus = {
            GB: raw[15] || null,
            IE: raw[16] || null
        };

        taxon.rprStatus = raw[Taxon.RPR_KEY] || null;

        taxon.occurrenceCoverage = raw[Taxon.GR_PRESENCE_KEY] || null;

        return taxon;
    }

    /**
     *
     * @param {boolean} vernacularMatched
     * @returns {string}
     */
    formattedHTML(vernacularMatched) {
        let acceptedTaxon;
        if (this.id !== this.acceptedEntityId) {
            acceptedTaxon = Taxon.fromId(this.acceptedEntityId);
        }

        if (Taxon.showVernacular) {
            if (vernacularMatched) {
                return (acceptedTaxon) ?
                    `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>` +
                    ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
                    :
                    `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>`
                    ;
            } else {
                return (acceptedTaxon) ?
                    `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''
                    } = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
                    :
                    `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''}`
                    ;
            }
        } else {
            return (acceptedTaxon) ?
                `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>` +
                ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>`
                :
                `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>`
                ;
        }
    }
}
