define([], function() {
    function AppEventController(detail) {
        
    }
    
    AppEventController.prototype.dispatch = function(evtDetail) {
		console.log('emitting', evtDetail ? evtDetail.type : 'hz');
        document.body.dispatchEvent(new CustomEvent('app-event', {
            bubbles: true,
            cancelable: true,
            detail: evtDetail || {}
        }));
    }

    return new AppEventController();
});
