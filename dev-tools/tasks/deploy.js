"use strict";

var gulp = require('gulp');
var ghPages = require('gulp-gh-pages');

function getRemoteUrl(options) {
	var remoteUrl = '';

	try {
		remoteUrl = options.packageJson.seabass.deployTo;
		if (remoteUrl === '') {
			throw new Error('"deployTo" git repository is not specified');
		}
	} catch (err) {
		throw new Error('Please specify "deployTo" field in package.json in order to use deploy command');
	}

	return remoteUrl;
}

module.exports = function (options) {
	return function () {
		return gulp.src('www/**/*')
			.pipe(ghPages({
				"remoteUrl": getRemoteUrl(options),
				"branch": options.packageJson.seabass.deployToBranch || "gh-pages"
			}));
	};
};
