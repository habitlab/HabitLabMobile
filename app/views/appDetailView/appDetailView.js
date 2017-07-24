var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var IM = require('~/interventions/InterventionManager');

var builder = require('ui/builder');
var gestures = require('ui/gestures').GestureTypes;

var drawer;
var page;
var id;
var enabled;
var pkg;

var createItem = function(id)  {
  var item = builder.load({
    path: 'shared/togglelistelem',
    name: 'togglelistelem'
  });

  item.id = 'intervention' + id;
  item.className = 'app-detail-grid';

  var label = item.getViewById("name");
  label.text = UsageUtil.interventionDetails[id].name;
  label.className = "app-detail-label";
    
  var sw = item.getViewById("switch");
  sw.checked = StorageUtil.isEnabledForApp(id, pkg);
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForApp(id, pkg);
  });

  return item;
};

var setUpDetail = function(packageName) {
  page.getViewById('title').text = packageName;

  // var level = StorageUtil.interventionDetails[id].level;
  // var levelLabel = page.getViewById('level');
  // levelLabel.text = level;
  // levelLabel.className += " " + level;

  var layout = page.getViewById('list');
  var interventions = StorageUtil.getInterventionsForApp();

  interventions.forEach(function (id) {
    if (!layout.getViewById('intervention' + id)) {
      layout.addChild(createItem(id));
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
  }

  pkg = args.navigationContext && args.navigationContext.packageName;
  if (pkg) {
    setUpDetail(pkg);
  }
};