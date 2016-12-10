define(['./index', './dropbox', 'co', 'app/app-event', 'app/settings'], function(FileController, DropboxClient, co, AppEvent, Settings) {
    function FileManager() {
        var self = this;
        this.FS_TYPES = {
            "FS_NATIVE": 1,
            "FS_DROPBOX": 2
        };

        // TODO: move to Settings
        var savedFsType = Settings.get('fileTreeSource');
        switch (savedFsType) {
            case 'dropbox':
                {
                    this._fsType = this.FS_TYPES.FS_DROPBOX;
                    break;
                }
            case 'native':
                {
                    this._fsType = this.FS_TYPES.FS_NATIVE;
                  	break;
                }
            default:
                {
                    if (window.LocalFileSystem) {
                        this._fsType = this.FS_TYPES.FS_NATIVE;
                    } else {
                        this._fsType = this.FS_TYPES.FS_DROPBOX;
                    }
                }
        }
      	Settings.set('fileTreeSource', this._fsType);


        this._initFs().then(function() {}, function(err) {
            console.error(err);
        });
    }

    FileManager.prototype._initFs = function() {
        var self = this;
        return co(function*() {
            console.log('init FS type', self._fsType);
            switch (self._fsType) {
                case self.FS_TYPES.FS_NATIVE:
                    {
                        if (window.LocalFileSystem) {
                            self.fsController = new FileController();
                            yield self.fsController.waitForInit();
                            AppEvent.dispatch({
                                type: 'fsready'
                            });
                        } else {
                            throw new Error('FS is not supported, ' + self._fsType);
                        }

                        break;
                    }
                case self.FS_TYPES.FS_DROPBOX:
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
        var url = this.getRoot().nativeURL;
        var rootUrl = 'file://localhost';
        var shortenedUrl = url.slice(url.indexOf(rootUrl) + rootUrl.length, url.length);

        return shortenedUrl;
    };

    FileManager.prototype.getRoot = function() {
        return this.fsController.rootEntry;
    };

    FileManager.prototype.setRoot = function(rootEntry) {
        localStorage.setItem('rootURL', rootEntry.nativeURL);
        this.fsController.rootEntry = rootEntry;
    };
    FileManager.prototype.unsetRoot = function() {
        localStorage.setItem('rootURL', this.fsController.fs.root.nativeURL);
        this.fsController.rootEntry = this.fsController.fs.root;
    };

    return FileManager;
});
