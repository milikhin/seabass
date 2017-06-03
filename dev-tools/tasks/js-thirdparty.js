var shell = require('gulp-shell');
var prettydiffPath = 'node_modules/prettydiff';
var ambiancePath = 'src/thirdparty/non-amd/ambiance/js';
var otherModulesPath = 'src/thirdparty/non-amd/etc';
var jsBeautifyPath = 'src/bower_components/js-beautify/js/lib';

var ambianceModules = [
    'fast-buttons.js',
    'core.js',
    'buttons.js',
    'dialogs.js',
    'page.js',
    'pagestacks.js',
    'tabs.js',
    'tab.js'
];

var prettyDiffModules = [
    'api/dom.js',
    'lib/safeSort.js',
    'lib/csspretty.js',
    'lib/csvpretty.js',
    'lib/diffview.js',
    'lib/jspretty.js',
    'lib/markuppretty.js',
    'prettydiff.js'
];

var otherModules = [
    // 'coffeelint.js',
    'csslint.js',
    'js-yaml.js',
    'jshint.js',
    'jsonlint.js'
];

var jsBeautifyModules = [
    'beautify.js',
    'beautify-css.js',
    'beautify-html.js'
];

var cmdSrcString = '';
ambianceModules.forEach(function(fileName) {
    cmdSrcString += ` ${ambiancePath}/${fileName}`;
});

prettyDiffModules.forEach(function(fileName) {
    cmdSrcString += ` ${prettydiffPath}/${fileName}`;
});

otherModules.forEach(function(fileName) {
    cmdSrcString += ` ${otherModulesPath}/${fileName}`;
});

jsBeautifyModules.forEach(function(fileName) {
    cmdSrcString += ` ${jsBeautifyPath}/${fileName}`;
});

console.log(`./node_modules/.bin/uglifyjs ${cmdSrcString} -o tmp/js/non-amd.js`);

module.exports = shell.task([
    `./node_modules/.bin/uglifyjs ${cmdSrcString} -o tmp/js/non-amd.js`
]);