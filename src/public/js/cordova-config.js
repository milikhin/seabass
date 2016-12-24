(function(global) {
  "use strict";

  global.seabass = {
      DB_AUTH_URL: "https://milikhin.github.io/seabass/db.html"
  };
  global.seabass.hasCordova = (document.location.protocol == "file:");
  global.seabass.hasChrome = (document.location.protocol == "chrome-extension:");
  global.seabass.initEvent = global.seabass.hasCordova ? "deviceready" : "DOMContentLoaded";

  // Init Cordova
  if (global.seabass.hasCordova) {
      var cordovaScriptElem = document.createElement('script');
      cordovaScriptElem.src = "cordova.js";
      document.getElementById('cordova-goes-after').parentElement.insertBefore(cordovaScriptElem, document.getElementById('cordova-goes-after'));
  }
})(window);
