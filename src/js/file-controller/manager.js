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


    FileManager.prototype.getFiles = function(dirEntry) {
        return this.fsController.getFiles(dirEntry);
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

    return FileManager;
});
