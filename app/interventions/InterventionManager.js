const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const DialogOverlay = require("~/overlays/DialogOverlay");
const FullScreenOverlay = require("~/overlays/FullScreenOverlay");
const Toast = require("~/util/ToastUtil");
const TimerOverlay = require("~/overlays/TimerOverlay");
const DimmerOverlay = require("~/overlays/DimmerOverlay");
const VideoOverlay = require("~/overlays/VideoOverlay");
const LockdownOverlay = require("~/overlaps/LockdownOverlay")
const ID = require('~/interventions/InterventionData');
const Timer = require("timer");
var FancyAlert = require("~/util/FancyAlert");

var application = require('application');
var context = application.android.context.getApplicationContext();

// native APIs
var AudioManager = android.media.AudioManager;
var Context = android.content.Context;
var Intent = android.content.Intent;
var System = java.lang.System;
// var AccessibilityService = android.accessibilityservice.AccessibilityService;

// global vars
var audioManager = context.getSystemService(Context.AUDIO_SERVICE);

var notificationID = {
  GLANCE: 1000,
  UNLOCK: 2000,
  VISIT: 3000,
  DURATION: 4000,
  USAGE: 5000
};

/*************************************************************
 *             EFFECTIVE INTERVENTION THRESHOLDS             * 
 *    (when it's ok to start showing each interventions)     *
 *************************************************************/

// visit interventions
const THRESHOLD_VISIT_TST = 5;
const THRESHOLD_VISIT_NTF = 7;
const THRESHOLD_VISIT_DLG = 10;

// glance/unlock interventions
const THRESHOLD_GLANCES_NTF = 30;
const THRESHOLD_UNLOCKS_TST = 15;
const THRESHOLD_UNLOCKS_NTF = 17;
const THRESHOLD_UNLOCKS_DLG = 20;

// usage interventions
const THRESHOLD_USAGE_TST = 10;
const THRESHOLD_USAGE_NTF = 15;
const THRESHOLD_USAGE_DLG = 17;

// visit duration interventions
const THRESHOLD_DURATION_TST = 300000;
const THRESHOLD_DURATION_NTF = 600000;
const THRESHOLD_DURATION_DLG = 900000;

// overlay interventions 
const THRESHOLD_FULLSCREEN_OVR = 12;
const THRESHOLD_COUNTUP_TMR = 12;
const THRESHOLD_COUNTDOWN_TMR = 15;
const THRESHOLD_DIMSCREEN_OVR = 15;


var MIN_IN_MS = 60000;

var shouldPersonalize = function() {
  return Math.floor(Math.random() * 2) === 0;
};

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
var popToastVisited = function(real, pkg) {
  if (!real) {
    Toast.show(context, "You've visited Facebook 8 times today", 1, "#E71D36");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.VISIT_TOAST, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits >= THRESHOLD_VISIT_TST) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VISIT_TOAST}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var msg = "You've opened " + app + " " + visits + (visits === 1 ? " time" : " times") + " today";
      Toast.show(context, msg, 1, "#E71D36"); 
    }
  }
};


/**
 * sendNotificationVisited
 * -----------------------
 * Sends a notification if there are an effective number 
 * of visits (determined by THRESHOLD_VISIT_NTF) to 
 * the specified package.
 */
var sendNotificationVisited = function(real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Visit Count", 
      "You've opened Facebook 7 times today", notificationID.VISIT, 10);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.VISIT_NOTIFICATION, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits >= THRESHOLD_VISIT_NTF) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VISIT_NOTIFICATION}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = app + " Visit Count";
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " opened " + app + " " + visits + (visits === 1 ? " time" : " times") + " today";
      NotificationUtil.sendNotification(context, title, msg, notificationID.VISIT, 10);
    }
  }
};


/**
 * showDialogVisited
 * -----------------
 * Shows a dialog if there are an effective number 
 * of visits (determined by THRESHOLD_VISIT_DLG) to 
 * the specified package.
 */
