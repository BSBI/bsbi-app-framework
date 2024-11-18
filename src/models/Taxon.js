import {TaxonError} from "../utils/exceptions/TaxonError";
import {escapeHTML} from "../utils/escapeHTML";

export const SORT_ORDER_GENUS = 28;
export const SORT_ORDER_SPECIES = 56;
export const SORT_ORDER_CULTIVAR = 120;

const AGG_QUALIFIER = 'agg.';
const SL_QUALIFIER = 's.l.';

const INFO_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/><path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/></svg>';

export const RAW_TAXON_NAMESTRING = 0;
export const RAW_TAXON_CANONICAL = 1;
export const RAW_TAXON_HYBRID_CANONCIAL = 2;
export const RAW_TAXON_ACCEPTED_ENTITY_ID = 3;
export const RAW_TAXON_QUALIFIER = 4;
export const RAW_TAXON_AUTHORITY = 5;
export const RAW_TAXON_VERNACULAR = 6;
export const RAW_TAXON_VERNACULAR_ROOT = 7;
export const RAW_TAXON_USED = 8;
export const RAW_TAXON_SORT_ORDER = 9;
export const RAW_TAXON_PARENT_IDS = 10;
export const RAW_TAXON_VERNACULAR_NOT_FOR_ENTRY = 11;
export const RAW_TAXON_GB_NATIONAL_STATUS = 12;
export const RAW_TAXON_IE_NATIONAL_STATUS = 13;
export const RAW_TAXON_CI_NATIONAL_STATUS = 14;
export const RAW_TAXON_GB_RARE_SCARCE = 15;
export const RAW_TAXON_IE_RARE_SCARCE = 16;
export const RAW_TAXON_NYPH_RANKING = 17;
export const RAW_TAXON_BRC_CODE = 18;
export const RAW_TAXON_NOT_FOR_NEW_RECORDING = 19
export const RAW_TAXON_ATLAS_DOCS = 20;

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
     * @property {number} [11] vernacularNotForEntry (1 === not for entry)
     * @property {string} [12] GB national status
     * @property {string} [13] IE national status
     * @property {string} [14] CI national status
     * @property {string} [15] GB rare/scarce conservation status
     * @property {string} [16] IE rare/scarce conservation status
     * @property {number|null} [17] (optionally) NYPH percentile ranking or null
     * @property {string|null} [18] BRC code
     * @property {string|null} [19] Taxon not for new recording
     * @property {number} [20] documentation (Atlas captions etc.) [not used yet]
     *
     * // properties beyond this point are not part of the source file
     * @property {{}} [21] Presence in grid-squares (top-level object is keyed by grid-ref)
     * @property {{}} [22] Presence on rpr
     * @property {{}} [23] Presence in county (top-level object is keyed by vc code string, including prefix)
     */

    static PARENT_IDS_KEY = 10;

    static GR_PRESENCE_KEY = 21;
    static RPR_KEY = 22;
    static VC_PRESENCE_KEY = 23;

    /**
     *
     * @type {Object.<string, RawTaxon>}
     */
    static rawTaxa;

    /**
     *
     * @type {boolean}
     */
    static includeAtlasDocumentation = false;

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
     * @type {number|null}
     */
    nyphRanking = null;

    /**
     *
     * @type {boolean}
     */
    notForNewRecording = false;

    /**
     *
     * @type {string}
     */
    brcCode = '';

    /**
     *
     * @type {null|{description: string, trends: string, biogeog: string}}
     */
    documentation = null;

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

        if (navigator.onLine && (taxa.stamp + (3600 * 24 * 7)) < (Date.now() / 1000)) {
            console.log(`Taxon list may be stale (stamp is ${taxa.stamp}), prompting re-cache.`);
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

        // if (raw[0] === 'Poa annua') {
        //     console.log('got Poa annua');
        // }

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
        taxon.nyphRanking = raw[RAW_TAXON_NYPH_RANKING] || null;
        taxon.notForNewRecording = !!raw[RAW_TAXON_NOT_FOR_NEW_RECORDING];
        taxon.brcCode = raw[RAW_TAXON_BRC_CODE] || '';

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

            if (taxon.parentIds?.length) {
                for (let parentId of taxon.parentIds) {
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

        let infoLink = '';
        if (Taxon.includeAtlasDocumentation) {
            const preferredTaxon = acceptedTaxon || this;

            if (preferredTaxon?.documentation?.description) {
                infoLink = ` <a href="#" title="taxon description" data-taxon-info-link="${preferredTaxon.id}">${INFO_ICON_SVG}</a>`;
            }
        }

        if (Taxon.showVernacular) {
            if (vernacularMatched) {
                return (acceptedTaxon) ?
                    `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>` +
                    ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>${infoLink}`
                    :
                    `<q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q><wbr> <span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${infoLink}`
                    ;
            } else {
                return (acceptedTaxon) ?
                    `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>` : ''
                    } = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>${infoLink}`
                    :
                    `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${this.vernacular ? ` <wbr><q class="taxon-vernacular">${escapeHTML(this.vernacular)}</q>${infoLink}` : ''}`
                    ;
            }
        } else {
            return (acceptedTaxon) ?
                `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${this.authority}</span>` +
                ` = <span class="italictaxon">${acceptedTaxon.nameString}${acceptedTaxon.qualifier ? ` <span class="taxon-qualifier">${acceptedTaxon.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(acceptedTaxon.authority)}</span>${infoLink}`
                :
                `<span class="italictaxon">${this.nameString}${this.qualifier ? ` <span class="taxon-qualifier">${this.qualifier}</span>` : ''}</span> <span class="taxauthority">${escapeHTML(this.authority)}</span>${infoLink}`
                ;
        }
    }

    /**
     * @returns boolean
     */
    isAggregate() {
        return (this.qualifier === 's.l.' || this.qualifier === 'agg.');
    }
}
