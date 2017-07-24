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

};

exports.disableServices = function () {
	
};

exports.toggleDrawer = function() {
	drawer.toggleDrawerState();
};


exports.getRunningServices = function() {
	ServiceManager.getRunningServices();
};


exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer"); 
};
