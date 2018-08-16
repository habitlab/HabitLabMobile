var frame = require('ui/frame')
var fancyAlert = require("nativescript-fancyalert");
var PermissionUtil = require("~/util/PermissionUtil");
var StorageUtil = require("~/util/StorageUtil")
var page;
const application = require("application");
const fromObject = require("data/observable").fromObject;


exports.pageLoaded = function(args) {
  page = args.object
  source = fromObject({
    button_text: "Give Overlay Permission",
    text_field : "Many nudges require us to draw on top of other applications. To allow nudges to work, please enable the overlay permission.",
    done: "visible"
  })
  page.bindingContext = source
  StorageUtil.addLogEvents([{category: "navigation", index: "overlayPermissionView"}])
  if (!PermissionUtil.checkSystemOverlayPermission()) {
    fancyAlert.TNSFancyAlert.showInfo("Let us nudge you!", "Some of our nudges need to be able to show you alerts while you are in other apps. Please enable the overlay permission for us.", "Got it!");
  } else if (frame.topmost() == page) {
    frame.topmost().navigate({
      moduleName: 'views/onboarding/accessibilityPermissionView/accessibilityPermissionView',
    });
  } else {
    //Set button text to move on:
    source.set("button_text", "Move On")
    source.set("text_field",  "Awesome! You enabled the overlay permission!")
    source.set("done", "hidden")
  }
  
};


//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveDrawPermission = function(args) {
  if(!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
  } else {
    exports.moveOn()
  }
};

exports.backEvent = function(args) {
   args.cancel = true; 
}

exports.moveOn = function(args) {
  frame.topmost().navigate({
    moduleName: 'views/onboarding/accessibilityPermissionView/accessibilityPermissionView',
  });
}