var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var drawer;

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById("sideDrawer");
};

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};