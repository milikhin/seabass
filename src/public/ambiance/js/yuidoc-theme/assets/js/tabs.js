/*
 * Copyright 2011 Yahoo! Inc.
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of the Yahoo! Inc. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL YAHOO! INC. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



YUI({
    insertBefore: 'site_styles'
}).use('tabview', function(Y) {
    var classdocs = Y.one('#classdocs'),
        tabviewIndexTable = {};
    if (classdocs) {
        if (classdocs.all('li').size()) {
            var tabview = new Y.TabView({ srcNode: classdocs });
            tabview.render();
			classdocs.all('li a').each(function (item, index) {
				var hash = item.get(['hash']);
					type = hash.substring(1);
				if (!tabviewIndexTable[type]) {
					tabviewIndexTable[type] = index;
				}
			})
			Y.all('.sidebox.on-page').each(function (item, index) {
				var children = item.all('li a');
				children.each(function (cItem, cIndex) {
					return function () {
						var handleClick = function (e) {
							var node      = Y.one(this),
								hash      = node.get(['hash']),
								hashValue = hash.substring(1).split('_'),
								type      = hashValue.shift(),
								ogKey     = hashValue.join('_'); // in case the hash had other underscores
							if (tabviewIndexTable[type] > -1 && tabviewIndexTable[type] !== currentTab) {
								currentTab = tabviewIndexTable[type];
								tabview.selectChild(tabviewIndexTable[type]);
							}
						}
						Y.on('click', handleClick, cItem)
					}()
				})
			});
        }
    }
});
