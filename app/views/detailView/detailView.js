var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var IM = require('~/interventions/InterventionManager');

var builder = require('ui/builder');
var gestures = require('ui/gestures').GestureTypes;

var drawer;
var page;
var id;

var createItem = function(pkg)  {
  var item = builder.load({
    path: 'shared/detailelem',
    name: 'detailelem'
  });

  item.id = pkg;
  item.getViewById("name").text = UsageUtil.getAppName(pkg);
  item.getViewById("icon").src = UsageUtil.getIcon(pkg);
  
  var sw = item.getViewById("switch");
  sw.checked = StorageUtil.isEnabledForApp(id, pkg);
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForApp(id, pkg);
  });

  return item;
};

var setUpDetail = function() {
  page.getViewById('title').text = StorageUtil.interventionDetails[id].name;
  var desc = page.getViewById('description');
  desc.text = StorageUtil.interventionDetails[id].description;
  desc.textWrap = true;

  var level = StorageUtil.interventionDetails[id].level
  var levelLabel = page.getViewById('level');
  levelLabel.text = level;
  levelLabel.className = level;

  page.getViewById("button").on(gestures.tap, function() {
    var packages = StorageUtil.getSelectedPackages();
    if (StorageUtil.interventionDetails[id].target === 'phone' || packages.length !== 0) {
      StorageUtil.forceIntervene();
      IM.interventions[id](packages[0]);
      StorageUtil.unforceIntervene();
    } else {
      Toast.makeText('Unable to try - no apps selected.').show();
    }
  });

  if (StorageUtil.interventionDetails[id].target === 'phone') {
    return;
  }

  var layout = page.getViewById('list');
  var pkgs = StorageUtil.getSelectedPackages();

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
  id = page.navigationContext.id;
  setUpDetail();
};