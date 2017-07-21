var application = require("application");
var StorageUtil = require("~/util/StorageUtil");
var PermissionUtil = require("~/util/PermissionUtil");
var TextField = require("tns-core-modules/ui/text-field");
var view = require("ui/core/view");
var colorModule = require("tns-core-modules/color")
var Color = android.graphics.Color;
var dialogs = require("ui/dialogs");

var frameModule = require("ui/frame");
var gestures = require("ui/gestures").GestureTypes;

var page;
var name;
var container;
var onboarding = {};

onboarding.texts = [
  'Design your time online',
  'Choose the apps you want to spend less time on.',
  'Build better habits with personalized interventions.',
  'See how your habits improve over time.',
  'To get started, allow HabitLab to access your app data',
  'Allow HabitLab to work over other apps',
  'Swipe to pick your apps.\n'

  ];

onboarding.titles = [
  'Welcome to HabitLab',
  'Set Your Goals',
  'Stop Wasting Time',
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
  container = page.getViewById("slides")
 
  page.getViewById('slides').on('finished', function () {
    page.getViewById('lastslide').on(gestures.swipe, function (args) {
      if (args.direction === 2 && !navigated) {
        exports.goToNavView();
        navigated = true;
      }
    });
  }); 
};


exports.goToNextSlide = function(args) {
  console.warn("swiping");
  if (args.direction === 2) {
    container.nextSlide();
  } 
  if (args.direction === 1) {
    container.previousSlide();
  }
  
}


exports.checkNameNextSlide = function(args) {
  var textfield = page.getViewById("name");
  name = textfield.text;
  if (name === "") {
      dialogs.alert("Please enter your name!").then(function() {
       console.warn("Dialog closed!");
      });
  } else {
    console.warn("proceeding")
    exports.goToNextSlide(args);
  }
  
  
}


exports.getUsagePermission = function(args) {
   console.warn(!PermissionUtil.checkActionUsagePermission())
   if (!PermissionUtil.checkActionUsagePermission()) {
    PermissionUtil.launchActionUsageIntent();
 } else {
    exports.goToNextSlide(args);
 }
}


exports.getDrawPermission = function(args) {
   console.warn(PermissionUtil.checkSystemOverlayPermission())
   if(!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
   } else {
    exports.goToNextSlide(args);
   }
}




const ServiceManager = require("~/services/ServiceManager");
const Intent = android.content.Intent;

var context = applicationModule.android.context;
var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);
var dummyServiceIntent = new Intent(context, com.habitlab.DummyService.class);

exports.goToNavView = function(args) {
  if (!StorageUtil.isSetUp()) {
    StorageUtil.setUp();

    /** SERVICE STARTER **/
    if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
      context.startService(trackingServiceIntent);
    }

    if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
      context.startService(unlockServiceIntent);
    }

    if (!ServiceManager.isRunning(com.habitlab.DummyService.class.getName())) {
      context.startService(dummyServiceIntent);
    }


    /** SET UP ALARM **/
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