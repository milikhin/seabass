define([
    'app/utils/index',
    'app/tab-controller/index',
    'co',
    'app/app-event'
], function(utils, TabController, co, AppEvent) {
    "use strict";

    class UiTabs {
        constructor(fileManager) {
            this.fileManager = fileManager;

        }

        _closeTabByEvent(evt) {
            TabController.close(TabController.getByElem(evt.detail.target));
        }

        _registerTabEventHandlers() {
            let self = this;
            AppEvent.on('tab-close', this._closeTabByEvent.bind(this));
        }

        _openFileByTreeNode(treeNode) {
            let self = this;
            let fileEntry = treeNode.entry;

            return co(function*() {
                let fileContentPromise = self.fileManager.getFileContent(fileEntry);
                // show/hide preloader
                utils.withPreloader(fileContentPromise);
                let fileContent = yield fileContentPromise;
                let tab = TabController.get(treeNode.text, fileEntry, fileContent);
                tab.activate();
                return tab;
            });
        }
    }
    return UiTabs;
});