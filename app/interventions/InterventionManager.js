const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const DialogOverlay = require("~/overlays/DialogOverlay");
const FullScreenOverlay = require("~/overlays/FullScreenOverlay");
const TopAndTailOverlay = require("~/overlays/TopAndTailOverlay");
const Toast = require("nativescript-toast");
const TimerOverlay = require("~/overlays/TimerOverlay");
const DimmerOverlay = require("~/overlays/DimmerOverlay");
const ID = require('~/interventions/InterventionData');
const Timer = require("timer");

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

// Intervention Intervals - Unlock/Glances
var UNLOCKS_TOAST_INTERVAL = 10; // unlocks
var UNLOCKS_NOTIF_INTERVAL = 15; // unlocks
var UNLOCKS_DIALOG_INTERVAL = 25; // unlocks
var GLANCES_NOTIF_INTERVAL = 35; // glances
var GLANCES_TOAST_INTERVAL = 1; // glances


// Intervention Intervals - On Launch
var VISITED_TOAST_INTERVAL = 5; // visits
var VISITED_NOTIF_INTERVAL = 10; // visits
var VISITED_DIALOG_INTERVAL = 15; // visits
var FULL_SCREEN_OVERLAY_INTERVAL = 20; // visits
var COUNT_UP_TIMER_INTERVAL = 17;
var COUNT_DOWN_TIMER_INTERVAL = 23;
var DIMMER_OVERLAY_INTERVAL = 24;

var DURATION_TOAST_INTERVAL = 300000; // 5 minutes (in ms)
var DURATION_NOTIF_INTERVAL = 600000; // 10 minutes (in ms)
var DURATION_DIALOG_INTERVAL = 900000; // 15 minutes (in ms)

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
 * Displays a toast after VISITED_TOAST_INTERVAL visits to the 
 * specified package.
 */
var popToastVisited = function(real, pkg) {
  if (!real) {
    Toast.makeText("You've visited Facebook 8 times today").show();
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.VISIT_TOAST, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
    Toast.makeText("You've opened " + applicationName + " " + visits + (visits === 1 ? " time" : " times") + " today").show(); 
  }
};


/**
 * sendNotificationVisited
 * -----------------------
 * Displays a notification after VISITED_NOTIF_INTERVAL visits to the 
 * specified package.
 */
var sendNotificationVisited = function(real, pkg) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Visit Count", "You've opened Facebook 7 times today", notificationID.VISIT);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.VISIT_NOTIFICATION, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
    var title = applicationName + " Visit Count";
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " opened " + applicationName + " " + visits + (visits === 1 ? " time" : " times") + " today";
    NotificationUtil.sendNotification(context, title, msg, notificationID.VISIT);
  }
};


/**
 * showDialogVisited
 * -----------------
 * Displays a notification after VISITED_DIALOG_INTERVAL visits to the 
 * specified package.
 */
var showDialogVisited = function (real, pkg) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've opened Facebook 12 times today", "Okay");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.VISIT_DIALOG, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " opened " + applicationName + " " + visits + (visits === 1 ? " time" : " times") + " today";
    DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
  }
}



/*************************************
 *   UNLOCKS/GLANCES INTERVENTIONS   *
 *************************************/

/**
 * sendUnlocksNotification
 * -----------------------
 * Displays a notification after UNLOCKS_NOTIF_INTERVAL device unlocks.
 */
var sendUnlocksNotification = function(real) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Unlock Alert", "You've unlocked your phone 7 times today", notificationID.VISIT);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.UNLOCK_NOTIFICATION)) {
    var unlocks = StorageUtil.getUnlocks();
    if (unlocks % UNLOCKS_NOTIF_INTERVAL === 0) {
      var title = 'Unlock Alert';
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
      NotificationUtil.sendNotification(context, title, msg, notificationID.UNLOCK);
    }
  }
};


