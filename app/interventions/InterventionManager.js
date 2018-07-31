const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const GlobalUtil = require("~/util/GlobalUtil");
const DialogOverlay = require("~/overlays/DialogOverlay");
const FullScreenOverlay = require("~/overlays/FullScreenOverlay");
const Toast = require("~/util/ToastUtil");
const TimerOverlay = require("~/overlays/TimerOverlay");
const DimmerOverlay = require("~/overlays/DimmerOverlay");
const VideoOverlay = require("~/overlays/VideoOverlay");
const LockdownOverlay = require("~/overlays/LockdownOverlay");
const SliderOverlay = require("~/overlays/SliderOverlay");
const ScreenFlipperOverlay = require("~/overlays/ScreenFlipperOverlay");
const ToastOverlay = require("~/overlays/ToastOverlay");
const TargetOverlay = require("~/overlays/TargetOverlay");
const ID = require("~/interventions/InterventionData");
const Timer = require("timer");

var application = require('application');
var context = application.android.context.getApplicationContext();
var quoteFile = "quotes.json";

// native APIs
var AudioManager = android.media.AudioManager;
var Context = android.content.Context;
var Intent = android.content.Intent;
var System = java.lang.System;

// global vars
var audioManager = context.getSystemService(Context.AUDIO_SERVICE);

var notificationID = {
  GLANCE: 1000,
  UNLOCK: 2000,
  VISIT: 3000,
  DURATION: 4000,
  USAGE: 5000,
  PHONE: 6000
};

/*************************************************************
 *             EFFECTIVE INTERVENTION THRESHOLDS             *
 *    (when it's ok to start showing each interventions)     *
 *************************************************************/

// visit interventions
const THRESHOLD_VISIT_TST = 1;
const THRESHOLD_VISIT_NTF = 1;
const THRESHOLD_VISIT_DLG = 1;

// glance/unlock interventions
const THRESHOLD_GLANCES_NTF = 1;
const THRESHOLD_UNLOCKS_TST = 1;
const THRESHOLD_UNLOCKS_NTF = 1;
const THRESHOLD_UNLOCKS_DLG = 1;

// usage interventions
const THRESHOLD_USAGE_TST = 1;
const THRESHOLD_USAGE_NTF = 1;
const THRESHOLD_USAGE_DLG = 1;

// visit duration interventions
const INTERVAL_DURATION_TST = 300000;
const INTERVAL_DURATION_NTF = 600000;
const INTERVAL_DURATION_DLG = 120000;

// overlay interventions
const THRESHOLD_FULLSCREEN_OVR = 1;
const THRESHOLD_COUNTUP_TMR = 1;
const THRESHOLD_COUNTDOWN_TMR = 1;
const THRESHOLD_DIMSCREEN_OVR = 1;
const THRESHOLD_APPLICATION_SLIDER_OVR = 1;
const THRESHOLD_INTERSTITIAL_OVR = 1;
const THRESHOLD_FLIPPER_OVR = 1;
const THRESHOLD_POSITIVE_TST = 1;

var MIN_IN_MS = 60000;

var shouldPersonalize = function() {
  return Math.floor(Math.random() * 2) === 0;
};

// object mapping shortname => function
var code = {};

/*************************************
 *     VISIT COUNT INTERVENTIONS     *
 *************************************/

/**
 * popToastVisited
 * ---------------
 * Displays a toast if there are an effective number
 * of visits (determined by THRESHOLD_VISIT_TST) to
 * the specified package.
 */
code.VISIT_TOAST = function(real, pkg) {
  if (!real) {
    Toast.show(context, "You've visited Facebook 8 times today", 1, "#E71D36");
    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits >= THRESHOLD_VISIT_TST) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VISIT_TOAST}]);
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var msg = "You've opened " + app + " " + visits + (visits === 1 ? " time" : " times") + " today";
    Toast.show(context, msg, 1, "#E71D36");
  }
};


/**
 * sendNotificationVisited
 * -----------------------
 * Sends a notification if there are an effective number
 * of visits (determined by THRESHOLD_VISIT_NTF) to
 * the specified package.
 */
