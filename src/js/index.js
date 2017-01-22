define([
    './file-controller/manager',
    './tab-controller/index',
    './settings',
    'alertify',
    'app/app-event',
    'app/utils/index',
    'co',
    'inspire',
    'clipboard',
    'app/dropbox-auth-app'
], function(FileManager, TabController, SettingsController, alertify, AppEvent, util, co, InspireTree, Clipboard) {
    "use strict";

    function Application() {}

    // function is called onDeviceReady
    Application.prototype.initialize = function() {
        var self = this;
        if (navigator && navigator.notification && navigator.notification.alert && navigator.notification.confirm) {
            window.alert = navigator.notification.alert;
            window.confirm = navigator.notification.confirm;
        }

        document.body.addEventListener('app-event', function(evt) {
            self.receivedEvent(evt.detail.type, evt);
        });

        this.fileManager = new FileManager();
        this.UI = new UbuntuUI();
        this.onDeviceReady();

        window.addEventListener('resize', function() {
            TabController.converge();
        });

        new Clipboard('.clipboard-btn');
    };

    Application.prototype._addEditorButtons = function() {
        var headerElem = document.querySelector('.header [data-role="tabtitle"]');
        if (headerElem.querySelector('.header__tab__button-pane')) {
            return;
        }

        headerElem.innerHTML += `
			<div class="header__tab__button-pane">
				<!--<button
					data-action="editor-save"
					class="app-action header__tab__button-pane__button tooltip tooltip-bottom">
					<i class="material-icons">save</i>
					<span class="tooltip__text">Save<br/><code>Ctrl + S</code></span>
				</button>-->
				<button
					data-action="filetree-toggle"
					class="app-action header__tab__button-pane__button header__tab__button-pane__button-osk tooltip tooltip-bottom">
					<i class="material-icons">list</i>
					<span class="tooltip__text">Toggle file tree<br/><code>Ctrl + T</code></span>
				</button>
				<button
					data-action="window-osk"
					class="app-action header__tab__button-pane__button header__tab__button-pane__button-osk tooltip tooltip-bottom">
					<i class="material-icons">keyboard</i>
					<span class="tooltip__text">Toggle OSK mode</span>
				</button>
				<button
					data-action="editor-beautify"
					class="app-action header__tab__button-pane__button header__tab__button-pane__button-beautify tooltip tooltip-bottom"
					disabled>
					<i class="material-icons">spellcheck</i>
					<span class="tooltip__text">Beautify<br/><code>Ctrl + Alt + B</code></span>
				</button>
				<button
					data-action="editor-redo"
					class="app-action header__tab__button-pane__button header__tab__button-pane__button-redo tooltip tooltip-bottom"
					disabled>
					<i class="material-icons">redo</i>
					<span class="tooltip__text">Redo<br/><code>Ctrl + Y</code></span>
				</button>
				<button
					data-action="editor-undo"
					class="app-action header__tab__button-pane__button header__tab__button-pane__button-undo tooltip tooltip-bottom"
					disabled>
					<i class="material-icons">undo</i>
					<span class="tooltip__text">Undo<br/><code>Ctrl + Z</code></span>
				</button>
        <!-- <button
					data-action="file-open"
					class="app-action header__tab__button-pane__button header__tab__button-pane__button-undo tooltip tooltip-bottom">
					<i class="material-icons">plus</i>
					<span class="tooltip__text">Open file<br/><code>Ctrl + E</code></span>
				</button> -->
        <div class="header__tab__action-container tablet-only">
          <form action="#">
            <input class="header__tab__action-container__input" type="text" placeholder="path/to/file"/>
            <button class="header__tab__action-container__submit tooltip tooltip-bottom" type="submit">
              <i class="material-icons">insert_drive_file</i>
              <span class="tooltip__text">Open file (create if not exists)</span>
            </button>
          </form>
        </div>
			</div>`;

        headerElem.querySelector("form").onsubmit = function() {
            return false;
        };
    };

    Application.prototype._hakEditorHeaderUI = function() {
        var self = this;
        var editorPageUI = this.UI.page("main");
        editorPageUI.onactivated(function(evt) {
            self._addEditorButtons();
        });

        // this._addEditorButtons();
    };

    Application.prototype.onDeviceReady = function() {
        var self = this;
        this._hakEditorHeaderUI();

        this.receivedEvent('deviceready');

        document.body.addEventListener('submit', function(evt) {
            if (!(evt && evt.target && evt.target.closest('.header__tab__action-container') && evt.target.querySelector('input'))) {
                console.log('Warning: input not found');
                return;
            }

            var inputElem = evt.target.querySelector('input');
            var fileName = inputElem.value;
            if (fileName) {
                co(function*() {
                    var fileDescriptionPromise = self.fileManager.open(fileName);

                    Promise.all([
                        fileDescriptionPromise,
                        util.showPreloader()
                    ]).then(util.hidePreloader, util.hidePreloader);

                    var fileDescription = yield fileDescriptionPromise;
                    if (fileDescription && fileDescription.fileEntry) {
                        var tab = TabController.get(fileName.split('/')[fileName.split('/').length - 1], fileDescription.fileEntry, fileDescription.fileContent);
                        tab.activate();
                    }

                    self.reloadTree();
                    inputElem.value = "";
                }).catch(function(err) {
                    console.error(err);
                });
            }

            return false;
        });

        function KeyPress(e) {
            var evtobj = window.event ? event : e;
            // console.log(evtobj.ctrlKey, evtobj.altKey, String.fromCharCode(event.keyCode).toLowerCase());

            if (evtobj.ctrlKey) {
                switch (String.fromCharCode(event.keyCode).toLowerCase()) {
                    case 't':
                        {
                            self.toggleFileTree();
                            break;
                        }

                    case 'o':
                    case 'e':
                        {
                            self.focusOnInput();
                            break;
                        }
                }
            }
        }

        document.onkeydown = KeyPress;

        document.body.addEventListener('click', function(evt) {
            // console.log('target', evt.target, evt.target.dataset);

            // Workaround to catch page change event & add editor buttons to Header when page changed;
            if (evt.target.dataset && evt.target.dataset.role == "tabitem" && evt.target.dataset.page == "main") {
                var headerInterval = setInterval(function() {
                    var headerElem = document.querySelector('.header [data-role="tabtitle"]');
                    // wait while header is updated, add buttons & set their states;
                    // 	console.log('innerHTML', headerElem.innerHTML.toLowerCase());
                    if (~headerElem.innerHTML.toLowerCase().indexOf('editor')) {
                        self._addEditorButtons();
                        var currentTab = TabController.getCurrent();
                        if (currentTab) {
                            currentTab.onEditorChange();
                        }
                        clearInterval(headerInterval);
                    }
                }, 100);
            }

            var target = evt.target.closest('.app-action');
            if (!target || target.disabled) {
                return false;
            }

            var action = target.dataset.action;
            // 			console.log('you clicked on ', action);
            // 			console.log('current tab is', TabController.getCurrent());
            if (action) {
                self.receivedEvent(action, {
                    detail: {
                        target: target
                    }
                });
            }
        });
    };

    Application.prototype.focusOnInput = function() {
        var inputElem = document.querySelector('.header__tab__action-container input');
        if (inputElem) {
            inputElem.focus();
        }
    };

    Application.prototype.toggleFileOpener = function() {
        console.log('toggle file input');
    };

    Application.prototype.toggleFileTree = function() {
        if (document.body.clientWidth < 600) {
            location.hash = !~location.hash.indexOf('file-tree') ? 'file-tree' : '';
        } else {
            var isHidden = document.getElementById('main').classList.contains('aside-hidden');
            document.getElementById('main').classList[isHidden ? "remove" : "add"]('aside-hidden');
        }
    };

    Application.prototype.toggleOSK = function() {
        document.body.classList[document.body.classList.contains('osk-mode') ? "remove" : "add"]('osk-mode');
        AppEvent.dispatch({
            type: 'body-resize'
        });
    };

    Application.prototype.reloadTree = function() {
        var self = this;
        var expandedNodes = self.tree.expanded();
        co(function*() {
            yield self.tree.reload();
            expandRecursively(self.tree);
            self._updateTreeHeader();
        });

        function expandRecursively(rootNode) {
            expandedNodes.forEach(function(node) {
                try {
                    var childNodes = rootNode.getChildren ? rootNode.getChildren() : rootNode.nodes();
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
    };

    Application.prototype._updateTreeHeader = function() {
        var rootUrl = this.fileManager.getRootURL();
        document.getElementById('aside__header__path__tooltip').innerHTML = rootUrl.split('/').join('<wbr/>/');
    };

    Application.prototype._updateTreeHint = function() {
        var getTreeData = this._getTreeData();
        getTreeData.then(function(fileInfo) {
            if (fileInfo.length) {
                SettingsController.hideByQuery('.tree-helper__empty');
            }
        });
    };

    Application.prototype.receivedEvent = function(id, evt) {
        var self = this;
        // console.log('received event', id, evt);
        switch (id) {
            case 'deviceready':
                {
                    this.UI.init();
                    this._addEditorButtons();
                    SettingsController.init();
                    document.getElementById('file-tree-navigation').addEventListener('change', function() {
                        setTimeout(function() {
                            self.tree.reload();
                        }, 100);
                    });
                    break;
                }
            case 'editor-beautify':
                {
                    TabController.getCurrent().beautify();
                    break;
                }
            case 'editor-save':
                {
                    TabController.getCurrent().save();
                    break;
                }
            case 'editor-redo':
                {
                    TabController.getCurrent().redo();
                    break;
                }
            case 'editor-state-changed':
                {
                    var undoElem = document.querySelector('.header__tab__button-pane__button-undo');
                    var redoElem = document.querySelector('.header__tab__button-pane__button-redo');
                    var beautifyElem = document.querySelector('.header__tab__button-pane__button-beautify');

                    if (undoElem) {
                        undoElem.disabled = !evt.detail.hasUndo;
                    }
                    if (redoElem) {
                        redoElem.disabled = !evt.detail.hasRedo;
                    }
                    if (beautifyElem) {
                        beautifyElem.disabled = !evt.detail.hasBeautify;
                    }

                    break;
                }
            case 'editor-undo':
                {
                    TabController.getCurrent().undo();
                    break;
                }



            case 'file-save':
                {
                    co(function*() {
                        var fileContent = yield self.fileManager.writeFile(evt.detail.fileEntry, evt.detail.value);

                    }).catch(function(err) {
                        console.error(err);
                    });
                    break;

                }
            case 'filetree-toggle':
                {
                    self.toggleFileTree();
                    break;
                }
            case 'fsready':
                {
                    this.renderTree();
                    break;
                }
            case 'nav-enabled':
                {
                    // console.log('nav enabled!');
                    this._updateTreeHint();
                    break;
                }
            case 'tab-close':
                {
                    TabController.close(TabController.getByElem(evt.detail.target));
                    break;
                }
            case 'tree-node-rename':
                {
                    id = evt.detail.node.id;
                    var fileEntry = evt.detail.node.entry;
                    var moveFile = function(buttonIndex, fileName) {
                      	console.log(buttonIndex, fileName);
                        if (!buttonIndex || buttonIndex === 1) {
                            co(function*() {
                                yield self.fileManager.rename(fileEntry, fileName);
                                var tabToClose = TabController.getTabByFileEntry(fileEntry);
                                if (tabToClose) {
                                    TabController.close(tabToClose);
                                }
                                self.reloadTree();
                                self._updateTreeHint();
                            }).catch(function(err) {
                                console.error(err);
                            });
                        }
                    };

                    
                    if (!window.chrome) {
                        prompt(`Rename ${fileEntry.fullPath}`, moveFile, 'Rename file', ['Ok', 'Cancel'], fileEntry.fullPath);
                    } else {
                        alertify.defaultValue(fileEntry.fullPath).prompt(`Rename ${fileEntry.fullPath}`, function(val, evt) {
                          	evt.preventDefault();
                            moveFile(1, val);
                        }, function(evt) {
                          	evt.preventDefault();
                            moveFile(0);
                        });
                    }

                    break;
                }
            case 'tree-node-delete':
                {
                    id = evt.detail.node.id;
                    var fileEntry = evt.detail.node.entry;
                    var deleteFile = function(buttonIndex) {
                        if (!buttonIndex || buttonIndex === 1) {
                            co(function*() {
                                yield self.fileManager.delete(fileEntry);
                                var tabToClose = TabController.getTabByFileEntry(fileEntry);
                                if (tabToClose) {
                                    TabController.close(tabToClose);
                                }
                                self.reloadTree();
                                self._updateTreeHint();
                            }).catch(function(err) {
                                console.error(err);
                            });
                        }
                    };

                    if (!window.chrome) {
                        confirm(`Delete ${fileEntry.name} ?`, deleteFile, 'Delete file', ['Yes', 'Cancel']);
                    } else {
                        deleteFile();
                    }

                    break;
                }
            case 'tree-node-click':
                {
                    id = evt.detail.node.id;
                    var fileEntry = evt.detail.node.entry;
                    co(function*() {
                        var navEnabled = yield SettingsController.get('navEnabled');
                        if (fileEntry.isDirectory) {
                            if (navEnabled) {
                                self._updateTreeHint();
                                self._updateTreeHint();
                                self.fileManager.setRoot(evt.detail.node.entry);
                                self.reloadTree();
                                return;
                            }

                            evt.detail.node.toggleCollapse();
                            return;
                        }

                        var fileContentPromise = self.fileManager.getFileContent(fileEntry);
                        // show/hide preloader
                        Promise.all([
                            fileContentPromise,
                            util.showPreloader()
                        ]).then(util.hidePreloader, util.hidePreloader);

                        var content = yield fileContentPromise;
                        var tab = TabController.get(evt.detail.node.text, fileEntry, content);
                        tab.activate();

                        // close tree
                        location.hash = "";
                    }).catch(function(err) {
                        console.error(err);
                    });
                    break;
                }
            case 'tree-reload':
                {
                    self.reloadTree();
                    self._updateTreeHint();
                    break;
                }
            case 'tree-unset-root':
                {
                    self.fileManager.unsetRoot();
                    self.reloadTree();
                    self._updateTreeHint();
                    break;
                }
            case 'window-osk':
                {
                    self.toggleOSK();
                    break;node
                }
        }
    };

    Application.prototype.renderTree = function() {
        // Hide file tree tips if it is already set up;
        var getTreeData = this._getTreeData();
        getTreeData.then(function(fileInfo) {
            if (fileInfo.length) {
                SettingsController.hideByQuery('.tree-helper__empty');
            }
        });

        this.tree = new InspireTree({
            'target': '.tree',
            'data': this._getTreeData.bind(this),
            'selection': {
                'allow': function() {
                    return false;
                }
            },
            contextMenu: [{
                text: 'Rename...',
                handler: function(event, node, closer) {
                    AppEvent.dispatch({
                        type: 'tree-node-rename',
                        node: node
                    });
                    closer(node);
                }

            }, {
                text: 'Delete',
                handler: function(event, node, closer) {
                    AppEvent.dispatch({
                        type: 'tree-node-delete',
                        node: node
                    });
                    closer();
                }
            }]

        });
        this._updateTreeHeader();

        this.tree.on('node.click', function(event, node) {
            AppEvent.dispatch({
                type: 'tree-node-click',
                node: node
            });
        });
    };

    Application.prototype._getTreeData = function(node) {
        var self = this;
        return co(function*() {
            var navEnabled = yield SettingsController.get('navEnabled');
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
    };

    return Application;
});