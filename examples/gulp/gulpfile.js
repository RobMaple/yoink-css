var gulp = require("gulp");
var del = require("del");
var yoink = require("yoink-css");

function clean() {
    return del(["./dist/templates/"]);
}

function extractCss() {
    return gulp
        .src(["./templates/**/*"])
        .pipe(yoink({
            css_dest: './scss/style.scss',
            prefix : '--'
        }))
        .pipe(gulp.dest("./dist/templates/"));
}

function watchFiles() {
    gulp.watch("./templates/**/*", {ignoreInitial : false}, gulp.series(clean, extractCss));
}

gulp.task('extractCss');

exports.default = watchFiles;