code.VISIT_NOTIFICATION = function(real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Visit Count",
      "You've opened Facebook 7 times today", notificationID.VISIT, 10);
    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits >= THRESHOLD_VISIT_NTF) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VISIT_NOTIFICATION}]);
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var title = app + " Visit Count";
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " opened " + app + " " + visits + (visits === 1 ? " time" : " times") + " today";
    NotificationUtil.sendNotification(context, title, msg, notificationID.VISIT, 10);
  }
};


/**
 * showDialogVisited
 * -----------------
 * Shows a dialog if there are an effective number
 * of visits (determined by THRESHOLD_VISIT_DLG) to
 * the specified package.
 */
code.VISIT_DIALOG = function (real, pkg) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've opened Facebook 12 times today", "Okay");
    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits >= THRESHOLD_VISIT_DLG) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VISIT_DIALOG}]);
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " opened " + app + " " + visits + (visits === 1 ? " time" : " times") + " today";
    DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
  }
}



/*************************************
 *   UNLOCKS/GLANCES INTERVENTIONS   *
 *************************************/

/**
 * sendNotificationGlances
 * -----------------------
 * Send a notification if the device has an effective
 * number of glances (determined by
 * THRESHOLD_GLANCES_NTF).
 */
code.GLANCE_NOTIFICATION = function(real) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Glance Alert",
      "You've glanced at your phone 7 times today", notificationID.VISIT, 10);
    return;
  }

  var glances = StorageUtil.getGlances();
  if (glances >= THRESHOLD_GLANCES_NTF) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.GLANCE_NOTIFICATION}]);
    var title = 'Glance Alert';
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " glanced at your phone " + glances + (glances === 1 ? ' time' : ' times') + ' today';
    NotificationUtil.sendNotification(context, title, msg, notificationID.GLANCE, 10);
  }
};


/**
 * popToastUnlocked
 * ----------------
 * Displays a toast if the device has an effective number
 * of unlocks (determined by THRESHOLD_UNLOCKS_TST).
 */
code.UNLOCK_TOAST = function(real) {
  if (!real) {
    Toast.show(context, "You've unlocked your phone 7 times today", 1, "#72E500");
    return;
  }

  var unlocks = StorageUtil.getUnlocks();
  if (unlocks >= THRESHOLD_UNLOCKS_TST) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.UNLOCK_TOAST}]);
    var msg = "You've unlocked your phone " + unlocks + (unlocks === 1 ? " time" : " times") + " today";
    Toast.show(context, msg, 1, "#72E500");
  }
};


/**
 * sendUnlocksNotification
 * -----------------------
 * Send a notification if the device has an effective
 * number of unlocks (determined by
 * THRESHOLD_UNLOCKS_NTF).
 */
code.UNLOCK_NOTIFICATION = function(real) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Unlock Alert",
      "You've unlocked your phone 7 times today", notificationID.VISIT, 10);
    return;
  }

  var unlocks = StorageUtil.getUnlocks();
  if (unlocks >= THRESHOLD_UNLOCKS_NTF) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.UNLOCK_NOTIFICATION}]);
    var title = 'Unlock Alert';
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
    NotificationUtil.sendNotification(context, title, msg, notificationID.UNLOCK, 10);
  }
};


/**
 * showUnlocksDialog
 * -----------------
 * Show a dialog if the device has an effective
 * number of unlocks (determined by
 * THRESHOLD_UNLOCKS_DLG).
 */
code.UNLOCK_DIALOG = function (real) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've unlocked your phone 18 times today", "Okay");
    return;
  }

  var unlocks = StorageUtil.getUnlocks();
  if (unlocks >= THRESHOLD_UNLOCKS_DLG) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.UNLOCK_DIALOG}]);
    var title = 'Unlock Alert';
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
    DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
  }
}



/*************************************
 *     PHONE USAGE INTERVENTIONS     *
 *************************************/
const THRESHOLD_PHONE_USAGE_TST = 60; // 1 hour
const THRESHOLD_PHONE_USAGE_NTF = 120; // 2 hours
const THRESHOLD_PHONE_USAGE_DLG = 180; // 3 hours

/**
 * popToastPhoneUsage
 * ------------------
 * Displays a toast if the device has an effective number
 * of minutes spent on phone (determined by
 * THRESHOLD_PHONE_USAGE_TST).
 */
