export class PartyError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, PartyError); // see https://v8.dev/docs/stack-trace-api
    }
}
