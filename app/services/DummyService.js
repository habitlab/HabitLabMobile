// utils
var application = require("application");
const ServiceManager = require("./ServiceManager");
var Timer = require("timer");
var timerID;


/*
 * com.habitlab.DummyService
 * ----------------------------
 * Extension of Android Service class. Just starts a blank foreground
 * service (to get rid of ongoing notification for foreground services).
 * SUPER hacky/sketch, but hey it works for now...
 */
android.app.Service.extend("com.habitlab.DummyService", {
	onStartCommand: function(intent, flags, startId) {
		this.super.onStartCommand(intent, flags, startId);
        startTimer();
        this.startForeground(ServiceManager.getForegroundID(), ServiceManager.getForegroundNotification());
        console.log("DUMMY SERVICE CREATED");
		return android.app.Service.START_STICKY; 
	}, 

    onDestroy: function() {
        // do nothing
        console.log("DUMMY SERVICE DESTROYED");
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
            kill();
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


/**
 * kill
 * ----
 * Function to kill this service.
 */
function kill() {
    stopTimer();
    var context = application.android.context;
    context.stopService(new android.content.Intent(context, com.habitlab.DummyService.class));
}


module.exports = {stopTimer};






