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


exports.goToProgress = function() {
  frameModule.topmost().navigate("views/progressView/progressView");
};


exports.goToGoals = function() {
  frameModule.topmost().navigate("views/goalsView/goalsView");
};


exports.goToSettings = function() {
  frameModule.topmost().navigate("views/settingsView/settingsView");
};


exports.goToInterventions = function() {
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};