code.PHONE_USAGE_TOAST = function(real) {
  if (!real) {
    Toast.show(context, "You've spent 3.6 hours on your phone today", 1, "#011627");
    return;
  }

  var time = StorageUtil.getTotalTime();
  if (time >= THRESHOLD_PHONE_USAGE_TST) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.PHONE_USAGE_TOAST}]);
    var hours = Math.round(10 * (time / 60)) / 10;
    var msg = "You've spent " + hours + " hours on your phone today";
    Toast.show(context, msg, 1, "#011627");
  }
};


/**
 * sendPhoneUsageNotification
 * --------------------------
 * Send a notification if the device has an effective number
 * of minutes spent on phone (determined by
 * THRESHOLD_PHONE_USAGE_NTF).
 */
code.PHONE_USAGE_NOTIFICATION = function(real) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Phone Usage Alert",
      "You've spend 4.2 hours on your phone today", notificationID.PHONE, 10);
    return;
  }

  var time = StorageUtil.getTotalTime();
  if (time >= THRESHOLD_PHONE_USAGE_NTF) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.PHONE_USAGE_NOTIFICATION}]);
    var hours = Math.round(10 * (time / 60)) / 10;
    var title = 'Phone Usage Alert';
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " already spent " + hours + ' hours on your phone today';
    NotificationUtil.sendNotification(context, title, msg, notificationID.PHONE, 10);
  }
};


/**
 * showPhoneUsageDialog
 * --------------------
 * Show a dialog if the device has an effective
 * number of minutes spent on phone (determined by
 * THRESHOLD_PHONE_USAGE_DLG).
 */
code.PHONE_USAGE_DIALOG = function (real) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've spent 5.1 hours on your phone today", "Okay");
    return;
  }

  var time = StorageUtil.getTotalTime();
  if (time >= THRESHOLD_PHONE_USAGE_DLG) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.PHONE_USAGE_DIALOG}]);
    var hours = Math.round(10 * (time / 60)) / 10;
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " already spent " + hours + ' hours on your phone today';
    DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
  }
}




/*************************************
 *      APP USAGE INTERVENTIONS      *
 *************************************/


/**
 * popToastUsage
 * -------------
 * Displays a toast on application launch if the user has already
 * surpassed their minutes goal for the day.
 */
code.USAGE_TOAST = function (real, pkg) {
  if (!real) {
    Toast.show(context, "You've already used Facebook for 23 minutes today!", 1, "#FFA730");
    return;
  }

  var minutes = StorageUtil.getAppTime(pkg);
  if (minutes >= THRESHOLD_USAGE_TST) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_TOAST}]);
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var msg = "You've already spent " + minutes + " minutes on " + app + " today!";
    Toast.show(context, msg, 1, "#FFA730");
  }
};


/**
 * sendNotificationUsage
 * ----------------------
 * Sends a notification on application launch if the user has
 * already surpassed 1.5 times their minutes goal for the day.
 */
code.USAGE_NOTIFICATION = function (real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Usage Alert",
      "You've already used Facebook for 27 minutes today!", notificationID.USAGE, 10);
    return;
  }

  var minutes = StorageUtil.getAppTime(pkg);
  if (minutes >= THRESHOLD_USAGE_NTF) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_NOTIFICATION}]);
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var title = app + " Usage Alert"
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " already used " + app + " for " + minutes + " minutes today.";
    NotificationUtil.sendNotification(context, title, msg, notificationID.USAGE, 10);
  }
};


/**
 * showDialogUsage
 * ---------------
 * Shows a dialog on application launch if the user has
 * already surpassed 2 times their minutes goal for the day.
 */
code.USAGE_DIALOG = function (real, pkg) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've already used Facebook for 47 minutes today!", "Okay");
    return;
  }

  var minutes = StorageUtil.getAppTime(pkg);
  if (minutes >= THRESHOLD_USAGE_DLG) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_DIALOG}]);
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", that's" : "That's"
    msg += " already " + minutes + " minutes on " + app + " today!";
    DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
  }
};



/**
 * EXPERIMENTAL USE
 *
 * showRandomQuote
 * ---------------
 * Displays a random quote on application launch if user has exceeded minute goal.
 *
 **/
