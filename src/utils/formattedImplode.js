/**
 *
 * @param {string} separator
 * @param {string} finalSeparator
 * @param {Array.<string>} list
 * @returns {string}
 */
export function formattedImplode(separator, finalSeparator, list) {
    if (list.length > 2) {
        const last = list.pop();
        return `${list.join(separator + ' ')} ${finalSeparator} ${last}`;
    } else {
        return list.join(` ${finalSeparator} `);
    }
}