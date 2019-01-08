const recursive = require("recursive-readdir");
const fs = require("fs-extra");
const writeFile = require("./writeFile");

module.exports = function(css_dest) {
    let stylesContent = "";

    recursive("yoink-cache", [".DS_Store"], function(err, files) {
        files.forEach(function(path) {
            const file = fs.readFileSync(path);
            stylesContent += file.toString();
        });
        writeFile(css_dest, stylesContent, function(err) {
            if (err) {
                throw new Error(err);
            }
        });
    });
};
