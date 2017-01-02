define([], function() {
    "use strict";

    class Menu {
        constructor(options) {
            this.handler = options.handler;
            this.rootElem = document.createElement('div');
            this.rootElem.className = "context-menu";

            this._wrapperElem = document.createElement('ul');
            this._wrapperElem.className = "context-menu__content";
            this.rootElem.appendChild(this._wrapperElem);

            options.items.forEach(function(item) {
                let itemElem = document.createElement('li');
                let buttonElem = document.createElement('button');
                buttonElem.innetHTML = item.label;
                buttonElem.type = "button";
                itemElem.appendChild(buttonElem);

                this.rootElem.appendChild(itemElem);
            }, this);

            // this._attachEventHandler();
        }

//         show(parentElement) {
//             let self = this;
//             parentElem.parentElement.insertBefore(self.rootElem, parentElem.nextSibling);
//             this.rootElem.addEventListener('click', function(evt) {
//                 if (self.handler) {
//                     return self.handler();
//                 }

//                 require(['app/app-event'], function(AppEvent) {
//                     console.log('!!');
//                 });
//             });
//         }
    }


    return Menu;
});