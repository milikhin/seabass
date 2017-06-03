define([], function() {
    return function() {
        return [{
                action: "editor-save",
                iconClass: "save",
                text: "Save<br/><code>Ctrl + S</code>",
                addons: "disabled",
                doNotShow: true,
                className: 'header__tab__button-pane__button-save',
                priority: 0
            }, {
                action: "tree__toggle",
                iconClass: "tree",
                text: "Toggle file tree<br/><code>Ctrl + T</code>",
                className: 'header__tab__button-pane__button-ftree',
                priority: 0
            },
            //         {
            //     action: "window-osk__toggle",
            //     iconClass: "toggle-osk",
            //     text: "Toggle OSK mode",
            //     className: 'header__tab__button-pane__button-osk',
            //     priority: 10
            // }, 
            {
                action: "editor-beautify",
                iconClass: "beautify",
                text: "Beautify<br/><code>Ctrl + Alt + B</code>",
                addons: "disabled",
                className: 'header__tab__button-pane__button-beautify',
                priority: 20
            }, {
                action: "editor-redo",
                iconClass: "redo",
                text: "Redo<br/><code>Ctrl + Y</code>",
                addons: "disabled",
                // doNotShow: true,
                className: 'header__tab__button-pane__button-redo',
                priority: 30
            }, {
                action: "editor-undo",
                iconClass: "undo",
                text: "Undo<br/><code>Ctrl + Z</code>",
                addons: "disabled",
                className: 'header__tab__button-pane__button-undo',
                priority: 40
            }
        ];
    };
});