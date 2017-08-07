var frameModule = require("ui/frame");
var fancyAlert = require("nativescript-fancyalert");
var PermissionUtil = require("~/util/PermissionUtil");
var page;


exports.pageLoaded = function(args) {
	page = args.object;
}


//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveAccessibilityPermission = function(args) {

  if (!PermissionUtil.checkAccessibilityPermission()) {
    PermissionUtil.launchAccessibilityServiceIntent();
 } else {
    fancyAlert.TNSFancyAlert.showInfo("Ahead of the Game", "You've already authorized HabitLab. Swipe to continue!", "Sweet!");
 }
};