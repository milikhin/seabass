var gulp = require('gulp');
var merge = require('merge-stream');

module.exports = function () {
	var index = gulp.src(['tmp/js/**/*'])
		.pipe(gulp.dest('./www/js/'));

	var beauty = gulp.src(['src/bower_components/js-beautify/js/lib/**/*'])
			.pipe(gulp.dest('./www/beautify/'));

	return merge(index, beauty);
};
