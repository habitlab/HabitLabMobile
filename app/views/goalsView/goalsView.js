var frameModule = require("ui/frame");
var StorageUtil = require('~/util/StorageUtil');
var builder = require('ui/builder');
var UsageUtil = require('~/util/UsageInformationUtil');
var gestures = require('ui/gestures').GestureTypes;
var Grid = require("ui/layouts/grid-layout").GridLayout;
var StackLayout = require("ui/layouts/stack-layout").StackLayout;
var FlexLayout = require("ui/layouts/flexbox-layout").FlexboxLayout;
var fancyAlert = require("nativescript-fancyalert");


var drawer;
var page;

var getGoal = function(txt, add) {
  var num = txt.replace(/[^0-9]/g, '') || 0;

  var newNum = parseInt(num) - 5
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
  label.className = "goal-label-nowidth";

  var number = np.getViewById('number');
  number.text = value;

  np.getViewById('plus').on(gestures.tap, function() {
    var newNum = getGoal(number.text, true);
    number.text = newNum;
    StorageUtil.changePhoneGoal(newNum, goal);
  });

  np.getViewById('minus').on(gestures.tap, function() {
    var newNum = getGoal(number.text, false);
    number.text = newNum;
    StorageUtil.changePhoneGoal(newNum, goal);
  });

  return item;
}; 

var setUpPhoneGoals = function() {
  var phoneGoals = StorageUtil.getPhoneGoals();
  var phoneSection = page.getViewById("phoneGoals");

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
  item.on("touch, tap", function(args) {
    if (args.eventName === 'tap') {
      var options = {
        moduleName: 'views/appDetailView/appDetailView',
        context: {
          packageName: pkg,
          name: basicInfo.name,
          icon: basicInfo.icon
        }
      }
      frameModule.topmost().navigate(options);
    } else {
      if (args.action === 'down') {
        item.className = 'flex selected';
      } else if (args.action === 'up' || args.action === 'cancel') {
        item.className = 'flex';
      }
    }
    
  });

  var np = item.getViewById('np');
  np.id = pkg;

  var goal = StorageUtil.getMinutesGoal(pkg);

  item.getViewById('label').text = 'mins';
  var number = np.getViewById('number');
  number.text = goal;

  np.getViewById('plus').on(gestures.tap, function() {
    var newNum = getGoal(number.text, true);
    number.text = newNum;
    StorageUtil.changeAppGoal(pkg, newNum, 'minutes');
  });

  np.getViewById('minus').on(gestures.tap, function() {
    var newNum = getGoal(number.text, false);
    number.text = newNum;
    StorageUtil.changeAppGoal(pkg, newNum, 'minutes');
  });

  return item;
};

var setUpAppGoals = function() {
  var pkgs = StorageUtil.getSelectedPackages();
  var appSection = page.getViewById("appGoals");

  pkgs.forEach(function (pkg) {
    appSection.addChild(createAppGoal(pkg));
  });
};

exports.onManageApps = function() {
  frameModule.topmost().navigate("views/appsView/appsView");
};

exports.pageLoaded = function(args) {
  page = args.object;
  drawer = page.getViewById("sideDrawer");
  if (page.id !== 'loaded' || (args.navigationContext && args.navigationContext.updated)) {
    page.id = 'loaded';
    setUpPhoneGoals();
    setUpAppGoals();
  }
};


exports.onDone = function() {
   fancyAlert.TNSFancyAlert.showSuccess("Success!", "You're all set up.", "View my stats");
   frameModule.topmost().navigate("views/progressView/progressView");
}



exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};