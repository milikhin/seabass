var gulp = require('gulp');
var merge = require('merge-stream');

module.exports = function() {
    var haks = gulp.src(['src/hak/**/*'])
        .pipe(gulp.dest('src/bower_components/'));

    var copy = gulp.src([
            'src/bower_components/requirejs/require.js',
            'src/js/require-config.js'
        ])
        .pipe(gulp.dest('./tmp/js'));

    return merge(haks, copy);
}