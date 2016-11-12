define([
    'json!./languages.json',
    "cm/lib/codemirror",
    "app/app-event",
    'cm/keymap/sublime',
    'cm/addon/search/search',
    'cm/addon/search/searchcursor',
    'cm/addon/search/jump-to-line',
    'cm/addon/search/search',
    'cm/addon/dialog/dialog',
    'cm/addon/edit/closebrackets',
    'cm/addon/edit/matchbrackets',
    'cm/addon/edit/matchtags',

    // Web
    "cm/mode/htmlmixed/htmlmixed",
    "cm/mode/javascript/javascript",
    "cm/mode/css/css",
    "cm/mode/sass/sass",
    "cm/mode/stylus/stylus",
    "cm/mode/php/php",
    "cm/mode/jsx/jsx",
    "cm/mode/markdown/markdown",

    //
    "cm/mode/python/python",
    "cm/mode/xml/xml",
    "cm/mode/sql/sql",
    "cm/mode/stex/stex",

    //
    "cm/mode/clike/clike",
    "cm/mode/go/go",
    "cm/mode/ruby/ruby",
    "cm/mode/shell/shell",
    "cm/mode/yaml/yaml",
    "cm/mode/pascal/pascal",
    "cm/mode/swift/swift"
], function(languages, CodeMirror, AppEvent) {
    function Editor(options) {
        var self = this;
        this.fileName = options.fileName;
        if (!this.fileName) {
            throw new Error('File name for the Tab is required');
        }

        var language = this._getLanguage();

        this._editor = CodeMirror.fromTextArea(options.editorElem, {
            lineNumbers: true,
            mode: language,
            keyMap: "sublime",
            theme: "monokai",
            value: options.fileContent,
            matchTags: true,
            matchBrackets: true,
            autoCloseBrackets: true
        });

        this._editor.setOption("extraKeys", {
            "Ctrl-Alt-B": function() {
                self.beautify();
            },
            "Ctrl-Shift-B": function() {
                self.beautify();
            },
            "Ctrl-Z": function() {
                if (!self._editor.isClean()) {
                    self.undo();
                }
            },
            "Ctrl-Y": function() {
                self.redo();
            }
        });

        this._editor.setValue(options.fileContent);
        this._editor.markClean();
    }

    Editor.prototype.beautify = function() {
        var content = this._editor.getValue();
        var beautyContent;
        var ext = this.fileName.slice(this.fileName.lastIndexOf('.') + 1, this.fileName.length);
        switch (ext) {
            case 'json':
            case 'js':
                {
                    beautyContent = window.js_beautify(content);
                    break;
                }
            case 'css':
                {
                    beautyContent = window.css_beautify(content);
                    break;
                }
            case 'html':
                {
                    beautyContent = window.html_beautify(content);
                    break;
                }
            default:
                {
                    beautyContent = content;
                }

        }
        this._editor.setValue(beautyContent);
    };

    Editor.prototype.getValue = function() {
        return this._editor.getValue();
    };

    Editor.prototype.undo = function() {
        this._undoUsed = this._undoUsed ? this._undoUsed + 1 : 1;
        return this._editor.undo();
    };

    Editor.prototype.redo = function() {
        this._undoUsed = this._undoUsed ? this._undoUsed - 1 : 0;
        return this._editor.redo();
    };

    Editor.prototype.hasUndo = function() {
        return !this._editor.isClean();
    };

    Editor.prototype.hasRedo = function() {
        return !!this._undoUsed;
    };

    Editor.prototype.focus = function() {
        this._editor.focus();
    };

    Editor.prototype.onChange = function(callback) {
        this._editor.on("change", callback);
    };

    Editor.prototype._getLanguage = function() {
        var ext = this.fileName.slice(this.fileName.lastIndexOf('.') + 1, this.fileName.length);

        for (var i in languages) {
            if (ext == i) {
                return languages[i];
            }
        }

        return null;
    };

    return Editor;
});