code.QUOTE_NOTIFICATION = function (real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Usage Alert",
    "Each day provides its own gifts. (Marcus Aurelius)", notificationID.USAGE, 10);
    return;
  }
  let quoteArray = []
  var quoteData = require('~/interventions/quotes')
  for (let {quoteAuthor, quoteText} of quoteData) {
    quoteArray[quoteText + ' (' + quoteAuthor + ')']
  }
  StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_NOTIFICATION}]);
  var app = UsageInformationUtil.getBasicInfo(pkg).name;
  var title = app + " Usage Alert";
  var msg = quoteArray[Math.floor(Math.random() * quoteArray.length)];
  NotificationUtil.sendNotification(context, title, msg, notificationID.USAGE, 10);
};


/**
 * EXPERIMENTAL USE
 *
 * showTotalTime
 * ---------------
 * Displays total undesired app usage on undesired app launch.
 * Does not use name/other personalization. Uses neutral language.
 *
 **/
code.TIME_NOTIFICATION = function (real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "App Usage Alert",
    "You've used your targeted apps for 55 minutes today", notificationID.USAGE, 10);
    return;
  }
  StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_NOTIFICATION}]);
  var packages =  StorageUtil.getSelectedPackages()
  var totalUsage = 0
  for (var i = 0; i < packages.length; i++) {
    totalUsage += StorageUtil.getAppTime(pkg);
  }
  var app = UsageInformationUtil.getBasicInfo(pkg).name;
  var title = "Usage Alert"
  var msg = "You've used your targeted apps for " + totalUsage + " minutes today.";
  NotificationUtil.sendNotification(context, title, msg, notificationID.USAGE, 10);
};

/**************************************
 *    VISIT DURATION INTERVENTIONS    *
 **************************************/
// logging vars
var durationToastID = 0;
var durationNotifID = 0;
var durationDialogID = 0;

var sessionStart = 0

/**
 * logVisitStart
 * -------------
 * Takes note of the time a given application is opened and
 * resets necessary logging variables.
 */
var resetDurationInterventions = function() {
  if (durationToastID) {
    Timer.clearTimeout(durationToastID);
    durationToastID = 0;
  }

  if (durationNotifID) {
    Timer.clearTimeout(durationNotifID);
    durationNotifID = 0;
  }

  if (durationDialogID) {
    Timer.clearTimeout(durationDialogID);
    durationDialogID = 0;
  }
  sessionStart = Date.now()
};


/**
 * popToastVisitLength
 * -------------------
 * Displays a toast after INTERVAL_DURATION_TST ms on the
 * specified package.
 */
code.DURATION_TOAST = function (real, pkg) {
  if (!real) {
    Toast.show(context, "You've been on Facebook for 5 minutes this visit", 1, "#2EC4B6");
    return;
  }
  var now = System.currentTimeMillis();
  if (!durationToastID) {
    durationToastID = Timer.setTimeout(() => {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DURATION_TOAST}]);
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var msg = "You've been on " + applicationName + " for " + Math.ceil((Date.now() - sessionStart )/ MIN_IN_MS) + " minutes this visit";
      Toast.show(context, msg, 1, "#2EC4B6");
      durationToastID = 0;
    }, INTERVAL_DURATION_TST);
  }
};

/**
 * sendNotificationVisitLength
 * ---------------------------
 * Displays a notification after INTERVAL_DURATION_NTF ms
 * on the specified package.
 */
code.DURATION_NOTIFICATION = function (real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Visit Length",
      "You've been using Facebook for 10 minutes", notificationID.DURATION, 10);
    return;
  }

  var now = System.currentTimeMillis();
  if (!durationNotifID) {
    durationNotifID = Timer.setTimeout(() => {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DURATION_NOTIFICATION}]);
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = applicationName + " Visit Length";
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " been using " + applicationName + " for " + Math.ceil((Date.now() - sessionStart) / MIN_IN_MS) + " minutes";
      NotificationUtil.sendNotification(context, title, msg, notificationID.DURATION, 10);
      durationNotifID = 0;
    }, INTERVAL_DURATION_NTF)
  }
};


/**
 * showDialogVisitLength
 * ---------------------
 * Displays a toast after INTERVAL_DURATION_DLG ms on the
 * specified package.
 */
