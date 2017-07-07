// requires
var application = require("application");
const TrackingService = require("~/util/TrackingService");
var Toast = require("nativescript-toast");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var drawer;

var UsageUtil = require("~/util/UsageInformationUtil.js");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var ActivityManager = android.app.ActivityManager;
var Integer = java.lang.Integer;

// global vars
var context = application.android.context.getApplicationContext();
var mServiceIntent = new Intent(context, com.habitlab.TrackingService.class);

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
		Toast.makeText("Starting Service").show();
		context.startService(mServiceIntent);
	}
}

exports.disableService = function () {
	if (TrackingService.isServiceRunning()) {
		Toast.makeText("Stopping Service").show();
		TrackingService.stopTimer();
		context.stopService(mServiceIntent);
	}
}

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.getRunningServices = function() {	

	var list = UsageUtil.getApplicationList();

	for (var i = 0; i < list.length; i++) {
		console.log(list[i].label, list[i].averageUsage, list[i].packageName);
	}



	// console.log("---------------------------------------------");
	// var manager = context.getSystemService(Context.ACTIVITY_SERVICE);
	// var services = manager.getRunningServices(Integer.MAX_VALUE);
	// for (var i = 0; i < services.size(); i++) {
	// 	var service = services.get(i);
	// 	if (service.service.getClassName() === com.habitlab.TrackingService.class.getName()) {
	// 		console.log("=====>", service.service.getClassName());
	// 	} else {
	// 		console.log("      ", service.service.getClassName());
	// 	}	
	// }
}



