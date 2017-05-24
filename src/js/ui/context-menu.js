define(['app/app-event'], function(AppEvent) {
    "use strict";

    class Menu {
        constructor(menuSelector, offset) {
            this.menuRootElem = document.querySelector(menuSelector);
            this.menuIsActive = false;
            this.activeClassName = "context-menu--active";
            this.offset = offset || 0;
            let self = this;

            this.menuRootElem.addEventListener('click', function(evt) {
                if (evt.target.closest('.app-action')) {
                    self.hide();
                }
            });

            document.body.addEventListener('click', function(evt) {
                // console.log(self.menuIsActive, self.menuRootElem);
                if (self.menuRootElem.contains(evt.target) || !self.menuIsActive) {
                    return;
                }

                self.hide();
            });

            AppEvent.on('menu-click', function(evt) {
                // console.log('Menu click', evt);
                self._onClick(evt.detail.target);
            });
        }

        _onClick() {
            console.log('click');
        }

        _updateState() {
            this.menuRootElem.classList[this.menuIsActive ? "add" : "remove"](this.activeClassName);
        }

        toggle() {
            let self = this;
            setTimeout(function() {
                self.menuIsActive = !self.menuIsActive;
                self._updateState();
            });
        }

        show(evt, clickHandler) {
            let self = this;
            setTimeout(function() {
                self.menuIsActive = true;
                if (evt) {
                    self.positionMenu(evt);
                }

                self._onClick = clickHandler || function() {};
                self._updateState();
            });
        }

        hide() {
            // console.log('HIDE!', this.menuRootElem);
            this.menuIsActive = false;
            this._updateState();
        }

        getPosition(evt) {
            var posx = 0;
            var posy = 0;

            if (!evt) {
                var evt = window.event;
            }

            if (evt.pageX) {
                posx = evt.pageX;
                posy = evt.pageY;
            } else if (evt.clientX) {
                posx = evt.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = evt.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }

            return {
                x: posx,
                y: posy
            };
        }

        positionMenu(evt) {
            let clickCoords = this.getPosition(evt);
            let clickCoordsX = clickCoords.x;
            let clickCoordsY = clickCoords.y;

            let styleDisplay = this.menuRootElem.style.display;
            this.menuRootElem.style.display = "block";
            let menuWidth = this.menuRootElem.offsetWidth + 4;
            let menuHeight = this.menuRootElem.offsetHeight + 4;
            this.menuRootElem.style.display = styleDisplay;

            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;



            if ((windowWidth - clickCoordsX) < menuWidth) {
                this.menuRootElem.style.left = windowWidth - menuWidth + "px";
            } else {
                this.menuRootElem.style.left = clickCoordsX + "px";
            }

            if ((windowHeight - clickCoordsY) < menuHeight) {
                this.menuRootElem.style.top = windowHeight - menuHeight + "px";
            } else {
                this.menuRootElem.style.top = clickCoordsY + "px";
            }
        }
    }

    return Menu;
});