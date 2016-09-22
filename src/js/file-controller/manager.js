define(['./index', 'co'], function(FileController, co) {
    function FileManager() {
        var self = this;

        co(function*() {
            // initialize fs access;
            self.fsController = new FileController();
            yield self.fsController.waitForInit();

            document.body.dispatchEvent(new CustomEvent('fsready', {
                bubbles: true
            }));
        }).catch(function(err) {
            console.error(err);
        });
    }

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
