// requires
var application = require("application");
var Timer = require("timer");

// utils
const ServiceManager = require("./ServiceManager");
const PermissionUtil = require("~/util/PermissionUtil");
const StorageUtil = require("~/util/StorageUtil");

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
		return android.app.Service.START_STICKY; 
	}, 

    onDestroy: function() {
        // do nothing
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


var accessibilityPermission = false;
var overlayPermission = false;

var checkPermission = function () {
    if (!overlayPermission && PermissionUtil.checkSystemOverlayPermission()) {
        overlayPermission = true;
        var intent = context.getPackageManager().getLaunchIntentForPackage("org.nativescript.HabitLabMobile");
        if (foregroundActivity) {
            foregroundActivity.startActivity(intent);
        }
    } else if (!accessibilityPermission && PermissionUtil.checkAccessibilityPermission()) {
        accessibilityPermission = true;
        var intent = context.getPackageManager().getLaunchIntentForPackage("org.nativescript.HabitLabMobile");
        if (foregroundActivity) {
            foregroundActivity.startActivity(intent);
        }
    } else if (accessibilityPermission && overlayPermission) {
        StorageUtil.addLogEvents([{setValue: new Date().toLocaleString(), category: 'navigation', index: 'finished_onboarding'}]);
        stopTimer();
        context.stopService(new android.content.Intent(context, com.habitlab.PermissionCheckerService.class));
    }
}