var showDialogVisited = function (real, pkg) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've opened Facebook 12 times today", "Okay");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.VISIT_DIALOG, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits >= THRESHOLD_VISIT_DLG) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VISIT_DIALOG}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " opened " + app + " " + visits + (visits === 1 ? " time" : " times") + " today";
      DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
    }
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
var sendNotificationGlances = function(real) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Glance Alert", 
      "You've glanced at your phone 7 times today", notificationID.VISIT, 10);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.GLANCE_NOTIFICATION)) {
    var glances = StorageUtil.getGlances();
    if (glances >= THRESHOLD_GLANCES_NTF) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.GLANCE_NOTIFICATION}]);
      var title = 'Glance Alert';
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " glanced at your phone " + glances + (glances === 1 ? ' time' : ' times') + ' today';
      NotificationUtil.sendNotification(context, title, msg, notificationID.GLANCE, 10);
    }
  }
};


/**
 * popToastUnlocked
 * ----------------
 * Displays a toast if the device has an effective number 
 * of unlocks (determined by THRESHOLD_UNLOCKS_TST).
 */
var popToastUnlocked = function(real) {
  if (!real) {
    Toast.show(context, "You've unlocked your phone 7 times today", 1, "#72E500");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.UNLOCK_TOAST)) {
    var unlocks = StorageUtil.getUnlocks();
    if (unlocks >= THRESHOLD_UNLOCKS_TST) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.UNLOCK_TOAST}]);
      var msg = "You've unlocked your phone " + unlocks + (unlocks === 1 ? " time" : " times") + " today";
      Toast.show(context, msg, 1, "#72E500");
    }
  }
};


/**
 * sendUnlocksNotification
 * -----------------------
 * Send a notification if the device has an effective 
 * number of unlocks (determined by 
 * THRESHOLD_UNLOCKS_NTF).
 */
var sendUnlocksNotification = function(real) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Unlock Alert", 
      "You've unlocked your phone 7 times today", notificationID.VISIT, 10);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.UNLOCK_NOTIFICATION)) {
    var unlocks = StorageUtil.getUnlocks();
    if (unlocks >= THRESHOLD_UNLOCKS_NTF) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.UNLOCK_NOTIFICATION}]);
      var title = 'Unlock Alert';
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
      NotificationUtil.sendNotification(context, title, msg, notificationID.UNLOCK, 10);
    }
  }
};


/**
 * showUnlocksDialog
 * -----------------
 * Show a dialog if the device has an effective 
 * number of unlocks (determined by 
 * THRESHOLD_UNLOCKS_DLG).
 */
var showUnlocksDialog = function (real) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've unlocked your phone 18 times today", "Okay");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.UNLOCK_DIALOG)) {
    var unlocks = StorageUtil.getUnlocks();
    if (unlocks >= THRESHOLD_UNLOCKS_DLG) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.UNLOCK_DIALOG}]);
      var title = 'Unlock Alert';
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
      DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
    }
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
var popToastUsage = function (real, pkg) {
  if (!real) {
    Toast.show(context, "You've already used Facebook for 23 minutes today!", 1, "#FFA730");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.USAGE_TOAST, pkg)) {
    var minutes = StorageUtil.getAppTime(pkg);
    if (minutes >= THRESHOLD_USAGE_TST) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_TOAST}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var msg = "You've already spent " + minutes + " minutes on " + app + " today!";
      Toast.show(context, msg, 1, "#FFA730");
    }
  }
};


/**
 * sendNotificationUsage
 * ----------------------
 * Sends a notification on application launch if the user has 
 * already surpassed 1.5 times their minutes goal for the day.
 */
var sendNotificationUsage = function (real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Usage Alert", 
      "You've already used Facebook for 27 minutes today!", notificationID.USAGE, 10);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.USAGE_NOTIFICATION, pkg)) {
    var minutes = StorageUtil.getAppTime(pkg);
    if (minutes >= THRESHOLD_USAGE_NTF) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_NOTIFICATION}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = app + " Usage Alert"
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " already used " + app + " for " + minutes + " minutes today.";
      NotificationUtil.sendNotification(context, title, msg, notificationID.USAGE, 10);
    } 
  }
};


