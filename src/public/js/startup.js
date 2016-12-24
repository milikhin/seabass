(function(global){
  "use strict";

  document.addEventListener(global.seabass.initEvent, function() {
      require(['app/index'], function(App) {
          (new App()).initialize();
      });
  });
})(window);