/**
 * popToastUnlocked
 * ----------------
 * Displays a toast after UNLOCKS_TOAST_INTERVAL device unlocks.
 */
var popToastUnlocked = function(real) {
  if (!real) {
    Toast.makeText("You've unlocked your phone 7 times today").show();
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.UNLOCK_TOAST)) {
    var unlocks = StorageUtil.getUnlocks();
    if (unlocks % UNLOCKS_TOAST_INTERVAL === 0) {
      Toast.makeText("You've unlocked your phone " + unlocks + (unlocks === 1 ? " time" : " times") + " today").show();
    }
  }
};


/**
 * showUnlocksDialog
 * -----------------
 * Displays a dialog after UNLOCKS_DIALOG_INTERVAL device unlocks.
 */
var showUnlocksDialog = function (real) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've unlocked your phone 18 times today", "Okay");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.UNLOCK_DIALOG)) {
    var unlocks = StorageUtil.getUnlocks();
    if (unlocks % UNLOCKS_DIALOG_INTERVAL === 0) {
      var title = 'Unlock Alert';
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
      DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
    }
  }
}


/**
 * sendNotificationGlances
 * -----------------------
 * Displays a notification after GLANCES_NOTIF_INTERVAL device glances.
 */
var sendNotificationGlances = function(real) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Glance Alert", "You've glanced at your phone 7 times today", notificationID.VISIT);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.GLANCE_NOTIFICATION)) {
    var glances = StorageUtil.getGlances();
    if (glances % GLANCES_NOTIF_INTERVAL === 0) {
      var title = 'Glance Alert';
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " glanced at your phone " + glances + (glances === 1 ? ' time' : ' times') + ' today';
      NotificationUtil.sendNotification(context, title, msg, notificationID.GLANCE);
    }
  }
};


/**
 * popToastGlanced
 * ---------------
 * Displays a toast after GLANCES_TOAST_INTERVAL device glances.
 */
var popToastGlanced = function(real) {
  if (!real) {
    Toast.makeText("You've glanced at your phone 14 times today").show();
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.GLANCE_TOAST)) {
    var glances = StorageUtil.getGlances();
    Toast.makeText("You've glanced at your phone " + glances + (glances === 1 ? " time" : " times") + " today").show();
  }
};



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
    Toast.makeText("You've already used Facebook for 23 minutes today!").show();
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.USAGE_TOAST, pkg)) {
    var minutesUsed = StorageUtil.getAppTime(pkg);
    var minutesGoal = StorageUtil.getMinutesGoal(pkg);
    var msg = "";

    if (minutesUsed > minutesGoal) {
      msg = "Uh oh! You've spent " + minutesUsed + " minutes here today! (Goal: " + minutesGoal + " minutes)";
    } else {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      msg = applicationName + " Usage: " + minutesUsed + " of " + minutesGoal + " goal minutes today";
    }

    Toast.makeText(msg).show();
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
      "You've already used Facebook for 27 minutes today!", notificationID.USAGE);
    return;
  }

  console.warn("n");
  if (StorageUtil.canIntervene(ID.interventionIDs.USAGE_NOTIFICATION, pkg)) {
    var minutesUsed = StorageUtil.getAppTime(pkg);
    var minutesGoal = StorageUtil.getMinutesGoal(pkg);
    var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
    var title = applicationName + " Usage Alert"
    var msg = "";

    if (minutesUsed > minutesGoal) {
      msg = "Whoops! You've been here for " + minutesUsed + " minutes today! (Goal: " + minutesGoal + " minutes)"; 
    } else {
      msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += "used " + applicationName + " for " + minutesUsed + " minutes today. (Goal: " + minutesGoal + " minutes)"; 
    }
      
    NotificationUtil.sendNotification(context, title, msg, notificationID.USAGE);    
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
    var minutesUsed = StorageUtil.getAppTime(pkg);
    var minutesGoal = StorageUtil.getMinutesGoal(pkg);
    var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
    var msg = "";

    if (minutesUsed > minutesGoal) {
      msg = shouldPersonalize() ? "Slow down " + StorageUtil.getName() + "!" : "Slow down!"
      msg += " That's " + minutesUsed + " minutes on " + applicationName + " today!"; 
    } else {
      msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += "used " + applicationName + " for " + minutesUsed + " minutes today. (Goal: " + minutesGoal + " minutes)"; 
    }

    DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
  }
};



