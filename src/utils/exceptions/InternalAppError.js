/**
 *
 */
export class InternalAppError extends Error {
    constructor(...args) {
        super(...args);

        Error.captureStackTrace?.(this, InternalAppError); // see https://v8.dev/docs/stack-trace-api
    }
}