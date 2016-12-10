var gulp = require('gulp');

module.exports = function() {
    return gulp.src(['tmp/css/**/*']).pipe(gulp.dest('./www/css/'));
};