code.DURATION_DIALOG = function (real, pkg) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've been using Facebook for 15 minutes", "Okay");
    return;
  }
  var now = System.currentTimeMillis();
  if (!durationDialogID) {
    durationDialogID = Timer.setTimeout(() => {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DURATION_DIALOG}]);
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " been using " + applicationName + " for " + Math.ceil((Date.now() - sessionStart) / MIN_IN_MS) + " minutes";
      DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
      durationDialogID = 0;
      code.DURATION_DIALOG(true, pkg)
    }, INTERVAL_DURATION_DLG);
  }
}


/*************************************
 *    VIDEO BLOCKING INTERVENTION    *
 *************************************/

// callback function for audioFocusListener
var foreground = application.android.foregroundActivity;
var exitToHome = function () {
  // if statement to protect if the foreground activity becomes null (after a crash)
  if (foreground) {
    var toHome = new Intent(Intent.ACTION_MAIN);
    toHome.addCategory(Intent.CATEGORY_HOME);
    foreground.startActivity(toHome);
  }
};


/*
 * youTubeVideoBlocker
 * -------------------
 * Looks for pause/play button on YouTube Videos and
 * pauses the video (by requesting audio focus) if it
 * finds them. Displays overlay covering the video
 * player in YouTube.
 */
var pausedThisVisit = false;
var playNode;
code.VIDEO_BLOCKER = function (real, node, pkg) {
  if (!real) {
    Toast.show(context, "No demo available for this nudge!", 0);
    return;
  }

  if (!node) { return; }

  if (node.isFocusable() && (node.getContentDescription() === "Play video"
    || node.getContentDescription() === "Pause video") && !pausedThisVisit) {

    var videoContainer = node.getParent();
    var videoRect = new android.graphics.Rect();
    if (videoContainer) { videoContainer.getBoundsInScreen(videoRect); }

    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VIDEO_BLOCKER}]);
    audioManager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_SYSTEM, AudioManager.AUDIOFOCUS_GAIN);
    VideoOverlay.showYoutube(videoRect.width(), videoRect.height(), null, exitToHome);
    pausedThisVisit = true;
  }
}




/**
 * audioFocusListener
 * ------------------
 * Detects loss of audio focus and pops a dialog when other
 * applications (i.e. Facebook, YouTube) begin playing video,
 * thus stealing the audio focus.
 */
var audioFocusListener = new android.media.AudioManager.OnAudioFocusChangeListener({
    onAudioFocusChange: function (change) {
      // DO NOTHING
    }
});



/***************************************
 *        OVERLAY INTERVENTIONS        *
 ***************************************/


/**
 * showFullScreenOverlay
 * ---------------------
 * Present a full screen overlay with two buttons (positive
 * and negative). Overlay disappears on click.
 */
code.FULL_SCREEN_OVERLAY = function (real, pkg) {
  if (!real) {
    FullScreenOverlay.showOverlay("Continue to Facebook?",
      "You've been here 25 times today. Want to take a break?",
      "Continue to Facebook", "Get me out of here!", null, null);
    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits >= THRESHOLD_FULLSCREEN_OVR) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.FULL_SCREEN_OVERLAY}]);
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var title = "Continue to " + app + "?";
    var linkMsg = "Continue to " + app;
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " been here " + visits + (visits === 1 ? " time" : " times") + " today. Want to take a break?";
    FullScreenOverlay.showOverlay(title, msg, linkMsg, "Get me out of here!", null, exitToHome);
  }
}


/*
 * showCountUpTimer
 * ----------------
 * Display an overlaid timer (initially in the bottom
 * right corner) that counts up. Timer is flickable.
 * Call dismissTimer to get rid of display.
 */
var countUpTimerID;
code.COUNTUP_TIMER_OVERLAY = function (real, pkg) {
  if (!real) {
    TimerOverlay.dismissTimer();
    if (countUpTimerID) {
      Timer.clearTimeout(countUpTimerID);
      countUpTimerID = 0;
    }

    TimerOverlay.showCountUpTimer();
    countUpTimerID = Timer.setTimeout(() => {
        TimerOverlay.dismissTimer();
    }, 6000);

    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits >= THRESHOLD_COUNTUP_TMR) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.COUNTUP_TIMER_OVERLAY}]);
    TimerOverlay.showCountUpTimer();
  }
}


