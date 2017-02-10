define([
    'app/app-event',
    'app/dialog',
    'app/ui/index',
    'app/file-controller/manager'
], function(AppEvent, Dialog, AppUi, FileManager) {
    "use strict";

    class Application {
        constructor() {
            this.fileManager = new FileManager();
            this.ui = new AppUi({
                fileManager: this.fileManager
            });

            console.log('App UI initialized');
            console.log(performance.now() / 1000);
        }
    }


    return Application;
});