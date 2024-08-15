export class NotFoundError extends Error {
    constructor (message) {
        super(message);

        Error.captureStackTrace?.(this, NotFoundError); // see https://v8.dev/docs/stack-trace-api
    }
}