var application = require("application");
var UsageUtil = require("~/util/UsageInformationUtil");
var StorageUtil = require("~/util/StorageUtil");
var frame = require('ui/frame');
var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');
var layout = require("ui/layouts/grid-layout");
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var fancyAlert = require("nativescript-fancyalert");
var timer = require("timer");
var page;
var toToggle;
var pkgs;

exports.gridUnloaded = function(args) {
  args.object.removeChildren();
};

exports.pageLoaded = function(args) {
	page = args.object;
	pkgs = StorageUtil.getSelectedPackages();
  toToggle = {};


  var loader = new LoadingIndicator();
  var options = {
    message: 'Loading...',
    progress: 0.65,
    android: {
      indeterminate: true,
      cancelable: false,
      max: 100,
      progressNumberFormat: "%1d/%2d",
      progressPercentFormat: 0.53,
      progressStyle: 1,
      secondaryProgress: 1
    }
  };
  loader.show(options);

  timer.setTimeout(() => {
    createGrid();
    loader.hide();
  }, 1000);
};

var createGrid = function() {
  var list = UsageUtil.getApplicationList();
  var selectedPackages = StorageUtil.getSelectedPackages();

  list.sort(function(a, b){
    var aIsSelected = selectedPackages.includes(a.packageName);
    var bIsSelected = selectedPackages.includes(b.packageName);

    if (aIsSelected && !bIsSelected) {
      return -1;
    } else if (!aIsSelected && bIsSelected) {
      return 1;
    }  else {
      return a.label.toUpperCase() < b.label.toUpperCase() ? -1 : 1;
    }
  });

  var grid = page.getViewById('grid');
  list.forEach(function (item, i) {
    if (i % 3 === 0) {
      grid.addRow(new layout.ItemSpec(1, layout.GridUnitType.AUTO));
    }
    grid.addChild(createCell(list[i], Math.floor(i/3), i%3));
  });
};

var setCellInfo = function(cell, info) {
  cell.getViewById("lbl").text = info.label;
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
    name: 'appgridcell',
    page: page
  });

  setCellInfo(cell, info);
  layout.GridLayout.setRow(cell, r);
  layout.GridLayout.setColumn(cell, c);
  return cell;
};

exports.onDone = function() {
  Object.keys(toToggle).forEach(function(key) {
    if (toToggle[key]) {
      StorageUtil.togglePackage(key);
    }
  });

  if (!StorageUtil.getSelectedPackages().length) {
    fancyAlert.TNSFancyAlert.showError("Uh Oh!", "Please select at least one app to monitor!", "Okay");
    return;
  }
  var arr = StorageUtil.getSelectedPackages().length;
  console.warn(arr);
  frame.topmost().navigate('views/onboarding/nudgesOnboardingView/nudgesOnboardingView');  
};