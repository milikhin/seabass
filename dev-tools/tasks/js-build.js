var shell = require('gulp-shell');

module.exports = shell.task([
    './node_modules/.bin/r.js -o ./build-config.js'
]);