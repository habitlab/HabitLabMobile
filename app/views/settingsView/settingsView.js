var application = require("application");

const TrackingService = require("~/services/TrackingService");
const UnlockService = require("~/services/UnlockService");
const DummyService = require("~/services/DummyService");
const ServiceManager = require("~/services/ServiceManager");
const PermissionUtil = require("~/util/PermissionUtil");
const StorageUtil = require("~/util/StorageUtil");
const DialogOverlay = require("~/overlays/DialogOverlay");

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

	var util = require("~/util/UsageInformationUtil");

	var map = util.getApplicationList();

	var facebook = map.get("com.facebook.katana")
	var messenger = map.get("com.facebook.orca");

	console.log("Facebook:", facebook.getTotalTimeInForeground());
	console.log("Messenger:", messenger.getTotalTimeInForeground());


	// if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
	// 	context.startService(trackingServiceIntent);
	// }

	// if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
	// 	context.startService(unlockServiceIntent);
	// }

	// if (!ServiceManager.isRunning(com.habitlab.DummyService.class.getName())) {
	// 	context.startService(dummyServiceIntent);
	// }
};

exports.disableServices = function () {
	// if (ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
	// 	TrackingService.stopTimer();
	// 	context.stopService(trackingServiceIntent);
	// }

	// if (ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
	// 	context.stopService(unlockServiceIntent);
	// }
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
