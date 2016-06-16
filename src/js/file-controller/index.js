define(['co'], function (co) {
	function FileController(options) {
		var self = this;
		this.fsInitPromise = co(function* () {
			yield self._init();
			self.rootEntry = (options && options.root) ? yield self.getDirectory({
				'root': self.fs.root,
				'path': options.root,
				'create': true
			}) : self.fs.root;
		}).catch(function (err) {
			console.error(err);
		});
	}

	/** API
	 *
	 *   getDirectory({@path: String, @root: DirEntry, @create: bool})
	 *   getFiles(@dirEntry: DirEntry)
	 *
	 */

	FileController.prototype.writeFile = function (fileEntry, data) {
		return new Promise(function (resolve, reject) {
			// Create a FileWriter object for our FileEntry (log.txt).
			fileEntry.createWriter(function (fileWriter) {

				fileWriter.onwriteend = function () {
					console.log("Successful file write...");
					return data;
					// self.readFile(fileEntry).then(resolve, reject);
				};

				fileWriter.onerror = function (e) {
					console.log("Failed file write: " + e.toString());
					reject(e);
				};

				fileWriter.write(data);
			});
		});
	};

	FileController.prototype.readFile = function (fileEntry) {
		return new Promise(function (resolve, reject) {
			fileEntry.file(function (file) {
				var reader = new FileReader();

				reader.onloadend = function () {
					console.log("Successful file read: " + this.result);
					resolve(this.result);
				};

				reader.readAsText(file);

			}, reject);
		});
	};


	FileController.prototype.getDirectory = function (options) {
		var self = this;
		var rootEntry = options.root || this.rootEntry;
		if(!options.path) {
			throw new Error("path attribute required");
		}

		return new Promise(function (resolve, reject) {
			rootEntry.getDirectory(options.path, {
				"create": options.create || false
			}, resolve, reject);
		});
	};

	FileController.prototype.getFiles = function (dirEntry) {
		console.log('DE', dirEntry);
		dirEntry = dirEntry || this.rootEntry;
		var fileStructure = [];
		var self = this;

		return new Promise(function (resolve, reject) {
			var directoryReader = dirEntry.createReader();
			directoryReader.readEntries(function (entries) {
				for(var i = 0; i < entries.length; i++) {
					var entry = entries[i];
					console.log(entries[i]);
					var fileDescription = {
						'text': entry.name,
						'id': entry.name,
						'entry': entry,
						'itree': {
							state: {
								selectable: false
							}
						},
						'children': entry.isDirectory > 0
					};

					fileStructure.push(fileDescription);
				}



				console.log(fileStructure);
				resolve(fileStructure);
			}, reject);
		});
	};


	FileController.prototype.waitForInit = function () {
		return this.fsInitPromise;
	};


	// Private methods

	FileController.prototype._init = function () {
		var self = this;
		return co(function* () {
			try {
				self.fs = yield self._getFs();
				console.log('file system open: ' + self.fs.name);

			} catch(err) {
				console.error(err);
			}
		});
	};

	FileController.prototype._getFs = function () {
		return new Promise(function (resolve, reject) {
			window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, resolve, reject);
		});
	};

	return FileController;
});
