var shell = require('gulp-shell');

module.exports = shell.task([
    // './node_modules/.bin/r.js -o cssIn=src/bower_components/r5m-cms/css/all.css out=tmp/engine.css',
    './node_modules/.bin/r.js -o cssIn=src/css/index.css out=tmp/css/index.css'
]);