import {EventHarness} from "./EventHarness";

export class Db extends EventHarness {
    /**
     * @type {IDBDatabase}
     */
    db;

    constructor() {
        super();
    }

    registerIndex(objectStore, indexName, keyPath, options) {

    }

    registerObjectStore(name, keyPath) {

    }

    /**
     *
     * @param {string} name
     * @param {number} version
     */
    open(name, version) {
        return new Promise((resolve, reject) => {
            const openRequest = window.indexedDB.open(name, version);

            // Register two event handlers to act on the database being opened successfully, or not
            openRequest.onerror = () => {
                reject(new Error(`Error opening db: ${name}`));
            };

            openRequest.onsuccess = (event) => {
                this.db = openRequest.result;

                resolve(this.db);
            };

            // This event handles the event whereby a new version of the database needs to be created
            // Either one has not been created before, or a new version number has been submitted via the
            // window.indexedDB.open line above
            // it is only implemented in recent browsers
            openRequest.onupgradeneeded = (event) => {
                this.db = event.target.result;

                this.db.addEventListener('error', () => {
                    throw new Error(`Error opening db '${name}' in onupgradeneeded.`);
                });

                // Create an objectStore for this database
                const objectStore = this.db.createObjectStore('toDoList', {keyPath: 'taskTitle'});

                // Define what data items the objectStore will contain
                objectStore.createIndex('hours', 'hours', {unique: false});
                objectStore.createIndex('minutes', 'minutes', {unique: false});
                objectStore.createIndex('day', 'day', {unique: false});
                objectStore.createIndex('month', 'month', {unique: false});
                objectStore.createIndex('year', 'year', {unique: false});

                objectStore.createIndex('notified', 'notified', {unique: false});

                note.appendChild(createListItem('Object store created.'));
            };
        });
    }
}