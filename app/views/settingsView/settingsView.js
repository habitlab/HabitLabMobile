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

// global vars
var context = application.android.context.getApplicationContext();
var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);
var page;
var drawer;

exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer"); 
}

exports.enableServices = function() {
	if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		context.startService(trackingServiceIntent);
	}

	if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		context.startService(unlockServiceIntent);
	}
}

exports.disableServices = function () {
	if (ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		TrackingService.stopTimer();
		context.stopService(trackingServiceIntent);
	}

	if (ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		context.stopService(unlockServiceIntent);
	}
}

exports.toggleDrawer = function() {
	drawer.toggleDrawerState();
};

exports.getRunningServices = function() {
	ServiceManager.getRunningServices();
}


