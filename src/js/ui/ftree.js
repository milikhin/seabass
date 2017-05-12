define([
    "inspire-tree",
    "inspire-dom",
    "app/settings",
    "app/app-event",
    "co",
    '../settings',
    './context-menu'
], function(InspireTree, InspireTreeDom, settings, AppEvent, co, SettingsController, Menu) {
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
                } else {
                    SettingsController._initFileTreeSettings();
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
            let treeInfo = this._render();
            this.tree = treeInfo.tree;
            this.treeRenderer = treeInfo.renderer;
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

            let tree = new InspireTree({
                'data': this._getData.bind(this),
                'selection': {
                    'allow': function() {
                        return false;
                    }
                }
            });

            let treeRenderer = new InspireTreeDom(tree, {
                'target': this._rootSelector
            });

            let menu = new Menu('.tree-context-menu');
            let self = this;
            tree.on('node.contextmenu', function(event, node) {
                event.preventDefault();
                event.preventTreeDefault(); // Cancels default listener
                menu.show(event, self._getContextMenuHandler.bind(self, node));
            });

            return {
                tree: tree,
                renderer: treeRenderer
            };
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

        _getContextMenuHandler(node, target) {
            switch (target.dataset.menuAction) {
                case "create":
                    {
                        AppEvent.dispatch('tree__node-create', {
                            node: node
                        });
                        break;
                    }
                case "rename":
                    {
                        AppEvent.dispatch('tree__node-rename', {
                            node: node
                        });
                        break;
                    }
                case "delete":
                    {
                        AppEvent.dispatch('tree__node-delete', {
                            node: node
                        });
                        break;
                    }
            }

        }
    }

    return FileTree;
});