define([], function() {
    function AppEventController(detail) {

    }

    AppEventController.prototype.dispatch = function(evtName, evtDetail) {
        if (!evtName) {
            throw new Error("AppEvent name is missing");
        }

        evtDetail = evtDetail || {};
        evtDetail.name = evtName;
        document.body.dispatchEvent(new CustomEvent('app-event', {
            bubbles: true,
            cancelable: true,
            detail: evtDetail || {}
        }));
    };

    AppEventController.prototype.on = function(evtName, callback) {
        let callbackFunction = function(evt) {
            if (!evt.detail.type) {
                throw new Error("AppEvent detail is missing", evt);
            }
            callback(evt.detail.type, evt);
        };

        document.body.addEventListener("app-event", callbackFunction);
        return callbackFunction;
    };
  
  	AppEventController.prototype.removeEventListener = function(callbackOnFunction) {
        document.body.removeEventListener("app-event", callbackOnFunction);        
    };

    return new AppEventController();
});