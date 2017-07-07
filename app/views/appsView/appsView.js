var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var drawer;

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('drawer');
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};