/**************************************
 *    VISIT DURATION INTERVENTIONS    *
 **************************************/
// logging vars
var sentToastDuration = false;
var sentNotificationDuration = false;
var sentDialogDuration = false;

/**
 * logVisitStart
 * -------------
 * Takes note of the time a given application is opened and 
 * resets necessary logging variables.
 */
var logVisitStart = function() {
  sentToastDuration = false;
  sentNotificationDuration = false;
  sentDialogDuration = false;
};


/**
 * popToastVisitLength
 * -------------------
 * Displays a toast after DURATION_TOAST_INTERVAL ms on the 
 * specified package.
 */
var popToastVisitLength = function (real, pkg, visitStart) {
  if (!real) {
    Toast.makeText("You've been on Facebook for 5 minutes this visit").show();
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DURATION_TOAST, pkg)) {
    var now = System.currentTimeMillis();
    if ((now - visitStart) > DURATION_TOAST_INTERVAL && !sentToastDuration) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      Toast.makeText("You've been on " + applicationName + " for " + Math.ceil(DURATION_TOAST_INTERVAL / MIN_IN_MS) + " minutes this visit").show();
      sentToastDuration = true;
    }
  }
};

/**
 * sendNotificationVisitLength
 * ---------------------------
 * Displays a notification after DURATION_TOAST_INTERVAL ms 
 * on the specified package.
 */
var sendNotificationVisitLength = function (real, pkg, visitStart) {
  if (!real) {
    NotificationUtil.sendNotification(context, "Facebook Visit Length", "You've been using Facebook for 10 minutes", notificationID.DURATION);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DURATION_NOTIFICATION, pkg)) {
    var now = System.currentTimeMillis();
    if ((now - visitStart) > DURATION_NOTIF_INTERVAL && !sentNotificationDuration) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = applicationName + " Visit Length";
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " been using " + applicationName + " for " + Math.ceil(DURATION_NOTIF_INTERVAL / MIN_IN_MS) + " minutes";
      NotificationUtil.sendNotification(context, title, msg, notificationID.DURATION);
      sentNotificationDuration = true;
    }
  }
};


/**
 * showDialogVisitLength
 * ---------------------
 * Displays a toast after DURATION_DIALOG_INTERVAL ms on the 
 * specified package.
 */
var showDialogVisitLength = function (real, pkg, visitStart) {
  if (!real) {
    DialogOverlay.showOneOptionDialogOverlay("You've been using Facebook for 15 minutes", "Okay");
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DURATION_DIALOG, pkg)) {
    var now = System.currentTimeMillis();
    if ((now - visitStart) > DURATION_DIALOG_INTERVAL && !sentDialogDuration) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " been using " + applicationName + " for " + Math.ceil(DURATION_DIALOG_INTERVAL / MIN_IN_MS) + " minutes";
      DialogOverlay.showOneOptionDialogOverlay(msg, "Okay");
      sentDialogDuration = true;
    }
  }
}


/*************************************
 *    VIDEO BLOCKING INTERVENTION    *
 *************************************/
var shouldBlockVideo = true;


/**
 * allowVideoBlocking
 * ------------------
 * Sets shouldBlockVideo variable to either permit video blocking on 
 * the current package (true) or disable it (false)
 */
var allowVideoBlocking = function (bool) {
  shouldBlockVideo = bool;
};


/**
 * blockVideo
 * ----------
 * Blocks all videos from the current package by constantly 
 * requesting audio focus.
 */
