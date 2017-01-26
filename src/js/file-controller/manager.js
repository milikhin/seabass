define([
    './index',
    './dropbox',
    'app/utils/storage',
    'co',
    'app/app-event',
    'app/settings'
], function(FileController, DropboxClient, storage, co, AppEvent, Settings) {
    function FileManager() {
        var self = this;


        // TODO: move to Settings
        co(function*() {
            self._fsType = yield Settings.getFsType();
            // console.log(self._fsType);
            self._initFs().then(function() {}, function(err) {
                console.error(err);
            });
        });
    }

    FileManager.prototype._initFs = function() {
        var self = this;
        return co(function*() {
            console.log('init FS type', self._fsType);
            switch (self._fsType) {
                case Settings.FS_TYPES.FS_NATIVE:
                    {
                        // if (window.LocalFileSystem) {
                        try {
                            self.fsController = new FileController();
                            yield self.fsController.waitForInit();
                            AppEvent.dispatch({
                                type: 'fsready'
                            });
                        } catch (err) {
                            throw new Error('FS is not supported, ' + self._fsType);
                        }

                        break;
                    }
                case Settings.FS_TYPES.FS_DROPBOX:
                    {
                        self.fsController = new DropboxClient();

                        yield self.fsController.wait();
                        AppEvent.dispatch({
                            type: 'fsready'
                        });

                        break;
                    }
            }
        });
    };

    FileManager.prototype.open = function(path) {
        return this.fsController.readFileByName(path);
    };

    FileManager.prototype.delete = function(fileEntry) {
        return this.fsController.deleteFile(fileEntry);
    };

    FileManager.prototype.rename = function(fileEntry, newName) {
        if (!newName) {
            throw new Error('FileName is required');
        }
        return this.fsController.renameFile(fileEntry, newName);
    };

  	FileManager.prototype.create = function(path) {
        if (!path) {
            throw new Error('FileName is required');
        }
        return this.fsController.readFileByName(path);
    };

    FileManager.prototype.getFiles = function(dirEntry, navEnabled) {
        return this.fsController.getFiles(dirEntry, navEnabled);
    };

    FileManager.prototype.getFileContent = function(fileEntry) {
        return this.fsController.readFile(fileEntry);
    };

    FileManager.prototype.writeFile = function(fileEntry, data) {
        return this.fsController.writeFile(fileEntry, data);
    };

    FileManager.prototype.test = function() {
        return this.fsController.getDirectory({
            path: '../',
            create: false
        });
    };

    FileManager.prototype.getRootURL = function() {
        if (this.fsController.getRootUrl) {
            return this.fsController.getRootUrl();
        }
        // console.log(this.getRoot(), this.fsController);
        var url = this.getRoot().nativeURL || this.getRoot().fullPath;
        var rootUrl = 'file://localhost';
        var shortenedUrl = url.slice(url.indexOf(rootUrl) + rootUrl.length, url.length);

        return shortenedUrl;
    };

    FileManager.prototype.getRoot = function() {
        return this.fsController.rootEntry;
    };

    FileManager.prototype.setRoot = function(rootEntry) {
        storage.set('rootURL', rootEntry.nativeURL || rootEntry.fullPath);
        this.fsController.rootEntry = rootEntry;
    };
    FileManager.prototype.unsetRoot = function() {
        storage.set('rootURL', this.fsController.fs.root.nativeURL || this.fsController.fs.root.fullPath);
        this.fsController.rootEntry = this.fsController.fs.root;
    };

    return FileManager;
});