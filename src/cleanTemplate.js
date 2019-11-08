const createUuid = require("./createUuid");
const writeFile = require("./writeFile");


/**
 * Remove any extractable styles from the template file and convert prefixed class references to use uuid
 * @param {string} str Content
 * @param {string} str Path
 * @param {object} obj Params object
 */

module.exports = function(content, path, params) {
    const els = content.match(
        /<style[\' '\S]*?extract[\s\S]*?>([\s\S]*?)<\/style>/g
    );

    if (els) {
        [].forEach.call(els, function(el, i) {
            const re = new RegExp(
                '(class=.*)([ "])(' + params.prefix + '.*?)([" ])'
            );

            const uuid = el.match(/<style.*?prefix="([^"]*)/)
                ? el.match(/<style.*?prefix="([^"]*)/)[1]
                : createUuid(path, params.readable);

            content = content.replace(
                /<style[\' '\S]*?extract[\s\S]*?>([\s\S]*?)<\/style>/g,
                ""
            );

            function replacePrefix() {
                if (content.match(re) && content.match(re).length > 3) {
                    content = content.replace(re, function(m) {
                        let cls = m.match(re)[3];
                        cls = cls.replace(params.prefix, "");
                        return m.replace(
                            re,
                            "$1" + "$2" + uuid + "_" + cls + "$4"
                        );
                    });
                    replacePrefix();
                }
            }

            replacePrefix();

        });
    }

    return content;
};
