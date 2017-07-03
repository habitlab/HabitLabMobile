var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var drawer;

exports.pageLoaded = function(args) {
    var page = args.object;
    drawer = view.getViewById(page, "sideDrawer");
};

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};

