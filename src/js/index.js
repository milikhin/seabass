define([
    'app/app-event',
    'app/dialog',
    'app/ui/index',
    'app/file-controller/manager',
    './settings'
], function(AppEvent, Dialog, AppUi, FileManager, SettingsController) {
    "use strict";
	
    class Application {
        constructor() {
            this.fileManager = new FileManager();
            this.ui = new AppUi({
                fileManager: this.fileManager
            });
            SettingsController.init();
        }
    }

    return Application;
});