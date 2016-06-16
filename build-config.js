({
	generateSourceMaps: true,
	preserveLicenseComments: false,
	optimize: "none",
	normalizeDirDefines: "skip",
	baseUrl: "src/",
	name: "app/index",
	out: "tmp/js/index.js",
	paths: {
		"ace": "bower_components/ace/lib/ace",
		"inspire": "bower_components/inspire-tree/dist/inspire-tree-bundled.min",
		"co": "js/co.min",
		"md5": "bower_components/js-md5/js/md5.min"
	},
  packages: [{
    name: "app",
    location: "js"
  }]
})
