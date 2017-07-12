// requires
var application = require("application");
var Timer = require("timer");
const InterventionManager = require("~/interventions/InterventionManager");

// utils
var StorageUtil = require("~/util/StorageUtil");

// expose native APIs
var Context = android.content.Context;
var System = java.lang.System;
var UsageEvents = android.app.usage.UsageEvents;

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
		console.log("TRACKING SERVICE CREATED");
        startTimer();
        this.startForeground(123, getNotification());
		return android.app.Service.START_STICKY; 
	}, 

    onDestroy: function() {
        // do nothing
        console.log("TRACKING SERVICE DESTROYED");
    },

    onTaskRemoved: function(intent) {
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
var trackUsage = function () {
    var packageName = getActivePackage();
    if (packageName && StorageUtil.isPackageSelected(packageName)) {
        StorageUtil.visited(packageName); // log a visit

        /* Plug in interventions HERE */
        InterventionManager.visitedToast(packageName);
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



 
var NotificationCompat = android.support.v4.app.NotificationCompat
var notificationColor = [34, 0.81, 1];

var getNotification = function() {
    var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);
    var notificationBuilder = new NotificationCompat.Builder(context);
    var icon_id = context.getResources().getIdentifier("logo_bubbles", "drawable", context.getPackageName());
    notificationBuilder.setSmallIcon(icon_id);
    notificationBuilder.setContentTitle("HabitLab")
    notificationBuilder.setContentText("Helping change your habits!");
    notificationBuilder.setColor(android.graphics.Color.HSVToColor(notificationColor));
    notificationBuilder.setVisibility(android.app.Notification.VISIBILITY_SECRET);
    return notificationBuilder.build();
};

module.exports = {stopTimer: stopTimer};






