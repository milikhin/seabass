var gulp = require('gulp');
var merge = require('merge-stream');
module.exports = function () {
	var index = gulp.src(['tmp/js/**/*'])
		.pipe(gulp.dest('./www/js/'));

	var req = gulp.src(['src/bower_components/ace/lib/ace/worker/worker.js'])
		.pipe(gulp.dest('./www/js/ace/worker/'));

	var main = gulp.src(['src/bower_components/ace/lib/ace/**/*'])
		.pipe(gulp.dest('./www/js/ace/main/'));

	var beauty = gulp.src(['src/bower_components/js-beautify/js/lib/**/*'])
			.pipe(gulp.dest('./www/beautify/'));

	return merge(index, req, main, beauty);
};
