var gulp = require('gulp');
var merge = require('merge-stream');

module.exports = function() {
    var index = gulp.src(['tmp/js/**/*'])
        .pipe(gulp.dest('./www/js/'));

    var beauty = gulp.src(['src/bower_components/js-beautify/js/lib/**/*'])
        .pipe(gulp.dest('./www/beautify/'));

    var prettydiff = gulp.src([
            'node_modules/prettydiff/prettydiff.js',
            'node_modules/prettydiff/api/dom.js',
            'node_modules/prettydiff/lib/safeSort.js',
            'node_modules/prettydiff/lib/diffview.js',
            'node_modules/prettydiff/lib/csspretty.js',
            'node_modules/prettydiff/lib/csvpretty.js',
            'node_modules/prettydiff/lib/markuppretty.js',
            'node_modules/prettydiff/lib/jspretty.js',
        ])
        .pipe(gulp.dest('./www/prettydiff/'));

    return merge(index, beauty, prettydiff);
};