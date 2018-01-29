var frame = require('ui/frame')
var fancyAlert = require("nativescript-fancyalert");
var PermissionUtil = require("~/util/PermissionUtil");
var page;


exports.pageLoaded = function(args) {
	page = args.object;
  fancyAlert.TNSFancyAlert.showInfo("Let us nudge you!", "Some of our nudges need to be able to show you alerts while you are in other apps. Please enable the overlay permission for us.", "Got it!");
};


//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveDrawPermission = function(args) {
  if(!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
  } else {
    fancyAlert.TNSFancyAlert.showInfo("Ahead of the game", "You've already authorized HabitLab.", "Sweet!");
    frame.topmost().navigate({
      moduleName: 'views/onboarding/accessibilityPermissionView/accessibilityPermissionView',
    });
  }
};

exports.backEvent = function(args) {
   args.cancel = true; 
}