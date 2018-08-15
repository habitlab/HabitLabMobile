var frameModule = require("ui/frame");
var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var fancyAlert = require("nativescript-fancyalert");
var ToolTip = require("nativescript-tooltip").ToolTip;
var FancyAlert = require("~/util/FancyAlert");
var SCREEN_WIDTH = android.content.res.Resources.getSystem().getDisplayMetrics().widthPixels;
var observable = require("data/observable");
var TargetOverlay = require("~/overlays/TargetOverlay");

var drawer;
var page;
var events;
var pageData;
var phoneList;
var appsList;
var targetsList;

exports.onInfo = function(args) {
  events.push({category: 'features', index: 'tooltips'});
  const tip = new ToolTip(args.object, {text:"The number of times you check your phone's lock screen", width: 0.43*SCREEN_WIDTH, style: 'CustomToolTipLayoutStyle'});
  tip.show();
  setTimeout(function() {
    tip.hide();
  }, 3000)
};

var initializePhoneList = function() {
  var goals = StorageUtil.getPhoneGoals();
  var phoneGoals = [];
  Object.keys(goals).forEach(function (key) {
    phoneGoals.push({
      name: key,
      value: goals[key]
    });
  });
  pageData.set('phoneGoals', phoneGoals);
};

var initializeAppsList = function() {
  var pkgs = StorageUtil.getSelectedPackages();
  var appGoals = [];
  pkgs.forEach(function (pkg) {
    var basicInfo = UsageUtil.getBasicInfo(pkg);
    appGoals.push({
      app: basicInfo.name,
      icon: basicInfo.icon,
      name: 'mins',
      value: StorageUtil.getMinutesGoal(pkg),
      packageName: pkg
    });
  });
  pageData.set('appGoals', appGoals);
};

var initializeTargetsList = function() {
  var pkgs = StorageUtil.getTargetSelectedPackages();
  var targetGoals = [];
  pkgs.forEach(function (pkg) {
    var basicInfo = UsageUtil.getBasicInfo(pkg);
    targetGoals.push({
      app: basicInfo.name,
      icon: basicInfo.icon,
      name: 'mins',
      value: StorageUtil.getMinutesGoal(pkg),
      packageName: pkg
    });
  });
  pageData.set('targetGoals', targetGoals);
};

var getGoal = function(txt, add) {
  var num = add ? Number(txt) + 5 : Number(txt) - 5;
  if (num > 995) {
    num = 995;
  } else if (num < 0) {
    num = 0
  }
  return num;
};

exports.phoneGoalChange = function(args) {
  var boundGoal = args.object.parent.parent.bindingContext;
  boundGoal.value = getGoal(boundGoal.value, args.object.id === 'plus');
  phoneList.refresh();
};

exports.phoneGoalUnloaded = function(args) {
  var boundGoal = args.object.bindingContext;
  StorageUtil.changePhoneGoal(boundGoal.value, boundGoal.name);
};

exports.appGoalChange = function(args) {
  var boundGoal = args.object.parent.parent.bindingContext;
  if (!boundGoal) { return; } // because sometimes boundGoal comes back null...
  boundGoal.value = getGoal(boundGoal.value, args.object.id === 'plus');
  appsList.refresh();
};

exports.targetGoalChange = function(args) {
  var boundGoal = args.object.parent.parent.bindingContext;
  boundGoal.value = getGoal(boundGoal.value, args.object.id === 'plus');
  targetsList.refresh();
};

var initializeLists = function() {
  initializePhoneList();
  initializeAppsList();
  initializeTargetsList();
};

exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "goals"}];
  page = args.object;
  pageData = new observable.Observable();
  page.bindingContext = pageData;
  pageData.set('tutorialFinished', StorageUtil.isTutorialComplete());

  var tabView = page.getViewById("tabView")
  tabView.selectedIndex = 1;

  drawer = page.getViewById("sideDrawer");
  phoneList = page.getViewById('phone-list');
  appsList = page.getViewById('apps-list');
  targetsList = page.getViewById('targets-list');
  initializeLists();

  if (!pageData.get('tutorialFinished')) {
    FancyAlert.show(FancyAlert.type.SUCCESS, "Great!", "Set some goals! Or not - you can come back here anytime by clicking on Goals in the menu", "Awesome!"); 
  }
};


exports.onIndexChanged = function(args) {
  if (args.newIndex === 2) {
    if (!StorageUtil.isTargetOn()) {
      if (!StorageUtil.isTutorialComplete()) {
        TargetOverlay.showIntroDialog("Targets are Locked", "Continue using HabitLab to unlock Targets.", "Ok", redirect, redirect);
      } else {
        TargetOverlay.showIntroDialog("Targets are Locked", "Choose target apps you'd rather spend time on to start building positive habits.", "Ok!", redirectToWatchlist, redirect);
      }
    }
  }
}

//Setting up targets occurs in the watchlist 
redirectToWatchlist = function() {
  var options = {
    moduleName: 'views/watchlistView/watchlistView',
    context: {
      index: 1,
      fromGoals: true
    }
  } 
  frameModule.topmost().navigate(options);
}

//Redirect back to the watchlist tab
redirect = function() {
  var tabView = page.getViewById("tabView")
  tabView.selectedIndex = 1;
}

exports.nextStep = function() {
  frameModule.topmost().navigate('views/interventionsView/interventionsView');
};

exports.pageUnloaded = function(args) {
  var watchlist = page.bindingContext.get('appGoals');

  watchlist.forEach(function(app) {
    if (!app) {
      return;
    }
    //This function checks if the package is enabled, and adds it if it isn't.
    StorageUtil.addPackage(app.packageName)
    StorageUtil.changeAppGoal(app.packageName, app.value, app.name === 'mins' ? 'minutes' : app.name);
  });

  var targetList = page.bindingContext.get('targetGoals');
  for (var i = 0; i < targetList.length; i++) {
    StorageUtil.changeAppGoal(targetList[i].packageName, targetList[i].value, targetList[i].name === 'mins' ? 'minutes' : targetList[i].name);
  }

  StorageUtil.addLogEvents(events);
};

exports.toggleDrawer = function() {
  if (!StorageUtil.isTutorialComplete()) {
    fancyAlert.TNSFancyAlert.showError("Complete Tutorial First", "Click done to continue with the tutorial, then you'll be ready to start exploring!", "Got It!");
  } else {
    events.push({category: "navigation", index: "menu"});
    drawer.toggleDrawerState();
  }
};