define([
	'md5',
	'app/app-event',
	'./editor-codemirror',
	'app/settings'
], function (md5, AppEvent, Editor, SettingsController) {

	function Tab(options) {
		if (!(options.fileName && options.fileEntry)) {
			throw new Error("fileName & fileEntry required");
		}

		this.id = md5(options.fileEntry.nativeURL);
		this.fileName = options.fileName;
		this.fileEntry = options.fileEntry;
		this.lastModified = null;

		this.rootDir = this._getRootURL();

		this.onEditorChange = options.onEditorChange || function () {};

		// Create new tab layout & append it to parentElem;
		this.rootElem = document.createElement('li');
		this.rootElem.innerHTML = this.tpl();
		options.parentElem.appendChild(this.rootElem);

		this.editor = new Editor({
			editorElem: this.rootElem.querySelector('.editor'),
			fileContent: options.fileContent || "",
			fileName: this.fileName
		});

		this._registerEventHandlers();
		// console.log('complete Tab init');
	}

	Tab.prototype._getRootURL = function () {
		var fsType = SettingsController.getFsType();
		var rootDir;
		switch (fsType) {
		case 2: // Dropbox
			{
				rootDir = '';
				break;
			}
		case 1: // LocalFileSystem
		default:
			{
				if (window.chrome) {
					rootDir = '';
				} else {
					rootDir = 'file://localhost';
				}
				break;
			}
		}
		return rootDir;
	};

	Tab.prototype.close = function () {
		console.log('close stub');
	};

	Tab.prototype.undo = function () {
		this.editor.undo();
	};

	Tab.prototype.hasUndo = function () {
		return this.editor.hasUndo();
	};

	Tab.prototype.hasRedo = function () {
		return this.editor.hasRedo();
	};

	Tab.prototype.redo = function () {
		this.editor.redo();
	};

	Tab.prototype.activate = function () {
		this.rootElem.querySelector('.tab-state').checked = true;

		AppEvent.dispatch({
			type: 'tab-activate',
			tab: this
		});
	};

	Tab.prototype._registerEventHandlers = function () {
		var self = this;

		// register editor onchange handler
		this.editor.onChange(function (evt) {
			self.save(); // autosave
			self.onEditorChange(evt); // undo/redo enabling/disabling
		});

		this.rootElem.querySelector('.tab-state').onchange = function () {
			self.activate();
			self.onEditorChange();

			setTimeout(function () {
				self.editor.focus();
			}, 100);
		};
	};

	Tab.prototype.tpl = function () {
		var url = this.fileEntry.nativeURL;

		var fnameHash = md5(url);
		var fileUriIndex = this.rootDir ? url.indexOf(this.rootDir) : 0;
		console.log(fileUriIndex, this.rootDir, url);
		var shortenedUrl = url.slice(fileUriIndex + this.rootDir.length, url.length);
		return `
          <input class="tab-state" type="radio" title="tab-${fnameHash}" name="tabs-state" id="tab-${fnameHash}" checked />
    			<label
    				class="tab-label"
    				for="tab-${fnameHash}"
    				id="tab-label-${fnameHash}"
    				title="${this.fileName}">
    				<button class="tab-label__close app-action" data-action="tab-close">x</button>
    				<span class="tab-label__label">${this.fileName}</span>
    			</label>
    			<div class="tab-content" id="tab-content-${fnameHash}" >
    					<textarea id="editor-${fnameHash}" class="editor"></textarea>
    			</div>
    			<div class="tab-footer" id="tab-footer-${fnameHash}" >
    					<span class="tab-footer__file-name">${shortenedUrl}</span>
    			</div>`;
	};


	Tab.prototype.save = function () {
		AppEvent.dispatch({
			type: 'file-save',
			fileEntry: this.fileEntry,
			value: this.editor.getValue()
		});
	};

	Tab.prototype.beautify = function () {
		this.editor.beautify();
	};

	return Tab;
});
