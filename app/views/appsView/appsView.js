var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var UsageUtil = require("~/util/UsageInformationUtil");
var StorageUtil = require("~/util/StorageUtil");
var gestures = require("ui/gestures").GestureTypes;


const NUM_GRID_SLOTS = 9;
var drawer;
var grid;
var list;

var setOnTap = function(image, packageName) {
  image.on(gestures.tap, function() {
    StorageUtil.togglePackage(packageName);
  });
};

var setGridInfo = function() {

  for (var i = 0; i < NUM_GRID_SLOTS && i < list.length; i++) {
    var cell = grid.getViewById("cell" + i);
    var image = cell.getViewById("img");
    var label = cell.getViewById("lbl");
    var usage = cell.getViewById("usg");

    label.text = list[i].label;
    usage.text = Math.ceil(list[i].averageUsage / 60000) || 'no data';
    image.src = list[i].iconSource;
    setOnTap(image, list[i].packageName);
  }

};

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('sideDrawer');
  grid = args.object.getViewById('appgrid');
  
  // order by things with icon then by usage
  list = UsageUtil.getApplicationList()
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