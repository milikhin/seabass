define(['co'], function(co) {
    function DropboxClient() {
        var self = this;
        this.fsInitPromise = co(function*() {
            self._init();
        });
    }

    DropboxClient.prototype._init = function() {
        var dbx = new Dropbox({
            clientId: 'oiwrzs6wfzosfcp'
        });
        var authUrl = dbx.getAuthenticationUrl('http://localhost:8080');
        [].forEach.call(document.querySelectorAll('.dropbox-auth-link'), function(dplinkElem) {
            console.log(dplinkElem);
            dplinkElem.href = authUrl;
        });
    };

    return DropboxClient;
});