/*
 * showCountDownTimer
 * ------------------
 * Display an overlaid timer (initially in the bottom
 * right corner) that counts down. Timer is flickable.
 * Call dismissTimer to get rid of display.
 */
code.COUNTDOWN_TIMER_OVERLAY = function (real, pkg) {
  if (!real) {
    TimerOverlay.dismissTimer();
    TimerOverlay.showCountDownTimer((1/12), null);
    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits >= THRESHOLD_COUNTDOWN_TMR) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.COUNTDOWN_TIMER_OVERLAY}]);
    TimerOverlay.showCountDownTimer(2, exitToHome);
  }
}


/*
 * dimScreen
 * ---------
 * Display an overlaid timer (initially in the bottom
 * right corner) that counts up. Timer is flickable.
 * Call dismissTimer to get rid of display.
 */
var dimScreen = code.DIMMER_OVERLAY = function (real, pkg) {
  if (!real) {
    DimmerOverlay.dim(0.2);
    Timer.setTimeout(() => {
        DimmerOverlay.removeDimmer();
    }, 6500);
    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits > THRESHOLD_DIMSCREEN_OVR) {
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DIMMER_OVERLAY}]);
    DimmerOverlay.dim(0.01);
  }
}


/*
 * showSliderDialog
 * ----------------
 * Display a dialog that allows user to set time to
 * spend on the specified package.
 */
code.APPLICATION_SLIDER = function(real, pkg) {
  if (!real) {
    var msg = "How much time would you like to spend on Facebook this visit?";
    SliderOverlay.showSliderOverlay(msg, null);
    return;
  }

  var cb = function(setTime) {
    if (setTime === 0) {
      setTime = 0.05;
    }

    TimerOverlay.showCountDownTimer(setTime, exitToHome);
  };

  var visits = StorageUtil.getVisits(pkg);
  if (visits > THRESHOLD_APPLICATION_SLIDER_OVR) {
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var msg = "How much time would you like to spend on " + app + " this visit?";
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.APPLICATION_SLIDER}]);
    SliderOverlay.showSliderOverlay(msg, cb);
  }
}



/*
 * showInterstitial
 * ----------------
 * Shows a full screen overlay that prevents user from entering app
 * for 10 seconds (also allows them to leave an app).
 */
code.INTERSTITIAL = function(real, pkg) {
  if (!real) {
    var title = "Just a Moment";
    var msg = "We'll take you to Facebook shortly. Take a deep breath in the meantime!";
    FullScreenOverlay.showInterstitial(title, msg, "EXIT", null);
    return;
  }

  var visits = StorageUtil.getVisits(pkg);
  if (visits > THRESHOLD_INTERSTITIAL_OVR) {
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var title = "Just a Moment";
    var msg = "We'll take you to " + app + " shortly. Take a deep breath in the meantime!";
    StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.INTERSTITIAL}]);
    FullScreenOverlay.showInterstitial(title, msg, "EXIT", exitToHome);
  }
}

/*
 * flipScreen
 * ----------
 * Flips the screen upside down. REQUIRES PERMISSION
 */
var flipScreen = function(real, pkg) {
  if (!real) {
    ScreenFlipperOverlay.flipScreen();
    Timer.setTimeout(() => {
      ScreenFlipperOverlay.removeOverlay();
    }, 3000);
    return;
  }

  // if (StorageUtil.canIntervene(ID.interventionIDs.FLIPPER, pkg)) {
  //   var visits = StorageUtil.getVisits(pkg);
  //   if (visits > THRESHOLD_FLIPPER_OVR) {
  //     StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.FLIPPER}]);
  //     ScreenFlipperOverlay.flipScreen();
  //   }
  // }
}

function show_target_enabler() {
  var title = "Target Acquired!";
  var msg = "You've unlocked Targets! Would you like to check it out?";
  var pos = "Let's do it!";
  var neg = "Later";
  var cb = function() {
    var intent = context.getPackageManager().getLaunchIntentForPackage("com.stanfordhci.habitlab");
    intent.putExtra("goToTarget", "true");
    if (foreground) {
      foreground.startActivity(intent);
    }
  };

  TargetOverlay.showTargetEnableOverlay(title, msg, pos, neg, cb, null);
}

/*
 * positiveAppToast
 * ----------------
 * Pops toast to go to positive app/
 */
