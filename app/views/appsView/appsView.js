var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var UsageUtil = require("~/util/UsageInformationUtil");
var StorageUtil = require("~/util/StorageUtil");
var gestures = require("ui/gestures").GestureTypes;


const NUM_GRID_SLOTS = 9;
var drawer;
var grid;
var list;

var setOnTap = function(image, packageName, selector) {
  image.on(gestures.tap, function() {
    var selected = StorageUtil.togglePackage(packageName);
    selector.src = selected ? '~/images/selected.png' : '';
  });
};

var setGridInfo = function() {

  for (var i = 0; i < NUM_GRID_SLOTS && i < list.length; i++) {
    var cell = grid.getViewById("cell" + i);
    var image = cell.getViewById("img");
    var label = cell.getViewById("lbl");
    var usage = cell.getViewById("usg");
    var selector = cell.getViewById("slctr");

    label.text = list[i].label;
    image.src = list[i].iconSource;

    selector.src = StorageUtil.isPackageSelected(list[i].packageName) ? '~/images/selected.png' : '';

    var mins = Math.ceil(list[i].averageUsage / 60000);
    if (mins || mins === 0) {
      usage.text = mins + ' min/day';
      if (mins >= 15) {
        usage.className = mins >= 30 ? 'app-cell-usg red' : 'app-cell-usg yellow';
      }
    }

    setOnTap(image, list[i].packageName, selector);
  }

};

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('sideDrawer');
  grid = args.object.getViewById('appgrid');
  
  // order by things with icon then by usage
  list = UsageUtil.getApplicationList();
  list.sort(function compare(a, b) {
    if (!a.averageUsage) {
      return 1;
    } else if (!b.averageUsage) {
      return -1;
    }
    return parseFloat(b.averageUsage) - parseFloat(a.averageUsage);
  });

  setGridInfo();

};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};