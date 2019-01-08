const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const getDirName = require("path").dirname;

/**
 * Utility function to create files and folders
 * @param {string} str Content
 * @param {string} str Path
 * @param {requestCallback} cb
 */

module.exports = function (path, contents, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) return cb(err);
        fs.writeFile(path, contents, cb);
    });
}
