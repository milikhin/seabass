define(['co', 'md5',
	'ace/ace', 'ace/theme/monokai',
	'ace/mode/javascript',
	'ace/worker/worker',

	'ace/mode/css',
	'ace/mode/php',
	'ace/mode/html',
	'ace/mode/c_cpp',
	'ace/mode/python',
	'ace/mode/plain_text',

	'ace/mode/json',
	'ace/mode/jsx',
	'ace/mode/ejs'
], function (co, md5, ace, theme, mode) {
	function TabController() {
		this.tabs = [];
		this.rootElem = document.querySelector('.tabs');
		// this.tabsElem = this.rootElem.querySelector('.tabs');
	}

	// Get active tab
	TabController.prototype.getCurrent = function () {
		var checkedPanelElem = document.querySelector('.tabs .tab-state:checked ~ .tab-content');
		var currentTab;
		this.tabs.forEach(function (tab) {
			if(tab.panelElem == checkedPanelElem.closest('li')) {
				currentTab = tab;
			}
		}, this);

		return currentTab;
	};

	// Get the eldest tab (to close it for example)
	TabController.prototype.getEarliestModified = function () {
		var oldestTab;
		this.tabs.forEach(function (tabDescription) {
			if(!oldestTab || oldestTab.lastModified > tabDescription.lastModified) {
				oldestTab = tabDescription;
			}
		});

		return oldestTab;
	};

	// Get tab corresponded to a file
	TabController.prototype.getTabByFileEntry = function (fileEntry) {
		var tab;

		if(!fileEntry) {
			throw new Error("file entry argument is not specified");
		}

		this.tabs.forEach(function (tabDescription) {
			if(tabDescription.fileEntry == fileEntry) {
				tab = tabDescription;
			}
		}, this);

		return tab;
	};

	// Get tab (or create new if it doesn't exist)
	TabController.prototype.get = function (fileName, fileEntry, fileContent) {
		var self = this;

		// check if file is already opened
		var tab = this.getTabByFileEntry(fileEntry);
		if(tab) {
			return tab;
		}

		document.getElementById('editor-tabs').style.zIndex = 10;

		// if maximum amount of tabs is exceeded, close the earliest one
		var oldestTab = this.getEarliestModified();
		if(this.tabs.length >= 5) {
			this.close(oldestTab);
		}

		// Create new tabs template;
		var tabElem = document.createElement('li');
		tabElem.innerHTML = this.tpl({
			fileName: fileName,
			content: fileContent,
			url: fileEntry.nativeURL
		});
		this.rootElem.appendChild(tabElem);

		// Create editor
		var editorElemId = tabElem.querySelector('.editor').id;
		tab = {
			panelElem: tabElem,
			id: md5(fileName),
			fileName: fileName,
			editor: ace.edit(editorElemId),
			fileEntry: fileEntry,
			lastModified: null
		};

		tab.onEditorChange = function () {
			setTimeout(function () {
				var um = tab.editor.getSession().getUndoManager();
				var ext = tab.fileName.slice(tab.fileName.lastIndexOf('.') + 1, tab.fileName.length);
				console.log(ext, ~['js', 'html', 'css', 'json'].indexOf(ext).toString());
				tab.lastModified = Date.now();
				// console.log('call onEditorChange', tab, um.hasUndo().toString(), um.hasRedo().toString());
				document.body.dispatchEvent(new CustomEvent('editor-state-changed', {
					bubbles: true,
					cancelable: true,
					detail: {
						hasUndo: um.hasUndo(),
						hasRedo: um.hasRedo(),
						hasBeautify: ~['js', 'html', 'css', 'json'].indexOf(ext)
					}
				}));
			}, 500);
		};

		tab.onResize = function () {
			tab.editor.resize(true);
		};
		document.body.addEventListener('body-resize', tab.onResize);
		tab.editor.setTheme(theme);
		tab.editor.setValue(fileContent, 1);

		// enable syntax highlighting
		this._setEditorMode(fileEntry, tab, fileName);

		// save created tab
		this.tabs.push(tab);

		// Add onchange handlers
		tab.editor.on('change', function (evt) {
			self.save(tab); // autosave
			tab.onEditorChange(evt); // button enabling/disabling
		});

		this.tabs.forEach(function (tabDescription) {
			tabDescription.panelElem.querySelector('.tab-state').onchange = function () {
				tabDescription.onEditorChange();
				setTimeout(function () {
					tabDescription.editor.focus();
				}, 100);
			};
		});

		// reset undo manager & buttons
		setTimeout(function() {
			self._resetUndoManager(tab);
		}, 100);

		return tab;
	};

	TabController.prototype.save = function (tab) {
		var evt = new CustomEvent('file-save', {
			bubbles: true,
			cancelable: true,
			detail: {
				fileEntry: tab.fileEntry,
				value: tab.editor.getValue()
			}
		});

		document.body.dispatchEvent(evt);
	};

	TabController.prototype.beautify = function (tab) {
		var content = tab.editor.getValue();
		var beautyContent;
		var ext = tab.fileName.slice(tab.fileName.lastIndexOf('.') + 1, tab.fileName.length);
		console.log(ext);
		switch(ext) {
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
		tab.editor.setValue(beautyContent);

	};

	TabController.prototype.getByElem = function (elem) {
		var tab;
		this.tabs.forEach(function (tabDescription, index) {
			if(elem.closest('.tabs li') == tabDescription.panelElem) {
				tab = tabDescription;
			}
		});

		return tab;
	};

	TabController.prototype.close = function (tabToClose) {
		if(!tabToClose) {
			throw new Error('Tab to close not found!');
		}

		document.body.removeEventListener('body-resize', tabToClose.onResize);
		var tabContainer = tabToClose.panelElem.parentElement.removeChild(tabToClose.panelElem);
		this.tabs.splice(this.tabs.indexOf(tabToClose), 1);

		var newCurrentTab = this.getEarliestModified();
		if(newCurrentTab) {
			newCurrentTab.panelElem.querySelector('.tab-state').checked = true;
		} else {
			document.getElementById('editor-tabs').style.zIndex = -1;
			document.body.dispatchEvent(new CustomEvent('editor-state-changed', {
				bubbles: true,
				cancelable: true,
				detail: {
					hasUndo: false,
					hasRedo: false,
					hasBeautify: false
				}
			}));
		}

	};

	TabController.prototype.undo = function (tab) {
		tab.editor.undo();
	};

	TabController.prototype.redo = function (tab) {
		tab.editor.redo();
	};

	TabController.prototype.tpl = function (options) {
		var fnameHash = md5(options.url);
		var rootDir = 'seabass.mikhael/persistent/';
		var shortenedUrl = options.url.slice(options.url.indexOf(rootDir) + rootDir.length, options.url.length);
		return `<input class="tab-state" type="radio" title="tab-${fnameHash}" name="tabs-state" id="tab-${fnameHash}" checked />
			<label
				class="tab-label"
				for="tab-${fnameHash}"
				id="tab-label-${fnameHash}"
				title="${options.fileName}">
				<button class="tab-label__close app-action" data-action="tab-close">x</button>
				<span class="tab-label__label">${options.fileName}</span>
			</label>
			<div class="tab-content" id="tab-content-${fnameHash}" >
					<div id="editor-${fnameHash}" class="editor"></div>
			</div>
			<div class="tab-footer" id="tab-footer-${fnameHash}" >
					<span class="tab-footer__file-name">${shortenedUrl}</span>
			</div>`;
	};

	TabController.prototype._resetUndoManager = function (tab) {
		var um = tab.editor.getSession().getUndoManager();
		um.reset();
		tab.onEditorChange();
	};

	TabController.prototype._setEditorMode = function (fileEntry, tab, fileName) {
		fileEntry.file(function (data) {
			// get mime type
			var mime = data.type;
			console.log('file data', data);
			switch(mime) {
			case 'application/javascript':
				{
					tab.editor.getSession().setMode('ace/mode/javascript');
					break;
				}
			case 'text/css':
				{
					tab.editor.getSession().setMode('ace/mode/css');
					break;
				}
			case 'text/html':
				{
					tab.editor.getSession().setMode('ace/mode/html');
					break;
				}
			case 'application/x-php':
				{
					tab.editor.getSession().setMode('ace/mode/php');
					break;
				}
			case 'text/x-csrc':
			case 'text/x-c++src':
				{
					tab.editor.getSession().setMode('ace/mode/c_cpp');
					break;
				}
			case 'text/x-python':
				{
					tab.editor.getSession().setMode('ace/mode/python');
					break;
				}
			case 'application/json':
				{
					tab.editor.getSession().setMode('ace/mode/json');
					break;
				}

			default:
				{
					var ext = fileName.slice(fileName.lastIndexOf('.') + 1, fileName.length);

					switch(ext) {
					case 'ejs':
						{
							tab.editor.getSession().setMode('ace/mode/ejs');
							break;
						}
					case 'jsx':
						{
							tab.editor.getSession().setMode('ace/mode/jsx');
							break;
						}

					default:
						{
							tab.editor.getSession().setMode('ace/mode/plain_text');
						}
					}


				}

			}
			console.log(mime);
		});
	};

	return new TabController();
});
