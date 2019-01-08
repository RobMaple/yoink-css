const through2 = require('through2');
const extractCss = require('./src/extractCss');
const cleanTemplate = require('./src/cleanTemplate');
const PluginError = require('plugin-error');
const fs = require("fs-extra");

/**
 * Gulp / streams wrapper
 *
 * @param {object} params Yoink configuration
 * @returns {stream} Gulp stream
 */
function streamsHandler(params) {

    // Set the default prefix if one not set
    params.prefix = params.prefix || '--';

    // Clear the cache
    fs.removeSync("./yoink-cache");

    return through2.obj(function(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }

        if (file.isStream()) {
            return this.emit(
                "error",
                new PluginError("Yoink", "Streaming not supported")
            );
        }

        const contents = (file.contents || "").toString("utf8");
        const relativePath = file.path.replace(file.base, '');

        Promise.resolve()
        .then(() => extractCss(contents, relativePath, params))
        .then(() => cleanTemplate(contents, relativePath, params))
        .then((content) => {
            file.contents = Buffer.from(content);
            cb(null, file);
        })
        .catch(error => cb(new PluginError("Extract", error.message))); 
        
    });

}

module.exports = streamsHandler;

