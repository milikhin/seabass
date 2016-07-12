define([], function () {
	function SettingsController() {
		/*
		  available keys:
		  - navEnabled
      - treeWidth
		*/
	}

	SettingsController.prototype.get = function (key) {
		if (!key) {
			throw new Error('Key is required');
		}

		switch (key) {
		case 'navEnabled':
			{
				return localStorage.getItem(key) === "true";
			}
		default:
			{
				return localStorage.getItem(key);
			}
		}

	};

	SettingsController.prototype.set = function (key, value) {
		localStorage.setItem(key, value);
		switch (key) {
		case 'treeWidth':
			{
				this._initRules();
			}
		}
    
		return this.get(key);
	};

	SettingsController.prototype.init = function () {
		this._initRules();
	};

	SettingsController.prototype._getSheet = function () {
		if (this.sheet) {
			return this.sheet;
		}

		return this.sheet = this._createSheet();
	};

	SettingsController.prototype._initRules = function () {
		var width = this.get('treeWidth') || 251;
		while (this._getSheet().rules.length) {
			this._getSheet().deleteRule(0);
		}

		this._getSheet().addRule('.main-window', `margin-left: ${width}px;width: calc(100% - ${width}px);`);
		this._getSheet().addRule('.aside', `width: ${width}px;`);
		this._getSheet().addRule('.inspire-tree', `width: ${width}px;`);
	};

	SettingsController.prototype._createSheet = function () {
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
