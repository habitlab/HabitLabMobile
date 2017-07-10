var application = require("application");
const TrackingService = require("~/util/TrackingService");
const UnlockService = require("~/util/UnlockService");
var Toast = require("nativescript-toast");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var dialogs = require("ui/dialogs");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var ActivityManager = android.app.ActivityManager;
var Integer = java.lang.Integer;
var drawer;

// global vars
var context = application.android.context.getApplicationContext();
var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);

// only here until added to onboarding
function checkActionUsagePermission() {
	var appOps = context.getSystemService(Context.APP_OPS_SERVICE);
	var mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.getPackageName());
    return mode === AppOpsManager.MODE_ALLOWED;
}

// only here until added to onboarding
function launchActionUsageIntent() {
	var int = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
	application.android.foregroundActivity.startActivity(int);	
}

exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer");
	if (!checkActionUsagePermission()) {
		launchActionUsageIntent();
	} 
}

exports.enableService = function() {
	if (!TrackingService.isServiceRunning()) {
		Toast.makeText("Tracking Enabled").show();
		context.startService(trackingServiceIntent);
	}

	if (!UnlockService.isServiceRunning()) {
		Toast.makeText("Unlocks Enabled").show();
		context.startService(unlockServiceIntent);
	}
}

exports.disableService = function () {
	if (TrackingService.isServiceRunning()) {
		Toast.makeText("Tracking Disabled").show();
		TrackingService.stopTimer();
		context.stopService(trackingServiceIntent);
	}

	if (UnlockService.isServiceRunning()) {
		Toast.makeText("Unlocks Disabled").show();
		context.stopService(unlockServiceIntent);
	}
}

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};


var utils = require("utils/utils");

exports.getRunningServices = function() {	
	console.log("---------------------------------------------");
	var manager = context.getSystemService(Context.ACTIVITY_SERVICE);
	var services = manager.getRunningServices(Integer.MAX_VALUE);
	for (var i = 0; i < services.size(); i++) {
		var service = services.get(i);
		if (service.service.getClassName() === com.habitlab.TrackingService.class.getName()) {
			console.log("=====>", service.service.getClassName());
		} else {
			console.log("      ", service.service.getClassName());
		}	
	}
}



