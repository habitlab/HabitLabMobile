var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var UsageUtil = require("~/util/UsageInformationUtil");
var StorageUtil = require("~/util/StorageUtil");
var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');
var layout = require("ui/layouts/grid-layout");
var drawer;

var setOnTap = function(image, packageName, selector) {
  image.on(gestures.tap, function() {
    var selected = StorageUtil.togglePackage(packageName);
    selector.visibility = selected ? 'visible' : 'hidden';
  });
};

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('sideDrawer');
  createGrid(args);
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

var createGrid = function(args) {
  // order by things with icon then by usage
  var list = UsageUtil.getApplicationList();
  list.sort(function compare(a, b) {
    if (!a.averageUsage) {
      return 1;
    } else if (!b.averageUsage) {
      return -1;
    }
    return parseFloat(b.averageUsage) - parseFloat(a.averageUsage);
  });

  var grid = args.object.getViewById('grid');
  for (var i = 0; i < list.length; i++) {
    if (i % 3 === 0) {
      var row = new layout.ItemSpec(1, layout.GridUnitType.AUTO);
      grid.addRow(row);
    }
    grid.addChild(createCell(list[i], Math.floor(i/3), i%3));
  }
};

var setCellInfo = function(cell, info) {
  var image = cell.getViewById("img");
  var label = cell.getViewById("lbl");
  var usage = cell.getViewById("usg");
  var selector = cell.getViewById("slctr");

  label.text = info.label;
  image.src = info.iconSource;
  selector.visibility = StorageUtil.isPackageSelected(info.packageName) ? 'visible' : 'hidden';

  var mins = Math.ceil(info.averageUsage / 60000);
  if (mins || mins === 0) {
    usage.text = mins + ' min/day';
    if (mins >= 15) {
      usage.className = mins >= 30 ? 'app-cell-usg red' : 'app-cell-usg yellow';
    }
  }
  setOnTap(image, info.packageName, selector);
};

var createCell = function(info, r, c)  {
  var cell = builder.load({
    path: 'shared/appgridcell',
    name: 'appgridcell'
  });
  setCellInfo(cell, info);
  layout.GridLayout.setRow(cell, r);
  layout.GridLayout.setColumn(cell, c);
  return cell;
};