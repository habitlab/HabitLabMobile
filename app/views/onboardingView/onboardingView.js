var application = require("application");
var StorageUtil = require("~/util/StorageUtil");
var PermissionUtil = require("~/util/PermissionUtil");

var frameModule = require("ui/frame");
var gestures = require("ui/gestures").GestureTypes;

var page;
var onboarding = {};

onboarding.texts = [
  'Design how you spend time on your mobile device.',
  'Build better habits with personalized interventions.',
  'Choose the apps you want to spend less time on.',
  'See how your habits improve over time.',
  'To get started, allow HabitLab to access your app data',
  'Allow HabitLab to work over other apps',
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
  console.warn('pageloaded');
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


exports.getUsagePermission = function() {
  // console.warn(PermissionUtil.checkActionUsagePermission())
  //  if (!PermissionUtil.checkActionUsagePermission()) {
  //   PermissionUtil.launchActionUsageIntent();
  //  }
}


exports.getDrawPermission = function() {
  // console.warn(PermissionUtil.checkSystemOverlayPermission())
  // if(!PermissionUtil.checkSystemOverlayPermission()) {
  //   PermissionUtil.launchSystemOverlayIntent();
  // }

}



exports.navigatingTo = function() {
  console.warn("navigating")
}



exports.goToNavView = function(args) {
  if (!StorageUtil.isSetUp()) {
    StorageUtil.setUp();

    const DAY = 86400 * 1000;
    var context = application.android.context;
    var alarm = context.getSystemService(android.content.Context.ALARM_SERVICE);
    var intent = new android.content.Intent(context, com.habitlab.AlarmReceiver.class);
    var pi = android.app.PendingIntent.getBroadcast(context, 0, intent, android.app.PendingIntent.FLAG_UPDATE_CURRENT);

    var midnight = java.util.Calendar.getInstance();
    midnight.set(java.util.Calendar.HOUR_OF_DAY, 0);
    midnight.set(java.util.Calendar.MINUTE, 0);
    midnight.set(java.util.Calendar.SECOND, 0);
    midnight.setTimeInMillis(midnight.getTimeInMillis() + DAY);

    alarm.setRepeating(android.app.AlarmManager.RTC_WAKEUP, midnight.getTimeInMillis(), DAY, pi);    
  }
  
  frameModule.topmost().navigate("views/navView/navView");
};