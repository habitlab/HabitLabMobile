var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var IM = require('~/interventions/InterventionManager');
var fancyAlert = require("nativescript-fancyalert");
var frameModule = require('ui/frame');
var builder = require('ui/builder');
var gestures = require('ui/gestures').GestureTypes;

var drawer;
var page;
var info;
var switchArr;
var mainSwitch;
var mainSwitchLabel;
var events;

var createItem = function(pkg)  {
  var item = builder.load({
    path: 'shared/detailelem',
    name: 'detailelem',
    page: page
  });

  item.id = pkg;
  item.className = 'detail-grid';

  var appInfo = UsageUtil.getBasicInfo(pkg);

  var label = item.getViewById("name");
  label.text = appInfo.name;
  label.className = "detail-label";
  
  var icon = item.getViewById("icon");
  icon.src = appInfo.icon;
  icon.className = 'detail-icon';
  
  var sw = item.getViewById("switch");
  sw.checked = StorageUtil.isEnabledForApp(info.id, pkg);
  sw.on(gestures.tap, function() {
    events.push({category: 'features', index: 'nudge_detail_toggle'});
    StorageUtil.toggleForApp(info.id, pkg);
    mainSwitch.checked = StorageUtil.isEnabledForAll(info.id);
    mainSwitchLabel.text = mainSwitch.checked ? 'Disable All' : 'Enable All';
  });
  switchArr.push(sw);

  return item;
};

var setUpDetail = function() {
  if (page.getViewById('list').getChildAt(0)) { return; }

  page.getViewById('title').text = info.name;
  var desc = page.getViewById('description');
  desc.text = info.description;
  desc.textWrap = true;

  var level = info.level;
  var levelLabel = page.getViewById('level');
  levelLabel.text = level.charAt(0).toUpperCase() + level.slice(1);;
  levelLabel.className += " " + level;

  page.getViewById("button").on(gestures.tap, function() {
    IM.interventions[info.id]();
    events.push({category: 'features', index: 'nudge_detail_demo'});
  });

  mainSwitch = page.getViewById("disable-switch");
  mainSwitchLabel = page.getViewById('disable-label');
  mainSwitch.checked = StorageUtil.isEnabledForAll(info.id);

  if (info.target === 'phone') {
    page.getViewById('disable-toggle').className = 'level-layout';
    mainSwitchLabel.text = mainSwitch.checked ? 'Disable' : 'Enable';
    mainSwitch.on(gestures.tap, function() {
      events.push({category: 'features', index: 'nudge_detail_toggle_all'});
      mainSwitchLabel.text = mainSwitch.checked ? 'Enable' : 'Disable';
      StorageUtil.toggleForAll(info.id);
    });
    return;
  }

  mainSwitchLabel.text = mainSwitch.checked ? 'Disable All' : 'Enable All';
  mainSwitch.on(gestures.tap, function() {
    events.push({category: 'features', index: 'nudge_detail_toggle_all'});
    mainSwitchLabel.text = mainSwitch.checked ? 'Enable All' : 'Disable All';
    StorageUtil.toggleForAll(info.id);
    switchArr.forEach(function(swtch) {
      // toggle happens after this on tap so we have to do it backwards
      swtch.checked = !mainSwitch.checked;
    });
  });

  var layout = page.getViewById('list');
  var pkgs = StorageUtil.getSelectedPackages();

  if (info.apps) {
    pkgs = pkgs.filter(function (item) {
      return info.apps.includes(item);
    });
  }

  pkgs.forEach(function (pkg) {
    if (!layout.getViewById(pkg)) {
      layout.addChild(createItem(pkg));
    }
  });
};

exports.toggleDrawer = function() {
  if (!StorageUtil.isTutorialComplete()) {
    fancyAlert.TNSFancyAlert.showError("Almost there!", "Finish up the tutorial to begin exploring the app!", "Got It!");
  } else {
    events.push({category: "navigation", index: "menu"});
    drawer.toggleDrawerState();
  }
};

exports.pageLoaded = function(args) {
  events = [{category: 'page_visits', index: 'nudges_detail'}];
  switchArr = [];
  page = args.object;
  drawer = page.getViewById("sideDrawer");
  if (page.navigationContext) {
    info = page.navigationContext.info;
  }
  
  setUpDetail();
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