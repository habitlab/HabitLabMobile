var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var IM = require('~/interventions/InterventionManager');

var builder = require('ui/builder');
var gestures = require('ui/gestures').GestureTypes;

var drawer;
var page;
var id;
var info;

var createItem = function(pkg)  {
  var item = builder.load({
    path: 'shared/detailelem',
    name: 'detailelem'
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
  sw.checked = StorageUtil.isEnabledForApp(id, pkg);
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForApp(id, pkg);
  });

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
    IM.interventions[id]();
  });

  if (info.target === 'phone') {
    return;
  }

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
    drawer.toggleDrawerState();
};

exports.pageLoaded = function(args) {
  page = args.object;
  drawer = page.getViewById("sideDrawer");
  if (page.navigationContext) {
    id = page.navigationContext.id;
    info = page.navigationContext.info;
  }
  setUpDetail();
};

var application = require("application");
var TimerOverlay = require("~/overlays/TimerOverlay");
var DimmerOverlay = require("~/overlays/DimmerOverlay");
application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args) {
  TimerOverlay.dismissTimer(application.android.context);
  DimmerOverlay.removeDimmer();
});