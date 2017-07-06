var usageUtil = require('~/util/UsageInformationUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var drawer;

// native APIs
var Calendar = java.util.Calendar;

exports.pageLoaded = function (args) {
	var page = args.object;
    drawer = view.getViewById(page, "sideDrawer");
	if (!permissionUtil.checkActionUsagePermission()) {
		permissionUtil.launchActionUsageIntent();
	}

	var list = usageUtil.getApplicationList();

	var packageName = "com.facebook.katana";

	console.log("Facebook usage breakdown: ")
	console.log("     Minutes: ", usageUtil.getTimeOnApplicationSingleDay(packageName, 2));








	// for (var i = 0; i < list.length; i++) {
	// 	var app = list[i];

	// 	var installDate = Calendar.getInstance();
	// 	installDate.setTimeInMillis(app.installationTime);

	// 	console.log(app.label, "INSTALLED: ", (installDate.get(Calendar.MONTH) + 1) + "/" + installDate.get(Calendar.DAY_OF_MONTH) + "/" + installDate.get(Calendar.YEAR));
	// }


}


exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};


// --------------- to delete when get custom compoentns working 
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