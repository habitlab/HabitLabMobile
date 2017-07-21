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
        console.warn("TRACKING SERVICE CREATED");
		return android.app.Service.START_STICKY; 
	}, 

    onDestroy: function() {
        // do nothing
        console.warn("TRACKING SERVICE DESTROYED");
    },

    onTaskRemoved: function(intent) {
        // this.super.onTaskRemoved(intent);
        // stopTimer();
        // this.stopSelf();
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
        // if you were in a blacklisted application, update time spent there
        if (inBlacklistedApplication) {
            var timeSpent = System.currentTimeMillis() - visitStart;
            StorageUtil.updateAppTime(currentActivePackage, timeSpent);
        }

        // if the new package is blacklisted, take note of visit start
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
            currentActivePackage = "";
        }
    } else if (visit) {
        if (System.currentTimeMillis() - visitStart > MIN_VISIT_DURATION) {
            visit = false;
            inBlacklistedApplication = true; 
            StorageUtil.visited(currentActivePackage); // log a visit
            InterventionManager.allowVideoBlocking(true);
            InterventionManager.interventions[StorageUtil.interventions.VISIT_TOAST](true, currentActivePackage);
            InterventionManager.interventions[StorageUtil.interventions.VISIT_NOTIFICATION](true, currentActivePackage);
        } 
    } else if (inBlacklistedApplication && visitStart) {
        // been in a blacklisted application for more than 2 seconds
<<<<<<< HEAD
        InterventionManager.interventions[StorageUtil.interventions.DURATION_TOAST](true, currentActivePackage, visitStart);
        InterventionManager.interventions[StorageUtil.interventions.DURATION_NOTIFICATION](true, currentActivePackage, visitStart);
=======
        InterventionManager.interventions[StorageUtil.interventions.DURATION_TOAST](currentActivePackage, visitStart);
        InterventionManager.interventions[StorageUtil.interventions.DURATION_NOTIFICATION](currentActivePackage, visitStart);
        // InterventionManager.interventions[11](currentActivePackage, visitStart);
>>>>>>> 04e6e032c32d18921ac0bea3cae3e53bb92f4561

        if (currentActivePackage === "com.facebook.katana" || currentActivePackage === "com.google.android.youtube") {
            InterventionManager.interventions[StorageUtil.interventions.VIDEO_BLOCKER](true);
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
    var foregroundEvent;
    while (events.hasNextEvent()) {
        events.getNextEvent(event);
        if (event.getEventType() === UsageEvents.Event.MOVE_TO_FOREGROUND) {
            foregroundEvent = event;
        }
    }

    // pull the package name from the event, if applicable
    if (foregroundEvent) {
        var packageName = foregroundEvent.getPackageName();
        if (previousPackageName !== packageName) {
            previousPackageName = packageName;
            return packageName;
        } else {
            return null;
        }
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
        StorageUtil.updateAppTime(currentActivePackage, timeSpent);

        // reset logging information
        visitStart = 0;
        visit = false;
        currentActivePackage = "";
        inBlacklistedApplication = false;
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
        StorageUtil.updateAppTime(currentActivePackage, timeSpent);

        // reset logging information
        visitStart = 0;
        visit = false;
        currentActivePackage = "";
        inBlacklistedApplication = false;
    }
 }


module.exports = {
    stopTimer,
    alertScreenOff,
    alertScreenOn
};






