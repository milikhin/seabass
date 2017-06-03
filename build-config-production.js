({
    generateSourceMaps: false,
    preserveLicenseComments: false,
    optimize: "none",
    baseUrl: "src/",
    name: "app/index",
    throwWhen: {
        //If there is an error calling the minifier for some JavaScript,
        //instead of just skipping that file throw an error.
        optimize: true
    },
    out: "tmp/js/index.src.js",
    paths: {
        "inspire-tree": "bower_components/inspire-tree/dist/inspire-tree.min",
        "inspire-dom": "thirdparty/amd/inspire-tree-dom.min",
        "lodash": "bower_components/lodash/dist/lodash.min",
        "alertify": "bower_components/alertifyjs/dist/js/alertify",
        "co": "thirdparty/amd/co.min",
        "md5": "bower_components/js-md5/js/md5.min",
        "json": "bower_components/requirejs-plugins/src/json",
        "text": "bower_components/requirejs-plugins/lib/text",
        "clipboard": "bower_components/clipboard/dist/clipboard.min",
        "htmlhint": "thirdparty/amd/htmlhint",
        "Sortable": "bower_components/Sortable/Sortable.min"
    },
    stubModules: ['json'],
    packages: [{
        name: "app",
        location: "js"
    }, {
        name: "cm",
        location: "bower_components/CodeMirror",
        main: "lib/codemirror"
    }, {
        name: "prettydiff",
        location: "../node_modules/prettydiff",
        main: "prettydiff"
    }]
});