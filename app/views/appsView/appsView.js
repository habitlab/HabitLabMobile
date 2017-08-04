var application = require("application");
var UsageUtil = require("~/util/UsageInformationUtil");
var StorageUtil = require("~/util/StorageUtil");
var fancyAlert = require("nativescript-fancyalert");

var frame = require('ui/frame');
var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');
var layout = require("ui/layouts/grid-layout");
var timer = require("timer");

var drawer;
var pkgs;
var toToggle;

exports.onUnloaded = function(args) {
  args.object.removeChildren();
};

var randBW = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

var createGrid = function(args) {
  var list = UsageUtil.getApplicationList();

  var grid = args.object.getViewById('grid');
  list.forEach(function (item, i) {
    if (i % 3 === 0) {
      grid.addRow(new layout.ItemSpec(1, layout.GridUnitType.AUTO));
    }
    grid.addChild(createCell(list[i], Math.floor(i/3), i%3));
  });
  console.warn(Date.now());
};

var setCellInfo = function(cell, info) {
  cell.getViewById("lbl").text = info.label;

  // var usage = cell.getViewById("usg");
  // var mins = Math.ceil(0);
  // usage.text = mins + ' min/day';
  // if (mins >= 15) {
  //   usage.className = mins >= 30 ? 'app-cell-usg red' : 'app-cell-usg yellow';
  // }

  var selector = cell.getViewById("slctr");
  selector.visibility = pkgs.includes(info.packageName) ? 'visible' : 'hidden';

  var image = cell.getViewById("img");
  image.src = info.iconSource;
  image.on(gestures.tap, function() {
    selector.visibility = selector.visibility === 'visible' ? 'hidden' : 'visible';
    toToggle[info.packageName] = !toToggle[info.packageName];
  });

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

exports.pageLoaded = function(args) { 
  toToggle = {};
  drawer = args.object.getViewById('sideDrawer');
  pkgs = StorageUtil.getSelectedPackages();

  timer.setTimeout(() => {
    createGrid(args);
    console.warn("Done!");
  }, 300);
};

exports.toggleDrawer = function() {
  if (!StorageUtil.isOnboarded()) {
    fancyAlert.TNSFancyAlert.showError("Almost done!", "Click done to set up your watchlist!", "Got It!");
  } else {
    drawer.toggleDrawerState();
  }
};

exports.onDone = function() {
  //notification on done (first time only)

  var wasChanged = false;
  Object.keys(toToggle).forEach(function(key) {
    if (toToggle[key]) {
      StorageUtil.togglePackage(key);
      wasChanged = true;
    }
  });

  if (!StorageUtil.getSelectedPackages().length) {
    fancyAlert.TNSFancyAlert.showError("Uh Oh!", "Please select at least one app to monitor!", "Okay");
    return;
  }

  var onboarded = StorageUtil.isOnboarded();
  if (!onboarded) {
    fancyAlert.TNSFancyAlert.showSuccess("Last step!", "Set goals for your phone and app usage.", "Got it!");
  } 

  if (onboarded) {
    frame.topmost().goBack();
  } else {
    frame.topmost().navigate({
      moduleName: 'views/goalsView/goalsView',
      context: {
        updated: wasChanged
      }
    });
  }
};