({
    generateSourceMaps: true,
    preserveLicenseComments: false,
    optimize: "none",
    normalizeDirDefines: "skip",
    baseUrl: "src/",
    name: "app/index",
    out: "tmp/js/index.js",
    paths: {
        "inspire-tree": "bower_components/inspire-tree/dist/inspire-tree.min",
      	"inspire-dom": "public/js/inspire-tree-dom.min",
        "lodash": "bower_components/lodash/dist/lodash.min",
        "alertify": "bower_components/alertifyjs/dist/js/alertify",
        "co": "js/co.min",
        "md5": "bower_components/js-md5/js/md5.min",
        "json": "bower_components/requirejs-plugins/src/json",
        "text": "bower_components/requirejs-plugins/lib/text",
        "clipboard": "bower_components/clipboard/dist/clipboard.min",
        "htmlhint": "public/js/htmlhint",
        "Sortable": "bower_components/Sortable/Sortable.min"
    },
    stubModules: ['json'],
    packages: [{
        name: "app",
        location: "js"
    }, {
        name: "cm",
        location: "bower_components/codemirror",
        main: "lib/codemirror"
    }, {
        name: "prettydiff",
        location: "../node_modules/prettydiff",
        main: "prettydiff"
    }]
});