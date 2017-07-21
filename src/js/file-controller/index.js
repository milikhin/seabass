define(['co', 'md5', 'app/utils/storage'], function(co, md5, storage) {
    function FileController(options) {
        var self = this;
        this._flags = {
            forceSetup: options.forceSetup
        };

        //   .catch(function(err) {
        //     console.error(err);
        // });
    }


    /** API
     *
     *   getDirectory({@path: String, @root: DirEntry, @create: bool})
     *   getFiles(@dirEntry: DirEntry)
     *
     */
    FileController.prototype.renameFile = function(fileEntry, newName) {
        var self = this;
        var rootPath = self.rootEntry.name;
        return co(function*() {
            var currentName = fileEntry.fullPath;
            var filePaths = newName.split('/');
            var fileName = newName;
            var dirPaths;
            var dirEntry = self.rootEntry;
            if (filePaths.length > 1) {
                dirPaths = filePaths.slice(0, -1);
                fileName = filePaths.slice(-1)[0];
            }
            if (dirPaths) {
                for (var i = 0; i < dirPaths.length; i++) {
                    if ((i == 1 || i == 0) && (dirPaths[i] == rootPath)) {
                        // Chrome hak!
                        continue;
                    }
                    if (!dirPaths[i]) {
                        continue;
                    }
                    dirEntry = yield self.getDirectory({
                        root: dirEntry,
                        path: dirPaths[i],
                        create: true
                    });
                }
            }
            yield new Promise(function(resolve, reject) {
                fileEntry.moveTo(dirEntry, fileName, resolve, reject);
            });

            return fileEntry;
        });
    };

    FileController.prototype.deleteFile = function(fileEntry) {
        return new Promise(function(resolve, reject) {
            if (fileEntry.isDirectory) {
                return fileEntry.removeRecursively(resolve, reject);
            }
            fileEntry.remove(resolve, reject);
        });
    };

    FileController.prototype.writeFile = function(fileEntry, data) {
        var self = this;
        return co(function*() {
            var writableEntry = fileEntry;
            if (!window.LocalFileSystem && window.chrome) {
                writableEntry = yield new Promise(function(resolve, reject) {
                    chrome.fileSystem.getWritableEntry(fileEntry, resolve);
                });
            }

            writableEntry.createWriter(function(fileWriter) {
                // Writing data
                fileWriter.onwriteend = function() {
                    // console.log("Successful file write...", data);
                    fileWriter.onwriteend = function() {};
                    if (window.chrome) {
                        fileWriter.write(new Blob([data], {
                            type: 'text/plain'
                        }));
                    } else {
                        fileWriter.write(data);
                    }
                };

                fileWriter.onerror = function(e) {
                    console.log("Failed file write: " + e.toString());
                    throw e;
                };

                fileWriter.truncate(0);
            });
        });
    };

    FileController.prototype.readFile = function(fileEntry) {
        return new Promise(function(resolve, reject) {
            fileEntry.file(function(file) {
                var reader = new FileReader();

                reader.onloadend = function() {
                    resolve(this.result);
                };

                reader.readAsText(file);

            }, reject);
        });
    };

    FileController.prototype.readFileByName = function(fileName) {
        var self = this;
        var rootPath = self.rootEntry.name;
        return new Promise(function(resolve, reject) {
            var filePaths = fileName.split('/');
            var dirEntry = self.rootEntry;

            if (filePaths.length > 1) {
                var dirPaths = filePaths.slice(0, -1);
                fileName = filePaths.slice(-1)[0];
                // console.log(dirPaths, filePaths.slice(-1));
            }

            co(function*() {
                if (dirPaths) {
                    for (var i = 0; i < dirPaths.length; i++) {
                        if ((i == 1 || i == 0) && (dirPaths[i] == rootPath)) {
                            // Chrome hak!
                            continue;
                        }
                        if (!dirPaths[i]) {
                            continue;
                        }
                        dirEntry = yield self.getDirectory({
                            root: dirEntry,
                            path: dirPaths[i],
                            create: true
                        });
                    }
                }

                if (!fileName) {
                    return resolve();
                }

                dirEntry.getFile(fileName, {
                    "create": true
                }, function(fileEntry) {
                    fileEntry.nativeURL = fileEntry.nativeURL || fileEntry.fullPath;
                    fileEntry.file(function(file) {
                        var reader = new FileReader();

                        reader.onloadend = function() {
                            resolve({
                                fileEntry: fileEntry,
                                fileContent: this.result
                            });
                        };

                        reader.readAsText(file);

                    }, reject);
                }, reject);
            });
        });

    };




    FileController.prototype.getDirectory = function(options) {
        var rootEntry = options.root || this.rootEntry;
        if (!options.path) {
            throw new Error("path attribute required");
        }

        return new Promise(function(resolve, reject) {
            rootEntry.getDirectory(options.path, {
                "create": options.create || false
            }, resolve, reject);
        });
    };

    FileController.prototype.getFiles = function(dirEntry, navEnabled) {
        dirEntry = dirEntry || this.rootEntry;
        var fileStructure = [];
        var self = this;

        return co(function*() {
            if (navEnabled) {
                if (self.rootEntry == dirEntry) {
                    try {
                        var parentDirectory = yield self.getDirectory({
                            path: '../',
                            create: false
                        });

                        parentDirectory.nativeURL = parentDirectory.nativeURL || parentDirectory.fullPath;
                        fileStructure.push({
                            'text': '..',
                            'id': '__up',
                            'entry': parentDirectory,
                            'itree': {
                                state: {
                                    selectable: false
                                }
                            },
                            'children': parentDirectory.isDirectory > 0
                        });
                    } catch (err) {
                        console.error('unable to get parentDirectory', err);
                    }
                }
            }
            var directoryReader = dirEntry.createReader();
            yield new Promise(function(resolve, reject) {

                directoryReader.readEntries(function(entries) {
                    var promises = [];
                    for (var i = 0; i < entries.length; i++) {

                        promises.push(co(function*() {
                            var entry = entries[i];

                            entry.nativeURL = entry.nativeURL || entry.fullPath;
                            var fileDescription = {
                                'text': entry.name,
                                'id': md5(entry.nativeURL),
                                'entry': entry,
                                'itree': {
                                    state: {
                                        selectable: false
                                    }
                                },
                                'children': entry.isDirectory > 0
                            };

                            fileStructure.push(fileDescription);
                        }));

                    }
                    Promise.all(promises).then(function() {
                        resolve(fileStructure);
                    }, reject);
                });
            });

            // console.log(fileStructure.length);
            return fileStructure;
        });
    };


    FileController.prototype.wait = FileController.prototype.waitForInit = function() {
        return this._init();
    };


    // Private methods
    FileController.prototype._init = function() {
        var self = this;
        var forceSetup = this._flags.forceSetup;
        return co(function*() {
            try {
                if (window.chrome && forceSetup) {
                    var rootEntry = yield self._chromeChooseRootDir();
                    self.fs = {
                        root: rootEntry
                    };
                } else {
                    self.fs = yield self._getFs();
                }
            } catch (err) {
                throw err;
            }

            self.rootEntry = self.fs.root;
            var savedRootUrl = yield storage.get('rootURL');
            if (savedRootUrl && window.resolveLocalFileSystemURL) {
                self.rootEntry = yield new Promise(function(resolve, reject) {
                    window.resolveLocalFileSystemURL(savedRootUrl, function(dirEntry) {
                        resolve(dirEntry);
                    }, function(err) {
                        console.error(err);
                        storage.set('rootURL', self.fs.root.nativeURL || self.fs.root.fullPath);
                        resolve(self.fs.root);
                    });
                });
            }

            if (window.chrome) {
                storage.set('rootId', window.chrome.fileSystem.retainEntry(self.fs.root));
            }
        });
    };

    FileController.prototype._getFs = function() {
        var self = this;
        return co(function*() {
            if (window.LocalFileSystem) {
                yield new Promise(function(resolve, reject) {
                    window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, resolve, reject);
                });
            } else if (window.chrome) {
                var isRestorable = yield self._chromeIsRestorable();
                if (isRestorable) {
                    var rootEntry = yield self._chromeGetRestoredRootEntry();
                    return {
                        root: rootEntry
                    };
                } else {
                    throw new Error('Root can\'t be restored');

                }
            }
        });
    };

    FileController.prototype._chromeChooseRootDir = function() {
        return co(function*() {
            var newRootEntry = yield new Promise(function(resolve, reject) {
                chrome.fileSystem.chooseEntry({
                    type: "openDirectory"
                }, function(rootEntry) {
                    resolve(rootEntry);
                });
            });
            return newRootEntry;
        });
    };

    FileController.prototype._chromeIsRestorable = function() {
        return co(function*() {
            var rootId = yield storage.get('rootId');
            var isRestorable = false;
            if (rootId) {
                try {
                    isRestorable = yield new Promise(function(resolve, reject) {
                        chrome.fileSystem.isRestorable(rootId, function(isRestorable) {
                            resolve(isRestorable);
                        });
                    });
                } catch (err) {
                    console.error('Root can\'t be restored, but that\'s OK', err);
                }
            }

            return isRestorable;
        });
    };

    FileController.prototype._chromeGetRestoredRootEntry = function() {
        return co(function*() {
            var rootId = yield storage.get('rootId');
            var rootEntry = yield new Promise(function(resolve, reject) {
                chrome.fileSystem.restoreEntry(rootId, function(entry) {
                    resolve(entry);
                });
            });
            return rootEntry;
        });
    };

    return FileController;
});