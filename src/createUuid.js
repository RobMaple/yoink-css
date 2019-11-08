/**
 * Create hash uuid from input
 * @param {string} str Input to hash
 * https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
 */

function createUuid(s, readable = false) {
    if (readable) {
        return "_" + s.replace(/[^a-zA-Z0-9-_]/g, '_');
    } else {
        let createUuid = 0,
            i,
            chr;
        if (s.length === 0) return createUuid;
        for (i = 0; i < s.length; i++) {
            chr = s.charCodeAt(i);
            createUuid = (createUuid << 5) - createUuid + chr;
            createUuid |= 0; // Convert to 32bit integer
        }
        const hash = createUuid & 0xfffffff;
        return "_" + hash;
    }
}

module.exports = createUuid;
