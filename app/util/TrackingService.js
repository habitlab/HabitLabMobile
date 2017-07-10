// requires
var application = require("application");
var Toast = require("nativescript-toast");
var timer = require("timer");

// expose native APIs
var Context = android.content.Context;
var System = java.lang.System;
var UsageEvents = android.app.usage.UsageEvents;
var Integer = java.lang.Integer;

// global vars
var context = application.android.context.getApplicationContext();
var timerID;

/*
 * com.habitlab.TrackingService
 * ----------------------------
 * Extension of Android Service class. Overrides onStartCommand
 * of Service class to start timer that continuously runs in
 * background to perform some task.
 */
android.app.Service.extend("com.habitlab.TrackingService", {
	onStartCommand: function(intent, flags, startId) {
		this.super.onStartCommand(intent, flags, startId);
		startTimer();
        console.log("TRACKING SERVICE CREATED");
		return android.app.Service.START_STICKY; 
	}, 

    onDestroy: function() {
        console.log("TRACKING SERVICE DESTROYED");
    },

    onCreate: function() {
        // do nothing
    },

    onBind: function(intent) {
        // do nothing 
    }
});


/*
 * startTimer
 * ----------
 * Initializes a NativeScript timer (if one is not already
 * active) that runs a function for a predetermined amount 
 * of time.
 */
var startTimer = function() {
	if (!timerID) {
		timerID = timer.setInterval(() => {
			tracking();
		}, 1000);
	}
};

/**
 * stopTimer
 * ---------
 * Function to kill the existing timer. Called by other 
 * modules BEFORE the call to stopService (otherwise the 
 * timer thread will still be active, and the service will
 * not be properly destroyed).
 */
var stopTimer = function() {
	timer.clearInterval(timerID);
	timerID = 0;
};


/******* TRACKING FUNCTIONALITY *******/
var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
var event = new UsageEvents.Event();
var previousPackageName = "";

var statsMap = [0, 0, 0, 0];

/*
 * tracking
 * --------
 * Function to be run at predetermined intervals in the 
 * background.
 */
var tracking = function () {
	var events = usageStatsManager.queryEvents(System.currentTimeMillis() - 3000, System.currentTimeMillis());

    while (events.hasNextEvent()) {
        events.getNextEvent(event);
    }

    var packageName = event.getPackageName();
    if (event.getEventType() === UsageEvents.Event.MOVE_TO_FOREGROUND && previousPackageName !== packageName) {
    	console.log("===> Active Package:", packageName);
    	previousPackageName = packageName;

    	if (packageName === "com.facebook.katana") {
    		statsMap[0]++;
    		Toast.makeText("Times on Facebook: " + statsMap[0]).show();
    	} else if (packageName === "com.snapchat.android") {
    		statsMap[1]++;
    		Toast.makeText("Times on Snapchat: " + statsMap[1]).show();
    	} else if (packageName === "com.facebook.orca") {
    		statsMap[2]++;
    		Toast.makeText("Times on Messenger: " + statsMap[2]).show();
    	} else if (packageName === "com.instagram.android") {
    		statsMap[3]++;
    		Toast.makeText("Times on Instagram: " + statsMap[3]).show();
    	}
    }
};


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
        if (service.service.getClassName() === com.habitlab.TrackingService.class.getName()) {
            return true;
        }
    }
    return false;
};

module.exports = {stopTimer: stopTimer, isServiceRunning: isServiceRunning};




