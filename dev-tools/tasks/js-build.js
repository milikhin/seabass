var shell = require('gulp-shell');

module.exports = shell.task([
    `(cd src/bower_components/CodeMirror; npm i; npm run-script build;)
	./node_modules/.bin/r.js -o ./build-config.js`
]);