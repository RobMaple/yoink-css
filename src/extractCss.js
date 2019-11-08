const createUuid = require("./createUuid");
const writeFile = require("./writeFile");
const mergeStyles = require("./mergeStyles");

/**
 * Extract css from template files & replace prefixed class names with a uuid
 * @param {string} str Content
 * @param {string} str Path
 * @param {object} obj Params object
 */

function extractCss(content, path, params) {
    const els = content.match(
        /<style[\' '\S]*?extract[\s\S]*?>([\s\S]*?)<\/style>/g
    );

    if (els) {
        let content = "";

        [].forEach.call(els, function(el, i) {
            // Process children if we have them.
            const uuid = el.match(/<style.*?prefix="([^"]*)/)
                ? el.match(/<style.*?prefix="([^"]*)/)[1]
                : createUuid(path, params.readable);

            el = el.replace(/<\/?style[\S\s]*?>/g, "");

            if (el.length > 0) {
                let data = el;

                const re = new RegExp(
                    "(." + params.prefix + "(?:[^{ :,.>](?!.*;))+)",
                    "g"
                );

                data = data.replace(re, function(m) {
                    return m.replace(params.prefix, uuid + "_");
                });

                content = content + " " + data;
            }
        });

        writeCssToCache(content, path).then(() => mergeStyles(params.css_dest));
    }
}

/**
 * Write extracted css to cache folder
 * @param {string} str Content
 * @param {string} str Path
 */

function writeCssToCache(content, path) {
    return new Promise((resolve, reject) => {
        writeFile("yoink-cache/" + path, content, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

module.exports = extractCss;
