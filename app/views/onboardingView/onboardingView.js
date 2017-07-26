const ServiceManager = require("~/services/ServiceManager");

var application = require("application");
var StorageUtil = require("~/util/StorageUtil");
var PermissionUtil = require("~/util/PermissionUtil");
var TextField = require("tns-core-modules/ui/text-field");
var view = require("ui/core/view");
var colorModule = require("tns-core-modules/color")
var Color = android.graphics.Color;
var dialogs = require("ui/dialogs");
var fancyAlert = require("nativescript-fancyalert");

var frameModule = require("ui/frame");
var gestures = require("ui/gestures").GestureTypes;
var gesture = require("ui/gestures");

var page;
var container;
var onboarding = {};

onboarding.texts = [
  'Design your time on your phone',
  'Choose the apps you want to spend less time on.',
  'Build better habits with personalized interventions.',
  'Find what works for you and see how your habits improve over time.',
  'Allow HabitLab to access your app data',
  'Last one!',
  'Swipe to pick your apps.\n'

  ];

onboarding.titles = [
  'Welcome to HabitLab,',
  'Set Your Goals',
  'Stop Wasting Time',
  'Track Your Progress',
  'Let\'s Do It!'
  ];

onboarding.visuals = [
  '~/images/logo_bubbles.png',
  '~/images/onboarding_goals.png',
  '~/images/onboarding_applock.png',
  '~/images/onboarding_progress.png',
  '~/images/onboarding_swiperight.png'
];


exports.pageLoaded = function(args) {
  var navigated = false;
  page = args.object;
  page.bindingContext = onboarding;
  container = page.getViewById("slides");
 
  page.getViewById('slides').on('finished', function () {
    page.getViewById('lastslide').on(gestures.swipe, function (args) {
      if (args.direction === 2 && !navigated) {
        exports.goToNavView();
        navigated = true;
      }
    });
  }); 
};


//hide cursor when the return button on the keyboard is pressed 
exports.hideCursor = function(args) {
  var textField = args.object;
};


exports.goToNextSlide = function(args) {
  if (args.direction === 2) {
    container.nextSlide();
  } 
  if (args.direction === 1) {
    container.previousSlide();
  }
};


exports.checkNameNextSlide = function(args) {
  var textfield = page.getViewById("name");
  var name = textfield.text;
  if (name === "") {
      fancyAlert.TNSFancyAlert.showError("Not so fast!", "Please enter your name to continue", "Dismiss");
  } else {
    StorageUtil.setName(name);
    exports.goToNextSlide(args);
  }
};


exports.checkUsagePermission = function(args) {
  if (!PermissionUtil.checkActionUsagePermission()) {
      fancyAlert.TNSFancyAlert.showError("Not so fast!", "Please permit usage access to continue", "Dismiss");
  } else {
    exports.goToNextSlide(args);
  }
}

exports.checkDrawPermission = function(args) {
  if (!PermissionUtil.checkSystemOverlayPermission()) {
      fancyAlert.TNSFancyAlert.showError("Not so fast!", "Please give permission to continue", "Dismiss");
  } else {
    exports.goToNextSlide(args);
  }
}


exports.giveUsagePermission = function(args) {
  if (!PermissionUtil.checkActionUsagePermission()) {
    PermissionUtil.launchActionUsageIntent();
 } else {
    fancyAlert.TNSFancyAlert.showInfo("Ahead of the Game", "You've already authorized HabitLab. Swipe to continue!", "Sweet!");
 }
};

exports.giveDrawPermission = function(args) {
  if(!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
  } else {
    fancyAlert.TNSFancyAlert.showInfo("Ahead of the game", "You've already authorized HabitLab. Swipe to continue!", "Sweet!");
  }
};


exports.getUsagePermission = function(args) {
  if (!PermissionUtil.checkActionUsagePermission()) {
    PermissionUtil.launchActionUsageIntent();
  } else {
    exports.goToNextSlide(args);
  }
};

exports.getDrawPermission = function(args) {
  if(!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
  } else {
    exports.goToNextSlide(args);
  }
};

var context = application.android.context;

exports.goToGoalView = function(args) {
  if (!StorageUtil.isSetUp()) {
    StorageUtil.setUp();

    /** SET UP ALARM **/
    const DAY = 86400 * 1000;
    // var context = application.android.context;
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

  if (args.direction === 2) {
    frameModule.topmost().navigate('views/appsView/appsView');
  } 
  if (args.direction === 1) {
    container.previousSlide();
  }
  
};