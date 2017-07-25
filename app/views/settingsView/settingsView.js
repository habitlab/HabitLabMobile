var application = require("application");

const TrackingService = require("~/services/TrackingService");
const UnlockService = require("~/services/UnlockService");
const DummyService = require("~/services/DummyService");
const ServiceManager = require("~/services/ServiceManager");
const PermissionUtil = require("~/util/PermissionUtil");
const StorageUtil = require("~/util/StorageUtil");

// expose native APIs
var drawer;

exports.reset = function() {
	StorageUtil.setUp();
};

exports.enableServices = function() {
	var foregroundActivity = application.android.foregroundActivity;
	var int = new android.content.Intent(android.provider.Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
	var uri = android.net.Uri.fromParts("package", application.android.context.getPackageName(), null);
	int.setData(uri);
	foregroundActivity.startActivity(int);
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
