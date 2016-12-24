/*
	TabController

	Public methods:
	- beautify(tab: tab's description): formats tab's editor content if possible
	- close(tab: tab's description): closes given tab, selects new active tab based on "getLastModified" alghorythm
	- get(fileName: String, fileEntry: Cordova File's entry, fileContent: String (NOT USED)): returns new or existed tab for given fileName & fileEntry
	- getCurrent(): returns current tab's dscription
	- getEarliestModified(): returns tab's description for the tab, that hasn't change for longest time among the opened tabs
	- getLastModified: returns tab's description of last modified tab
	- getTabByFileEntry(fileEntry: Cordova File's entry): returns tab correspondent to given fileEntry
	- getByElem(elem: HTMLElement): returns tab's description for a tab, that contains given elem
	- save(tab: tab's description): fires "file-save" event on documents with fileName & entry as event details

	Private methods:
	- _getMaxTabsNumber(): returns maximum amount of simultaniously opened tabs
	- _create(fileName: String, fileEntry: Cordova File's entry, fileContent: String (NOT USED)): returns new tab for the given fileName & fileEntry, editor is empty
	- _updateButtons(tab: tab's description): sets "disabled" property of header buttons based on givent tab properties
	- _activate(tab: tab's description): adds "tab-active" class to a given tab's <li>, removes class from other tabs' <li> elems
	- _resetUndoManager(tab: tab's description): reset Ace's UndoManager state for a
*/
define([
    './tab',
    'co',
    'md5',
    'app/app-event'
], function(Tab, co, md5, AppEvent) {
    function TabController() {
        var self = this;
        this.tabs = [];
        this.rootElem = document.querySelector('.tabs');
        // this.tabsElem = this.rootElem.querySelector('.tabs');

        document.body.addEventListener('tab-activate', function(evt) {
            self.tabs.forEach(function(tabDescription) {
                tabDescription.rootElem.closest('li').classList.remove('tab-active');
            });

            evt.detail.tab.rootElem.closest('li').classList.add('tab-active');
        });
    }

    // Get active tab
    TabController.prototype.getCurrent = function() {
        var checkedrootElem = document.querySelector('.tabs .tab-state:checked ~ .tab-content');
        var currentTab;
        this.tabs.forEach(function(tab) {
            if (tab.rootElem == checkedrootElem.closest('li')) {
                currentTab = tab;
            }
        }, this);

        return currentTab;
    };

    // Get the eldest tab (to close it, for example)
    TabController.prototype.getEarliestModified = function() {
        var eldestTab;
        this.tabs.forEach(function(tabDescription) {
            if (!eldestTab || eldestTab.lastModified > tabDescription.lastModified) {
                eldestTab = tabDescription;
            }
        });

        return eldestTab;
    };

    // Get last modified tab
    TabController.prototype.getLastModified = function() {
        var lastTab;
        this.tabs.forEach(function(tabDescription) {
            if (!lastTab || lastTab.lastModified < tabDescription.lastModified) {
                lastTab = tabDescription;
            }
        });

        return lastTab;
    };

    // Get tab corresponded to a file
    TabController.prototype.getTabByFileEntry = function(fileEntry) {
        var tab;

        if (!fileEntry) {
            throw new Error("file entry argument is not specified");
        }

        this.tabs.forEach(function(tabDescription) {
            if (tabDescription.fileEntry.nativeURL == fileEntry.nativeURL) {
                tab = tabDescription;
            }
        }, this);

        return tab;
    };

    // Get Zentabs limit
    TabController.prototype._getMaxTabsNumber = function() {
        return document.body.clientWidth > 600 ? 5 : 3;
    };

    TabController.prototype.converge = function() {
        while (this.tabs.length > this._getMaxTabsNumber()) {
            var tabToClose = this.getEarliestModified();
            if (tabToClose) {
                this.close(tabToClose);
            }
        }
    };

    TabController.prototype._getTabsGroupedByFileName = function() {
        // List groups of similarly named tabs
        var similarFileNameTabs = {};
        this.tabs.forEach(function(tab) {
            if (!similarFileNameTabs[tab.fileName]) {
                similarFileNameTabs[tab.fileName] = [tab];
            } else {
                similarFileNameTabs[tab.fileName].push(tab);
            }
        });
        return similarFileNameTabs;
    };

    TabController.prototype._updateTabNames = function() {
        var similarFileNameTabs = this._getTabsGroupedByFileName();
        var groupTabs, tabFileName, tab, tabHash, tabUrl, tabLabelElem;

        for (tabFileName in similarFileNameTabs) {
            groupTabs = similarFileNameTabs[tabFileName];
            var similarTill = this._getSimilarTill(groupTabs);

            if (groupTabs.length > 1) {
                for (var i = 0; i < groupTabs.length; i++) {
                    tab = groupTabs[i];
                    tabHash = md5(tab.fileEntry.nativeURL);
                    tabLabelElem = document.getElementById(`tab-label-${tabHash}`);
                    tabUrl = tab.fileEntry.nativeURL.split('/');
                    tabUrl.splice(0, similarTill);
                    var tabDifferentName = tabUrl.join('/').slice(0, -tabFileName.length);
                    tabLabelElem.getElementsByClassName('tab-label__label')[0].innerHTML = `${tabFileName} - <span class="tab-label__label__additional">${tabDifferentName}</span>`;
                }
            } else {
                tab = groupTabs[0];
                console.log(tab.fileEntry.nativeURL);
                tabHash = md5(tab.fileEntry.nativeURL);
                tabLabelElem = document.getElementById(`tab-label-${tabHash}`);
                tabLabelElem.getElementsByClassName('tab-label__label')[0].innerHTML = `${tabFileName}`;
            }
        }
    };

    TabController.prototype._getSimilarTill = function(groupTabs) {
        var tabOne, tabTwo;
        var similarTill = Number.MAX_VALUE;

        for (var i = 0; i < groupTabs.length; i++) {
            tabOne = groupTabs[i];

            var tabOneUrl = (tabOne.fileEntry.nativeURL).split('/');
            for (var j = 1; j < groupTabs.length; j++) {
                if (i == j) {
                    continue;
                }

                tabTwo = groupTabs[j];
                var tabTwoUrl = (tabTwo.fileEntry.nativeURL).split('/');
                var k = 0;
                while ((k < tabOneUrl.length - 2) && (k < tabTwoUrl.length - 2) && (tabOneUrl[k] == tabTwoUrl[k])) {
                    k++;
                }

                if (similarTill > k) {
                    similarTill = k;
                }
            }
        }

        return similarTill;
    };

    TabController.prototype._create = function(fileName, fileEntry, fileContent) {
        var self = this;

        var tab = new Tab({
            fileName: fileName,
            fileEntry: fileEntry,
            fileContent: fileContent,
            parentElem: this.rootElem,
            onEditorChange: function() {
                setTimeout(function() {
                    self._updateButtons(tab);
                }, 100);
            }
        });

        // save created tab
        this.tabs.push(tab);
        this._updateTabNames();
        this._activate(tab);
        this._updateButtons(tab);

        return tab;
    };

    TabController.prototype._updateButtons = function(tab) {
        var ext = tab.fileName.slice(tab.fileName.lastIndexOf('.') + 1, tab.fileName.length);

        tab.lastModified = Date.now();
        // console.log('call onEditorChange', tab, um.hasUndo().toString(), um.hasRedo().toString());
        AppEvent.dispatch({
            type: 'editor-state-changed',
            hasUndo: tab.hasUndo(),
            hasRedo: tab.hasRedo(),
            hasBeautify: ~['js', 'html', 'css', 'json'].indexOf(ext)
        });
    };

    TabController.prototype._activate = function(tab) {
        tab.activate();
    };

    // Get tab (or create new if it doesn't exist)
    TabController.prototype.get = function(fileName, fileEntry, fileContent) {
        // check if file is already opened
        var tab = this.getTabByFileEntry(fileEntry);
        if (tab) {
            return tab;
        }

        document.getElementById('editor-tabs').style.zIndex = 10;
        document.getElementById('welcome-note').style.visibility = "hidden";
        // if maximum amount of tabs is exceeded, close the earliest one
        var eldestTab = this.getEarliestModified();
        if (this.tabs.length >= this._getMaxTabsNumber()) {
            this.close(eldestTab);
        }

        return this._create(fileName, fileEntry, fileContent);
    };

    TabController.prototype.getByElem = function(elem) {
        var tab;
        this.tabs.forEach(function(tabDescription) {
            if (elem.closest('.tabs li') == tabDescription.rootElem) {
                tab = tabDescription;
            }
        });

        return tab;
    };

    TabController.prototype.close = function(tabToClose) {
        if (!tabToClose) {
            throw new Error('Tab to close not found!');
        }

        document.body.removeEventListener('body-resize', tabToClose.onResize);
        tabToClose.rootElem.parentElement.removeChild(tabToClose.rootElem);

        // destroy tab's Ace instance
        tabToClose.close();
        this.tabs.splice(this.tabs.indexOf(tabToClose), 1);

        var newCurrentTab = this.getLastModified();
        if (newCurrentTab) {
            newCurrentTab.rootElem.querySelector('.tab-state').checked = true;
            newCurrentTab.onEditorChange();
            this._activate(newCurrentTab);
            this._updateTabNames();
        } else {
            document.getElementById('editor-tabs').style.zIndex = -1;
            document.getElementById('welcome-note').style.visibility = "visible";
            AppEvent.dispatch({
                type: 'editor-state-changed',
                hasUndo: false,
                hasRedo: false,
                hasBeautify: false
            });
        }
    };

    TabController.prototype._resetUndoManager = function(tab) {
        var um = tab.editor.getSession().getUndoManager();
        um.reset();
        tab.onEditorChange();
    };

    return new TabController();
});
