"use strict";

let gulp = require('gulp');
let shell = require('gulp-shell');

let daemon = require('./dev-tools/tasks/daemon');

let cssCopy = require('./dev-tools/tasks/css-copy');
let cssBuild = require('./dev-tools/tasks/css-build');
let jsBuild = require('./dev-tools/tasks/js-build');
let jsCopy = require('./dev-tools/tasks/js-copy');

let copyOnly = require('./dev-tools/tasks/copy-only');
let jsPre = require('./dev-tools/tasks/js-prebuild');
let deploy = require('./dev-tools/tasks/deploy');

/* Compile JS/CSS, copy them to /dist directory */
gulp.task('js-prebuild', jsPre);
gulp.task('js-build', ['js-prebuild'], jsBuild);
gulp.task('js', ['js-build'], jsCopy);
gulp.task('css-build', cssBuild);
gulp.task('css', ['css-build'], cssCopy);

gulp.task('assets', copyOnly());
gulp.task('deploy', deploy({
    packageJson: require('./package')
}));

// If some files are missing, remove this task from default task list
gulp.task('rm-dist', shell.task([
    'rm -rf ./www/*'
]));

gulp.task('daemon', ['js', 'css', 'assets'], daemon);
gulp.task('default', ['daemon']);

gulp.task('build', ['js', 'css', 'assets']);
