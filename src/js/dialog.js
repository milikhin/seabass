define([
    'alertify'
], function(alertify) {
    class DialogController {
        constructor() {
            this._polyfillSystemDlgs();
        }

        _polyfillSystemDlgs() {
            if (navigator && navigator.notification && navigator.notification.alert && navigator.notification.confirm) {
                window.alert = navigator.notification.alert;
                window.confirm = navigator.notification.confirm;
                window.prompt = navigator.notification.prompt;
            }
        }

        prompt(options) {
            if (!window.chrome) {
                prompt(options.description, options.callback, options.title, options.buttons, options.default);
            } else {
                alertify.defaultValue(options.default).prompt(options.description, function(val, evt) {
                    evt.preventDefault();
                    options.callback({
                        buttonIndex: 1,
                        input1: val
                    });
                }, function(evt) {
                    evt.preventDefault();
                    options.callback({
                        buttonIndex: 0
                    });
                });
            }
        }

        confirm(options) {
            if (!window.chrome) {
                confirm(options.description, options.callback, options.title, options.buttons);
            } else {
                alertify.confirm(options.description, function(evt) {
                    evt.preventDefault();
                    options.callback(1);
                }, function(evt) {
                    evt.preventDefault();
                    options.callback(0);
                });
            }
        }
    }

    return new DialogController();
});