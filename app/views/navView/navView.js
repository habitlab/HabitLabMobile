var application = require("application");
var PermissionUtil = require("~/util/PermissionUtil");

var frameModule = require("ui/frame");

var drawer;

exports.goToProgress = function() {
  frameModule.topmost().navigate("views/progressView/progressView");
};

exports.goToGoals = function() {
  frameModule.topmost().navigate("views/goalsView/goalsView");
};

exports.goToInterventions = function() {
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};

exports.goToSettings = function() {
  frameModule.topmost().navigate("views/settingsView/settingsView");
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.pageLoaded = function(args) {
  /** SERVICE STARTER **/
  if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
    context.startService(trackingServiceIntent);
  }

  if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
    context.startService(unlockServiceIntent);
  }

  if (!ServiceManager.isRunning(com.habitlab.DummyService.class.getName())) {
    context.startService(dummyServiceIntent);
  }  
  
  drawer = args.object.getViewById('sideDrawer');
  if (!PermissionUtil.checkActionUsagePermission()) {
    PermissionUtil.launchActionUsageIntent();
  } else if (!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
  } 
};


