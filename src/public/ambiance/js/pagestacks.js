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
 * <http://www.gnu.org/licenses/>.
 */

/**
 * The Pagestack manages all Pages in a stack data structure. Initially, the Pagestack contains no Pages. The <em>push()</em> method is normally executed on load to display the app starting page.

      UI.pagestack.push("pageID")

The topmost Page on the Pagestack is always displayed.

The Pagestack is declared as a direct child of the <em>content</em> div.

#####Default application wide footer
The Pagestack contains a default <em>footer</em> (represented in JavaScript as a Toolbar), even if you do not declare one in HTML. The <em>footer</em> has a single Back button.
#####Customized application wide footer
This application-wide <em>footer</em> can be customized (for example, you can add Buttons) by declaring a <em>footer</em> as a direct child of the <em>pagestack</em> div (see example).
######Page specific footers
A <em>page</em> may declare a page-specific <em>footer</em> as a child element.

 * @class Pagestack
 * @namespace UbuntuUI
 * @constructor
 * @example

     <div data-role="mainview">

        <header data-role="header">
        </header>

        <div data-role="content">

          <div data-role="pagestack">

            <div data-role="page" id="main" data-title="Page 1">
            </div>

            <div data-role="page" id="page2" data-title="Page 2">
              [...]
              <footer data-role="footer" class="revealed" id="footerPage2">
                [...]
              </footer>
            </div>

            <footer data-role="footer" class="revealed" id="footerAppWide">
              [...]
            </footer>

          </div>  <!-- end of Pagestack div -->

        </div>

      </div>

      JavaScript access:
      UI.pagestack.METHOD();

 */
var Pagestack = (function () {

    function __safeCall(f, args, errorfunc) {
        if (typeof (f) !== 'function')
            return;
        try {
            f.apply(null, args);
        } catch (e) {
            if (errorfunc && typeof (errorfunc) === 'function') errorfunc(e)
        }
    };

    function Pagestack(pageStack) {
        this._pages = [];
        this._pageStack = pageStack;
        this._backBtn = document.querySelector('[data-role="back-btn"]');
    };

    Pagestack.prototype = {
        /**
         * Push a page to the top of this pagestack
         * @method push
         * @param {String} id - The id attribute of the page element to be pushed
         * @param {Object} properties - A list of properties passed down to the page that is to be activated
         */
        push: function (id, properties) {
            try {
                __safeCall(this.__setAllPagesVisibility.bind(this), [false]);
                (new Page(id)).activate(properties);
                this._pages.push(id);

                this.__dispatchPageChanged(this.currentPage());
            } catch (e) {}
        },

        /**
         * Checks for zero pages in this pagestack
         * @method isEmpty
         * @return {Boolean} - True when this pagestack has no pages, else false
         */
        isEmpty: function () {
            return this._pages.length === 0;
        },

        /**
         * Gets the id attribute of the page element on top of this pagestack
         * @method currentPage
         * @return {PageID|Null} - The topmost page's id attribute, else null when there are no pages on this pagestack
         */
        currentPage: function () {
            return this.isEmpty() ? null : this._pages[this._pages.length - 1];
        },

        /**
         * Gets the number of pages in this pagestack
         * @method depth
         * @return {Number} - The number of pages in this pagestack
         */
        depth: function () {
            return this._pages.length;
        },

        /**
         * Clears the whole page stack
         * @method clear
         */
        clear: function () {
            if (this.isEmpty())
                return;
            __safeCall(Page.prototype.deactivate.bind(new Page(this.currentPage())), []);
            this._pages = [];
        },

        /**
         * Pops the current page off this pagestack, which causes the next page to become the top page and to display
         * @method pop
         */
        pop: function () {
            if (this.isEmpty())
                return;
            __safeCall(Page.prototype.deactivate.bind(new Page(this.currentPage())), []);
            this._pages.pop();
            __safeCall(Page.prototype.activate.bind(new Page(this.currentPage())), []);

            this.__dispatchPageChanged(this.currentPage());
        },

        onPageChanged : function(callback){
            this._pageStack.addEventListener("pagechanged", callback);
        },

        /**
         * @private
         */
        __setAllPagesVisibility: function (visible) {
            var visibility = visible ? "block" : "none";

            var children = [].slice.call(this._pageStack.children);
            children.forEach(function(element) {
                var pageHelper = new Page();
                if (pageHelper.isPage(element)) {
                    element.style.display = visibility;
                }
            });
        },

        /**
         * @private
         */
        __isPage: function (element) {
            return element.getAttribute('data-role') === 'page';
        },

        /**
         * @private
         */
        __dispatchPageChanged: function (page) {
            this._backBtn.disabled = (this.depth() ==  1);

            [].forEach.call( document.querySelectorAll('[data-role="actions-wrapper"]'), function(el) {
                el.style.display = 'none';
            });

            var pageActions = document.getElementById("actions_" + page);
            if (pageActions !== null) {
                pageActions.style.display = 'block';
            }

            var event = document.createEvent('Event');
            event.initEvent('pagechanged',true,true);
            event.page = page;
            this._pageStack.dispatchEvent(event);
        },
    };

    return Pagestack;
})();
