define(['app/file-controller/dropbox', 'clipboard'], function(DropboxClient, Clipboard) {
    return function() {
        var dbxClient = new DropboxClient();
      	if(dbxClient.isAuthenticated()) {
        	document.getElementById('dropbox-get-token').style.display = "none";	
      	} else {
          document.getElementById('dropbox-info').style.display = "none";	
        }
        document.getElementById('dropbox-token').value = dbxClient._getAccessToken();
        document.getElementById('dropbox-token-btn').dataset.clipboardText = dbxClient._getAccessToken();
      	document.getElementById('dropbox-token-btn').addEventListener('click', function() {
          document.getElementById('dropbox-token-btn-text').innerHTML = 'Copied to clipboard!';
        });
      
      	new Clipboard('.clipboard-btn');
    }
});