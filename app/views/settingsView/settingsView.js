var usageUtil = require('~/util/UsageInformationUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var drawer;

var Toast = require("nativescript-toast"); // install nativescript-toast plugin

var application = require("application");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var ActivityManager = android.app.ActivityManager;
var Integer = java.lang.Integer;

// contexts
var context = application.android.context.getApplicationContext();

// // custom classes
const TrackingService = require("~/TrackingService");

// global vars
var mServiceIntent = new Intent(context, com.habitlab.TrackingService.class);

function checkActionUsagePermission() {
	var appOps = context.getSystemService(Context.APP_OPS_SERVICE);
	var mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.getPackageName());
    return mode === AppOpsManager.MODE_ALLOWED;
}

function launchActionUsageIntent() {
	var int = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
	application.android.foregroundActivity.startActivity(int);	
}

exports.pageLoaded = function() {
	if (!checkActionUsagePermission()) {
		launchActionUsageIntent();
	} else {
		context.startService(mServiceIntent); 
	}	
}

exports.enableService = function() {
	Toast.makeText("Starting Service").show();
	if (!isServiceRunning()) {
		context.startService(mServiceIntent);
	}
}

exports.disableService = function () {
	if (isServiceRunning()) {
		TrackingService.stopTimer();
		context.stopService(mServiceIntent);
		Toast.makeText("Stopping Service").show();
	}
}

exports.getRunningServices = function() {
	getRunningServices();
}

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};

var isServiceRunning = function () {
	var manager = context.getSystemService(Context.ACTIVITY_SERVICE);
	var services = manager.getRunningServices(Integer.MAX_VALUE);
	for (var i = 0; i < services.size(); i++) {
		var service = services.get(i);
		if (service.service.getClassName() === com.habitlab.TrackingService.class.getName()) {
			return true;
		}
	}
	return false;
}

var getRunningServices = function() {	
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

