define([
    'ace/ace',
    './file-controller/manager',
    './tab-controller/index',
    'co',
    'inspire'
], function(ace, FileManager, TabController, co, InspireTree) {
    "use strict";

    function Application() {
        this.editorElemId = "editor";
    }

    Application.prototype.initialize = function() {
        var self = this;
        this.fileManager = new FileManager();

        self.onDeviceReady();
        document.body.addEventListener('fsready', function() {
            self.receivedEvent('fsready');
        });

        document.body.addEventListener('tree-node-click', function(evt) {
            self.receivedEvent('tree-node-click', evt);
        });

        document.body.addEventListener('file-save', function(evt) {
            self.receivedEvent('file-save', evt);
        });

        document.body.addEventListener('editor-state-changed', function(evt) {
            self.receivedEvent('editor-state-changed', evt);
        });

        window.addEventListener('resize', function() {
            console.log('handling resize event');
            TabController.converge();
        });
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
					data-action="file-tree-toggle"
					class="app-action header__tab__button-pane__button header__tab__button-pane__button-osk tooltip tooltip-bottom mobile-only">
					<i class="material-icons">list</i>
					<span class="tooltip__text">Toggle file tree<br/><code>Ctrl + O</code></span>
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
			</div>`;
    };

    Application.prototype.onDeviceReady = function() {
        var self = this;
        this.receivedEvent('deviceready');

        var editorPageUI = this.UI.page("main");
        editorPageUI.onactivated(function(evt) {
            self._addEditorButtons();
        });

        this._addEditorButtons();


        function KeyPress(e) {
            var evtobj = window.event ? event : e;
            console.log(evtobj.ctrlKey, evtobj.altKey, String.fromCharCode(event.keyCode).toLowerCase());

            if (evtobj.ctrlKey) {
                switch (String.fromCharCode(event.keyCode).toLowerCase()) {
                    case 'z':
                        {
                            TabController.getCurrent().undo();
                            break;
                        }
                    case 'y':
                        {
                            TabController.getCurrent().redo();
                            break;
                        }
                    case 's':
                        {
                            TabController.getCurrent().save();
                            break;
                        }
                    case 'o':
                        {
                            self.toggleFileTree();
                            break;
                        }
                }

                if (evtobj.altKey) {
                    switch (String.fromCharCode(event.keyCode).toLowerCase()) {
                        case 'b':
                            {
                                TabController.getCurrent().beautify();
                            }
                    }
                }
            }
        }

        document.onkeydown = KeyPress;

        document.body.addEventListener('click', function(evt) {
            console.log('target', evt.target, evt.target.dataset);

            // Workaround to catch page change event & add editor buttons to Header when page changed;
            if (evt.target.dataset && evt.target.dataset.role == "tabitem" && evt.target.dataset.page == "main") {
                var headerInterval = setInterval(function() {
                    var headerElem = document.querySelector('.header [data-role="tabtitle"]');
                    // wait while header is updated, add buttons & set their states;
                    console.log('innerHTML', headerElem.innerHTML.toLowerCase());
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
            console.log('you clicked on ', action);
            console.log('current tab is', TabController.getCurrent());

            switch (action) {
                case 'file-tree-toggle':
                    {
                        self.toggleFileTree();
                        break;
                    }
                case 'window-osk':
                    {
                        self.toggleOSK();
                        break;
                    }
                case 'editor-save':
                    {
                        TabController.getCurrent().save();
                        break;
                    }
                case 'editor-beautify':
                    {
                        TabController.getCurrent().beautify();
                        break;
                    }
                case 'editor-undo':
                    {
                        TabController.getCurrent().undo();
                        break;
                    }
                case 'editor-redo':
                    {
                        TabController.getCurrent().redo();
                        break;
                    }
                case 'tab-close':
                    {
                        TabController.close(TabController.getByElem(target));
                        break;
                    }
                case 'tree-reload':
                    {
                        self.tree.reload();
                        break;
                    }
            }
            // this.receivedEvent(action, target);
        });
    };

    Application.prototype.toggleFileTree = function() {
        if (document.body.clientWidth < 600) {
            location.hash = !~location.hash.indexOf('file-tree') ? 'file-tree' : '';
        }
    };

    Application.prototype.toggleOSK = function() {
        document.body.classList[document.body.classList.contains('osk-mode') ? "remove" : "add"]('osk-mode');
        document.body.dispatchEvent(new CustomEvent('body-resize'));
    };

    Application.prototype.receivedEvent = function(id, evt) {
        var self = this;
        switch (id) {
            case 'deviceready':
                {
                    this.UI = new UbuntuUI();
                    this.UI.init();
                    break;
                }
            case 'fsready':
                {
                    this.renderTree();
                    // unconfined

                    this.fileManager.test().then(function(data) {
                        console.log('!!', data);
                    }, function(err) {
                        console.log('err', err);
                    });
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
            case 'tree-node-click':
                {
                    id = evt.detail.node.id;
                    if (id == "__up") {
                        this._rootDir =  evt.detail.node.entry;
                        this.tree.reload();
                    }
                    var fileEntry = evt.detail.node.entry;
                    if (fileEntry.isDirectory) {
                        evt.detail.node.toggleCollapse();
                        break;
                    }

                    co(function*() {
                        var content = yield self.fileManager.getFileContent(fileEntry);
                        var tab = TabController.get(evt.detail.node.id, fileEntry, content);
                        tab.activate();

                        // close tree
                        location.hash = "";
                    }).catch(function(err) {
                        console.error(err);
                    });
                    break;
                }

            case 'file-save':
                {
                    co(function*() {
                        var fileContent = yield self.fileManager.writeFile(evt.detail.fileEntry, evt.detail.value);

                    }).catch(function(err) {
                        console.error(err);
                    });

                }

        }


    };

    Application.prototype.renderTree = function() {
        this.tree = new InspireTree({
            'target': '.tree',
            'data': this._getTreeData.bind(this),
            'selection': {
                'allow': function() {
                    return false;
                }
            }
        });


        this.tree.on('node.click', function(event, node) {
            // node clicked!
            var evt = new CustomEvent('tree-node-click', {
                bubbles: true,
                cancelable: true,
                detail: {
                    node: node
                }
            });

            document.body.dispatchEvent(evt);
        });
    };

    Application.prototype._getTreeData = function(node) {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.fileManager.getFiles(node ? node.entry : (self._rootDir || null)).then(function(data) {
                var d = data.sort(function(a, b) {
                    if (a.children && !b.children) {
                        return -1;
                    }

                    if (!a.children && b.children) {
                        return 1;
                    }
                    return (a.text < b.text ? -1 : (a.text > b.text ? 1 : 0));
                });
                resolve(d);
            }, reject); // Array, callback, or promise
        });
    };

    return Application;
});