code.POSITIVE_TOAST = function(real, pkg) {
  if (!real) {
    var targetPkg = 'com.stanfordhci.habitlab';
    var targets = StorageUtil.getTargetSelectedPackages();
    if (targets.length > 0) {
      targetPkg = targets[0];
    }
    var targetAppName = UsageInformationUtil.getBasicInfo(targetPkg).name;
    var cb = function () {
      var launchIntent = context.getPackageManager().getLaunchIntentForPackage(targetPkg);
      if (foreground) {
        foreground.startActivity(launchIntent);
      }
    }
    var appName = UsageInformationUtil.getBasicInfo(targetPkg).name;
    var bitmap = UsageInformationUtil.getApplicationBitmap(targetPkg);
    //var icon_id = context.getResources().getIdentifier("ic_habitlab_white", "drawable", context.getPackageName());
    //var bitmap = context.getResources().getDrawable(icon_id).getBitmap();
    ToastOverlay.showToastOverlay("Open " + appName, bitmap, null, true);
    return;
  }
  if (StorageUtil.isTargetOn()) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits > THRESHOLD_POSITIVE_TST) {
      var targets = StorageUtil.getTargetSelectedPackages();
      if (targets.length === 0) { return; }
      var index = randBW(0, targets.length - 1);
      var targetPkg = targets[index];
      if (targetPkg.length > 2) {
        var bitmap = UsageInformationUtil.getApplicationBitmap(targetPkg);
        var cb = function () {
          var launchIntent = context.getPackageManager().getLaunchIntentForPackage(targetPkg);
          if (foreground) {
            foreground.startActivity(launchIntent);
          }
        }
        var appName = UsageInformationUtil.getBasicInfo(targetPkg).name;
        ToastOverlay.showToastOverlay("Open " + appName, bitmap, cb, true);
      }
    }
  } else {
    show_target_enabler()
  }
}

/*
 * positiveAppInterstitial
 * ----------------
 * Pops interstitial to go to positive app/
 */
code.POSITIVE_FULL_SCREEN_OVERLAY = function(real, pkg) {
  if (!real) {
    var targetPkg = 'com.stanfordhci.habitlab';
    var targets = StorageUtil.getTargetSelectedPackages();
    if (targets.length > 0) {
      targetPkg = targets[0];
    }
    var targetAppName = UsageInformationUtil.getBasicInfo(targetPkg).name;
    var cb = function () {
      var launchIntent = context.getPackageManager().getLaunchIntentForPackage(targetPkg);
      if (foreground) {
        foreground.startActivity(launchIntent);
      }
    }

    FullScreenOverlay.showOverlay("Go to " + targetAppName + " instead?",
      "You've already been here 25 times today. Want to do something else?",
      "Continue to Facebook", "Go to " + targetAppName, null, cb);
    return;
  }

  var targetPkg = 'com.stanfordhci.habitlab';
  var targets = StorageUtil.getTargetSelectedPackages();
  if (targets.length === 0) { return; }
  if (targets.length > 0) {
    targetPkg = targets[0];
  }
  var targetAppName = UsageInformationUtil.getBasicInfo(targetPkg).name;
  var cb = function () {
    var launchIntent = context.getPackageManager().getLaunchIntentForPackage(targetPkg);
    if (foreground) {
      foreground.startActivity(launchIntent);
    }
  }

  if (StorageUtil.isTargetOn()) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits >= THRESHOLD_FULLSCREEN_OVR) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.POSITIVE_FULL_SCREEN_OVERLAY}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = "Go to " + targetAppName + " instead?";
      var linkMsg = "Continue to " + app;
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " already been here " + visits + (visits === 1 ? " time" : " times") + " today. Want to do something else?";
      FullScreenOverlay.showOverlay(title, msg, linkMsg, "Go to " + targetAppName, null, cb);
    }
  } else {
    show_target_enabler()
  }
}


/*
 * removeOverlays
 * --------------
 * Remove any left over overlays on the screen.
 */
