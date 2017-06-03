"use strict";
//node_modules/.bin/nwbuild -o release -p linux64 --flavor=normal ./www

let gulp = require('gulp');
let shell = require('gulp-shell');

let daemon = require('./dev-tools/tasks/daemon');
let cssBuild = require('./dev-tools/tasks/css-build');
let cssCopy = require('./dev-tools/tasks/css-copy');

let jsBuild = require('./dev-tools/tasks/js-build');
let jsBuildPro = require('./dev-tools/tasks/js-build-production');
let jsBuildNonAmd = require('./dev-tools/tasks/js-thirdparty');
let jsCopy = require('./dev-tools/tasks/js-copy');
let jsPre = require('./dev-tools/tasks/js-prebuild');

let copyOnly = require('./dev-tools/tasks/copy-only');
let deploy = require('./dev-tools/tasks/deploy');

/* Compile JS/CSS, copy them to /dist directory */
gulp.task('js-prebuild', jsPre);
gulp.task('js-non-amd', jsBuildNonAmd);
gulp.task('js-build', ['js-prebuild', 'js-non-amd'], jsBuild);
gulp.task('js-build-production', ['js-prebuild', 'js-non-amd'], jsBuildPro);
gulp.task('js', ['js-build'], jsCopy);
gulp.task('js-production', ['js-build-production'], jsCopy);
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

gulp.task('build-dev', ['js', 'css', 'assets']);
gulp.task('build', ['js-production', 'css', 'assets']);