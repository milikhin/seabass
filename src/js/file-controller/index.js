define(['co', 'md5', 'app/utils/storage'], function(co, md5, storage) {
    function FileController(options) {
        var self = this;
        this.fsInitPromise = co(function*() {
            yield self._init();
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
        }).catch(function(err) {
            console.error(err);
        });
    }


    /** API
     *
     *   getDirectory({@path: String, @root: DirEntry, @create: bool})
     *   getFiles(@dirEntry: DirEntry)
     *
     */

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
                    fileWriter.write(new Blob([data], {
                        type: 'text/plain'
                    }));
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
        return this.fsInitPromise;
    };


    // Private methods
    FileController.prototype._init = function() {
        var self = this;
        return co(function*() {
            try {
                self.fs = yield self._getFs();
                // console.log('file system open: ' + self.fs.name);
            } catch (err) {
                console.error(err);
                throw err;
            }
        });
    };

    FileController.prototype._getFs = function() {
        return new Promise(function(resolve, reject) {
            // console.log(window.LocalFileSystem, chrome);
            if (window.LocalFileSystem) {
                window.requestFileSystem(window.LocalFileSystem.PERSISTENT, 0, resolve, reject);
            } else if (chrome) {
                chrome.fileSystem.chooseEntry({
                    type: "openDirectory"
                }, function(rootEntry) {
                    resolve({
                        root: rootEntry
                    });
                });
            }
        });
    };

    return FileController;
});