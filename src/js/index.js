define([
    'app/app-event',
    'app/dialog',
    'app/ui/index'
], function(AppEvent, Dialog, AppUi) {
    "use strict";

    class Application {
        constructor() {
            window.addEventListener('resize', function() {
                AppEvent.dispatch("window-resize");
            });

            new AppUi();
            console.log('App UI initialized');
        }
    }


    return Application;
});