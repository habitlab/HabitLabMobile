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
	FullScreenOverlay.showPosNegDialogOverlay(context, "Continue to Facebook?", "You've already been here 25 times today", "yes please", "get me out of here!", null, null);
};

exports.disableServices = function () {
	// var list = StorageUtil.getSelectedPackages();

	// for (var i = 0; i < list.length; i++) {
	// 	var pkg = list[i];
	// 	var time = StorageUtil.getAppTime(pkg, StorageUtil.days.TODAY);

	// 	console.warn("Package: " + pkg, "| Time Spent: " + time);
	// }


	// var time = StorageUtil.getTotalTime(StorageUtil.days.TODAY);
	// console.warn(time);
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
