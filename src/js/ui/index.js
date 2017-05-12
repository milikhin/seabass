define([
    'app/app-event',
    'clipboard',
    'co',
    'app/ui/ftree',
    'app/ui/buttons',
    'app/utils/index',
    'app/tab-controller/index',
    'app/settings',
    'app/ui/tabs',
    'app/dialog'
], function(AppEvent, Clipboard, co, FileTree, getEditorButtons, utils, TabController, settings, TabsUi, dialog) {
    "use strict";

    class AppUi {
        constructor(options) {
            this.fileManager = options.fileManager;
            this._initUbuntuUi();
            this._addHeaderButtonsHak();
            this._registerUiEventHandlers();
            this._registerAppEventHandlers();
            this.fileTree = new FileTree('.tree', this.fileManager);
            this.tabsUi = new TabsUi(this.fileManager);
            new Clipboard('.clipboard-btn');
        }

        _initUbuntuUi() {
            this.ui = new UbuntuUI();
            this.ui.init();
            console.log('Ubuntu UI initialized');
        }

        _getEditorButtons() {
            let buttons = getEditorButtons();
            return buttons.sort(function(a, b) {
                return a - b;
            });
        }

        _addHeaderButtonsHak() {
            let self = this;
            this._addEditorButtons();
            AppEvent.on('editor-activated', function() {
                self._addEditorButtons();
            });

            document.body.addEventListener('click', function(evt) {
                // Workaround to catch page change event & add editor buttons to Header when page changed;
                let headerInterval = setInterval(function() {
                    let headerElem = document.querySelector('.header [data-role="tabtitle"]');
                    if (~headerElem.innerHTML.toLowerCase().indexOf('editor')) {
                        AppEvent.dispatch("editor-activated");
                        clearInterval(headerInterval);
                    }
                }, 100);
            });
        }

        _addEditorButtons() {
            let headerElem = document.querySelector('.header [data-role="tabtitle"]');
            if (headerElem.querySelector('.header__tab__button-pane')) {
                return;
            }


            let headerButtonPaneElem = document.createElement('div');
            let buttonPaneHTML = "";
            headerButtonPaneElem.className = "header__tab__button-pane";

            this._getEditorButtons().forEach(function(buttonDescription) {
                if (buttonDescription.doNotShow) {
                    return;
                }
                buttonDescription.addons = buttonDescription.addons || "";

                buttonPaneHTML += `<button
					${buttonDescription.addons}
					data-action="${buttonDescription.action}"
					class="app-action header__tab__button-pane__button tooltip tooltip-bottom ${buttonDescription.className}">
					<i class="material-icons">${buttonDescription.iconClass}</i>
					<span class="tooltip__text">${buttonDescription.text}</span>
				</button>`;
            });
            buttonPaneHTML += `<div class="header__tab__action-container tablet-only">
                <form action="#">
                    <input class="header__tab__action-container__input" type="text" placeholder="path/to/file"/>
                    <button class="header__tab__action-container__submit tooltip tooltip-bottom" type="submit">
                        <i class="material-icons">insert_drive_file</i>
                        <span class="tooltip__text">Open file (create if not exists)</span>
                    </button>
                </form>
            </div>`;
            headerButtonPaneElem.innerHTML = buttonPaneHTML;
            headerElem.appendChild(headerButtonPaneElem);

            // Chrome OS doesn't allow to write inline event hadnlers;
            headerButtonPaneElem.querySelector("form").onsubmit = function() {
                return false;
            };
        }

        _focusOnInput() {
            let inputElem = document.querySelector('.header__tab__action-container input');
            if (inputElem) {
                inputElem.focus();
            }
        }

        _handleShortcuts(evt) {
            let evtObject = evt.detail;
            if (evtObject.ctrlKey) {
                switch (String.fromCharCode(evtObject.keyCode).toLowerCase()) {
                    case 't':
                        {
                            this.toggleFileTree();
                            break;
                        }

                    case 'o':
                    case 'e':
                        {
                            this._focusOnInput();
                            break;
                        }
                }
            }
        }

        _handleTreeNodeClick(evt) {
            let self = this;
            let nodeId = evt.detail.node.id;
            let treeNode = evt.detail.node;
            let fileEntry = treeNode.entry;

            return co(function*() {
                let navEnabled = yield settings.get('navEnabled');
                if (fileEntry.isDirectory) {
                    if (navEnabled) {
                        self.fileManager.setRoot(evt.detail.node.entry);
                        AppEvent.dispatch('tree-reload');
                    }
                    treeNode.toggleCollapse();
                    return;
                }

                self.tabsUi._openFileByTreeNode(treeNode);
                // close tree
                self.fileTree.closeMobile();
            }).catch(function(err) {
                console.error(err);
            });
        }

        _registerAppEventHandlers() {
            let self = this;
            AppEvent.on('tree__node-click', this._handleTreeNodeClick.bind(this));
            AppEvent.on('tree__toggle', this.toggleFileTree.bind(this));
            AppEvent.on('window-osk__toggle', this.toggleOSK.bind(this));
            AppEvent.on('keydown', this._handleShortcuts.bind(this));
            AppEvent.on('body-resize', function() {
                TabController.converge();
            });
            AppEvent.on('editor-beautify', function(evt) {
                TabController.getCurrent().beautify();
            });
            AppEvent.on('editor-save', function(evt) {
                TabController.getCurrent().save();
            });
            AppEvent.on('editor-redo', function(evt) {
                TabController.getCurrent().redo();
            });
            AppEvent.on('editor-state-changed', function(evt) {
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
            });
            AppEvent.on('editor-undo', function(evt) {
                TabController.getCurrent().undo();
            });


            AppEvent.on('tree__node-create', function(evt) {
                let nodeId = evt.detail.node.id;
                let fileEntry = evt.detail.node.entry;
                let defaultName = fileEntry.isDirectory ? (fileEntry.fullPath + "/") : fileEntry.fullPath;
                let createFile = function(options) {
                    if (options.buttonIndex === 1) {
                        self.tabsUi.openFileByName(options.input1);
                    }
                };

                dialog.prompt({
                    title: "Create file",
                    description: "Create new file or directory",
                    default: defaultName,
                    callback: createFile,
                    buttons: ['Ok', 'Cancel']
                });
            });

            AppEvent.on('tree__node-rename', function(evt) {
                let nodeId = evt.detail.node.id;
                let fileEntry = evt.detail.node.entry;
                let defaultName = fileEntry.fullPath;
                let moveFile = function(options) {
                    if (options.buttonIndex === 1) {
                        co(function*() {
                            yield self.fileManager.rename(fileEntry, options.input1);
                            AppEvent.dispatch('tree-reload');
                            AppEvent.dispatch('tab-close', {
                                fileEntry: fileEntry
                            });
                            self.tabsUi.openFileByName(options.input1);
                        }).catch(function(err) {
                            console.error(err);
                        });
                    }
                };

                dialog.prompt({
                    title: "Rename file",
                    description: `Rename ${fileEntry.fullPath}`,
                    default: defaultName,
                    callback: moveFile,
                    buttons: ['Ok', 'Cancel']
                });
            });

            AppEvent.on('tree__node-delete', function(evt) {
                let nodeId = evt.detail.node.id;
                let fileEntry = evt.detail.node.entry;

                let deleteFile = function(buttonIndex) {
                    if (buttonIndex === 1) {
                        co(function*() {
                            yield self.fileManager.delete(fileEntry);
                            AppEvent.dispatch('tree-reload');
                            AppEvent.dispatch('tab-close', {
                                fileEntry: fileEntry
                            });
                        }).catch(function(err) {
                            console.error(err);
                        });
                    }
                };

                dialog.confirm({
                    title: "Delete file",
                    description: `Delete ${fileEntry.fullPath}?`,
                    callback: deleteFile
                });
            });
        }

        _registerUiEventHandlers() {
            window.addEventListener('resize', function() {
                AppEvent.dispatch("body-resize");
            });

            document.body.addEventListener('submit', function(evt) {
                // console.log('FORM SUBMIT');
                AppEvent.dispatch("form-submit", {
                    formElem: evt.target
                });
                return false;
            });

            document.onkeydown = function(evt) {
                AppEvent.dispatch("keydown", evt);
            };

            document.body.addEventListener('click', function(evt) {
                try {
                    let target = evt.target.closest('.app-action');
                    if (!target || target.disabled) {                      	
                        return false;
                    }
                    let action = target.dataset.action;
                    console.log('Action:', action);
                    if (action) {
                        AppEvent.dispatch(action, {
                            target: target
                        });
                    }

                    if (target.dataset.preventDefault) {
                        evt.preventDefault();
                    }
                } catch (err) {
                    console.error(err);
                }

            });
        }

        toggleFileTree() {
            if (document.body.clientWidth < 750) {
                location.hash = !~location.hash.indexOf('file-tree') ? 'file-tree' : '';
            } else {
                var isHidden = document.getElementById('main').classList.contains('aside-hidden');
                document.getElementById('main').classList[isHidden ? "remove" : "add"]('aside-hidden');
            }
        }

        toggleOSK() {
            document.body.classList[document.body.classList.contains('osk-mode') ? "remove" : "add"]('osk-mode');
            AppEvent.dispatch('body-resize');
        };
    }

    return AppUi;
});