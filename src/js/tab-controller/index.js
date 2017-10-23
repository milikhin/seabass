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
    'app/app-event', 'app/settings', 'Sortable', 'app/ui/context-menu'
], function(Tab, co, md5, AppEvent, settings, Sortable, Menu) {
    function TabController() {
        var self = this;
        this.tabs = [];
        this.rootElem = document.querySelector('.tabs');
        this.labelsElem = document.querySelector('.tabs-labels');

        // this.tabsElem = this.rootElem.querySelector('.tabs');
        var sortable = Sortable.create(this.labelsElem, {
            draggable: '.tab-content-label'
        });

        let menu = new Menu('.tabs-labels__list__menu');
        document.getElementById('tabs-labels__list__button').addEventListener('click', function(evt) {
            menu.show(null, function(target) {
                var id = target.dataset.id;
                var tab = self.getById(id);
                if (!id) {
                    return console.error('ID is incorrect');
                }

                self._activate(tab);
            });
        });
    }

    TabController.prototype._isHidden = function(tab) {
        return tab.labelElem.className.indexOf('tab-content-label--hidden') >= 0;
    };

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

    TabController.prototype.getById = function(id) {
        var resTab = null;
        this.tabs.forEach(function(tab) {
            if (tab.id == id) {
                resTab = tab;
            }
        }, this);

        return resTab;
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
        return settings.get('maxTabs');

        // return document.body.clientWidth > 750 ? 5 : 3;
    };

    TabController.prototype.converge = function() {
        let self = this;
        co(function*() {
            let maxTabs = yield self._getMaxTabsNumber();
            while (this.tabs.length > maxTabs) {
                var tabToClose = this.getEarliestModified();
                if (tabToClose) {
                    this.close(tabToClose);
                }
            }

            var currentTab = this.getCurrent();
            if (currentTab) {
                this._activate(currentTab);
            }
        });

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
        let tabMenuElem = document.querySelector('.tabs-labels__list__menu .context-menu__items');
        tabMenuElem.innerHTML = '';
        let tabNames = [];

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
                    var _name = `${tabFileName} - <span class="tab-label__label__additional">${tabDifferentName}</span>`;
                    tabLabelElem.getElementsByClassName('tab-label__label')[0].innerHTML = _name;
                    tabNames.push({
                        id: tab.id,
                        name: _name
                    });
                }
            } else {
                tab = groupTabs[0];
                // console.log(tab.fileEntry.nativeURL);
                tabHash = md5(tab.fileEntry.nativeURL);
                tabLabelElem = document.getElementById(`tab-label-${tabHash}`);
                tabLabelElem.getElementsByClassName('tab-label__label')[0].innerHTML = `${tabFileName}`;
                tabNames.push({
                    id: tab.id,
                    name: tabFileName
                });
            }
        }

        tabNames.sort(function(a, b) {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });

        let currentTab = this.getCurrent();
        let currentTabId = null;
        if (currentTab) {
            currentTabId = currentTab.id;
        }
        tabNames.forEach(function(tab) {
            let tabId = tab.id;
            let isCurrent = tabId == currentTabId;
            let tabName = tab.name;
            tabMenuElem.innerHTML += `<li class="context-menu__item">
                <a href="#" class="context-menu__link app-action" data-action="menu-click" data-menu-action="open" data-prevent-default="1" data-id="${tabId}">
                    ` + (isCurrent ? `<b>` : ``) + `${tabName}` + (isCurrent ? `</b>` : ``) + `
                </a>
            </li>`;
        });
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
            parentLabelsElem: this.labelsElem,
            onEditorChange: function() {
                setTimeout(function() {
                    self._updateButtons(tab);
                }, 100);
            }
        });

        // save created tab
        this.tabs.push(tab);
        // this._updateTabNames();
        setTimeout(function() {
            self._updateButtons(tab);
        }, 100);

        return tab;
    };

    TabController.prototype._updateButtons = function(tab) {
        var ext = tab.fileName.slice(tab.fileName.lastIndexOf('.') + 1, tab.fileName.length);
        // console.log(tab.hasUndo(), tab.hasRedo(), !!~['ejs', 'js', 'jsx', 'html', 'less', 'scss', 'css', 'json', 'qml'].indexOf(ext));
        tab.lastModified = Date.now();
        // console.log('call onEditorChange', tab, um.hasUndo().toString(), um.hasRedo().toString());
        AppEvent.dispatch('editor-state-changed', {
            hasUndo: tab.hasUndo(),
            hasRedo: tab.hasRedo(),
            hasBeautify: ~['ejs', 'js', 'jsx', 'html', 'less', 'scss', 'css', 'json', 'qml'].indexOf(ext)
        });
    };

    TabController.prototype._activate = function(tab) {
        var self = this;
        var labelsCount = self.labelsElem.children.length;
        if (this._isHidden(tab)) {
            if (labelsCount > 1) {
                this.labelsElem.insertBefore(tab.labelElem, this.labelsElem.children[0]);
            }
        }

        tab.activate();
        var sumWidth = 40;
        var fullWidth = this.labelsElem.clientWidth;

        [].forEach.call(this.labelsElem.children, function(labelElem) {
            labelElem.classList.remove('tab-content-label--hidden');
        });

        if (labelsCount > 1) {
            [].forEach.call(this.labelsElem.children, function(labelElem) {
                sumWidth += labelElem.offsetWidth;
                if (sumWidth > fullWidth) {
                    labelElem.classList.add('tab-content-label--hidden');
                }
            });
        }

        // if tab was just added into the end of labels' list, move it forward!
        if (this._isHidden(tab)) {
            this._activate(tab);
        }
        this._updateTabNames();

        // update editor buttons to corespond current tab
        setTimeout(function() {
            self._updateButtons(tab);
        }, 100);
    };

    // Get tab (or create new if it doesn't exist)
    TabController.prototype.get = function(fileName, fileEntry, fileContent) {
        // check if file is already opened
        var tab = this.getTabByFileEntry(fileEntry);
        let self = this;
        if (tab) {
            return tab;
        }

        document.getElementById('editor-tabs').style.zIndex = 10;
        document.getElementById('welcome-note').style.visibility = "hidden";
        // if maximum amount of tabs is exceeded, close the earliest one
        var eldestTab = this.getEarliestModified();
        var curTabs = this.tabs.length;
        co(function*() {
            let maxTabs = yield self._getMaxTabsNumber();
            if (curTabs >= maxTabs) {
                self.close(eldestTab);
            }
        });

        return this._create(fileName, fileEntry, fileContent);
    };

    TabController.prototype.getByElem = function(elem) {
        var tab;
        this.tabs.forEach(function(tabDescription) {
            if (elem.closest('.tabs li') == tabDescription.rootElem) {
                tab = tabDescription;
            }
        });
        if (tab) {
            return tab;
        }

        var tabId = elem.dataset.tabId;
        var tabElem = document.querySelector(`#tab-${tabId}`);
        if (!tabElem) {
            return null;
        }

        this.tabs.forEach(function(tabDescription) {
            if (tabElem.closest('.tabs li') == tabDescription.rootElem) {
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
        tabToClose.labelElem.parentElement.removeChild(tabToClose.labelElem);

        // destroy tab's Ace instance
        tabToClose.close();
        this.tabs.splice(this.tabs.indexOf(tabToClose), 1);

        var newCurrentTab = this.getLastModified();
        if (newCurrentTab) {
            newCurrentTab.rootElem.querySelector('.tab-state').checked = true;
            newCurrentTab.onEditorChange();
            this._activate(newCurrentTab);
            // this._updateTabNames();
        } else {
            document.getElementById('editor-tabs').style.zIndex = -1;
            document.getElementById('welcome-note').style.visibility = "visible";
            AppEvent.dispatch('editor-state-changed', {
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