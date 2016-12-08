var gulp = require('gulp');
var shell = require('gulp-shell');
var merge = require('merge-stream');
module.exports = function() {
    return gulp.src(['tmp/css/**/*']).pipe(gulp.dest('./www/css/'));
};
