var gulp = require('gulp');
var shell = require('gulp-shell');
var merge = require('merge-stream');


module.exports = shell.task([
    './node_modules/.bin/r.js -o ./build-config.js'
]);