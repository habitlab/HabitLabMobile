var application = require("application");
var UsageUtil = require("~/util/UsageInformationUtil");
var StorageUtil = require("~/util/StorageUtil");
var frame = require('ui/frame');
var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');
var layout = require("ui/layouts/grid-layout");
var fancyAlert = require("nativescript-fancyalert");
var timer = require("timer");
var page;
var toToggle;
var pkgs;
const fromObject = require("data/observable").fromObject;

exports.gridUnloaded = function(args) {
  args.object.removeChildren();
};

exports.pageLoaded = function(args) {
  page = args.object;
  source = fromObject({
    progress_value: 0,
    progress_visibility: "visible",
    prompt_text: "Loading Applications...",
    done_visibility: "collapsed"
  })
  page.bindingContext = source
	pkgs = StorageUtil.getSelectedPackages();
  toToggle = {};

  timer.setTimeout(() => {
    createGrid();
  }, 1000);
};

var createGrid = function() {
  source.set("progress_value", "10")
  var list = UsageUtil.getApplicationList();
  var selectedPackages = StorageUtil.getSelectedPackages();
  source.set("progress_value", "30")
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
  source.set("progress_value", "80")

  var grid = page.getViewById('grid');
  list.forEach(function (item, i) {
    
    
    if (i % 3 === 0) {
      grid.addRow(new layout.ItemSpec(1, layout.GridUnitType.AUTO));
    }
    grid.addChild(createCell(list[i], Math.floor(i/3), i%3));
  });
  source.set("progress_visibility", "collapsed")
  source.set("prompt_text", "Which apps would you like to spend less time on?")
  source.set("done_visibility", "visible")
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
  var numToRemove = 0;
  var hasAddedPkg = false;
  Object.keys(toToggle).forEach(function(key) {
    if (!hasAddedPkg && toToggle[key]) {
      if (pkgs.includes(key)) {
        numToRemove++;
      } else {
        hasAddedPkg = true;
      }
    }
  });

  if (hasAddedPkg || (numToRemove !== pkgs.length && pkgs.length !== 0)) {
    Object.keys(toToggle).forEach(function(key) {
      if (toToggle[key]) {
        StorageUtil.togglePackage(key);
      }
    });
    frame.topmost().navigate('views/onboarding/nudgesOnboardingView/nudgesOnboardingView');  
  } else {
    fancyAlert.TNSFancyAlert.showError("Uh Oh!", "Please select at least one app to monitor!", "Okay");
  }
};