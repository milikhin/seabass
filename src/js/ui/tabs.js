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
            this._registerTabEventHandlers();
        }

        _closeTabByEvent(evt) {
            if (evt.detail.fileEntry) {
                let tabToClose = TabController.getTabByFileEntry(evt.detail.fileEntry);
                if (tabToClose) {
                    TabController.close(tabToClose);
                }
            } else if (evt.detail.target) {
                TabController.close(TabController.getByElem(evt.detail.target));
            }
        }

        _registerTabEventHandlers() {
            let self = this;
            AppEvent.on('tab-close', this._closeTabByEvent.bind(this));
            AppEvent.on('form-submit', function(evt) {
                let targetElem = evt.detail.formElem;
                if (!(targetElem && targetElem.closest('.header__tab__action-container') && targetElem.querySelector('input'))) {
                    return;
                }

                let inputElem = targetElem.querySelector('input');
                let fileName = inputElem.value;
                self.openFileByName(fileName).then(function() {
                    inputElem.value = "";
                });
            });
        }

        openFileByName(fileName) {
            let self = this;
            return co(function*() {
                if (fileName) {
                    let fileDescriptionPromise = self.fileManager.open(fileName);
                    utils.withPreloader(fileDescriptionPromise);
                    let fileDescription = yield fileDescriptionPromise;

                    if (fileDescription && fileDescription.fileEntry) {
                        var tab = TabController.get(fileName.split('/')[fileName.split('/').length - 1], fileDescription.fileEntry, fileDescription.fileContent);
                        TabController._activate(tab);
                    }

                    AppEvent.dispatch('tree-reload');
                }
            }).catch(function(err) {
                console.error(err);
            });
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
                TabController._activate(tab);
                return tab;
            });
        }
    }
    return UiTabs;
});