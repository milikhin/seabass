define([], function() {
    function AppEventController(detail) {

    }

    AppEventController.prototype.dispatch = function(evtDetail) {
        document.body.dispatchEvent(new CustomEvent('app-event', {
            bubbles: true,
            cancelable: true,
            detail: evtDetail || {}
        }));
    };

    return new AppEventController();
});