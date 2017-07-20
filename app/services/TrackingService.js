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
};


/*
 * trackUsage
 * ----------
 * Function to be run at predetermined intervals in the 
 * background. Plugs interventions into the device.
 */
const MIN_VISIT_DURATION = 2000; // in ms
var currentActivePackage = "";
var inBlacklistedApplication;
var screenOff = false;
var visitStart;
var visit;
var trackUsage = function () {
    if (screenOff) return;
    var newPackage = getActivePackage();
    if (newPackage) {
        console.warn(newPackage);
        if (visitStart) {
            var timeSpent = System.currentTimeMillis() - visitStart;
            console.warn("Time spent on " + currentActivePackage + ":", timeSpent);

            // TODO: log ms spent on app

        }

        if (StorageUtil.isPackageSelected(newPackage)) {
            visit = true;
            visitStart = System.currentTimeMillis(); // log visit start time
            currentActivePackage = newPackage;
            InterventionManager.logVisitStart();
        } else {
            // reset logging information
            visit = false;
            visitStart = 0;
            inBlacklistedApplication = false;
            InterventionManager.allowVideoBlocking(false);
        }
    } else if (visit) {
        if (System.currentTimeMillis() - visitStart > MIN_VISIT_DURATION) {
            visit = false;
            inBlacklistedApplication = true; 
            StorageUtil.visited(currentActivePackage); // log a visit
            InterventionManager.allowVideoBlocking(true);
            InterventionManager.interventions[StorageUtil.interventions.VISIT_TOAST](currentActivePackage);
            InterventionManager.interventions[StorageUtil.interventions.VISIT_NOTIFICATION](currentActivePackage);
        } 
    } else if (inBlacklistedApplication) {
        // been in a blacklisted application for more than 5 seconds
        InterventionManager.interventions[StorageUtil.interventions.DURATION_TOAST](currentActivePackage, visitStart);
        InterventionManager.interventions[StorageUtil.interventions.DURATION_NOTIFICATION](currentActivePackage, visitStart);
        // InterventionManager.interventions[11](currentActivePackage, visitStart);

        if (currentActivePackage === "com.facebook.katana" || currentActivePackage === "com.google.android.youtube") {
            InterventionManager.interventions[StorageUtil.interventions.VIDEO_BLOCKER]();
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
    var events = usageStatsManager.queryEvents(System.currentTimeMillis() - 3000, System.currentTimeMillis());
    
    // exit immediately if there are no events
    if (!events.hasNextEvent()) return null;
    
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



/**
 * alertScreenOff
 * --------------
 * Alert the TrackingService that the screen has shut off (to
 * clear any tracking information that is active-package 
 * sensitive)
 */
 var alertScreenOff = function () {
    previousPackageName = "";
    screenOff = true;
    if (visitStart) {
        var timeSpent = System.currentTimeMillis() - visitStart;
        console.warn("Time spent on " + currentActivePackage + ":", timeSpent);

        // TODO: log ms spent on app

        visitStart = 0;
        visit = false;
    }
 }


/**
 * alertScreenOn
 * -------------
 * Alert the TrackingService that the screen has bee turned
 * on (to restart tracking information that is package 
 * sensitive)
 */
 var alertScreenOn = function () {
    screenOff = false;
 }


 /**
 * alertShutdown
 * -------------
 * Alert the TrackingService that the screen has bee turned
 * on (to restart tracking information that is package 
 * sensitive)
 */
 var alertShutdown = function () {
    previousPackageName = "";
    screenOff = true;
    if (visitStart) {
        var timeSpent = System.currentTimeMillis() - visitStart;
        console.warn("Time spent on " + currentActivePackage + ":", timeSpent);

        // TODO: log ms spent on app

        visitStart = 0;
        visit = false;
    }
 }


module.exports = {
    stopTimer,
    alertScreenOff,
    alertScreenOn
};






