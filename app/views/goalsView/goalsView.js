var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var drawer;

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById("sideDrawer");
};

exports.onManageApps = function() {
  frameModule.topmost().navigate("views/appsView/appsView");
};


exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};