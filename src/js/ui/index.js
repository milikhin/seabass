define(['app/app-event', 'clipboard', 'app/ui/buttons'], function(AppEvent, Clipboard, getEditorButtons) {
    class AppUi {
        constructor() {
            let self = this;
            this._initUbuntuUi();
            this._addHeaderButtonsHak();

            new Clipboard('.clipboard-btn');
        }

        _initUbuntuUi() {
            this.ui = new UbuntuUI();
            this.ui.init();
            console.log('Ubuntu UI initialized');
        }

        _getEditorButtons() {
            let buttons = getEditorButtons();
            return buttons.sort(function(a, b) {
                return a - b;
            });
        }

        _addHeaderButtonsHak() {
            let self = this;
            this._addEditorButtons();
            AppEvent.on('editor-activated', function() {
                self._addEditorButtons();
            });

            document.body.addEventListener('click', function(evt) {
                // Workaround to catch page change event & add editor buttons to Header when page changed;
                let headerInterval = setInterval(function() {
                    let headerElem = document.querySelector('.header [data-role="tabtitle"]');
                    if (~headerElem.innerHTML.toLowerCase().indexOf('editor')) {
                        AppEvent.dispatch("editor-activated");
                        clearInterval(headerInterval);
                    }
                }, 100);
            });
        }

        _addEditorButtons() {
            let headerElem = document.querySelector('.header [data-role="tabtitle"]');
            if (headerElem.querySelector('.header__tab__button-pane')) {
                return;
            }


            let headerButtonPaneElem = document.createElement('div');
            let buttonPaneHTML = "";
            headerButtonPaneElem.className = "header__tab__button-pane";

            this._getEditorButtons().forEach(function(buttonDescription) {
                buttonPaneHTML += `<button
					data-action="editor-${buttonDescription.action}"
					class="app-action header__tab__button-pane__button tooltip tooltip-bottom ${buttonDescription.className}">
					<i class="material-icons">${buttonDescription.iconClass}</i>
					<span class="tooltip__text">${buttonDescription.text}</span>
				</button>`;
            });
            buttonPaneHTML += `<div class="header__tab__action-container tablet-only">
                <form action="#">
                    <input class="header__tab__action-container__input" type="text" placeholder="path/to/file"/>
                    <button class="header__tab__action-container__submit tooltip tooltip-bottom" type="submit">
                        <i class="material-icons">insert_drive_file</i>
                        <span class="tooltip__text">Open file (create if not exists)</span>
                    </button>
                </form>
            </div>`;
            headerButtonPaneElem.innerHTML = buttonPaneHTML;
            headerElem.appendChild(headerButtonPaneElem);

            // Chrome OS doesn't allow to write inline event hadnlers;
            headerButtonPaneElem.querySelector("form").onsubmit = function() {
                return false;
            };
        }

        _registerUiEventHandlers() {
            document.body.addEventListener('submit', function(evt) {
                AppEvent.dispatch("form-submit", {
                    formElem: evt.target
                });
                return false;
            });

            document.onkeydown = function(evt) {
                AppEvent.dispatch("keydown", evt);
            };

            document.body.addEventListener('click', function(evt) {
                try {
                    let target = evt.target.closest('.app-action');
                    if (!target || target.disabled) {
                        return false;
                    }
                    let action = target.dataset.action;

                    if (action) {
                        AppEvent.dispatch(action, {
                            detail: {
                                target: target
                            }
                        });
                    }
                } catch (err) {
                    console.error(err);
                }

            });
        }
    }

    return AppUi;
});