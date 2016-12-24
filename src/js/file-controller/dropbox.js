define(['co', 'app/utils/storage', 'md5', 'app/utils/index'], function (co, storage, md5, utils) {
	"use strict";

	function DropboxClient() {
		var self = this;
		this.WRITE_TIMEOUT = 2500;

		this.rootPath = '';
		this.fsInitPromise = co(function* () {
			yield self._init();
		});
	}

	DropboxClient.prototype.wait = function () {
		return this.fsInitPromise;
	};

	DropboxClient.prototype._init = function () {
		var self = this;

		return co(function* () {
			// Search for Auth token
			var isAuthenticated = yield self.isAuthenticated();
			console.log('ia', isAuthenticated);
			if (!isAuthenticated) {
				if (self._getAccessTokenFromUrl()) {
					yield self._saveAccessTokenFromUrl();
				}
			}

			// Try to connect to DB if token is found
			if (isAuthenticated) {
				self.dbx = new Dropbox({
					accessToken: yield self._getAccessToken()
				});

				return self.dbx;
				// Get token of there is no one yet
			} else {
				var dbx = new Dropbox({
					clientId: 'oiwrzs6wfzosfcp'
				});

				var authUrl = (window.seabass.hasCordova || window.seabass.hasChrome) ? window.seabass.DB_AUTH_URL : dbx.getAuthenticationUrl(location.toString());
				[].forEach.call(document.querySelectorAll('.dropbox-auth-link'), function (dplinkElem) {
					dplinkElem.href = authUrl;
					dplinkElem.dataset.href = authUrl;
					dplinkElem.onclick = function () {
						window.open(dplinkElem.dataset.href, '_blank');
					};
				});

				throw dbx;
			}
		});
	};

	DropboxClient.prototype.getRootUrl = function () {
		return this.rootPath;
	};

	DropboxClient.prototype.getFiles = function (dirEntry, navEnabled) {
		var dirPath = dirEntry ? dirEntry.path : this.rootPath;
		var fileStructure = [];
		var self = this;

		return co(function* () {
			var fileEntriesResponse = yield self.dbx.filesListFolder({
				path: dirPath
			});

			var fileEntries = fileEntriesResponse.entries;

			fileEntries.forEach(function (entry) {
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


	DropboxClient.prototype._checkDirectory = function (dirName, parentPath) {
		var self = this;
		return co(function* () {
			var fileEntriesResponse = yield self.dbx.filesListFolder({
				path: parentPath || self.rootPath
			});
			var fileEntries = fileEntriesResponse.entries;
			var dirFound = false;
			fileEntries.forEach(function (entry) {
				if (entry.name == dirName) {
					dirFound = true;
				}
			});

			return dirFound;
		});
	};

	DropboxClient.prototype._createDirectory = function (dirName, parentPath) {
		var self = this;
		return co(function* () {
			var alreadyExists = yield self._checkDirectory(dirName, parentPath);
			if (!alreadyExists) {
				yield self.dbx.filesCreateFolder({
					path: parentPath + "/" + dirName
				});
			}
		});
	};

	DropboxClient.prototype.readFileByName = function (filePath) {
		var self = this;

		return new Promise(function (resolve, reject) {
			var filePaths = filePath.split('/');
			var dirEntry = self.rootEntry;
			var dirPath = "";

			if (filePaths.length > 1) {
				var dirPaths = filePaths.slice(0, -1);
				var fileName = filePaths.slice(-1)[0];
				// console.log(dirPaths, filePaths.slice(-1));
			}

			co(function* () {
				if (dirPaths) {
					for (var i = 0; i < dirPaths.length; i++) {
						if (!dirPaths[i]) {
							continue;
						}
						console.log('checking ', dirPath + "/" + dirPaths[i]);
						yield self._createDirectory(dirPaths[i], dirPath);
						dirPath += "/" + dirPaths[i];
					}
				}

				if (!fileName) {
					return resolve();
				}

				// Check file existance
				var fileEntriesResponse = yield self.dbx.filesListFolder({
					path: dirPath
				});

				var fileEntries = fileEntriesResponse.entries;
				var fileFound = false;
				fileEntries.forEach(function (entry) {
					if (entry.name == fileName) {
						fileFound = true;
					}
				});
				var fileEntry = {
					path: dirPath + "/" + fileName
				};

				if (!fileFound) {
					yield self.writeFile(fileEntry);
				}

				var fileContent = yield self.readFile(fileEntry);
				resolve({
					fileEntry: {
						path: fileEntry.path,
						nativeURL: fileEntry.path,
						isDirectory: false
					},
					fileContent: fileContent
				});
			}).catch(function (err) {
				console.error(err);
			});
		});

	};

	DropboxClient.prototype.readFile = function (fileEntry) {
		var self = this;
		return co(function* () {
			var file = yield self.dbx.filesDownload({
				path: fileEntry.path ? fileEntry.path : fileEntry
			});

			var fileContent = yield new Promise(function (resolve, reject) {
				var reader = new FileReader();
				reader.onloadend = function () {
					// reader.result contains the contents of blob as a typed array
					resolve(reader.result);
				};

				//reader.addEventListener("error", function() {
				// reader.result contains the contents of blob as a typed array
				//  reject();
				//});

				reader.readAsText(file.fileBlob);
			});

			return fileContent;
		});
	};

	DropboxClient.prototype.writeFile = function (fileEntry, data) {
		var self = this;
		return new Promise(function (resolve, reject) {
			if (self._writeTimeout) {
				clearTimeout(self._writeTimeout);
			}
			self._writeTimeout = setTimeout(function () {
				return co(function* () {
					yield self.dbx.filesUpload({
						path: fileEntry.path,
						contents: data,
						mode: {
							".tag": "overwrite"
						}
					});

					resolve(data);
				});
			}, self.WRITE_TIMEOUT);
		});
	};

	// Authentication
	DropboxClient.prototype._getAccessTokenFromUrl = function () {
		return utils.parseQueryString(window.location.hash).access_token;
	};

	DropboxClient.prototype._setAccessToken = function (token) {
		return storage.set('dropbox-token', token);
	};

	DropboxClient.prototype._getAccessToken = function () {
		return co(function* () {
			var token = yield storage.get('dropbox-token');
			return token;
		});
	};

	DropboxClient.prototype.isAuthenticated = function () {
		var self = this;
		return co(function* () {
			var token = yield self._getAccessToken();
			console.log(token);
			return token;
		});
	};

	DropboxClient.prototype._saveAccessTokenFromUrl = function () {
		return this._setAccessToken(this._getAccessTokenFromUrl());
	};

	return DropboxClient;
});
