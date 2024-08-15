export class TaxonError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, TaxonError); // see https://v8.dev/docs/stack-trace-api
    }
}