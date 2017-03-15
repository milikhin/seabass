(function(global) {
    "use strict";
    global.ace = undefined;
    document.addEventListener(global.seabass.initEvent, function() {
        require(['app/index'], function(App) {
            (new App());
        });
    });
})(window);