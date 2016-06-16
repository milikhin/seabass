define(['./index', 'co'], function (FileController, co) {
	function FileManager() {
		var self = this;

		co(function* () {
			// initialize fs access;
			console.log('1');
			self.fsController = new FileController();
			console.log('2');
			yield self.fsController.waitForInit();

			document.body.dispatchEvent(new CustomEvent('fsready', {
        bubbles: true
      }));
		}).catch(function (err) {
			console.error(err);
		});

	}


	FileManager.prototype.getFiles = function (dirEntry) {
		return this.fsController.getFiles(dirEntry);
	};

  FileManager.prototype.getFileContent = function(fileEntry) {
    return this.fsController.readFile(fileEntry);
  };

  FileManager.prototype.writeFile = function (fileEntry, data) {
    return this.fsController.writeFile(fileEntry, data);
  };

	return FileManager;
});
