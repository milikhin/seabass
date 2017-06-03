var gulp = require('gulp');
var merge = require('merge-stream');

module.exports = function() {
    var copy = gulp.src([
            'src/bower_components/requirejs/require.js',
            'src/js/require-config.js'
        ])
        .pipe(gulp.dest('./tmp/js'));

    return merge(copy);
};