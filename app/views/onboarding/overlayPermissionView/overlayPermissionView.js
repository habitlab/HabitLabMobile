var frame = require('ui/frame')
var fancyAlert = require("nativescript-fancyalert");
var PermissionUtil = require("~/util/PermissionUtil");
var StorageUtil = require("~/util/StorageUtil")
var page;
const application = require("application");


exports.pageLoaded = function(args) {
  page = args.object;
  StorageUtil.addLogEvents([{category: "navigation", index: "overlayPermissionView"}])
  fancyAlert.TNSFancyAlert.showInfo("Let us nudge you!", "Some of our nudges need to be able to show you alerts while you are in other apps. Please enable the overlay permission for us.", "Got it!");
};


//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveDrawPermission = function(args) {
  if(!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
  } else {
    frame.topmost().navigate({
      moduleName: 'views/onboarding/accessibilityPermissionView/accessibilityPermissionView',
    });
  }
};

if (application.android) {
  application.android.on(application.AndroidApplication.activityResumedEvent, function (args) {
      console.log("Event: " + args.eventName + ", Activity: " + args.activity);
      if  (frame.topmost() == page) {
        if(PermissionUtil.checkSystemOverlayPermission()) {
          frame.topmost().navigate({
            moduleName: 'views/onboarding/accessibilityPermissionView/accessibilityPermissionView',
          });
        }
      }
  });
}

exports.backEvent = function(args) {
   args.cancel = true; 
}