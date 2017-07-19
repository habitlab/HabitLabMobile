var frameModule = require("ui/frame");
var StorageUtil = require('~/util/StorageUtil');
var builder = require('ui/builder');
var UsageUtil = require('~/util/UsageInformationUtil');
var gestures = require('ui/gestures').GestureTypes;
var Grid = require("ui/layouts/grid-layout").GridLayout;
var StackLayout = require("ui/layouts/stack-layout").StackLayout;
var FlexLayout = require("ui/layouts/flexbox-layout").FlexboxLayout;

var drawer;
var page;

var createPhoneGoal = function(goal, value) {
  var np = builder.load({
    path: 'shared/numberpicker',
    name: 'numberpicker',
    page: page
  });

  np.id = 'phone'+ goal;

  np.getViewById('label').text = goal;
  var number = np.getViewById('number');
  number.text = value;

  np.getViewById('plus').on(gestures.tap, function() {
    var num = number.text.replace(/[^0-9]/g, '') || 0;
    var newNum = parseInt(num) + 5;
    number.text = newNum;
    StorageUtil.changePhoneGoal(newNum, goal);
  });

  np.getViewById('minus').on(gestures.tap, function() {
    var num = number.text.replace(/[^0-9]/g, '') || 0;
    var newNum = parseInt(num) - 5;
    number.text = newNum;
    StorageUtil.changePhoneGoal(newNum, goal);
  });

  return np;
}; 

var setUpPhoneGoals = function() {
  var phoneGoals = StorageUtil.getPhoneGoals();
  var phoneSection = page.getViewById("phoneGoals");

  Object.keys(phoneGoals).forEach(function(key) {
    phoneSection.addChild(createPhoneGoal(key, phoneGoals[key]));
  });
};

var createAppGoal = function(pkg) {
  var stack = new StackLayout();
  stack.orientation = 'vertical';

  var flex = new FlexLayout();
  flex.flexDirection = 'row'

  var np = builder.load({
    path: 'shared/numberpicker',
    name: 'numberpicker',
    page: page
  });

  np.id = pkg;

  var goal = StorageUtil.getMinutesGoal(pkg);

  np.getViewById('label').text = 'minutes';
  var number = np.getViewById('number');
  number.text = goal;

  np.getViewById('plus').on(gestures.tap, function() {
    var num = number.text.replace(/[^0-9]/g, '') || 0;
    var newNum = parseInt(num) + 5;
    number.text = newNum;
    StorageUtil.changeAppGoal(pkg, newNum, goal);
  });

  np.getViewById('minus').on(gestures.tap, function() {
    var num = number.text.replace(/[^0-9]/g, '') || 0;
    var newNum = parseInt(num) - 5;
    number.text = newNum;
    StorageUtil.changeAppGoal(pkg, newNum, goal);
  });

  return np;
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
  if (page.id !== 'loaded') {
    page.id = 'loaded';
    setUpPhoneGoals();
    setUpAppGoals();
  }
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};