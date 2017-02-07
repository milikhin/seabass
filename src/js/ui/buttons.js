define([], function() {
    return function() {
        return [{
            action: "editor-save",
            iconClass: "save",
            text: "Save<br/><code>Ctrl + S</code>",
            disabled: false,
            doNotShow: true,
            className: 'header__tab__button-pane__button-save',
            priority: 0
        }, {
            action: "filetree-toggle",
            iconClass: "list",
            text: "Toggle file tree<br/><code>Ctrl + T</code>",
            disabled: false,
            doNotShow: false,
            className: 'header__tab__button-pane__button-ftree',
            priority: 0
        }, {
            action: "window-osk",
            iconClass: "keyboard",
            text: "Toggle OSK mode",
            disabled: false,
            doNotShow: false,
            className: 'header__tab__button-pane__button-osk',
            priority: 10
        }, {
            action: "editor-beautify",
            iconClass: "spellcheck",
            text: "Beautify<br/><code>Ctrl + Alt + B</code>",
            disabled: true,
            doNotShow: false,
            className: 'header__tab__button-pane__button-beautify',
            priority: 20
        }, {
            action: "editor-redo",
            iconClass: "redo",
            text: "Redo<br/><code>Ctrl + Y</code>",
            disabled: true,
            doNotShow: false,
            className: 'header__tab__button-pane__button-redo',
            priority: 30
        }, {
            action: "editor-undo",
            iconClass: "undo",
            text: "Undo<br/><code>Ctrl + Z</code>",
            disabled: true,
            doNotShow: false,
            className: 'header__tab__button-pane__button-undo',
            priority: 40
        }];
    };
});