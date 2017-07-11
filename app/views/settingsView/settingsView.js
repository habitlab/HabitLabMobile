var application = require("application");

const TrackingService = require("~/services/TrackingService");
const UnlockService = require("~/services/UnlockService");
const ServiceManager = require("~/services/ServiceManager");
const PermissionUtil = require("~/util/PermissionUtil");

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

exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer");
	if (!PermissionUtil.checkActionUsagePermission()) {
		PermissionUtil.launchActionUsageIntent();
	} 
}

exports.enableService = function() {
	if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		Toast.makeText("Tracking Enabled").show();
		context.startService(trackingServiceIntent);
	}

	if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		Toast.makeText("Unlocks Enabled").show();
		context.startService(unlockServiceIntent);
	}
}

exports.disableService = function () {
	if (ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		Toast.makeText("Tracking Disabled").show();
		TrackingService.stopTimer();
		context.stopService(trackingServiceIntent);
	}

	if (ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		Toast.makeText("Unlocks Disabled").show();
		context.stopService(unlockServiceIntent);
	}
}

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.getRunningServices = function() {
	ServiceManager.getRunningServices();
}



