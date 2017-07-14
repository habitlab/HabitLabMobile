var StorageUtil = require("~/util/StorageUtil");

var frameModule = require("ui/frame");
var gestures = require("ui/gestures").GestureTypes;

var page;
var onboarding = {};

onboarding.texts = [
  'Design how you spend time on your mobile device.',
  'Build better habits with personalized interventions.',
  'Choose the apps you want to spend less time on.',
  'See how your habits improve over time.',
  'Swipe to get started.\n'
  ];

onboarding.titles = [
  'HabitLab',
  'Stop Wasting Time',
  'Set Your Goals',
  'Track Your Progress',
  'Let\'s Do It!'
  ];

onboarding.visuals = [
  '~/images/icon.png',
  '~/images/onboarding_applock.png',
  '~/images/onboarding_goals.png',
  '~/images/onboarding_progress.png',
  '~/images/onboarding_swiperight.png'
];

exports.pageLoaded = function(args) {
  var navigated = false;

  page = args.object;
  page.bindingContext = onboarding;

  page.getViewById('slides').on('finished', function () {
    page.getViewById('lastslide').on(gestures.swipe, function (args) {
      if (args.direction === 2 && !navigated) {
        exports.goToNavView();
        navigated = true;
      }
    });
  }); 
};

exports.goToNavView = function(args) {
  if (!StorageUtil.isSetUp()) {
    StorageUtil.setUp();
  }
  frameModule.topmost().navigate("views/navView/navView");
};