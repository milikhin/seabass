/*
 * Copyright (C) 2013 Adnane Belmadiaf <daker@ubuntu.com>
 * License granted by Canonical Limited
 *
 * This file is part of ubuntu-html5-ui-toolkit.
 *
 * This package is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or
 * (at your option) any later version.

 * This package is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this program. If not, see
 * <http://www.gnu.org/licenses/>
 */

/**
 * @module UbuntuUI
 */

/**
 * UbuntuUI is the critical Ubuntu HTML5 framework class. You need to construct an UbuntuUI object and initialize it to have an Ubuntu HTML5 app. You then use this object to access Ubuntu HTML5 objects (and object methods) that correspond to the Ubuntu HTML5 DOM elements.

Note: The UbuntuUI object is "UI" in all API doc examples.
 * @class UbuntuUI
 * @constructor
 * @example
      var UI = new UbuntuUI();
      window.onload = function () {
        UI.init();
        UI.pagestack.push('pageid');
        [...]
      };
 */
var UbuntuUI = (function() {

    PAGESTACK_BACK_ID = 'ubuntu-pagestack-back';

    function __hasPageStack(document) {
        return document.querySelectorAll("[data-role='pagestack']").length >= 1;
    };

    function __hasTabs(document) {
        return document.querySelectorAll("[data-role='tabs']").length >= 1;
    };

    function __createBackButtonListItem() {
        var backBtn = document.createElement('button');
        backBtn.setAttribute('data-role', 'back-btn');
        backBtn.setAttribute('id', PAGESTACK_BACK_ID + '-' + Math.floor(Math.random()));
        backBtn.disabled = true;
        return backBtn;
    };

    function UbuntuUI() {
        var U = this;
        U.isTouch = "ontouchstart" in window;
        U.touchEvents = {
            touchStart: ['touchstart', 'mousedown'],
            touchMove: ['touchmove', 'mousemove'],
            touchEnd: ['touchend', 'mouseup'],
            touchLeave: ['mouseleave'],
        };

        this._prevScrollTop = this._y = 0;

        this._header = document.querySelector('[data-role="header"]');
        if ( ! this._header) {
            return;
        }
        this._content = document.querySelector('[data-role="content"]');
        this._headerHeight = this._header.offsetHeight + 17;
        this._content.style.paddingTop = this._headerHeight + "px";

        var self = this;
        window.onscroll = function(event) {
            var scrollTop = window.pageYOffset;
            var y = Math.min(self._headerHeight, Math.max(0, (self._y + scrollTop - self._prevScrollTop)));

            if (self._prevScrollTop > scrollTop && scrollTop > 0) {
                y = Math.max(y, 0);
            }

            if (y !== self._y) {
                requestAnimationFrame(self.__transformHeader.bind(self, y));
            }

            self._prevScrollTop = scrollTop;
            self._y = y;
        };
    };

    UbuntuUI.prototype = {
        __setupPageStack: function(d) {

            var header = d.querySelector("[data-role='header']");

            this._tabTitle = document.createElement('div');
            this._tabTitle.setAttribute('data-role', 'tabtitle');

            var tabTitleValue = document.createTextNode('');
            this._tabTitle.appendChild(tabTitleValue);

            var backBtn = __createBackButtonListItem();
            header.insertBefore(backBtn, header.firstChild);

            var self = this;
            backBtn.onclick = function(e) {
                if (self._pageStack.depth() > 1) {
                    self._pageStack.pop();
                }
                e.preventDefault();
            };

            this._content = document.querySelector('[data-role="content"]');
            this._overlay = document.createElement('div');
            this._overlay.setAttribute('data-role', 'overlay');
            this._content.appendChild(this._overlay);

            // FIXME: support multiple page stack & complex docs?
            var pagestacks = d.querySelectorAll("[data-role='pagestack']");
            if (pagestacks.length == 0)
                return;
            var pagestack = pagestacks[0];

            this._pageStack = new Pagestack(pagestack);

            var pages = pagestack.querySelectorAll("[data-role='page']");
            if (pages.length > 0) {
                this._pageStack.push(pages[0].getAttribute('id'));
            }

            this._pageActions = null;

            header.appendChild(this._tabTitle);
        },

        __createPageActions: function() {
            if ( ! this._pageActions) {
                this._pageActions = document.createElement('div');
                this._pageActions.setAttribute('data-role', 'actions');
                var header = document.querySelector("[data-role='header']");
                header.appendChild(this._pageActions);
            }
        },

        __transformHeader: function(y) {
            var s = this._header.style;
            this.__translateY(s, -y);
        },

        __translateY: function(s, y) {
            s.webkitTransform = s.transform = 'translate3d(0, ' + y + 'px, 0)';
        },

        __setupPage: function(document) {
            if (this._pageStack != null)
                return;
            if (__hasPageStack(document)) {
                this.__setupPageStack(document);
            }
        },

        __setupActionsBar: function(document) {

            var actionBar;

            var apptabsElements = document.querySelectorAll('[data-role=tab]');
            if (apptabsElements.length > 0) {
                for (var idx = 0; idx < apptabsElements.length; ++idx) {
                    var footers = apptabsElements[idx].querySelectorAll("[data-role='footer']");
                    if (footers.length > 0) {
                        // TODO: validate footer count: should be 1 footer
                        actionBar = this.__setupTabAction(footers[0], apptabsElements[idx]);
                        if (footers[0] != null) footers[0].remove();
                    }
                }
            }

            var apppagesElements = document.querySelectorAll('[data-role=page]');
            if (apppagesElements.length > 0) {
                for (var idx = 0; idx < apppagesElements.length; ++idx) {
                    var footers = apppagesElements[idx].querySelectorAll("[data-role='footer']");
                    if (footers.length > 0) {
                        // TODO: validate footer count: should be 1 footer
                        actionBar = this.__setupPageAction(footers[0], apppagesElements[idx]);
                        if (footers[0] != null) footers[0].remove();
                    }
                }
            }
        },

        __setupTabs: function(document) {
            if (this._tabs != null)
                return;
            if (__hasTabs(document)) {
                if (typeof Tabs != 'undefined' && Tabs) {
                    var apptabsElements = document.querySelectorAll('[data-role=tabs]');
                    if (apptabsElements.length == 0)
                        return;
                    this._tabs = new Tabs(apptabsElements[0]);
                    this._tabs.onTabChanged(function(e) {
                        if (!e || !e.infos)
                            return;
                        if (e.infos.tabId) {
                            (new Tab(e.infos.tabId)).activate();
                        }
                    }.bind(this));
                }
            }
        },


        __setupTabAction: function(oldFooter, parent) {
            this._oldFooter = oldFooter;
            this._oldFooterParent = parent;

            this._overlay = document.querySelector('[data-role="overlay"]');

            this.__createPageActions();

            var newActionsBar = document.querySelector('[data-role="actions"]');
            if ( ! newActionsBar)
                return;

            if (!this._oldFooter)
                return;

            var actionBar = this._oldFooter,
                actions = actionBar.querySelector('ul'),
                actionButtons = actionBar.querySelectorAll('ul li'),
                i = actionButtons.length;
            newActionsBarWrapper = document.createElement('div');
            newActionsBarWrapper.setAttribute("data-role", "actions-wrapper");
            newActionsBarWrapper.setAttribute("id", "actions_" + this._oldFooterParent.id);

            if (actionButtons.length > 2) {
                // Maintain the first item then replace the rest with an action overflow
                var firstAction = actionButtons[0],
                    overflowList = document.createElement('ul'),
                    /* Action Button */
                    firstButton = document.createElement('button'),
                    overflowButton = document.createElement('button'),
                    /* Icon */
                    firstIcon = firstAction.querySelector('img').getAttribute('src'),
                    /* ID*/
                    firstId = firstAction.querySelector('a').getAttribute('id'),
                    k = 1;

                if (this._tabs && this._tabs._tabsitems.length == 1) {
                    k = 2;
                    this._tabs._tabTitle.style.width = "calc(100% - 155px)";

                    // Maintain the second item
                    var secondAction = actionButtons[1],
                        /* Action Button */
                        secondButton = document.createElement('button'),
                        /* Icon */
                        secondIcon = secondAction.querySelector('img').getAttribute('src'),
                        /* ID*/
                        secondId = secondAction.querySelector('a').getAttribute('id');
                }

                overflowList.setAttribute('data-role', 'actions-overflow-list');

                // Hide the overflow
                for (var x = k; x < i; x++) {
                    var li = document.createElement('li'),
                        a_id = actionButtons[x].querySelector('a').getAttribute('id'),
                        lbl = actionButtons[x].querySelector('span').innerHTML,
                        icon = actionButtons[x].querySelector('img').getAttribute('src');

                    li.innerHTML = lbl;
                    li.setAttribute('id', a_id);

                    li.style.backgroundImage = 'url( ' + icon + ' )';
                    overflowList.appendChild(li);

                    li.onclick = function(e) {
                        overflowList.classList.toggle('opened');
                        self._overlay.classList.toggle('active');
                        e.preventDefault();
                    };
                }

                // Add the action overflow button
                overflowButton.setAttribute('data-role', 'actions-overflow-icon');

                //firstButton.style.backgroundImage = 'url( ' + firstIcon + ' )';
                firstButton.setAttribute('id', firstId);
                document.styleSheets[0].addRule('#' + firstId + ':after', 'background-image: url("' + firstIcon + '");');

                newActionsBarWrapper.appendChild(firstButton);
                if (this._tabs != 'undefined' && this._tabs) {
                    if (this._tabs._tabsitems && this._tabs._tabsitems.length == 1) {
                        secondButton.setAttribute('id', secondId);
                        document.styleSheets[0].addRule('#' + secondId + ':after', 'background-image: url("' + secondIcon + '");');
                        newActionsBarWrapper.appendChild(secondButton);
                    }
                }
                newActionsBarWrapper.appendChild(overflowButton);
                newActionsBarWrapper.appendChild(overflowList);

                self = this;
                overflowButton.onclick = function(e) {
                    overflowList.classList.toggle('opened');
                    self._overlay.classList.toggle('active');
                    self._tabs._tabs.classList.remove('opened');
                    e.preventDefault();
                };
            } else {

                for (var y = 0; y < i; y++) {
                    var actionButton = document.createElement('button'),
                        actionButton_lbl = actionButtons[y].querySelector('span').innerHTML,
                        actionButton_icon = actionButtons[y].querySelector('img').getAttribute('src'),
                        actionButton_id = actionButtons[y].querySelector('a').getAttribute('id');

                    actionButton.setAttribute('id', actionButton_id);
                    document.styleSheets[0].addRule('#' + actionButton_id + ':after', 'background-image: url("' + actionButton_icon + '");');
                    newActionsBarWrapper.appendChild(actionButton);
                }
            }

            newActionsBar.appendChild(newActionsBarWrapper);
        },


        __setupPageAction: function(oldFooter, parent) {
            this._oldFooter = oldFooter;
            this._oldFooterParent = parent;
            this._overlay = document.querySelector('[data-role="overlay"]');

            this.__createPageActions();
            
            var newActionsBar = document.querySelector('[data-role="actions"]');
            if (! newActionsBar)
                return;

            if (!this._oldFooter)
                return;

            var actionBar = this._oldFooter,
                actions = actionBar.querySelector('ul'),
                actionButtons = actionBar.querySelectorAll('ul li'),
                i = actionButtons.length;

            newActionsBarWrapper = document.createElement('div');
            newActionsBarWrapper.setAttribute("data-role", "actions-wrapper");
            newActionsBarWrapper.setAttribute("id", "actions_" + this._oldFooterParent.id);

            if (actionButtons.length > 2) {
                // Maintain the first then replace the rest with an action overflow
                var firstAction = actionButtons[0],
                    overflowList = document.createElement('ul'),
                    /* Actions Button */
                    firstButton = document.createElement('button'),
                    overflowButton = document.createElement('button'),
                    /* Icon */
                    firstIcon = firstAction.querySelector('img').getAttribute('src'),
                    /* ID*/
                    firstId = firstAction.querySelector('a').getAttribute('id'),
                    k = 2;

                this._tabTitle.style.width = "calc(100% - 155px)";

                // Maintain the second item
                var secondAction = actionButtons[1],
                    /* Action Button */
                    secondButton = document.createElement('button'),
                    /* Icon */
                    secondIcon = secondAction.querySelector('img').getAttribute('src'),
                    /* ID*/
                    secondId = secondAction.querySelector('a').getAttribute('id');

                overflowList.setAttribute('data-role', 'actions-overflow-list');

                // Hide the overflow
                for (var x = k; x < i; x++) {
                    var li = document.createElement('li'),
                        a_id = actionButtons[x].querySelector('a').getAttribute('id'),
                        lbl = actionButtons[x].querySelector('span').innerHTML,
                        icon = actionButtons[x].querySelector('img').getAttribute('src');

                    li.innerHTML = lbl;
                    li.setAttribute('id', a_id);

                    li.style.backgroundImage = 'url( ' + icon + ' )';
                    overflowList.appendChild(li);

                    li.onclick = function(e) {
                        overflowList.classList.toggle('opened');
                        self._overlay.classList.toggle('active');
                        e.preventDefault();
                    };
                }

                // Add the action overflow button
                overflowButton.setAttribute('data-role', 'actions-overflow-icon');

                firstButton.setAttribute('id', firstId);
                document.styleSheets[0].addRule('#' + firstId + ':after', 'background-image: url("' + firstIcon + '");');

                newActionsBarWrapper.appendChild(firstButton);
                secondButton.setAttribute('id', secondId);
                document.styleSheets[0].addRule('#' + secondId + ':after', 'background-image: url("' + secondIcon + '");');
                newActionsBarWrapper.appendChild(secondButton);
                newActionsBarWrapper.appendChild(overflowButton);
                newActionsBarWrapper.appendChild(overflowList);

                self = this;
                overflowButton.onclick = function(e) {
                    overflowList.classList.toggle('opened');
                    self._overlay.classList.toggle('active');
                    e.preventDefault();
                };
            } else {

                for (var y = 0; y < i; y++) {
                    var actionButton = document.createElement('button'),
                        actionButton_lbl = actionButtons[y].querySelector('span').innerHTML,
                        actionButton_icon = actionButtons[y].querySelector('img').getAttribute('src'),
                        actionButton_id = actionButtons[y].querySelector('a').getAttribute('id');

                    actionButton.setAttribute('id', actionButton_id);
                    document.styleSheets[0].addRule('#' + actionButton_id + ':after', 'background-image: url("' + actionButton_icon + '");');
                    newActionsBarWrapper.appendChild(actionButton);
                }
            }

            newActionsBar.appendChild(newActionsBarWrapper);
        },

        /**
         * Required call that initializes the UbuntuUI object
         * @method {} init
         */
        init: function() {
            this.__setupTabs(document);
            this.__setupPage(document);
            this.__setupActionsBar(document);
        },

        /**
         * Gets an Ubuntu Page object
         * @method page
         * @param {ID} id - The element's id attribute
         * @return {Page} - The Page with the specified id
         */
        page: function(id) {
            if (typeof Page != 'undefined' && Page) {
                return new Page(id);
            } else {
                console.error('Could not find the Page element. You might be missing the "page.js" Page definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Tab object
         * @method tab
         * @param {ID} id - The element's id attribute
         * @return {Tab} - The Tab with the specified id
         */
        tab: function(id) {
            if (typeof Tab != 'undefined' && Tab) {
                return new Tab(id);
            } else {
                console.error('Could not find the Tab element. You might be missing the "tab.js" Tab definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Shape object
         * @method shape
         * @param {ID} id - The element's id attribute
         * @return {Shape} - The Shape with the specified id
         */
        shape: function(id) {
            if (typeof Shape != 'undefined' && Shape) {
                return new Shape(id);
            } else {
                console.error('Could not find the Shape element. You might be missing the "shape.js" Shape definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Button object
         * @method button
         * @param {ID} id - The element's id attribute
         * @return {Button} - The Button with the specified id
         */
        button: function(id) {
            if (typeof Button != 'undefined' && Button) {
                return new Button(id);
            } else {
                console.error('Could not find the Button element. You might be missing the "button.js" Button definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Progress object
         * @method progress
         * @param {ID} id - The element's id attribute
         * @return {Progress} - The Progress with the specified id
         */
        progress: function(id) {
            if (typeof Progress != 'undefined' && Progress) {
                return new Progress(id);
            }
        },

        /**
         * Gets an Ubuntu Dialog object
         * @method dialog
         * @param {ID} id - The element's id attribute
         * @return {Dialog} - The Dialog with the specified id
         */
        dialog: function(id) {
            if (typeof Dialog != 'undefined' && Dialog) {
                return new Dialog(id);
            } else {
                console.error('Could not find the Dialog element. You might be missing the "dialog.js" Dialog definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Popover object
         * @method popover
         * @param {Element} el - The element to which the Popover's position is relative
         * @param {ID} id - The element's id attribute
         * @return {Popover} - The Popover with the specified id
         */
        popover: function(elem, id) {
            if (typeof Popover != 'undefined' && Popover) {
                return new Popover(elem, id);
            } else {
                console.error('Could not find the Popover element. You might be missing the "popover.js" Popover definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Header object
         * @method header
         * @param {ID} id - The element's id attribute
         * @return {Header} - The Header with the specified id
         */
        header: function(id) {
            if (typeof Header != 'undefined' && Header) {
                return new Header(id);
            } else {
                console.error('Could not find the Header element. You might be missing the "header.js" Header definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Toolbar object
         * @method toolbar
         * @param {ID} id - The element's id attribute
         * @return {Toolbar} - The Toolbar with the specified id
         */
        toolbar: function(id) {
            if (typeof Toolbar != 'undefined' && Toolbar) {
                return new Toolbar(id, this.__getTabInfosDelegate());
            } else {
                console.error('Could not find the Toolbar element. You might be missing the "toolbar.js" Toolbar definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu List
         * @method list
         * @param {Selector} selector - A selector that JavaScript querySelector method understands
         * @return {List}
         */
        list: function(selector) {
            if (typeof List != 'undefined' && List) {
                return new List(selector);
            } else {
                console.error('Could not find the List element. You might be missing the "list.js" List definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets an Ubuntu Option Selector
         * @method optionselector
         * @param {ID} id - The element's id attribute
         * @param {Boolean} expanded - Specifies whether the list is always expanded
         * @param {Boolean} multiSelection - If multiple choice selection is enabled the list is always expanded.
         * @return {OptionSelector}
         */
        optionselector: function(id, expanded, multiSelection) {
            if (typeof OptionSelector != 'undefined' && OptionSelector) {
                return new OptionSelector(id, expanded, multiSelection);
            } else {
                console.error('Could not find the OptionSelector element. You might be missing the "option-selector.js" OptionSelector definition script. Please add a <script> declaration to include it.');
            }
        },

        /**
         * Gets the DOM element from a given selector
         * @method element
         * @return {Element} - The DOM element
         * Gets the HTML element associated with an Ubuntu HTML5 JavaScript object
         */
        element: function(selector) {
            return document.querySelector(selector);
        },

        /**
         * Gets this UbuntuUI's single Pagestack object
         * @method pagestack
         * @return {Pagestack} - The Pagestack
         */
        get pagestack() {
            return this._pageStack;
        },

        /**
         * Gets this UbuntuUI's single Tabs object
         * @method tabs
         * @return {Tabs} - The Tabs
         */
        get tabs() {
            return this._tabs;
        },

    };

    return UbuntuUI;

})();
