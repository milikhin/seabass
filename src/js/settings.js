define([], function() {
    function SettingsController() {
        /*
		  available keys:
		  - navEnabled
      - treeWidth
			- isCustomFontSize
			- fontSize
		*/
    }

    SettingsController.prototype.get = function(key) {
        if (!key) {
            throw new Error('Key is required');
        }

        switch (key) {
            case 'isCustomFontSize':
            case 'navEnabled':
                {
                    return localStorage.getItem(key) === "true";
                }
            case 'treeWidth':
                {
                    return localStorage.getItem(key) || 251;
                }
            case 'fontSize':
                {
                    return localStorage.getItem(key) || 12;
                }
            default:
                {
                    return localStorage.getItem(key);
                }
        }

    };

    SettingsController.prototype.set = function(key, value) {
        localStorage.setItem(key, value);
        switch (key) {
            case 'fontSize':
            case 'isCustomFontSize':
            case 'treeWidth':
                {
                    this._initRules();
                }
        }

        return this.get(key);
    };

    SettingsController.prototype.init = function() {
        this._initRules();
        this._initUI();

    };

    SettingsController.prototype._initUI = function() {
        var self = this;

        /* File tree settings */
        document.getElementById('file-tree-navigation').checked = this.get('navEnabled');
        document.getElementById('file-tree-width').value = this.get('treeWidth');
        document.getElementById('file-tree-width-state').innerHTML = this.get('treeWidth');

        /* Editor settngs*/
        document.getElementById('editor-custom-font-size').checked = this.get('isCustomFontSize');
        document.getElementById('editor-font-size').disabled = !this.get('isCustomFontSize');
        document.getElementById('editor-font-size-state-wrapper').classList[this.get('isCustomFontSize') ? "remove" : "add"]('disabled');
        document.getElementById('editor-font-size').value = this.get('fontSize');
        document.getElementById('editor-font-size-state').innerHTML = this.get('fontSize');
        if (this.get('fileTreeSource')) {
            document.getElementById('file-tree-source').value = this.get('fileTreeSource');
        } else {
            if (!window.LocalFileSystem) {
                document.getElementById('file-tree-source').value = "dropbox";
            }
        }

        if (this.get('fileTreeSource') !== "dropbox") {
            [].forEach.call(document.querySelectorAll('.ft-dropbox-only'), function(elemToHide) {
                elemToHide.style.display = "none";
            });
        }

        document.getElementById('dropbox-access-token').value = this.get('dropbox-token');


        /* File tree settngs UI events*/
        document.getElementById('file-tree-navigation').onchange = function() {
            self.set('navEnabled', this.checked);
        };
        document.getElementById('file-tree-width').oninput = function() {
            self.set('treeWidth', this.valueAsNumber);
            document.getElementById('file-tree-width-state').innerHTML = self.get('treeWidth');
        };
        document.getElementById('file-tree-source').onchange = function() {
            self.set('fileTreeSource', this.value);
            location.reload();
        };

        /* Editor settings UI events */
        document.getElementById('editor-custom-font-size').onchange = function() {
            document.getElementById('editor-font-size').disabled = !this.checked;
            document.getElementById('editor-font-size-state-wrapper').classList[this.checked ? "remove" : "add"]('disabled');
            self.set('isCustomFontSize', this.checked);
        };
        document.getElementById('editor-font-size').oninput = function() {
            self.set('fontSize', this.valueAsNumber);
            document.getElementById('editor-font-size-state').innerHTML = self.get('fontSize');
        };

        /* Dropbox settings UI events */
        document.getElementById('dropbox-access-token').onchange = function() {
            self.set('dropbox-token', this.value);
        }

    };

    SettingsController.prototype._getSheet = function() {
        if (this.sheet) {
            return this.sheet;
        }

        return this.sheet = this._createSheet();
    };

    SettingsController.prototype._initRules = function() {
        var isCustomFontSize = this.get('isCustomFontSize');
        var width = this.get('treeWidth') || 251;
        var fileTreeTooltipWidth = width - 40;
        var fontSize = this.get('fontSize') || 12;

        while (this._getSheet().rules.length) {
            this._getSheet().deleteRule(0);
        }

        this._getSheet().addRule('.main-window', `margin-left: ${width}px;width: calc(100% - ${width}px);`);
        this._getSheet().addRule('.aside', `width: ${width}px;`);
        this._getSheet().addRule('.inspire-tree', `width: ${width}px;`);
        this._getSheet().addRule('.aside__header__path .tooltip__text', `width: ${fileTreeTooltipWidth}px;`);

        if (isCustomFontSize) {
            this._getSheet().addRule('.CodeMirror', `font-size: ${fontSize}px;`);
        }
    };

    SettingsController.prototype._createSheet = function() {
        // Create the <style> tag
        var style = document.createElement("style");

        // Add a media (and/or media query) here if you'd like!
        // style.setAttribute("media", "screen")
        // style.setAttribute("media", "only screen and (max-width : 1024px)")

        // WebKit hack :(
        style.appendChild(document.createTextNode(""));

        // Add the <style> element to the page
        document.head.appendChild(style);
        return style.sheet;
    };

    return new SettingsController();
});