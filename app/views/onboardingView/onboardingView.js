var frameModule = require("ui/frame");
var page;
var onboarding = {};
var gestures = require("ui/gestures");

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

// onboarding.content = [{
//   text: texts[0],
//   title: titles[0],
//   visualSource: visuals[0]
// }, {
//   text: texts[1],
//   title: titles[1],
//   visualSource: visuals[1]
// }, {
//   text: texts[2],
//   title: titles[2],
//   visualSource: visuals[2]
// }, {
//   text: texts[3],
//   title: titles[3],
//   visualSource: visuals[3]
// }, {
//   text: texts[4],
//   title: titles[4],
//   visualSource: visuals[4]
// }];

exports.pageLoaded = function(args) {
  var navigated = false;

  page = args.object;
  page.bindingContext = onboarding;

  page.getViewById('slides').on('finished', function () {
    page.getViewById('lastslide').on(gestures.GestureTypes.swipe, function (args) {
      if (args.direction === 2 && !navigated) {
        exports.goToNavView();
        navigated = true;
      }
    });
  }); 
};

exports.goToNavView = function(args) {
  frameModule.topmost().navigate("views/navView/navView");
};