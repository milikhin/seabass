define(['app/utils/storage', 'app/app-event', 'co'], function(storage, AppEvent, co) {
    function SettingsController() {
        /*
		  available keys:
		  - navEnabled
      - treeWidth
			- isCustomFontSize
			- fontSize
		*/

        this.FS_TYPES = {
            "FS_NATIVE": 1,
            "FS_DROPBOX": 2
        };
    }

    SettingsController.prototype.getFsType = function() {
        var self = this;
        return co(function*() {
            var savedFsType = yield self.get('fileTreeSource');
            var fsType;
            switch (savedFsType) {
                case 'dropbox':
                    {
                        fsType = self.FS_TYPES.FS_DROPBOX;
                        break;
                    }
                case 'native':
                default:
                    {
                        if (window.LocalFileSystem || window.chrome) {
                            fsType = self.FS_TYPES.FS_NATIVE;
                        } else {
                            fsType = self.FS_TYPES.FS_DROPBOX;
                        }
                    }
            }

            return fsType;
        });
    };

    SettingsController.prototype.get = function(key) {
        return co(function*() {
            if (!key) {
                throw new Error('Key is required');
            }

            switch (key) {
                case 'isCustomFontSize':
                case 'navEnabled':
                    {
                        var v = yield storage.get(key);
                        return (v === true || v === "true");
                    }
                case 'treeWidth':
                    {
                        return (yield storage.get(key)) || 251;
                    }
                case 'fontSize':
                    {
                        return (yield storage.get(key)) || 12;
                    }
                default:
                    {
                        return yield storage.get(key);
                    }
            }
        });

    };

    SettingsController.prototype.set = function(key, value) {
        var self = this;
        return co(function*() {
            yield storage.set(key, value);
            switch (key) {
                case 'fontSize':
                case 'isCustomFontSize':
                case 'treeWidth':
                    {
                        self._initRules();
                    }
            }

            return yield self.get(key);
        });

    };

    SettingsController.prototype.init = function() {
        this._initRules();
        this._initUI();
    };

    SettingsController.prototype.hideByQuery = function(query) {
        [].forEach.call(document.querySelectorAll(query), function(elemToHide) {
            elemToHide.style.display = "none";
        });
    };

    SettingsController.prototype.unhideByQuery = function(query) {
        [].forEach.call(document.querySelectorAll(query), function(elemToHide) {
            elemToHide.style.display = "";
        });
    };

    SettingsController.prototype._initFileTreeSettings = function() {
        var self = this;
        return co(function*() {
            /* File tree settings */
            document.getElementById('file-tree-navigation').checked = yield self.get('navEnabled');
            document.getElementById('file-tree-width').value = yield self.get('treeWidth');
            document.getElementById('file-tree-width-state').innerHTML = yield self.get('treeWidth');

            // get file tree source
            var realSource = yield self.getFsType();
            switch (realSource) {
                case self.FS_TYPES.FS_DROPBOX:
                    {
                        document.getElementById('file-tree-source').value = "dropbox";
                        [].forEach.call(document.querySelectorAll('.ft-dropbox-only'), function(elemToHide) {
                            elemToHide.style.display = "block";
                        });
                        break;
                    }
                case self.FS_TYPES.FS_NATIVE:
                default:
                    {
                        document.getElementById('file-tree-source').value = "native";
                        [].forEach.call(document.querySelectorAll('.ft-localfs-only'), function(elemToHide) {
                            elemToHide.style.display = "block";
                        });
                    }
            }
        });
    };

    SettingsController.prototype._initEditorSettings = function() {
        var self = this;
        return co(function*() {
            /* Editor settngs*/
            document.getElementById('editor-custom-font-size').checked = yield self.get('isCustomFontSize');
            document.getElementById('editor-font-size').disabled = !(yield self.get('isCustomFontSize'));
            document.getElementById('editor-font-size-state-wrapper').classList[(yield self.get('isCustomFontSize')) ? "remove" : "add"]('disabled');
            document.getElementById('editor-font-size').value = yield self.get('fontSize');
            document.getElementById('editor-font-size-state').innerHTML = yield self.get('fontSize');
        });
    };

    SettingsController.prototype._initUI = function() {
        var self = this;
        co(function*() {
            yield self._initFileTreeSettings();
            yield self._initEditorSettings();

            document.getElementById('dropbox-access-token').value = yield self.get('dropbox-token');
        });


        /* File tree settngs UI events*/
        document.getElementById('file-tree-navigation').onchange = function() {
            self.set('navEnabled', this.checked);
            co(function*() {
                yield self._initFileTreeSettings();
                AppEvent.dispatch('tree-reload');
            });
        };
        document.getElementById('file-tree-width').oninput = function() {
            self.set('treeWidth', this.valueAsNumber);
            document.getElementById('file-tree-width-state').innerHTML = this.valueAsNumber;
        };
        document.getElementById('file-tree-source').onchange = function() {
            self.set('fileTreeSource', this.value).then(function() {
                location.reload();
            });
        };

        /* Editor settings UI events */
        document.getElementById('editor-custom-font-size').onchange = function() {
            document.getElementById('editor-font-size').disabled = !this.checked;
            document.getElementById('editor-font-size-state-wrapper').classList[this.checked ? "remove" : "add"]('disabled');
            self.set('isCustomFontSize', this.checked);
        };
        document.getElementById('editor-font-size').oninput = function() {
            self.set('fontSize', this.valueAsNumber);
            document.getElementById('editor-font-size-state').innerHTML = this.valueAsNumber;
        };

        /* Dropbox settings UI events */
        document.getElementById('dropbox-access-token').onchange = function() {
            self.set('dropbox-token', this.value);
        };

    };

    SettingsController.prototype._getSheet = function() {
        if (this.sheet) {
            return this.sheet;
        }

        return this.sheet = this._createSheet();
    };

    SettingsController.prototype._initRules = function() {
        var self = this;
        return co(function*() {
            var isCustomFontSize = yield self.get('isCustomFontSize');
            var width = yield self.get('treeWidth') || 251;
            var fileTreeTooltipWidth = width - 40;
            var fontSize = yield self.get('fontSize') || 12;

            while (self._getSheet().rules.length) {
                self._getSheet().deleteRule(0);
            }

            self._getSheet().addRule('.main-window', `margin-left: ${width}px;width: calc(100% - ${width}px);`);
            self._getSheet().addRule('.aside', `width: ${width}px;`);
            self._getSheet().addRule('.inspire-tree', `width: ${width}px;`);
            self._getSheet().addRule('.aside__header__path .tooltip__text', `width: ${fileTreeTooltipWidth}px;`);

            if (isCustomFontSize) {
                self._getSheet().addRule('.CodeMirror', `font-size: ${fontSize}px;`);
            }
        });

    };

    SettingsController.prototype._createSheet = function() {
        // Create the <style> tag
        var style = document.createElement("style");

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(style);
        return style.sheet;
    };

    return new SettingsController();
});