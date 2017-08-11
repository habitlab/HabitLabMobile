var frameModule = require("ui/frame");
var StorageUtil = require('~/util/StorageUtil');
var builder = require('ui/builder');
var UsageUtil = require('~/util/UsageInformationUtil');
var gestures = require('ui/gestures').GestureTypes;
var Grid = require("ui/layouts/grid-layout").GridLayout;
var StackLayout = require("ui/layouts/stack-layout").StackLayout;
var FlexLayout = require("ui/layouts/flexbox-layout").FlexboxLayout;
var fancyAlert = require("nativescript-fancyalert");
var ToolTip = require("nativescript-tooltip").ToolTip;
var view = require("ui/core/view");
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;
var timer = require("timer");
var FancyAlert = require("~/util/FancyAlert");
var Toast = require("nativescript-toast");
var Resources = android.content.res.Resources;
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;

var drawer;
var page;
var events;
var appChanged;
var phoneChanged;
var toSave;

var getGoal = function(txt, add) {
  var num = txt.replace(/[^0-9]/g, '') || 0;

  var newNum = parseInt(num) - 5;
  if (add) {
    newNum += 10;
  }
  
  if (newNum > 1440) {
    newNum = 1440;
  } else if (newNum < 0) {
    newNum = 0
  }
  return newNum;
};

var createPhoneGoal = function(goal, value) {
  var item = builder.load({
    path: 'shared/goalelem',
    name: 'goalelem',
    page: page
  });
  var icon = item.getViewById('icon');
  icon.visibility = 'collapsed';

  item.getViewById('name').visibility = 'collapsed';

  var np = item.getViewById('np');
  np.id = 'phone'+ goal;

  var label = item.getViewById('label');
  label.text = goal;
  label.id = goal;
  label.className = "goal-label-nowidth";
  
  var info = item.getViewById('infoButton');
  if (goal === "glances") {
      info.visibility = 'visible';
      info.on(gestures.tap, function() {
        events.push({category: 'features', index: 'tooltips'});
        const tip = new ToolTip(info, {text:"The number of times you check your phone's lock screen", width: 0.43*SCREEN_WIDTH});;
        tip.show(); 
      });
  } else {
    info.visibility="hidden";
  }
  
  var number = np.getViewById('number');
  number.text = value;
  number.on("unloaded", function (args) {
    if (!toSave) return;
    var newNum = parseInt(number.text.replace(/[^0-9]/g, '') || 15);
    StorageUtil.changePhoneGoal(newNum, goal);
    if (phoneChanged) {
      events.push({category: "features", index: "goals_phonegoal_change"});
    }
  });

  np.getViewById('plus').on(gestures.tap, function() {
    phoneChanged = true;
    number.text = getGoal(number.text, true);
  });

  np.getViewById('minus').on(gestures.tap, function() {
    phoneChanged = true;
    number.text = getGoal(number.text, false);
  });

  return item;
};

var setUpPhoneGoals = function() {
  var phoneGoals = StorageUtil.getPhoneGoals();
  var phoneSection = page.getViewById("phoneGoals");
  phoneSection.removeChildren();

  Object.keys(phoneGoals).forEach(function(key) {
    phoneSection.addChild(createPhoneGoal(key, phoneGoals[key]));
  });
};

var createAppGoal = function(pkg) {
  var item = builder.load({
    path: 'shared/goalelem',
    name: 'goalelem',
    page: page
  });

  var basicInfo = UsageUtil.getBasicInfo(pkg);
  item.getViewById('name').text = basicInfo.name;

  var icon = item.getViewById('icon');
  icon.src = basicInfo.icon;

  var np = item.getViewById('np');
  np.id = pkg;

  var goal = StorageUtil.getMinutesGoal(pkg);

  item.getViewById('label').text = 'mins';
  var number = np.getViewById('number');
  number.text = goal;

  number.on("unloaded", function (args) {
    if (!toSave) return;
    var newNum = parseInt(number.text.replace(/[^0-9]/g, '') || 15);
    StorageUtil.changeAppGoal(pkg, newNum, 'minutes');
    if (appChanged) {
      events.push({category: "features", index: "goals_appgoal_change"});
    }
  });

  np.getViewById('plus').on(gestures.tap, function() {
    appChanged = true;
    number.text = getGoal(number.text, true);
  });

  np.getViewById('minus').on(gestures.tap, function() {
    appChanged = true;
    number.text = getGoal(number.text, false);
  });

  return item;
};

var setUpAppGoals = function() {
  var pkgs = StorageUtil.getSelectedPackages();
  var appSection = page.getViewById("appGoals");
  appSection.removeChildren();

  pkgs.forEach(function (pkg) {
    appSection.addChild(createAppGoal(pkg));
  });
};

exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "goals"}];
  page = args.object;
  drawer = page.getViewById("sideDrawer");

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
    setUpPhoneGoals();
    setUpAppGoals();
    loader.hide();
    var btn = page.getViewById('done');
    if (StorageUtil.isTutorialComplete()) {
      btn.text = 'save';
      btn.on('tap', function() {
        toSave = true;
        Toast.makeText('Goals Saved').show();
      });
    } else {
      btn.on('tap', function() {
        frameModule.topmost().navigate('views/interventionsView/interventionsView');
      });
      FancyAlert.show(FancyAlert.type.SUCCESS, "Great!", "Set some goals! Or not - you can come back here anytime by clicking on Goals in the menu", "Awesome!"); 
    }
  }, 1000);  
};

exports.pageUnloaded = function(args) {
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