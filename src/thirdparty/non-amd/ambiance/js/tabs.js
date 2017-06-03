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
 * One of the navigation pattern that can be used within an Ubuntu App is the flat navigation. Tabs are the standard way to provide such a navigation pattern from within your application.

Tabs are defined from within the Header part of your application HTML. See the Header class for more information.

Declare the Header and Tabs in HTML as a direct child of the top level Page as a sibling to the content div.

 * @class Tabs
 * @constructor
 * @namespace UbuntuUI
 * @example
      <body>
        <div data-role="mainview">

          <header data-role="header">
            <ul data-role="tabs">
              <li data-role="tabitem" data-page="main">
                Main
              </li>
              <li data-role="tabitem" data-page="page2">
                Two
              </li>
            </ul>
          </header>

          <div data-role="content">
            <div data-role="tab" id="main">
              [...]
            </div>

            <div data-role="tab" id="page2">
              [...]
            </div>
          </div>

        </div>
      </body>

      JavaScript access:
      UI.tabs.METHOD();
*/
var Tabs = (function () {
    var activeTab;

    function Tabs(tabs) {
        if (tabs == null) {
            return;
        }

        this._tabs = tabs;
        this._header = this._tabs.parentNode;

        this._tabsitems = this.tabChildren;

        [].forEach.call(this._tabsitems, function (elm) {
            elm.addEventListener('click', this.__onClicked.bind(this, elm), false);
        }.bind(this));

        // initialize default page
        this.__setupInitialTabVisibility();
    };

    Tabs.prototype = {
        /**
         * Return the index of the selected tab
         * @property selectedTabIndex
         * @return {Integer} - The zero based index of the element in the list of tabs or -1
         */
        get selectedTabIndex() {
            return Array.prototype.slice.call(this._tabs.querySelectorAll('li')).indexOf(activeTab);
        },

        /**
         * Sets the index of the selected tab
         * @property selectedTabIndex
         * @param {Integer} - The zero based index of the element in the list of tabs
         */
        set selectedTabIndex(index) {
            var tabs = Array.prototype.slice.call(this._tabs.querySelectorAll('li'));
            if (index < 0 || index >= tabs.length)
                return;

            this.__doSelectTab(tabs[index]);
        },

        /**
         * Return the page associated with the currently selected tab
         *
         * @deprecated
         *
         * @property currentPage
         * @return {Element} - Page DOM element associated with the currently selected tab or null
         */
        get currentPage() {
            return this.selectedTab ? this.selectedTab.querySelector('page') : null;
        },

        /**
         * Return the currently selected tab element
         *
         * @property selectedTab
         * @return {Element} - The currently selected element or null
         */
        get selectedTab() {
            var selected = null;
            if (activeTab) {
                try {
                    selected = document.getElementBydId(activeTab.getAttribute('data-page'));
                } catch (e) {};
            }
            return selected;
        },

        /**
         * Return the number of tab elements in the header
         * @property count
         * @return {Integer} - Number of tab elements
         */
        get count() {
            return this.tabChildren.length;
        },

        /**
         * Return the list of DOM elements of the tab
         *
         * @deprecated
         *
         * @property tabChildren
         * @return {Elements} - List of DOM elements in the tab
         */
        get tabChildren() {
            return this._tabs.querySelectorAll('li');
        },

        /**
         * @private
         */
        __setupInitialTabVisibility: function () {

            this._firstrun = true;

            PAGESTACK_BACK_ID = 'ubuntu-pagestack-back';
            TAB_BTN_ID = 'ubuntu-tabs-btn';

            var backbtn = document.createElement('button');
            backbtn.setAttribute('data-role', 'back-btn');
            backbtn.setAttribute('id', PAGESTACK_BACK_ID + '-' + Math.floor(Math.random()));
            backbtn.disabled = true;

            if(this._tabs.childElementCount > 1) {
                this._tabsbtn = document.createElement('button');
                this._tabsbtn.setAttribute('data-role', 'tabs-btn');
                this._tabsbtn.setAttribute('id', TAB_BTN_ID + '-' + Math.floor(Math.random()));
                this._tabsbtn.style.display = 'block';
            }

            this._content = document.querySelector('[data-role="content"]');

            this._overlay = document.createElement('div');
            this._overlay.setAttribute('data-role', 'overlay');
            this._content.appendChild(this._overlay);

            this._tabtitle = document.createElement('div');
            this._tabtitle.setAttribute('data-role', 'tabtitle');

            var tabtitle_value = document.createTextNode('Main');
            this._tabtitle.appendChild(tabtitle_value);

            var tab = this._tabs.querySelector('[data-role="tabitem"]:first-child');
            tab.classList.remove('inactive');
            tab.classList.add('active');

            this._header.innerHTML = '';
            this._header.appendChild(backbtn);
            if(this._tabs.childElementCount > 1) {
                this._header.appendChild(this._tabsbtn);
                this._header.appendChild(this._tabs);

                var self = this;
                this._tabsbtn.onclick = function (e) {
                    self.__toggleTabs();
                    e.preventDefault();
                };
            } else { this._tabtitle.style.marginLeft = '16px'; }
            this._header.appendChild(this._tabtitle);

            var self = this;
            this._overlay.onclick = function (e) {
                self.__hideMenus();
                var elm = document.elementFromPoint(e.pageX, e.pageY);
                e.preventDefault();
            };

            tab.click();
        },

        /**
         * @private
         */
        __onClicked: function (selectedTab, e) {
            if (selectedTab == null)
                return;
            this.__doSelectTab(selectedTab);
            e.preventDefault();
        },

        /**
         * @private
         */
        __updateActiveTabContent: function (newActiveTab) {
            this._tabtitle.textContent = newActiveTab.innerHTML;
        },

        /**
         * @private
         */
        __dispatchTabChangedEvent: function (tabId) {

            this._evt = document.createEvent('Event');
            this._evt.initEvent('tabchanged', true, true);
            this._evt.infos = {
                tabId: tabId
            };
            this._tabs.dispatchEvent(this._evt);
        },

        /**
         * @private
         */
        __doSelectTab: function (tabElement) {
            if (!tabElement)
                return;

            if (tabElement.getAttribute("data-role") !== 'tabitem')
                return;

            this.__updateActiveTabContent(tabElement);

            var targetPageId = tabElement.getAttribute('data-page');
            this.__activate(targetPageId);

            this.__dispatchTabChangedEvent(targetPageId);
            if (this._firstrun) {
                this._firstrun = false;
            }
            else {
                this.__toggleTabs();
            }
        },

        /**
         * @private
         */
        __activate: function (id) {
            if (!id || typeof (id) !== 'string')
                return;
            activeTab = this._tabs.querySelector('[data-page="' + id + '"]');
            if (!activeTab)
                return;

            [].forEach.call(this._tabs.querySelectorAll('[data-role="tabitem"]'), function (e) {
                e.classList.remove('active');
                e.classList.remove('inactive');
            });

            activeTab.classList.add('active');
        },

        /**
         * @private
         */
        onTabChanged: function (callback) {
            this._tabs.addEventListener("tabchanged", callback);
        },

        /**
         * @private
         */
        __toggleTabs: function () {
            this._tabs.classList.toggle('opened');
            this._overlay.classList.toggle('active');

            var tabsActions = document.querySelector('[data-role="actions"]');
            if (tabsActions &&
                tabsActions.querySelector('.opened') !== null)
                tabsActions.querySelector('.opened').classList.remove('opened');
        },

        /**
         * @private
         */
        __hideMenus: function () {
            this._tabs.classList.remove('opened');
            this._overlay.classList.remove('active');
            
            var tabsActions = document.querySelector('[data-role="actions"]');
            if (tabsActions &&
                tabsActions.querySelector('.opened') !== null)
                tabsActions.querySelector('.opened').classList.remove('opened');
        }
    };


    return Tabs;
})();
