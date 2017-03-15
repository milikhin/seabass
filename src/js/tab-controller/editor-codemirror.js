define([
    'json!./languages.json',
    "cm",
    "app/app-event",

    'cm/keymap/sublime',
    'cm/addon/lint/lint',
    'cm/addon/comment/comment',
    'cm/addon/lint/javascript-lint',
    //'cm/addon/lint/coffeescript-lint',
    'cm/addon/lint/html-lint',
    'cm/addon/lint/json-lint',
    'cm/addon/lint/css-lint',
    'cm/addon/lint/yaml-lint',

    'cm/addon/search/search',

    'cm/addon/search/searchcursor',
    'cm/addon/search/jump-to-line',
    'cm/addon/search/search',
    'cm/addon/dialog/dialog',
    'cm/addon/edit/closebrackets',
    'cm/addon/edit/matchbrackets',
    'cm/addon/edit/matchtags',

    'cm/addon/fold/foldcode',
    'cm/addon/fold/foldgutter',
    'cm/addon/fold/brace-fold',
    'cm/addon/fold/xml-fold',
    'cm/addon/fold/markdown-fold',
    'cm/addon/fold/comment-fold',

    // Web
    "cm/mode/htmlmixed/htmlmixed",
    "cm/mode/javascript/javascript",
    "cm/mode/coffeescript/coffeescript",
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
        var ext = this.fileName.slice(this.fileName.lastIndexOf('.') + 1, this.fileName.length);
        var linterOptions;
        switch (ext) {
            case 'js':
                {
                    linterOptions = {
                        esversion: 6,
                        globals: {
                            "require": true,
                            "define": true,
                            "console": true,
                            "module": false
                        }
                    };
                    break;
                }
            case 'json':
            case 'css':
            case 'html':
            case 'yaml':
                {
                    linterOptions = true;
                    break;
                }
            default:
                {
                    linterOptions = false;
                }
        }
        // var hasLinter = ~['json', 'js', 'css', 'html', 'yaml'].indexOf(ext);

        this._editor = CodeMirror.fromTextArea(options.editorElem, {
            autoCloseBrackets: true,
            extraKeys: {
                "Ctrl-Q": function(cm) {
                    cm.foldCode(cm.getCursor());
                }
            },
            inputStyle: "contenteditable",
            foldGutter: true,
            gutters: linterOptions ? ["CodeMirror-lint-markers", "CodeMirror-foldgutter"] : ["CodeMirror-foldgutter"],
            keyMap: "sublime",
            lint: linterOptions,
            lineNumbers: true,
            // lineWrapping: true,
            matchTags: true,
            matchBrackets: true,
            mode: language,
            theme: "monokai",
            value: options.fileContent
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
        var currentCursorPosition = this._editor.getCursor(); //save current cursor position
        var currentScrollInfo = this._editor.getScrollInfo();
        var content = this._editor.getValue();
        var beautyContent = content;
        var ext = this.fileName.slice(this.fileName.lastIndexOf('.') + 1, this.fileName.length);
        let options = {
            source: content,
            mode: "beautify", //  beautify, diff, minify, parse
            wrap: 100,
            methodchain: "none",
        };

        switch (ext) {
            case 'json':
            case 'js':
                {
                    beautyContent = window.js_beautify(content, {
                        e4x: true
                    });
                    break;
                }
            case 'jsx':
                {
                    options.lang = "javascript";
                    let pd = window.prettydiff(options); // returns and array: [beautified, report]
                    let pretty = pd[0];
                    // var report = pd[1];
                    // console.log(pretty, report);

                    beautyContent = pretty;
                    break;
                }
            case 'qml':
                {
                    options.lang = "qml";
                    options.qml = true;

                    let pd = window.prettydiff(options);
                    let pretty = pd[0];

                    beautyContent = pretty;
                    break;
                }
            case 'ejs':
                {
                    options.lang = "markup";

                    let pd = window.prettydiff(options);
                    let pretty = pd[0];

                    beautyContent = pretty;
                    break;
                }
            case 'less':
            case 'scss':
            case 'css':
                {
                    options.lang = "css";

                    let pd = window.prettydiff(options); // returns and array: [beautified, report]
                    let pretty = pd[0];

                    beautyContent = pretty;
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
        this._editor.setCursor(currentCursorPosition);
        this._editor.scrollTo(currentScrollInfo.left, currentScrollInfo.top);
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