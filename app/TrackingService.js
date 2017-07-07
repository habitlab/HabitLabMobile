var application = require("application");
var Toast = require("nativescript-toast"); // install nativescript-toast plugin
var context = application.android.context.getApplicationContext();

// expose native APIs
var Context = android.content.Context;
var System = java.lang.System;
var Service = android.app.Service;
var UsageEvents = android.app.usage.UsageEvents;

// global vars
var timer = require("timer");
var timerID;


android.app.Service.extend("com.habitlab.TrackingService", {
	onStartCommand: function(intent, flags, startId) {
		this.super.onStartCommand(intent, flags, startId);
		startTimer();
		return Service.START_STICKY; 
	}, 

	onDestroy: function() {
		this.super.onDestroy();
		console.log("DESTROYED");
	}, 

    onCreate: function() {
        
    },

    onBind: function(intent) {
        // console.log("##onBind NOT YET IMPLEMENTED");
    }
});

var startTimer = function() {
	if (!timerID) {
		timerID = timer.setInterval(() => {
			tracking();
		}, 1000);
	}
}

var stopTimer = function() {
	timer.clearInterval(timerID);
	timerID = 0;
}

var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
var event = new UsageEvents.Event();
var previousPackageName = "";

var statsMap = [0, 0, 0, 0];

var tracking = function () {
	var events = usageStatsManager.queryEvents(System.currentTimeMillis() - 100000, System.currentTimeMillis());

    while (events.hasNextEvent()) {
    	events.getNextEvent(event);
    }

    var packageName = event.getPackageName();

    if (event !== null && event.getEventType() === UsageEvents.Event.MOVE_TO_FOREGROUND && previousPackageName !== packageName) {
    	console.log("Active Package:", packageName);
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

module.exports = {stopTimer: stopTimer};