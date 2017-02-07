define([], function() {
    class Dialog() {
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
    }
});