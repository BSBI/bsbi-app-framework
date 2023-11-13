import {TaxonError} from "../utils/exceptions/TaxonError";
import {escapeHTML} from "../utils/escapeHTML";

export const SORT_ORDER_GENUS = 28;
export const SORT_ORDER_SPECIES = 56;
export const SORT_ORDER_CULTIVAR = 120;

const AGG_QUALIFIER = 'agg.';
const SL_QUALIFIER = 's.l.';

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
     * @property {Array.<string>} 10 parentIds id(s) of *immediate* parent(s)
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
     * @property {{}} [19] Presence in county (top-level object is keyed by vc code string, including prefix)
     */

    static GR_PRESENCE_KEY = 17;
    static RPR_KEY = 18;
    static VC_PRESENCE_KEY = 19;

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
     * if rated, then the string is 'scarce' or 'rare'
     *
     * @type {{GB: null|('rare'|'scarce'), IE: null|('rare'|'scarce')}}
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
     * keyed by grid-square string
     * @type {Object<string, {current : number, previous : number, [year] : number, [status] : string}>|null}
     */
    occurrenceCoverage = null;

    /**
     * keyed by vc code string
     * @type {Object<string, {current : number, previous : number, [year] : number}>|null}
     */
    vcPresence = null;

    /**
     *
     * @type {boolean}
     */
    static showVernacular = true;

    /**
     *
     * @param {Object.<string, RawTaxon>} taxa
     */
    static setTaxa(taxa) {
        Taxon.rawTaxa = taxa;
    }

    /**
     *
     * @param {Object.<string, RawTaxon>} taxa
     * @param {string} sourceUrl
     */
    static initialiseTaxa(taxa, sourceUrl) {
        Taxon.rawTaxa = taxa;

        if ((taxa.stamp + (3600 * 24 * 7)) < (Date.now() / 1000)) {
            console.log(`Taxon list may be stale (stamp is ${taxa.stamp}), prompting re-cache.`);
            navigator?.serviceWorker?.ready.then((registration) => {
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
            //console.error(`Taxon id '${id}' not found.`);
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

        taxon.vcPresence = raw[Taxon.VC_PRESENCE_KEY] || null;

        return taxon;
    }

    /**
     *
     * @param {number} maxSortOrder lowest matching rank to accept
     * @param {number} minSortOrder highest rank to allow (return null if fails)
     * @param {boolean} excludeAggregates ignore aggregate parents
     * @param {boolean} excludeCultivars if set and current taxon is a cultivar then return null
     * @return {Taxon|null}
     */
    seekRankedAncestor(maxSortOrder, minSortOrder = SORT_ORDER_SPECIES, excludeAggregates = true, excludeCultivars = true) {
        const parentStack = [this];
        do {
            let taxon = parentStack.pop();

            if (taxon.sortOrder <= maxSortOrder && taxon.sortOrder >= minSortOrder) {
                // potentially have an acceptable taxon already

                if (!excludeAggregates || (taxon.qualifier !== AGG_QUALIFIER && taxon.qualifier !== SL_QUALIFIER)) {
                    return taxon;
                }
            }

            if (taxon.sortOrder < minSortOrder || (excludeCultivars && taxon.sortOrder === SORT_ORDER_CULTIVAR)) {
                continue;
            }

            if (this.parentIds?.length) {
                for (let parentId of this.parentIds) {
                    try {
                        parentStack[parentStack.length] = Taxon.fromId(parentId);
                    } catch {

                    }
                }
            }
        } while (parentStack.length);

        return null;
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
