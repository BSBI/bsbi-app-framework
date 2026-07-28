import localforage from 'localforage';

/**
 * Store for image binaries, held separately from the structured records.
 *
 * Image files used to live inline in their `image.{id}` record, which meant that *any* read of an
 * image record pulled the whole photo into memory. The sync and purge passes both walk every image
 * key on start-up, so a user with a few hundred unsent photos dragged several hundred megabytes
 * through WebKit's IndexedDb layer on every session. That is the known trigger for the
 * 'Connection to Indexed Database server lost' failures, which take the whole database with them.
 *
 * Binaries therefore get their own IndexedDb *database* rather than merely their own object store.
 * That way a failure of the (large, churny) image database cannot destroy the taxon records, which
 * are the irreplaceable data — photos can at least be retaken, and once uploaded they are dropped
 * from local storage anyway.
 *
 * This class is also the intended seam for moving image binaries to the Origin Private File System:
 * only these four operations would need reimplementing.
 */
export class ImageFileStore {
    /**
     * @type {LocalForage|null}
     * @private
     */
    static _store = null;

    /**
     * Must be called wherever localforage is configured for the records store, in both the window
     * and the service worker.
     *
     * @param {string} forageName the records store name, which this is derived from
     */
    static configure(forageName) {
        ImageFileStore._store = localforage.createInstance({
            name: `${forageName}-imagefiles`,
            storeName: 'imagefiles',
        });
    }

    /**
     * @returns {LocalForage}
     * @private
     */
    static _getStore() {
        if (!ImageFileStore._store) {
            throw new Error('ImageFileStore.configure() must be called before the image file store is used.');
        }

        return ImageFileStore._store;
    }

    /**
     * @param {string} imageId
     * @param {File|Blob} file
     * @returns {Promise<File|Blob>}
     */
    static setFile(imageId, file) {
        return ImageFileStore._getStore().setItem(imageId, file);
    }

    /**
     * Resolves with null rather than rejecting when the file is absent, as a missing binary is an
     * expected state (images are dropped locally once acknowledged by the server).
     *
     * @param {string} imageId
     * @returns {Promise<File|Blob|null>}
     */
    static getFile(imageId) {
        return ImageFileStore._getStore().getItem(imageId)
            .then((file) => file || null, () => null);
    }

    /**
     * @param {string} imageId
     * @returns {Promise<void>}
     */
    static removeFile(imageId) {
        return ImageFileStore._getStore().removeItem(imageId)
            .catch(() => {
                // A binary that cannot be removed is litter rather than a failure, and must not be
                // allowed to fail a save or abort a purge.
            });
    }

    /**
     * @returns {Promise<Array<string>>}
     */
    static keys() {
        return ImageFileStore._getStore().keys();
    }
}
