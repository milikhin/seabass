var shell = require('gulp-shell');

module.exports = shell.task([
    `(cd src/bower_components/CodeMirror; npm i; npm run-script build;)
	./node_modules/.bin/r.js -o ./build-config-production.js
	./node_modules/.bin/uglifyjs tmp/js/index.src.js -o tmp/js/index.js; rm tmp/js/index.src.js;`
]);