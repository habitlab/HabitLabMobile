var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var IM = require('~/interventions/InterventionManager');
var fancyAlert = require("nativescript-fancyalert");
var frameModule = require('ui/frame');
var observable = require("data/observable");
var permissionUtil = require('~/util/PermissionUtil')
var FancyAlert = require("~/util/FancyAlert")
var drawer;
var page;
var mainSwitch;
var events;
var id;

exports.toggleDrawer = function() {
  if (!StorageUtil.isTutorialComplete()) {
    fancyAlert.TNSFancyAlert.showError("Almost there!", "Finish up the tutorial to begin exploring the app!", "Got It!");
  } else {
    events.push({category: "navigation", index: "menu"});
    drawer.toggleDrawerState();
  }
};

//Demo button
exports.onButtonTap = function() {
  IM.interventions[id]();
  events.push({category: 'features', index: 'nudge_detail_demo'});
};

var initializeList = function() {
  var info = page.navigationContext.info;
  id = info.id;

  pageData.set('name', info.name);
  pageData.set('description', info.description);
  pageData.set('target', info.target);
  pageData.set('levelLabel', info.level.charAt(0).toUpperCase() + info.level.slice(1));
  pageData.set('level', info.level);

  var isEnabled = StorageUtil.isEnabledForAll(id);
  pageData.set('enabled', isEnabled);

  mainSwitch = page.getViewById('main-toggle');
  if (info.target === 'phone') {
    return;
  }

  var apps = StorageUtil.getSelectedPackages().filter(function (pkg) {
    return !info.apps || info.apps.includes(pkg);
  }).map(function (pkgName) {
    var basicInfo = UsageUtil.getBasicInfo(pkgName);
    return {
      appName: basicInfo.name,
      icon: basicInfo.icon,
      packageName: pkgName,
      enabled: StorageUtil.isEnabledForApp(id, pkgName)
    };
  });
  pageData.set('apps', apps);
};

exports.onItemTap = function(args) {
  events.push({category: 'features', index: 'nudge_detail_toggle'});
  var bound = args.object.parent.bindingContext;
  StorageUtil.toggleForApp(id, bound.packageName);
  
  var isEnabled = StorageUtil.isEnabledForAll(id);
  pageData.set('enabled', isEnabled);
};

exports.onMainToggle = function(args) {
  events.push({category: 'features', index: 'nudge_detail_toggle_all'});
  StorageUtil.toggleForAll(id);

  if (args.object.bindingContext.target === 'phone') return;
  var enableValue = !args.object.bindingContext.enabled;
  pageData.get('apps').forEach(function (appInfo) {
    appInfo.enabled = enableValue;
  });

  listView.refresh();
};

exports.pageLoaded = function(args) {
  events = [{category: 'page_visits', index: 'nudges_detail'}];
  page = args.object;
  pageData = new observable.Observable();
  page.bindingContext = pageData;
  drawer = page.getViewById("sideDrawer");
  listView = page.getViewById('app-list-view');
  initializeList();
  var cb = function() {
    permissionUtil.launchAccessibilityServiceIntent();
  };
  if (!permissionUtil.checkAccessibilityPermission()) {
    FancyAlert.show(FancyAlert.type.INFO, "Oops!", "Looks like our accessibility service was stopped, please re-enable to allow our nudges to work!",
        "Take me there!", cb);
  }
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};

var application = require("application");
var TimerOverlay = require("~/overlays/TimerOverlay");
var DimmerOverlay = require("~/overlays/DimmerOverlay");
application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
  TimerOverlay.dismissTimer(application.android.context);
  DimmerOverlay.removeDimmer();
});