/**
 * Yield execution
 * (implemented as scheduler.yield if available otherwise setTimeout(0) )
 * @type {{(): Promise<void>}}
 */
export function schedulerYield () {
    // Use scheduler.yield if it exists:
    if ('scheduler' in globalThis && 'yield' in scheduler) {
        return scheduler.yield();
    }

    // Fall back to setTimeout:
    return new Promise(resolve => {
        setTimeout(resolve, 0);
    });
}

// can't use this, as out-of-context calls result in 'Illegal invocation' errors

// export const schedulerYield = ('scheduler' in globalThis && 'yield' in scheduler) ?
//     scheduler.yield
//     :
//     () => new Promise(resolve => {
//         setTimeout(resolve, 0);
//     });

