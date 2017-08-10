var application = require("application");
var frameModule = require('ui/frame');
var fancyAlert = require("nativescript-fancyalert");
var PermissionUtil = require("~/util/PermissionUtil");
var StorageUtil = require("~/util/StorageUtil");
var page;


exports.pageLoaded = function(args) {
	page = args.object;

  if (!permissionServiceIsRunning()) {
    var trackingServiceIntent = new android.content.Intent(application.android.context, com.habitlab.AccessibilityCheckerService.class); 
    application.android.context.startService(trackingServiceIntent)
  }

	fancyAlert.TNSFancyAlert.showSuccess("Almost there!", "Awesome, just one last thing. We need to be able to monitor the apps you've selected so we can help you build better habits! Please enable the service for HabitLab.", "I'm on it!");
};

//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveAccessibilityPermission = function(args) {
  if (!PermissionUtil.checkAccessibilityPermission()) {
   	PermissionUtil.launchAccessibilityServiceIntent();
 	} else {
    fancyAlert.TNSFancyAlert.showInfo("Ahead of the Game", "You've already authorized HabitLab.", "Sweet!");
    frameModule.topmost().navigate({
      moduleName: 'views/goalsView/goalsView',
      clearHistory: true
    });
	}
}

exports.backEvent = function(args) {
   args.cancel = true; 
}

var permissionServiceIsRunning = function () {
    var manager = application.android.context.getSystemService(android.content.Context.ACTIVITY_SERVICE);
    var services = manager.getRunningServices(java.lang.Integer.MAX_VALUE);
    for (var i = 0; i < services.size(); i++) {
        var service = services.get(i);
        if (service.service.getClassName() === com.habitlab.AccessibilityCheckerService.class.getName()) {
            return true;
        }
    }
    return false;
};