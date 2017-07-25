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
var foregroundActivity = application.android.foregroundActivity;
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
var inBlacklistedApplication;
var startOfVisit;
var screenOff = false;
var currentPackage = "org.nativescript.HabitLabMobile";
var trackUsage = function () {
    if (screenOff) return;
    var newPackage = getActivePackage();
    if (newPackage) {
        var now = System.currentTimeMillis();

        // close the most recent blacklisted visit (if there was one)
        if (inBlacklistedApplication) {
            var timeSpent = now - startOfVisit || 0; // in case of concurrency issue w/ alertScreenOff
            StorageUtil.updateAppTime(currentPackage, timeSpent);
            console.warn("Closing visit for " + currentPackage + " (length: " + timeSpent + ")");
        }

        currentPackage = newPackage; // set the newPackage as the currentPackage

        // check if new package is blacklisted
        if (StorageUtil.isPackageSelected(newPackage)) {

            // log visit information
            startOfVisit = now;
            inBlacklistedApplication = true;
            StorageUtil.visited(currentPackage); // log a visit
            console.warn("Starting Visit for " + currentPackage);

            // on-launch interventions
            InterventionManager.allowVideoBlocking(true);
            InterventionManager.logVisitStart();
            InterventionManager.interventions[StorageUtil.interventions.VISIT_TOAST](true, currentPackage);
            InterventionManager.interventions[StorageUtil.interventions.VISIT_NOTIFICATION](true, currentPackage);
            InterventionManager.interventions[StorageUtil.interventions.FULL_SCREEN_OVERLAY](true, currentPackage);
        } else {
            // reset logging information
            startOfVisit = undefined;
            inBlacklistedApplication = false;
            InterventionManager.allowVideoBlocking(false);
        }
    } else if (inBlacklistedApplication) {
        console.warn("    inside: " + currentPackage);
        // interventions that last the lifespan of visit
        InterventionManager.interventions[StorageUtil.interventions.DURATION_TOAST](true, currentPackage, startOfVisit);
        InterventionManager.interventions[StorageUtil.interventions.DURATION_NOTIFICATION](true, currentPackage, startOfVisit);
        InterventionManager.interventions[StorageUtil.interventions.VIDEO_BLOCKER](true, currentPackage);
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
var getActivePackage = function() {
    var events = usageStatsManager.queryEvents(System.currentTimeMillis() - 3000, System.currentTimeMillis());
    
    // iterate to the next event
    var foregroundPackage;
    while (events.hasNextEvent()) {
        events.getNextEvent(event);
        if (event.getEventType() === UsageEvents.Event.MOVE_TO_FOREGROUND) {
            foregroundPackage = event.getPackageName();
        }
    }

    // pull the package name from the event, if applicable
    if (foregroundPackage && currentPackage !== foregroundPackage) {
        return foregroundPackage;
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
    // close the most recent blacklisted visit (if there was one)
    if (inBlacklistedApplication) {
        var timeSpent = System.currentTimeMillis() - startOfVisit;
        StorageUtil.updateAppTime(currentPackage, timeSpent);
        console.warn("Closing visit for " + currentPackage + " (length: " + timeSpent + ")");

        // reset logging information
        currentPackage = "SCREEN OFF";
        startOfVisit = undefined;
        inBlacklistedApplication = false;
        InterventionManager.allowVideoBlocking(false);
    }
    screenOff = true;
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
    // close the most recent blacklisted visit (if there was one)
    if (inBlacklistedApplication) {
        var timeSpent = System.currentTimeMillis() - startOfVisit;
        StorageUtil.updateAppTime(currentPackage, timeSpent);
        console.warn("Closing visit for " + currentPackage + " (length: " + timeSpent + ")");

        // reset logging information
        currentPackage = "SCREEN OFF";
        startOfVisit = undefined;
        inBlacklistedApplication = false;
        InterventionManager.allowVideoBlocking(false);
    }
    screenOff = true;
 }


module.exports = {
    stopTimer,
    alertScreenOff,
    alertScreenOn
};