var removeOverlays = function() {
  DimmerOverlay.removeDimmer();
  TimerOverlay.dismissTimer();
  DialogOverlay.removeOneOptionDialog();
  DialogOverlay.removeTwoOptionDialog();
  FullScreenOverlay.removeOverlay();
  VideoOverlay.removeVideoBlocker();
  LockdownOverlay.removeOverlay();
  SliderOverlay.removeSliderOverlay();
  ScreenFlipperOverlay.removeOverlay();
  TargetOverlay.removeTargetDialog();
  TargetOverlay.removeIntroDialog();
  ToastOverlay.removeOverlay();
  pausedThisVisit = false;
}


/***************************************
 *       INTERVENTION RETREIVAL        *
 ***************************************/
var intervention_functions = []

var onLaunchInterventions = {
  easy: [],
  medium: [],
  hard: [],
}
var onScreenUnlockInterventions = {
  easy: [],
  medium: [],
  hard: [],
}

var durationInterventions = [];

(function() {
  for (var i = 0; i < ID.interventionDetails.length; ++i) {
    var intervention_info = ID.interventionDetails[i];
    if (!intervention_info) {
      console.warn('missing interventionDetails for intervention number: ' + i)
      console.warn(intervention_info)
      continue
    }
    intervention_function = code[intervention_info.shortname] //intervention_functions[i];
    if (!intervention_function) {
      console.warn('missing code for intervention: ' + intervention_info.shortname);
      continue
    }
    intervention_functions[i] = intervention_function;
    intervention_function_and_name = {
      func: intervention_function,
      shortname: intervention_info.shortname,
    }
    if (intervention_info.target == 'duration') {
      durationInterventions.push(intervention_function_and_name);
    }
    else if (intervention_info.target == 'app') {
      onLaunchInterventions[intervention_info.level].push(intervention_function_and_name);
    } else if (intervention_info.target == 'phone') {
      onScreenUnlockInterventions[intervention_info.level].push(intervention_function_and_name);
    }
  }
})();

var nextOnLaunchIntervention = function(pkg) {
  if (GlobalUtil.getVar('override_launch_intervention')) {
    code[GlobalUtil.getVar('override_launch_intervention')](true, pkg)
    return
  }
  // set up duration interventions
  for (var duration_intervention of durationInterventions) {
    if (StorageUtil.getExperiment().includes("conservation") &&
        !StorageUtil.isPackageFrequent(pkg)) {
          //We want the "infrequent/easy" goals to have no duration interventions
          continue
    }
    duration_intervention.func(true, pkg);
  }
  var randomDifficulty = Math.random();
  var index;
  var func_and_name;
  if (randomDifficulty < 0.1) {  // hard
    index = randBW(0, onLaunchInterventions.hard.length - 1);
    func_and_name = onLaunchInterventions.hard[index];
  }  else if (randomDifficulty < 0.4) { // medium
    index = randBW(0, onLaunchInterventions.medium.length - 1);
    func_and_name = onLaunchInterventions.medium[index];
  } else {  // easy
    index = randBW(0, onLaunchInterventions.easy.length - 1);
    func_and_name = onLaunchInterventions.easy[index];
  }
  if (StorageUtil.canIntervene(ID.interventionIDs[func_and_name.shortname], pkg)) {
    func_and_name.func(true, pkg);
  }
  return func_and_name.shortname
};

var nextScreenOnIntervention = function() {
  var run = Math.random();
  if (run < 0.075) {
    code.GLANCE_NOTIFICATION(true);
  }
  return "GLANCE_NOTIFICATION"
}

var nextScreenUnlockIntervention = function() {
  var run = Math.random();
  if (run < 0.15) {
    var randomDifficulty = Math.random();
    var index;
    var func_and_name;
    if (randomDifficulty < 0.4) {
      index = randBW(0, onScreenUnlockInterventions.medium.length - 1);
      func_and_name = onScreenUnlockInterventions.medium[index];
    } else {
      index = randBW(0, onScreenUnlockInterventions.easy.length - 1);
      func_and_name = onScreenUnlockInterventions.easy[index];
    }
    // TODO there are no hard interventions for screen unlock (phone) type
    if (StorageUtil.canIntervene(ID.interventionIDs[func_and_name.shortname])) {
      func_and_name.func(true);
    }
    return func_and_name.shortname
  }
}

var randBW = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

module.exports = {
  interventions: intervention_functions,
  resetDurationInterventions,
  removeOverlays,
  nextOnLaunchIntervention,
  nextScreenOnIntervention,
  nextScreenUnlockIntervention,
};
