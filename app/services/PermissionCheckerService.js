// requires
var application = require("application");
var Timer = require("timer");

// utils
const ServiceManager = require("./ServiceManager");
const PermissionUtil = require("~/util/PermissionUtil");

// global vars
var context = application.android.context.getApplicationContext();
var foregroundActivity = application.android.foregroundActivity;
var timerID;

/*
 * com.habitlab.PermissionCheckerService
 * -------------------------------------
 * Extension of Android Service class. Overrides onStartCommand
 * of Service class to start timer that continuously runs in
 * background to perform some task.
 */
android.app.Service.extend("com.habitlab.PermissionCheckerService", {
	onStartCommand: function(intent, flags, startId) {
		this.super.onStartCommand(intent, flags, startId);
        startTimer();
        console.warn("PERMISSION CHECKER SERVICE CREATED");
		return android.app.Service.START_STICKY; 
	}, 

    onDestroy: function() {
        // do nothing
        console.warn("PERMISSION CHECKER SERVICE DESTROYED");
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
			checkPermission();
		}, 500);
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


var usagePermission = false;
var overlayPermission = false;

var checkPermission = function () {
    if (!usagePermission && PermissionUtil.checkActionUsagePermission()) {
        console.warn("Got usage");
        usagePermission = true;
        var intent = context.getPackageManager().getLaunchIntentForPackage("org.nativescript.HabitLabMobile");
        foregroundActivity.startActivity(intent);        
    } else if (!overlayPermission && PermissionUtil.checkSystemOverlayPermission()) {
        console.warn("Got overlay");

        overlayPermission = true;
        var intent = context.getPackageManager().getLaunchIntentForPackage("org.nativescript.HabitLabMobile");
        foregroundActivity.startActivity(intent);        
    } else if (usagePermission && overlayPermission) {
        stopTimer();
        context.stopService(new android.content.Intent(context, com.habitlab.PermissionCheckerService.class));
    }
}







