define([
    "inspire",
    "app/settings",
    "app/app-event",
    "co",
    '../settings'
], function(InspireTree, settings, AppEvent, co, SettingsController) {
    "use strict";

    class FileTree {
        constructor(rootElemSelector, fileManager) {
            if (!rootElemSelector) {
                throw new Error("RootElem selector for the tree is missing");
            }
            if (!fileManager) {
                throw new Error("FileManager instance for the tree is missing");
            }
            let self = this;

            this._rootSelector = rootElemSelector;
            this.fileManager = fileManager;
            if (this.fileManager.isLoaded()) {
                this._init();
            } else {
                AppEvent.on('fsready', function() {
                    self._init();
                });
            }

            AppEvent.on('tree-reload', function(evt) {
                self._reloadTree();
                self._updateTreeHint();
            });

            AppEvent.on('tree-unset-root', function(evt) {
                self.fileManager.unsetRoot();
                self._reloadTree();
                self._updateTreeHint();
            });
        }

        closeMobile() {
            location.hash = "";
        }

        _updateTreeHeader() {
            let rootUrl = this.fileManager.getRootURL();
            // console.log(rootUrl);
            document.getElementById('aside__header__path__tooltip').innerHTML = rootUrl.split('/').join('<wbr/>/');
        }
      
        _updateTreeHint() {
            var getTreeData = this._getData();
            getTreeData.then(function(fileInfo) {
                if (fileInfo.length) {
                    SettingsController.hideByQuery('.tree-helper__empty');
                }
            });
        }

        _reloadTree() {
            let self = this;
            let expandedNodes = this.tree.expanded();

            co(function*() {
                yield self.tree.reload();
                expandRecursively(self.tree);
                self._updateTreeHeader();
                self._updateTreeHint();
            });

            function expandRecursively(rootNode) {
                expandedNodes.forEach(function(node) {
                    try {
                        let childNodes = rootNode.getChildren ? rootNode.getChildren() : rootNode.nodes();
                        childNodes.forEach(function(childNode) {
                            if (childNode.id == node.id && childNode.entry.isDirectory) {
                                childNode.expand().then(function() {
                                    expandRecursively(childNode);
                                });
                            }
                        });
                    } catch (err) {
                        console.error(err);
                    }
                });
            }
        }

        _init() {
            this.tree = this._render();
            this._updateTreeHeader();
            this._updateTreeHint();
            this.tree.on('node.click', function(event, node) {
                AppEvent.dispatch('tree__node-click', {
                    node: node
                });
            });
        }

        _render(rootElemSelector) {
            this._getData().then(function(fileInfo) {
                if (fileInfo.length) {
                    AppEvent.dispatch('tree__update__has-data');
                }
            });

            return new InspireTree({
                'target': this._rootSelector,
                'data': this._getData.bind(this),
                'selection': {
                    'allow': function() {
                        return false;
                    }
                },
                contextMenu: this._getContextMenu()
            });
        }

        _getData(node) {
            var self = this;
            return co(function*() {
                var navEnabled = yield settings.get('navEnabled');
                // console.log(navEnabled);
                var data = yield self.fileManager.getFiles(node ? node.entry : null, navEnabled);
                var d = data.sort(function(a, b) {
                    if (a.children && !b.children) {
                        return -1;
                    }

                    if (!a.children && b.children) {
                        return 1;
                    }
                    return (a.text < b.text ? -1 : (a.text > b.text ? 1 : 0));
                });
                return d;
            });
        }

        _getContextMenu() {
            return [{
                text: 'Create file...',
                handler: function(event, node, closer) {
                    AppEvent.dispatch('tree__node-create', {
                        node: node
                    });
                    closer(node);
                }
            }, {
                text: 'Rename/move...',
                handler: function(event, node, closer) {
                    AppEvent.dispatch('tree__node-rename', {
                        node: node
                    });
                    closer(node);
                }

            }, {
                text: 'Delete',
                handler: function(event, node, closer) {
                    AppEvent.dispatch('tree__node-delete', {
                        node: node
                    });
                    closer(node);
                }
            }];
        }
    }

    return FileTree;
});