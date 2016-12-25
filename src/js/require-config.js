require.config({
    baseUrl: "./",
    packages: [{
        name: "app",
        location: "js"
    }, {
        name: "ace",
        location: "js/ace"
    }, {
        name: "cm",
        location: "../bower_components/codemirror",
        main: "lib/codemirror"
    }]
});