var blockVideo = function (real, pkg) {
  if (!real) {
    DialogOverlay.showTwoOptionDialogOverlay("Would you like to continue watching?", "Yes", "No", null, null);
    return;
  }

  if (shouldBlockVideo && StorageUtil.canIntervene(ID.interventionIDs.VIDEO_BLOCKER, pkg)) {
    audioManager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_SYSTEM, AudioManager.AUDIOFOCUS_GAIN);
  }
};


// callback function for audioFocusListener
var stopVideoBlocking = function () {
  allowVideoBlocking(false);
};


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


/**
 * audioFocusListener
 * ------------------
 * Detects loss of audio focus and pops a dialog when other
 * applications (i.e. Facebook, YouTube) begin playing video,
 * thus stealing the audio focus.
 */
var audioFocusListener = new android.media.AudioManager.OnAudioFocusChangeListener({
    onAudioFocusChange: function (change) {
      if (shouldBlockVideo && change === AudioManager.AUDIOFOCUS_LOSS) {
        var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", would" : "Would";
        msg += " you like to continue watching?";
        DialogOverlay.showTwoOptionDialogOverlay(msg, "Yes", "No", stopVideoBlocking, exitToHome);
      }
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
var showFullScreenOverlay = function (real, pkg) {
  if (!real) {
    FullScreenOverlay.showOverlay("Continue to Faceook?", 
      "You've already been here 25 times today. Want to take a break?", 
      "Continue", "Get me out of here!", null, null);
    return;
  }
  
  if (StorageUtil.canIntervene(ID.interventionIDs.FULL_SCREEN_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
    var title = "Continue to " + applicationName + "?";
    var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
    msg += " already been here " + visits + (visits === 1 ? " time" : " times") + " today. Want to take a break?";
    FullScreenOverlay.showOverlay(title, msg, 
      "Continue", "Get me out of here!", null, exitToHome);
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
var showCountDownTimer = function (real, pkg) {
  if (!real) {
    TimerOverlay.dismissTimer();
    TimerOverlay.showCountDownTimer((1/12), null);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.COUNTDOWN_TIMER_OVERLAY, pkg)) {
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
    DimmerOverlay.dim(0.01);
  }
}

var removeOverlays = function() {
  DimmerOverlay.removeDimmer();
  TimerOverlay.dismissTimer();
  DialogOverlay.removeOneOptionDialog();
  DialogOverlay.removeTwoOptionDialog();
  FullScreenOverlay.removeOverlay();
}




var easyIndex = 0;
var mediumIndex = 0;
var hardIndex = 0;
var onLaunchInterventions = {
  easy: [popToastVisited, sendNotificationVisited, popToastUsage, sendNotificationUsage],
  medium: [showDialogVisited, showDialogUsage, showFullScreenOverlay, showCountUpTimer],
  hard: [showCountDownTimer, dimScreen]
};

var getNextOnLaunchIntervention = function (pkg) {
  var run = Math.random();
  console.warn(run);
  if (run < 0.4) {
    var randomDifficulty = Math.random();
    if (randomDifficulty < 0.1) {  // hard
      onLaunchInterventions.hard[hardIndex % onLaunchInterventions.hard.length](true, pkg);
      hardIndex++;
    }  else if (randomDifficulty < 0.4) { // medium
      onLaunchInterventions.medium[mediumIndex % onLaunchInterventions.medium.length](true, pkg);
      mediumIndex++;
    } else {  // easy
      onLaunchInterventions.easy[easyIndex % onLaunchInterventions.easy.length](true, pkg);
      easyIndex++;
    }
  }
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
    blockVideo,
    showFullScreenOverlay,
    showCountUpTimer,
    showCountDownTimer,
    showUnlocksDialog,
    showDialogUsage,
    showDialogVisitLength,
    showDialogVisited,
    dimScreen
  ], 
  allowVideoBlocking,
  logVisitStart,
  removeOverlays,
  getNextOnLaunchIntervention
};




