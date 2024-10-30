export class PurgeInconsistencyError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, PurgeInconsistencyError); // see https://v8.dev/docs/stack-trace-api
    }
}
