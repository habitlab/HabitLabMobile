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
  DURATION: 4000
};

// Intervention Intervals
var VISITED_TOAST_INTERVAL = 5; // visits
var VISITED_NOTIF_INTERVAL = 10; // visits
var UNLOCKS_TOAST_INTERVAL = 15; // unlocks
var GLANCES_TOAST_INTERVAL = 20; // glances
var UNLOCKS_NOTIF_INTERVAL = 25; // unlocks
var GLANCES_NOTIF_INTERVAL = 35; // glances
var DURATION_TOAST_INTERVAL = 300000; // 5 minutes (in ms)
var DURATION_NOTIF_INTERVAL = 900000; // 15 minutes (in ms)
var FULL_SCREEN_OVERLAY_INTERVAL = 20; // visits
var COUNT_UP_TIMER_INTERVAL = 12;
var COUNT_DOWN_TIMER_INTERVAL = 16;
var DIMMER_OVERLAY_INTERVAL = 1;
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

    if (visits % VISITED_TOAST_INTERVAL === 0 && visits % VISITED_NOTIF_INTERVAL !== 0) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      Toast.makeText("You've opened " + applicationName + " " + visits + (visits === 1 ? " time" : " times") + " today").show();
    }
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
    if (visits % VISITED_NOTIF_INTERVAL === 0) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = applicationName + " Visit Count";

      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " opened " + applicationName + " " + visits + (visits === 1 ? " time" : " times") + " today";
      NotificationUtil.sendNotification(context, title, msg, notificationID.VISIT);
    }
  }
};



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
    if (glances % GLANCES_TOAST_INTERVAL === 0) {
      Toast.makeText("You've glanced at your phone " + glances + (glances === 1 ? " time" : " times") + " today").show();
    }
  }
};


/**************************************
 *    VISIT DURATION INTERVENTIONS    *
 **************************************/
// logging vars
var sentToast = false;
var sentNotification = false;

/**
 * logOpenTime
 * -----------
 * Takes note of the time a given application is opened and 
 * resets necessary logging variables.
 */
var logVisitStart = function() {
  sentToast = false;
  sentNotification = false;
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
    if ((now - visitStart) > DURATION_TOAST_INTERVAL && !sentToast) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      Toast.makeText("You've been on " + applicationName + " for " + Math.ceil(DURATION_TOAST_INTERVAL / MIN_IN_MS) + " minutes this visit").show();
      sentToast = true;
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
    if ((now - visitStart) > DURATION_NOTIF_INTERVAL && !sentNotification) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = applicationName + " Visit Length";
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " been using " + applicationName + " for " + Math.ceil(DURATION_NOTIF_INTERVAL / MIN_IN_MS) + " minutes";
      NotificationUtil.sendNotification(context, title, msg, notificationID.DURATION);
      sentNotification = true;
    }
  }
};


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
    DialogOverlay.showPosNegDialogOverlay(context, "Would you like to continue watching?", 
          "Yes", "No", null, null);
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
        DialogOverlay.showPosNegDialogOverlay(context, msg, 
          "Yes", "No", stopVideoBlocking, exitToHome);
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
    FullScreenOverlay.showOverlay(context, "Continue to Faceook?", 
      "You've already been here 25 times today. Want to take a break?", 
      "Continue", "Get me out of here!", null, null);
    return;
  }
  
  if (StorageUtil.canIntervene(ID.interventionIDs.FULL_SCREEN_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits % FULL_SCREEN_OVERLAY_INTERVAL === 0) {
      var applicationName = UsageInformationUtil.getBasicInfo(pkg).name;
      var title = "Continue to " + applicationName + "?";
      var msg = shouldPersonalize() ? "Hey " + StorageUtil.getName() + ", you've" : "You've";
      msg += " already been here " + visits + (visits === 1 ? " time" : " times") + " today. Want to take a break?";
      FullScreenOverlay.showOverlay(context, title, msg, 
        "Continue", "Get me out of here!", null, exitToHome);
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
var showCountUpTimer = function (real, ctx, pkg) {
  if (!real) {
    dismissTimer(context);
    TimerOverlay.showCountUpTimer(context);
    const id = Timer.setTimeout(() => {
        dismissTimer(context);
    }, 6000);

    return;
  }


  if (StorageUtil.canIntervene(ID.interventionIDs.COUNTUP_TIMER_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits % COUNT_UP_TIMER_INTERVAL === 0 && visits % COUNT_DOWN_TIMER_INTERVAL !== 0) {
      TimerOverlay.showCountUpTimer(ctx);
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
var showCountDownTimer = function (real, ctx, pkg) {
  if (!real) {
    dismissTimer(context);
    TimerOverlay.showCountDownTimer(context, (1/12), null);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.COUNTDOWN_TIMER_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits % COUNT_DOWN_TIMER_INTERVAL === 0) {
      TimerOverlay.showCountDownTimer(ctx, 5, exitToHome);
    }
  }
}


/*
 * dismissTimer
 * ------------
 * Removes timer from screen, if there is one present.
 */
var dismissTimer = function (context) {
  TimerOverlay.dismissTimer(context);
}


/*
 * dimScreen
 * ---------
 * Display an overlaid timer (initially in the bottom 
 * right corner) that counts up. Timer is flickable.
 * Call dismissTimer to get rid of display. 
 */
var dimScreen = function (real, ctx, pkg, duration) {
  if (!real) {
    DimmerOverlay.dim(context, 0.2);
    Timer.setTimeout(() => {
        removeDimmer();
    }, 6500);
    return;
  }

  if (StorageUtil.canIntervene(ID.interventionIDs.DIMMER_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits % DIMMER_OVERLAY_INTERVAL === 0) {
      DimmerOverlay.dim(ctx, duration);
    }
  }
}

var removeDimmer = function (context) {
  DimmerOverlay.removeDimmer();
}


module.exports = { 
  interventions: [
    sendNotificationGlances,
    popToastUnlocked,
    sendUnlocksNotification,
    null,
    null,
    popToastVisitLength,
    sendNotificationVisitLength,
    popToastVisited,
    sendNotificationVisited,
    blockVideo,
    showFullScreenOverlay,
    showCountUpTimer,
    showCountDownTimer,
    null,
    null,
    null,
    null,
    dimScreen
  ], 
  allowVideoBlocking,
  logVisitStart,
  dismissTimer,
  removeDimmer
};




