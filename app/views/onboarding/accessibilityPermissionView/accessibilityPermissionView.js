var application = require("application");
var frameModule = require('ui/frame');
var fancyAlert = require("nativescript-fancyalert");
var PermissionUtil = require("~/util/PermissionUtil");
var StorageUtil = require("~/util/StorageUtil");
var page;


exports.pageLoaded = function(args) {
	page = args.object;

  if (PermissionUtil.checkAccessibilityPermission()) {
    page.getViewById('accessibilityButton').text = "Finish";
  } else {
    fancyAlert.TNSFancyAlert.showSuccess("Almost there!", "Awesome, just one last thing. We need to be able to monitor the apps you've selected so we can help you build better habits! Please enable the service for HabitLab.", "I'm on it!");
  }
};

//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveAccessibilityPermission = function(args) {
  if (!PermissionUtil.checkAccessibilityPermission()) {
   	PermissionUtil.launchAccessibilityServiceIntent();
 	} else {
    frameModule.topmost().navigate({
      moduleName: 'views/goalsView/goalsView',
      clearHistory: true
    });
	}
}

exports.backEvent = function(args) {
   args.cancel = true; 
}