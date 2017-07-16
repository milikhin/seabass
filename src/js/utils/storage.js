define([], function() {
    "use strict";

    function StorageController() {
        this.storageModes = {
            "SM_NONE": 0,
            "SM_LOCAL_STORAGE": 1,
            "SM_CHROME": 2,
        };

        try {
            if (!window.chrome) {
                this._mode = window.localStorage ? this.storageModes.SM_LOCAL_STORAGE : this.storageModes.SM_NONE;
            } else {
                this._mode = chrome.storage.local ? this.storageModes.SM_CHROME : this.storageModes.SM_NONE;
            }
        } catch (err) {
            this._mode = this.storageModes.SM_NONE;
        }

    }

    StorageController.prototype.get = function(key) {
        var self = this;
        return new Promise(function(resolve, reject) {
            switch (self._mode) {
                case self.storageModes.SM_LOCAL_STORAGE:
                    {
                        resolve(window.localStorage.getItem(key));
                        break;
                    }
                case self.storageModes.SM_CHROME:
                    {
                        chrome.storage.local.get(key, function(values) {
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

    StorageController.prototype.set = function(key, value) {
        var self = this;
        return new Promise(function(resolve, reject) {
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
                        chrome.storage.local.set(keyValue, function() {
                            // console.log(key, value)
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