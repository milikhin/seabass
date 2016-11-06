define([
    'md5',
    'json!./languages.json',
    'app/app-event',
    'ace/ace',
    'ace/theme/monokai',
    'ace/ext/language_tools',
    'ace/ext/searchbox',


    'ace/worker/worker',

    // Language-specific modes
    'ace/mode/javascript',
    'ace/mode/typescript',
    'ace/mode/json',
    'ace/mode/css',
    'ace/mode/less',
    'ace/mode/sass',
    'ace/mode/scss',
    'ace/mode/stylus',
    'ace/mode/markdown',

    'ace/mode/latex',
    'ace/mode/xml',
    'ace/mode/html',
    'ace/mode/svg',
    'ace/mode/php',
    'ace/mode/ejs',
    'ace/mode/jsx',
    'ace/mode/ruby',

    'ace/mode/qml',
    'ace/mode/c_cpp',
    'ace/mode/golang',
    'ace/mode/python',
    'ace/mode/java',
    'ace/mode/swift',

    'ace/mode/sh',
    'ace/mode/yaml',
    'ace/mode/plain_text'
], function(md5, languages, AppEvent, ace, theme) {

    function Tab(options) {
        var self = this;
        if (!(options.fileName && options.fileEntry)) {
            throw new Error("fileName & fileEntry required");
        }

        this.id = md5(options.fileEntry.nativeURL);
        this.fileName = options.fileName;
        this.fileEntry = options.fileEntry;
        this.lastModified = null;
        this.rootDir = 'file://localhost';

        this.onEditorChange = options.onEditorChange || function() {};

        // Create new tab layout & append it to parentElem;
        this.rootElem = document.createElement('li');
        this.rootElem.innerHTML = this.tpl();
        options.parentElem.appendChild(this.rootElem);

        var editorElemId = this.rootElem.querySelector('.editor').id;
        this.editor = ace.edit(editorElemId);
        this.editor.setOptions({
            enableBasicAutocompletion: true
        });

        // set value & theme
        this.editor.setTheme(theme);
        this.editor.setValue(options.fileContent || "", 1);

        // enable syntax highlighting
        this._setEditorMode();
        this._registerEventHandlers();
        this._registerKeyBindings();

        // console.log('complete Tab init');
    }

    Tab.prototype.undo = function() {
        this.editor.undo();
    };

    Tab.prototype.redo = function() {
        this.editor.redo();
    };

    Tab.prototype.activate = function() {
        this.rootElem.querySelector('.tab-state').checked = true;

        AppEvent.dispatch({
                type: 'tab-activate',
                tab: this
            
        });
    };

    Tab.prototype.onResize = function() {
        this.editor.resize(true);
    };

    Tab.prototype._registerKeyBindings = function() {
        var self = this;
        this.editor.commands.addCommand({
            name: "filetree-toggle",
            bindKey: {
                win: "Ctrl-T",
                mac: "Command-T"
            },
            exec: function(editor) {
                AppEvent.dispatch({
                        type: 'filetree-toggle'
                    
                });
            }
        });

        this.editor.commands.addCommand({
            name: "beautify",
            bindKey: {
                win: "Ctrl-Shift-B",
                mac: "Command-Option-B"
            },
            exec: function(editor) {
                self.beautify();
            }
        });
    };

    Tab.prototype._registerEventHandlers = function() {
        var self = this;

        // register editor onchange handler
        this.editor.on('change', function(evt) {
            self.save(); // autosave
            self.onEditorChange(evt); // button enabling/disabling
        });

        // register osk-toggle-toggle handler
        document.body.addEventListener('body-resize', function(evt) {
            self.onResize();
        });

        this.rootElem.querySelector('.tab-state').onchange = function() {
            self.activate();
            self.onEditorChange();

            setTimeout(function() {
                self.editor.focus();
            }, 100);
        };

    };

    Tab.prototype._setEditorMode = function() {
        // get file extension
        var ext = this.fileName.slice(this.fileName.lastIndexOf('.') + 1, this.fileName.length);
        // tab.editor.getSession().setMode('ace/mode/plain_text');

        for (var i in languages) {
            if (ext == i) {
                // console.log('language is', languages[i]);
                this.editor.getSession().setMode('ace/mode/' + languages[i]);
            }
        }
    };

    Tab.prototype.tpl = function() {
        var url = this.fileEntry.nativeURL;

        var fnameHash = md5(url);
        var shortenedUrl = url.slice(url.indexOf(this.rootDir) + this.rootDir.length, url.length);
        return `<input class="tab-state" type="radio" title="tab-${fnameHash}" name="tabs-state" id="tab-${fnameHash}" checked />
			<label
				class="tab-label"
				for="tab-${fnameHash}"
				id="tab-label-${fnameHash}"
				title="${this.fileName}">
				<button class="tab-label__close app-action" data-action="tab-close">x</button>
				<span class="tab-label__label">${this.fileName}</span>
			</label>
			<div class="tab-content" id="tab-content-${fnameHash}" >
					<div id="editor-${fnameHash}" class="editor"></div>
			</div>
			<div class="tab-footer" id="tab-footer-${fnameHash}" >
					<span class="tab-footer__file-name">${shortenedUrl}</span>
			</div>`;
    };


    Tab.prototype.save = function() {
        AppEvent.dispatch({
                type: 'file-save',
                fileEntry: this.fileEntry,
                value: this.editor.getValue()
            
        });
    };

    Tab.prototype.beautify = function() {
        var content = this.editor.getValue();
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
        this.editor.setValue(beautyContent);

    };

    return Tab;
});
