define([], function () {
	"use strict";

	function StorageController() {
		this.storageModes = {
			"SM_NONE": 0,
			"SM_LOCAL_STORAGE": 1,
			"SM_CHROME": 2,
		};

		try {
			if (!window.localStorage) {
				throw new Error('no localStorage support');
			}
			this._mode = this.storageModes.SM_LOCAL_STORAGE;
		} catch (err) {
			this._mode = window.chrome ? this.storageModes.SM_CHROME : this.storageModes.SM_NONE;
		}
		console.log(this._mode, window.chrome);
	}

	StorageController.prototype.get = function (key) {
		var self = this;
		return new Promise(function (resolve, reject) {
			switch (self._mode) {
			case self.storageModes.SM_LOCAL_STORAGE:
				{
					resolve(window.localStorage.getItem(key));
					break;
				}
			case self.storageModes.SM_CHROME:
				{
					chrome.storage.local.get(key, function (values) {
						resolve(values[key]);
					});
					break;
				}
			default:
				{
					reject("Local storage is not available");

				}
			}
		});
	};

	StorageController.prototype.set = function (key, value) {
		var self = this;
		return new Promise(function (resolve, reject) {
			switch (self._mode) {
			case self.storageModes.SM_LOCAL_STORAGE:
				{
					resolve(window.localStorage.setItem(key, value));
					break;
				}
			case self.storageModes.SM_CHROME:
				{
					var keyValue = {};
					keyValue[key] = value;
					chrome.storage.local.set(keyValue, function () {
						console.log(key, value)
						resolve();
					});
					break;
				}
			default:
				{
					reject("Local storage is not available");

				}
			}
		});
	};

	return new StorageController();
});
