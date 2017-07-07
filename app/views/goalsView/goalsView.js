var appsList = [];
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var drawer;

exports.pageLoaded = function(args) {
  var page = args.object;
  drawer = page.getViewById("sideDrawer");
};

exports.onManageApps = function() {
  frameModule.topmost().navigate("views/appsView/appsView");
};


exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};