/**
 * showDialogUsage
 * ---------------
 * Shows a dialog on application launch if the user has 
 * already surpassed 2 times their minutes goal for the day.
 */
var showDialogUsage = function (real, pkg) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've already used Facebook for 47 minutes today!", "Okay");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.USAGE_DIALOG, pkg)) {
    var minutes = StorageUtil.getAppTime(pkg);
    if (minutes >= THRESHOLD_USAGE_DLG) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.USAGE_DIALOG}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", that's" : "That's"
      msg += " already " + minutes + " minutes on " + app + " today!"; 
      DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
    }
  }
};



/**************************************
 *    VISIT DURATION INTERVENTIONS    *
 **************************************/
// logging vars
var durationToastID = 0;
var durationNotifID = 0;
var durationDialogID = 0;

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
};


/**
 * popToastVisitLength
 * -------------------
 * Displays a toast after THRESHOLD_DURATION_TST ms on the 
 * specified package.
 */
var popToastVisitLength = function (real, pkg) {
  if (!real) {
    Toast.show(context, "You've been on Facebook for 5 minutes this visit", 1, "#2EC4B6");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DURATION_TOAST, pkg)) {
    var now = System.currentTimeMillis();
    if (!durationToastID) {
      durationToastID = Timer.setTimeout(() => {
        StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DURATION_TOAST}]);
        var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
        var msg = "You've been on " + applicationName + " for " + Math.ceil(THRESHOLD_DURATION_TST / MIN_IN_MS) + " minutes this visit";
        Toast.show(context, msg, 1, "#2EC4B6");
        durationToastID = 0;
      }, THRESHOLD_DURATION_TST);
    }
  }
};

/**
 * sendNotificationVisitLength
 * ---------------------------
 * Displays a notification after THRESHOLD_DURATION_NTF ms 
 * on the specified package.
 */
var sendNotificationVisitLength = function (real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Visit Length", 
      "You've been using Facebook for 10 minutes", notificationID.DURATION, 10);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DURATION_NOTIFICATION, pkg)) {
    var now = System.currentTimeMillis();
    if (!durationNotifID) {
      durationNotifID = Timer.setTimeout(() => {
        StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DURATION_NOTIFICATION}]);
        var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
        var title = applicationName + " Visit Length";
        var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
        msg += " been using " + applicationName + " for " + Math.ceil(THRESHOLD_DURATION_NTF / MIN_IN_MS) + " minutes";
        NotificationUtil.sendNotification(context, title, msg, notificationID.DURATION, 10);
        durationNotifID = 0;
      }, THRESHOLD_DURATION_NTF);
    }
  }
};


/**
 * showDialogVisitLength
 * ---------------------
 * Displays a toast after THRESHOLD_DURATION_DLG ms on the 
 * specified package.
 */
var showDialogVisitLength = function (real, pkg) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've been using Facebook for 15 minutes", "Okay");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DURATION_DIALOG, pkg)) {
    var now = System.currentTimeMillis();
    if (!durationDialogID) {
      durationDialogID = Timer.setTimeout(() => {
        StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DURATION_DIALOG}]);
        var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
        var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
        msg += " been using " + applicationName + " for " + Math.ceil(THRESHOLD_DURATION_DLG / MIN_IN_MS) + " minutes";
        DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
        durationDialogID = 0;
      }, THRESHOLD_DURATION_DLG);
    }
  }
}


/*************************************
 *    VIDEO BLOCKING INTERVENTION    *
 *************************************/
// var shouldBlockVideo = true;


/**
 * allowVideoBlocking
 * ------------------
 * Sets shouldBlockVideo variable to either permit video blocking on 
 * the current package (true) or disable it (false)
 */
// var allowVideoBlocking = function (bool) {
//   shouldBlockVideo = bool;
// };


/**
 * blockVideo
 * ----------
 * Blocks all videos from the current package by constantly 
 * requesting audio focus.
 */
// var blockVideo = function (real, pkg) {
//   if (!real) {
//     DialogOverlay.showTwoOptionDialogOverlay("Would you like to continue watching?", "Yes", "No", null, null);
//     return;
//   }

