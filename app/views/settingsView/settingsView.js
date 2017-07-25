var application = require("application");
var frame = require("ui/frame");

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


exports.toggleDrawer = function() {
	drawer.toggleDrawerState();
};


exports.goToFAQ = function () {
	frame.topmost().navigate("views/faqView/faqView");
};


exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer"); 
};
