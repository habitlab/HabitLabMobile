var application = require("application");
const PermissionUtil = require("~/util/PermissionUtil");

var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var drawer;

exports.goToProgress = function() {
  frameModule.topmost().navigate("views/progressView/progressView");
};

exports.goToGoals = function() {
  frameModule.topmost().navigate("views/goalsView/goalsView");
};

exports.goToInterventions = function() {
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};

exports.goToSettings = function() {
  frameModule.topmost().navigate("views/settingsView/settingsView");
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('sideDrawer');
  if (!PermissionUtil.checkActionUsagePermission()) {
	 PermissionUtil.launchActionUsageIntent();
  }  
};