//   if (shouldBlockVideo && StorageUtil.canIntervene(ID.interventionIDs.VIDEO_BLOCKER, pkg)) {
//     audioManager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_SYSTEM, AudioManager.AUDIOFOCUS_GAIN);
//   }
// };


// // callback function for audioFocusListener
// var stopVideoBlocking = function () {
//   allowVideoBlocking(false);
// };


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
var youTubeVideoBlocker = function (node, pkg) {
  if (!node) { return; }

  if (node.isFocusable() && (node.getContentDescription() === "Play video" 
    || node.getContentDescription() === "Pause video") && !pausedThisVisit) {

    var videoContainer = node.getParent();
    var videoRect = new android.graphics.Rect();
    if (videoContainer) { videoContainer.getBoundsInScreen(videoRect); }

    if (StorageUtil.canIntervene(ID.interventionIDs.VIDEO_BLOCKER, pkg)) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.VIDEO_BLOCKER}]);
      audioManager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_SYSTEM, AudioManager.AUDIOFOCUS_GAIN);
      VideoOverlay.showYoutube(videoRect.width(), videoRect.height(), null, exitToHome);
      pausedThisVisit = true;
    }
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
      // if (shouldBlockVideo && change === AudioManager.AUDIOFOCUS_LOSS) {
      //   var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", would" : "Would";
      //   msg += " you like to continue watching?";
      //   DialogOverlay.showTwoOptionDialogOverlay(msg, "Yes", "No", stopVideoBlocking, exitToHome);
      // }
    }
});



/***************************************
 *        OVERLAY INTERVENTIONS        *
 ***************************************/

/**
 * showLockdownOverlay
 * ---------------------
 * Present a full screen overlay to block user from using watchlisted apps
 */
var showLockdownOverlay = function (pkg) {
// showOverlay = function (title, msg, pos, prog, max, negCallback) 
    var remaining = StorageUtil.getLockdownRemaining();
    var goal = StorageUtil.getLockdownGoal();
    var progress = goal - remaining;
    var msg = "You have " + remaining + " minutes of focus remaining";
    var app = UsageInformationUtil.getBasicInfo(pkg).name;
    var closeMsg = "Close " + app;
    
    LockdownOverlay.showOverlay("You're in lockdown mode!", 
      msg, closeMsg, progress, goal, function() {
          DialogOverlay.showTwoOptionDialogOverlay("Are you sure you want to stop lockdown mode?", "Yes", "Cancel", removeLockdown ,null);
      });
}


var removeLockdown = function() {
  StorageUtil.removeLockdown();
   Toast.makeText("Lockdown removed").show();
}
 







/**
 * showFullScreenOverlay
 * ---------------------
 * Present a full screen overlay with two buttons (positive
 * and negative). Overlay disappears on click. 
 */
var showFullScreenOverlay = function (real, pkg) {
  if (!real) {
    FullScreenOverlay.showOverlay("Continue to Faceook?", 
      "You've already been here 25 times today. Want to take a break?", 
      "Continue", "Get me out of here!", null, null);
    return;
  }
  
  if (StorageUtil.canIntervene(ID.interventionIDs.FULL_SCREEN_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits >= THRESHOLD_FULLSCREEN_OVR) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.FULL_SCREEN_OVERLAY}]);
      var app = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = "Continue to " + app + "?";
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " already been here " + visits + (visits === 1 ? " time" : " times") + " today. Want to take a break?";
      FullScreenOverlay.showOverlay(title, msg, "Continue", "Get me out of here!", null, exitToHome);
    }
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
var showCountUpTimer = function (real, pkg) {
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


  if (StorageUtil.canIntervene(ID.interventionIDs.COUNTUP_TIMER_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits >= THRESHOLD_COUNTUP_TMR) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.COUNTUP_TIMER_OVERLAY}]);
      TimerOverlay.showCountUpTimer();
    }
  }
}


/*
 * showCountDownTimer
 * ------------------
 * Display an overlaid timer (initially in the bottom 
 * right corner) that counts down. Timer is flickable.
 * Call dismissTimer to get rid of display. 
 */
