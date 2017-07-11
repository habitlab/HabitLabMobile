var application = require("application");

var Context = android.content.Context;
var System = java.lang.System;
var UsageEvents = android.app.usage.UsageEvents;
var Integer = java.lang.Integer;

var context = application.android.context.getApplicationContext();

android.app.Service.extend("com.habitlab.DateChangeService", {
    onStartCommand: function(intent, flags, startId) {
        this.super.onStartCommand(intent, flags, startId);
        setUpService();
        console.log("DATE CHANGED SERVICE CREATED");
        return android.app.Service.START_STICKY; 
    }, 

    onDestroy: function() {
        console.log("DATE CHANGED SERVICE DESTROYED");
    },

    onCreate: function() {
        // do nothing
    },

    onBind: function(intent) {
        // do nothing 
    }
});

var setUpService = function () {
    application.android.registerBroadcastReceiver(android.content.Intent.ACTION_DATE_CHANGED,
        function onReceiveCallback(context, intent) {
            console.log("Date changed");
            // TODO: Put stuff here that needs to happen at 12:00 AM every day
        });
}


/*
 * isServiceRunning
 * ----------------
 * Checks whether TrackingService is active on the device. Called
 * from other modules. 
 */
var isServiceRunning = function () {
    var manager = context.getSystemService(Context.ACTIVITY_SERVICE);
    var services = manager.getRunningServices(Integer.MAX_VALUE);
    for (var i = 0; i < services.size(); i++) {
        var service = services.get(i);
        if (service.service.getClassName() === com.habitlab.DateChangeService.class.getName()) {
            return true;
        }
    }
    return false;
};

module.exports = {isServiceRunning: isServiceRunning};