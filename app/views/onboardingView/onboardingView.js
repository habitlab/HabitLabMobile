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
  'Choose apps to spend less time on',
  'Personalized nudges will help you meet your goals',
  'See how your habits improve over time.',
  'First things first...',
  'Last one!'
  ];

onboarding.titles = [
  'Welcome to HabitLab,',
  'Create your watchlist',
  'Stop wasting time',
  'Track Your Progress',
  'Let\'s Do It!'
  ];

onboarding.visuals = [
  'res://ic_habitlab_white',
  '~/images/onboarding_goals.png',
  '~/images/onboarding_applock.png',
  '~/images/onboarding_progress.png',
  '~/images/onboarding_swiperight.png'
];


exports.pageLoaded = function(args) {

  // set also in app.js
  if (StorageUtil.isOnboarded()) {
    frameModule.topmost().navigate('views/progressView/progressView');
  } else if (StorageUtil.isSetUp()) {
    frameModule.topmost().navigate('views/appsView/appsView');
  }

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


//go to next slide when the return button on the keyboard is pressed 
exports.hideCursor = function(args) {
  // no longer used
};

//If swipe left, go to next slide, if swipe right, go to previous slide
// May want to reimplement this function as the swiping can sometimes be 'stiff'
exports.goToNextSlide = function(args) {
  if (args.direction === 2) {
    container.nextSlide();
  } 
  if (args.direction === 1) {
    container.previousSlide();
  }
};


//Only lets the user continue past the first slide if a name is entered 
// else, a dialog appears
exports.checkNameNextSlide = function(args) {
  var textfield = page.getViewById("name");
  var name = textfield.text;
  if (name === "") {
      fancyAlert.TNSFancyAlert.showError("Not so fast!", "Please enter your name to continue", "OK");
  } else {
    StorageUtil.setName(name);
    container.nextSlide();
  }
};

//Ensures that usage permissions are given before allowing user to swipe to next slide
exports.checkUsagePermission = function(args) {
  if (!PermissionUtil.checkActionUsagePermission()) {
      fancyAlert.TNSFancyAlert.showError("Not so fast!", "Please permit usage access to continue", "OK");
  } else {
    exports.goToNextSlide(args);
  }
}

//Ensures that overlay permissions are given before allowing user to swipe to next slide
exports.checkDrawPermission = function(args) {
  if (!PermissionUtil.checkSystemOverlayPermission()) {
      fancyAlert.TNSFancyAlert.showError("Not so fast!", "Please give permission to continue", "OK");
  } else {
    exports.goToNextSlide(args);
  }
}

//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveUsagePermission = function(args) {
  if (!PermissionUtil.checkActionUsagePermission()) {
    PermissionUtil.launchActionUsageIntent();
 } else {
    fancyAlert.TNSFancyAlert.showInfo("Ahead of the Game", "You've already authorized HabitLab. Swipe to continue!", "Sweet!");
 }
};

//When the user taps the 'give permission' button - If the user hasn't already given permission, open settings
exports.giveDrawPermission = function(args) {
  if(!PermissionUtil.checkSystemOverlayPermission()) {
    PermissionUtil.launchSystemOverlayIntent();
  } else {
    fancyAlert.TNSFancyAlert.showInfo("Ahead of the game", "You've already authorized HabitLab. Swipe to continue!", "Sweet!");
  }
};


//Takes the user to the apps view to select their apps 
exports.goToAppsView = function(args) {
  if (!StorageUtil.isSetUp()) {
    StorageUtil.setUpDB();

    /** SET UP ALARM **/
    const DAY = 86400 * 1000;
    var context = application.android.context;
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
  frameModule.topmost().navigate('views/appsView/appsView');
};