var showCountDownTimer = function (real, pkg) {
  if (!real) {
    TimerOverlay.dismissTimer();
    TimerOverlay.showCountDownTimer((1/12), null);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.COUNTDOWN_TIMER_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits >= THRESHOLD_COUNTDOWN_TMR) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.COUNTDOWN_TIMER_OVERLAY}]);
      TimerOverlay.showCountDownTimer(2, exitToHome);
    } 
  }
}


/*
 * dimScreen
 * ---------
 * Display an overlaid timer (initially in the bottom 
 * right corner) that counts up. Timer is flickable.
 * Call dismissTimer to get rid of display. 
 */
var dimScreen = function (real, pkg) {
  if (!real) {
    DimmerOverlay.dim(0.2);
    Timer.setTimeout(() => {
        DimmerOverlay.removeDimmer();
    }, 6500);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DIMMER_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits > THRESHOLD_DIMSCREEN_OVR) {
      StorageUtil.addLogEvents([{category: "nudges", index: ID.interventionIDs.DIMMER_OVERLAY}]);
      DimmerOverlay.dim(0.01);
    }
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
  pausedThisVisit = false;
}

/***************************************
 *       INTERVENTION RETREIVAL        *
 ***************************************/
var onLaunchInterventions = {
  easy: [popToastVisited, sendNotificationVisited, popToastUsage, sendNotificationUsage],
  medium: [showDialogVisited, showDialogUsage, showFullScreenOverlay, showCountUpTimer],
  hard: [showCountDownTimer, dimScreen]
};

var onScreenUnlockInterventions = {
  easy: [sendUnlocksNotification, popToastUnlocked],
  medium: [showUnlocksDialog]
};

var nextOnLaunchIntervention = function(pkg) {
  // set up duration interventions
  popToastVisitLength(true, pkg);
  sendNotificationVisitLength(true, pkg);
  showDialogVisitLength(true, pkg);

  var lockdownMode = StorageUtil.inLockdownMode();
  if (lockdownMode) {
    showLockdownOverlay();
  }

  // decide whether or not to run an on-launch intervention
  var run = Math.random();
  if (run < 0.6) {
    var randomDifficulty = Math.random();
    var index;
    if (randomDifficulty < 0.1) {  // hard
      index = randBW(0, onLaunchInterventions.hard.length - 1);
      onLaunchInterventions.hard[index](true, pkg);
    }  else if (randomDifficulty < 0.4) { // medium
      index = randBW(0, onLaunchInterventions.medium.length - 1);
      onLaunchInterventions.medium[index](true, pkg);
    } else {  // easy
      index = randBW(0, onLaunchInterventions.easy.length - 1);
      onLaunchInterventions.easy[index](true, pkg);
    }
  }
};

var nextScreenOnIntervention = function() {
  var run = Math.random();
  if (run < 0.05) {
    sendNotificationGlances(true);
  }
}

var nextScreenUnlockIntervention = function() {
  var run = Math.random();
  if (run < 0.15) {
    var randomDifficulty = Math.random();
    var index;
    if (randomDifficulty < 0.4) {
      index = randBW(0, onScreenUnlockInterventions.medium.length - 1);
      onScreenUnlockInterventions.medium[index](true);
    } else {
      index = randBW(0, onScreenUnlockInterventions.easy.length - 1);
      onScreenUnlockInterventions.easy[index](true);
    }
  }
}

var randBW = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};



module.exports = { 
  interventions: [
    sendNotificationGlances,
    popToastUnlocked,
    sendUnlocksNotification,
    popToastUsage,
    sendNotificationUsage,
    popToastVisitLength,
    sendNotificationVisitLength,
    popToastVisited,
    sendNotificationVisited,
    youTubeVideoBlocker,
    showFullScreenOverlay,
    showCountUpTimer,
    showCountDownTimer,
    showUnlocksDialog,
    showDialogUsage,
    showDialogVisitLength,
    showDialogVisited,
    dimScreen
  ], 
  resetDurationInterventions,
  removeOverlays,
  nextOnLaunchIntervention,
  nextScreenOnIntervention,
  nextScreenUnlockIntervention,
  youTubeVideoBlocker
};




