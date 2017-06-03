var gulp = require('gulp');
var merge = require('merge-stream');

module.exports = function() {
    var index = gulp.src(['tmp/js/**/*'])
        .pipe(gulp.dest('./www/js/'));

    return merge(index);
};