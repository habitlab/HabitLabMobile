var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var IM = require('~/interventions/InterventionManager');

var builder = require('ui/builder');
var gestures = require('ui/gestures').GestureTypes;

var drawer;
var page;
var pkg;
var name;
var icon;

var createItem = function(enabled, id)  {
  var item = builder.load({
    path: 'shared/togglelistelem',
    name: 'togglelistelem'
  });

  item.id = 'intervention' + id;
  item.className = 'app-detail-grid';

  var label = item.getViewById("name");
  label.text = StorageUtil.interventionDetails[id].name;
  label.className = "app-detail-label";
    
  var sw = item.getViewById("switch");
  sw.checked = enabled;
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForApp(id, pkg);
  });

  return item;
};

var setUpDetail = function(packageName) {
  page.getViewById('app-detail-title').text = name;
  page.getViewById('app-detail-icon').src = icon;

  var average = 50; // bogus value so it compiles // UsageUtil.getAvgTimeOnAppThisWeek(packageName);
  var averageLabel = page.getViewById('average');
  averageLabel.text = average + ' minutes/day';
  var level = " good";
  if (average >= 15) {
    level = average >= 30 ? ' bad' : ' medium';
  }
  averageLabel.className += level;

  var layout = page.getViewById('list');
  var interventions = StorageUtil.getInterventionsForApp(packageName);

  interventions.forEach(function (enabled, id) {
    if (!layout.getViewById('intervention' + id) && StorageUtil.interventionDetails[id].target === 'app') {
      layout.addChild(createItem(enabled, id));
    }
  });

};

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};

exports.pageLoaded = function(args) {
  page = args.object;
  drawer = page.getViewById("sideDrawer");

  if ( page.navigationContext) {
    pkg = page.navigationContext.packageName;
    name = page.navigationContext.name;
    icon = page.navigationContext.icon;
    setUpDetail(pkg);
  }
};