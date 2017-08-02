// requires
var application = require("application");

var AccessibilityEvent = android.view.accessibility.AccessibilityEvent
var AccessibilityServiceInfo = android.accessibilityservice.AccessibilityServiceInfo

// based on https://gist.github.com/qihnus/1909616

android.accessibilityservice.AccessibilityService.extend("com.habitlab.HabitLabAccessibilityService", {
    onAccessibilityEvent: function(event) {
        console.warn('habitlab: onAccessibilityEvent:')
        //console.warn(getEventType(event))
        console.warn(event.getClassName())
        console.warn(event.getPackageName())
        console.warn(event.getEventTime())
        //console.warn(getEventText(event))
    },
    onInterrupt: function() {
        console.warn('habitlab: onInterrupt')
    },
    onServiceConnected: function() {
        console.warn('habitlab: onServiceConnected part 1')
        this.super.onServiceConnected()
        console.warn('habitlab: onServiceConnected part 2')
        /*
        var info = new AccessibilityServiceInfo()
        info.flags = AccessibilityServiceInfo.DEFAULT
        info.eventTypes = AccessbilityServiceEvent.TYPES_ALL_MASK
        info.feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
        */
        console.warn('habitlab: setServiceInfo pre')
        //this.setServiceInfo(info)
        console.warn('habitlab: setServiceInfo post')
    }
})
