define(['co', 'md5', 'app/utils/index'], function(co, md5, utils) {
    "use strict";

    function DropboxClient() {
        var self = this;
      	this.WRITE_TIMEOUT = 2500;
        
      	this.rootPath = '';
        this.fsInitPromise = co(function*() {
            yield self._init();
        });
    }

    DropboxClient.prototype.wait = function() {
        return this.fsInitPromise;
    };

    DropboxClient.prototype._init = function() {
        var self = this;

        return new Promise(function(resolve, reject) {
            // Search for Auth token      
            if (!self.isAuthenticated()) {
                if (self._getAccessTokenFromUrl()) {
                    self._saveAccessTokenFromUrl();
                }
            }

            // Try to connect to DB if token is found
            if (self.isAuthenticated()) {
                self.dbx = new Dropbox({
                    accessToken: self._getAccessToken()
                });

                resolve(self.dbx);
                // Get token of there is no one yet
            } else {
                var dbx = new Dropbox({
                    clientId: 'oiwrzs6wfzosfcp'
                });

                var authUrl = window.seabass.hasCordova ? window.seabass.DB_AUTH_URL : dbx.getAuthenticationUrl(location.toString());
                [].forEach.call(document.querySelectorAll('.dropbox-auth-link'), function(dplinkElem) {
                    console.log(dplinkElem);
                    dplinkElem.href = authUrl;
                });

                reject(dbx);
            }
        })

    };

    DropboxClient.prototype.getRootUrl = function() {
        return this.rootPath;
    }

    DropboxClient.prototype.getFiles = function(dirEntry, navEnabled) {
        var dirPath = dirEntry ? dirEntry.path : this.rootPath;
        console.log(dirPath);
        var fileStructure = [];
        var self = this;

        return co(function*() {
            var fileEntriesResponse = yield self.dbx.filesListFolder({
                path: dirPath
            });

            var fileEntries = fileEntriesResponse.entries;
            console.log(fileEntries);

            fileEntries.forEach(function(entry) {
                var fileDescription = {
                    'text': entry.name,
                    'id': md5(entry.id),
                    'entry': {
                        path: entry.path_display,
                        nativeURL: entry.path_display,
                        isDirectory: entry['.tag'] == "folder"
                    },
                    'itree': {
                        state: {
                            selectable: false
                        }
                    },
                    'children': entry['.tag'] == "folder"
                };

                fileStructure.push(fileDescription);
            });

            return fileStructure;
        });

    };

    DropboxClient.prototype.readFile = function(fileEntry) {
        var self = this;
        return co(function*() {
            var file = yield self.dbx.filesDownload({
                path: fileEntry.path
            });
            console.log(window.w = file);

            var fileContent = yield new Promise(function(resolve, reject) {
                var reader = new FileReader();
                reader.addEventListener("loadend", function() {
                    // reader.result contains the contents of blob as a typed array
                    resolve(reader.result);
                });

                //reader.addEventListener("error", function() {
                // reader.result contains the contents of blob as a typed array
                //  reject();
                //});

                reader.readAsText(file.fileBlob);
            });

            return fileContent;
        });
    };

    DropboxClient.prototype.writeFile = function(fileEntry, data) {
        var self = this;
        return new Promise(function(resolve, reject) {
            if (self._writeTimeout) {
                clearTimeout(self._writeTimeout);
            }
            self._writeTimeout = setTimeout(function() {
                return co(function*() {
                    yield self.dbx.filesUpload({
                        path: fileEntry.path,
                        contents: data,
                        mode: {
                            ".tag": "overwrite"
                        }
                    });
                });
            }, self.WRITE_TIMEOUT);

            resolve(data);
        });



    };

    // Authentication
    DropboxClient.prototype._getAccessTokenFromUrl = function() {
        return utils.parseQueryString(window.location.hash).access_token;
    };

    DropboxClient.prototype._setAccessToken = function(token) {
        localStorage.setItem('dropbox-token', token);
    };

    DropboxClient.prototype._getAccessToken = function() {
        return localStorage.getItem('dropbox-token');
    };

    DropboxClient.prototype.isAuthenticated = function() {
        return !!this._getAccessToken();
    };

    DropboxClient.prototype._saveAccessTokenFromUrl = function() {
        return this._setAccessToken(this._getAccessTokenFromUrl());
    };

    return DropboxClient;
});