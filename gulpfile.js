"use strict";

let gulp = require('gulp');
let shell = require('gulp-shell');

var jsBuilder = require('./dev-tools/tasks/js-build');
var daemon = require('./dev-tools/tasks/daemon');

var cssCopy = require('./dev-tools/tasks/css-copy');
var cssBuild = require('./dev-tools/tasks/css-build');
var jsBuild = require('./dev-tools/tasks/js-build');
var jsCopy = require('./dev-tools/tasks/js-copy');

var copyOnly = require('./dev-tools/tasks/copy-only');

/* Compile JS/CSS, copy them to /dist directory */
gulp.task('js-build', jsBuild);
gulp.task('js', ['js-build'], jsCopy);
gulp.task('css-build', cssBuild);
gulp.task('css', ['css-build'], cssCopy);

gulp.task('assets', copyOnly());

// If some files are missing, remove this task from default task list
gulp.task('rm-dist', shell.task([
    'rm -rf ./www/*'
]));


gulp.task('daemon', [ 'js', 'css', 'assets'], daemon());
gulp.task('default', ['daemon']);


// gulp.task('deploy', ghDeploy(options));
// gulp.task('install', install(options));
// gulp.task('sitemap', sitemap('./dist'));

// var htmlBuilder = require('./src/tasks/html-build');
// var ghDeploy = require('./src/tasks/deploy');
// var install = require('./src/tasks/install');
// var daemon = require('./src/tasks/daemon');
// var sitemap = require('./src/tasks/sitemap');
// gulp.task('html', htmlBuilder(options));
