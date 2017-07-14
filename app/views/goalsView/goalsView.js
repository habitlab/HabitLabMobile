var frameModule = require("ui/frame");
var drawer;

exports.onManageApps = function() {
  frameModule.topmost().navigate("views/appsView/appsView");
};

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById("sideDrawer");
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};