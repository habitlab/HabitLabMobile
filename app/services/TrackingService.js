// requires
var application = require("application");
var Timer = require("timer");
const InterventionManager = require("~/interventions/InterventionManager");

// utils
const ServiceManager = require("./ServiceManager");
const StorageUtil = require("~/util/StorageUtil");

// expose native APIs
var Context = android.content.Context;
var System = java.lang.System;
var UsageEvents = android.app.usage.UsageEvents;
var Intent = android.content.Intent;
var AlarmManager = android.app.AlarmManager;
var PendingIntent = android.app.PendingIntent;

const Toast = require('nativescript-toast');

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
        this.startForeground(ServiceManager.getForegroundID(), ServiceManager.getForegroundNotification());
        console.log("TRACKING SERVICE CREATED");
		return android.app.Service.START_STICKY; 
	}, 

    onDestroy: function() {
        // do nothing
        console.log("TRACKING SERVICE DESTROYED");
    },

    onTaskRemoved: function(intent) {
        // this.super.onTaskRemoved(intent);
        // stopTimer();
        // this.stopSelf();
        // var alarm = context.getSystemService(Context.ALARM_SERVICE);
        // var serviceToRestart = PendingIntent.getService(context, 3, new Intent(context, com.habitlab.TrackingService.class), 0);
        // alarm.set(AlarmManager.RTC, System.currentTimeMillis() + 500, serviceToRestart);
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
        console.log("Timer active");
		timerID = Timer.setInterval(() => {
			trackUsage();
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
	Timer.clearInterval(timerID);
	timerID = 0;
    console.log("Timer stopped");
};


/*
 * trackUsage
 * ----------
 * Function to be run at predetermined intervals in the 
 * background. Plugs interventions into the device.
 */
var inBlacklistedApplication = false;
var trackUsage = function () {
    var packageName = getActivePackage();

    if (packageName) {
        // new application launched
        InterventionManager.setBlockMedia(true);
        if (StorageUtil.isPackageSelected(packageName)) {
            inBlacklistedApplication = true;
            StorageUtil.visited(packageName); // log a visit
            // put interventions here that run on app launch
            InterventionManager.interventions[StorageUtil.interventions.VISIT_TOAST](packageName);
        } else {
            inBlacklistedApplication = false;
        }
    } else {
        // in old application
        if (inBlacklistedApplication) {
            InterventionManager.blockAllSoundMedia();
        }
    }
};


/*
 * getActivePackage
 * ----------------
 * Iterates through all events from the last 1.5 seconds and 
 * examines the most recent event to occur. If the event was
 * a change in the foreground application and that change had
 * not been previously recorded, returns the event's packageName.
 * Otherwise, returns null.
 */
var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
var event = new UsageEvents.Event();
var previousPackageName = "";
var getActivePackage = function() {
    var events = usageStatsManager.queryEvents(System.currentTimeMillis() - 2000, System.currentTimeMillis());
    
    // exit immediately if there are no events
    if (!events.hasNextEvent()) {
        return null;
    }

    // iterate to the next event
    while (events.hasNextEvent()) {
        events.getNextEvent(event);
    }

    // pull the package name from the event, if applicable
    var packageName = event.getPackageName();
    if (event.getEventType() === UsageEvents.Event.MOVE_TO_FOREGROUND && previousPackageName !== packageName) {
        previousPackageName = packageName;
        return packageName;
    } else {
        return null;
    }
}

module.exports = {stopTimer: stopTimer};






