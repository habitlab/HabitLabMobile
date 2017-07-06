var appsList = [];
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var drawer;

exports.pageLoaded = function(args) {
    var page = args.object;
    drawer = page.getViewById("sideDrawer");
    console.log(drawer);
};

// exports.onSelectApp = function(index) {

// };


exports.toggleDrawer = function() {
	console.log(drawer);
    drawer.toggleDrawerState();
};


