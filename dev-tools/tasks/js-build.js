var gulp = require('gulp');
var shell = require('gulp-shell');
var merge = require('merge-stream');


module.exports = function () {
	return gulp.src([
			'src/bower_components/requirejs/require.js',
			'src/js/require-config.js'
		])
		.pipe(shell([
			'./node_modules/.bin/r.js -o ./build-config.js'
		]))
		.pipe(gulp.dest('./tmp/js'));

};
