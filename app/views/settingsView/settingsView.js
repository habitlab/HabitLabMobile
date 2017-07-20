var application = require("application");

const TrackingService = require("~/services/TrackingService");
const UnlockService = require("~/services/UnlockService");
const DummyService = require("~/services/DummyService");
const ServiceManager = require("~/services/ServiceManager");
const PermissionUtil = require("~/util/PermissionUtil");
const StorageUtil = require("~/util/StorageUtil");
const DialogOverlay = require("~/overlays/DialogOverlay");
const FullScreenOverlay = require("~/overlays/FullScreenOverlay");

var Toast = require("nativescript-toast");
var dialogs = require("ui/dialogs");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var ActivityManager = android.app.ActivityManager;
var Integer = java.lang.Integer;
var System = java.lang.System;

// global vars
var context = application.android.context.getApplicationContext();
var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);
var dummyServiceIntent = new Intent(context, com.habitlab.DummyService.class);
var drawer;

exports.reset = function() {
	StorageUtil.setUp();
};

exports.enableServices = function() {
	// DialogOverlay.showPosNegDialogOverlay(context, "Hello", "Yes", "No", null, null);
	// FullScreenOverlay.showPosNegDialogOverlay(context, "You can put quite a long text message here, can't you? I wonder how long of a message is too long... The quick brown fox jumped over the lazy dog. Well, if you can see this far, then this text view must be large enough...", "yes", "no", null, null);
	FullScreenOverlay.showPosNegDialogOverlay(context, "Are you sure you'd like to visit Facebook? You've been here 17 times today", "yes", "no", null, null);
};

exports.disableServices = function () {
	console.warn("");
	console.warn("----------------------------");

	var Calendar = java.util.Calendar;
	var UsageStatsManager = android.app.usage.UsageStatsManager;
	var Context = android.content.Context;

	var start = Calendar.getInstance();
	start.set(Calendar.HOUR_OF_DAY, 8);
	start.set(Calendar.MINUTE, 0);
	start.set(Calendar.SECOND, 1);
	start.setTimeInMillis(start.getTimeInMillis());

	var end = Calendar.getInstance();
	end.setTimeInMillis(start.getTimeInMillis());
	end.set(Calendar.HOUR_OF_DAY, 23);
	end.set(Calendar.MINUTE, 59);
	end.set(Calendar.SECOND, 59);
	end.setTimeInMillis(end.getTimeInMillis());

	console.warn("START:", (start.get(Calendar.MONTH) + 1) + "/" 
		+ start.get(Calendar.DATE) + "/" 
		+ start.get(Calendar.YEAR) + " " 
		+ start.get(Calendar.HOUR_OF_DAY) + ":" 
		+ start.get(Calendar.MINUTE) + ":"
		+ start.get(Calendar.SECOND));

	console.warn("END:", (end.get(Calendar.MONTH) + 1) + "/" 
		+ end.get(Calendar.DATE) + "/" 
		+ end.get(Calendar.YEAR) + " " 
		+ end.get(Calendar.HOUR_OF_DAY) + ":" 
		+ end.get(Calendar.MINUTE) + ":"
		+ end.get(Calendar.SECOND));
	console.warn("----------------------------");


	var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
	var list = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start.getTimeInMillis(), end.getTimeInMillis());
	
	for (var i = 0; i < list.size(); i++) {
		var stat = list.get(i);
		// console.log(stat.getPackageName());
		if (stat.getPackageName() === "com.facebook.katana") {
			var firstTimeStamp = Calendar.getInstance();
			firstTimeStamp.setTimeInMillis(stat.getFirstTimeStamp());

			var lastTimeStamp = Calendar.getInstance();
			lastTimeStamp.setTimeInMillis(stat.getLastTimeStamp());

			console.warn("       FIRST:", (firstTimeStamp.get(Calendar.MONTH) + 1) + "/" 
				+ firstTimeStamp.get(Calendar.DATE) + "/" 
				+ firstTimeStamp.get(Calendar.YEAR) + " " 
				+ firstTimeStamp.get(Calendar.HOUR_OF_DAY) + ":" 
				+ firstTimeStamp.get(Calendar.MINUTE) + ":"
				+ firstTimeStamp.get(Calendar.SECOND));

			console.warn("       LAST:", (lastTimeStamp.get(Calendar.MONTH) + 1) + "/" 
				+ lastTimeStamp.get(Calendar.DATE) + "/" 
				+ lastTimeStamp.get(Calendar.YEAR) + " " 
				+ lastTimeStamp.get(Calendar.HOUR_OF_DAY) + ":" 
				+ lastTimeStamp.get(Calendar.MINUTE) + ":"
				+ lastTimeStamp.get(Calendar.SECOND));

			console.warn("       TIME:", stat.getTotalTimeInForeground());
			console.warn("------------------");
		}
	}
};

exports.toggleDrawer = function() {
	drawer.toggleDrawerState();
};


exports.getRunningServices = function() {
	// var intent = new Intent("android.settings.APP_NOTIFICATION_SETTINGS");
	// intent.putExtra("app_package", context.getPackageName());
	// intent.putExtra("app_uid", context.getApplicationInfo().uid);

	// var foregroundActivity = application.android.foregroundActivity;
	// foregroundActivity.startActivity(intent);


	ServiceManager.getRunningServices();
};


exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer"); 
};
