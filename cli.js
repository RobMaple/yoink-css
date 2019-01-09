#!/usr/bin/env node
const chokidar = require("chokidar");
const escapeRegex = require("escape-string-regexp");
const mkdirp = require("mkdirp");
const fs = require("fs-extra");
const getDirName = require("path").dirname;
const recursive = require("recursive-readdir");
const debounce = require("lodash").debounce;
const parseArgs = require("minimist");
const chalk = require("chalk");
const extractCss = require("./src/extractCss");
const cleanTemplate = require("./src/cleanTemplate");
const mergeStyles = require("./src/mergeStyles");

/* Get the process args / config file */
const args = parseArgs(process.argv);
let config = {};
try {
    config = require(process.cwd() + "/yoink.config")
}
catch {}

/* Assign params based on configuration method */
let params = {};

// The src folder to watch for changes
params.src = args.src || config.src || writeError(Error("Source not set")); 

// The output folder for 'cleaned' templates
params.dest = args.dest || config.dest || writeError(Error("Destination not set")); 

// The destination folder for the merged CSS
params.css_dest = args.css_dest || config.css_dest || writeError(Error("CSS Destination not set")); 

// The class prefix that will be replaced with a uuid
params.prefix = escapeRegex(args.prefix || config.prefix || "--"); 

if(args.watch || config.watch){
    /* Set chokidar to watch the src directory */
    const watcher = chokidar.watch(params.src, { ignoreInitial: true });

    watcher
        .on("add", processFile)
        .on("change", processFile)
        .on("ready", debounce(processAll, 300))
        .on("unlink", removeFromCache)
        .on("unlinkDir", removeFromCache)
        .on(
            "error",
            function() {
                writeError(Error("Yoink: An error occurred."));
            },
            300
        );
} else {
    processAll();
}

/**
 * Check if a file is processable then extract css, remove styles from template then merge styles to a single file
 * @param {string} str Path
 */

function processFile(path) {
    if (!fs.lstatSync(path).isDirectory()) {
        fs.readFile(path, function read(err, data) {
            if (err) {
                writeError(err);
            }
            if (!path.startsWith(".")) {
                extractCss(data.toString(), path, params);
                writeTemplateFile(
                    cleanTemplate(data.toString(), path, params),
                    path
                );
                countProcessed("processed");
            }
        });
    }
}

/**
 * Write a single template file to the output destination
 * @param {string} str Content
 * @param {string} str Path
 */
function writeTemplateFile(content, path) {
    writeFile(params.dest + path, content, function(err) {
        if (err) {
            writeError(err);
        }
    });
}

/**
 * Removes a folder from the cache folder if deleted from the src folder
 * @param {string} str Path
 */

function removeFromCache(path) {
    console.log(path);
    try {
        if (fs.existsSync("yoink-cache/" + path)) {
            fs.remove("yoink-cache/" + path, function() {
                mergeStyles(params.css_dest);
            });
        }
        if (fs.existsSync(params.dest + path)) {
            fs.remove(params.dest + path);
            countProcessed("removed:");
        }
    } catch {
        writeError(Error("Cache error"));
    }
}

/**
 * Process all files in the source folder.
 */
function processAll() {
    fs.remove("yoink-cache", function() {
        fs.remove(params.dest, function() {
            fs.readdirSync(params.src).forEach(path => {
                processFile(params.src + path);
            });
            recursive(params.src, [".DS_Store"], function(err, files) {
                files.forEach(function(path) {
                    if (!fs.lstatSync(path).isDirectory()) {
                        processFile(path);
                    }
                });
            });
        });
    });
}

/**
 * Small wrapper around fs.writeFile to craeat directory and catch errors
 * @param {string} str Path 
 * @param {string} str Contents 
 * @param {requestCallback} cb 
 */
function writeFile(path, contents, cb) {
    mkdirp(getDirName(path), function(err) {
        if (err) return cb(err);
        fs.writeFile(path, contents, cb);
    });
}

/**
 * Small utilty to write errrors to console
 * @param {string} str err 
 */
function writeError(err) {
    console.log(chalk.red("Yoink Error: ") + err.message || err);
    process.exit(1);
}


/* Define count vars */
let count = 0;
let countTimer = null;
/**
 * Count processed files to then output to console
 * @param {string} str Msg
 */
function countProcessed(msg) {
    count++;
    clearTimeout(countTimer);
    countTimer = setTimeout(() => {
        console.log(chalk.green("Yoink " + msg + " " + count + " file(s)"));
        count = 0;
    }, 500);
}
