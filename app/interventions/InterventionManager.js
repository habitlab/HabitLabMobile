const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const DialogOverlay = require("~/overlays/DialogOverlay");
const FullScreenOverlay = require("~/overlays/FullScreenOverlay");
const TopAndTailOverlay = require("~/overlays/TopAndTailOverlay");
const Toast = require("nativescript-toast");

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
  VISIT: 3000
};


/*************************************
 *     VISIT COUNT INTERVENTIONS     *
 *************************************/
var VISITED_TOAST_INTERVAL = 5;
var VISITED_NOTIF_INTERVAL = 15;


/**
 * popToastVisited
 * ---------------
 * Displays a toast after VISITED_TOAST_INTERVAL visits to the 
 * specified package.
 */
var popToastVisited = function(real, pkg) {
  if (!real) {
    Toast.makeText("Facebook visits today: 7").show();
    return;
  }


  if (StorageUtil.canIntervene(StorageUtil.interventions.VISIT_TOAST, pkg)) {
    var applicationName = UsageInformationUtil.getAppName(pkg);
    var visits = StorageUtil.getVisits(pkg);

    if (visits % VISITED_TOAST_INTERVAL === 0 && visits % VISITED_NOTIF_INTERVAL !== 0) {
      Toast.makeText(applicationName + " visits today: " + visits).show();
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
    NotificationUtil.sendNotification(context, "Facebook Usage", "You have opened Facebook 7 times today", notificationID.VISIT);
    return;
  }

  if (StorageUtil.canIntervene(StorageUtil.interventions.VISIT_NOTIFICATION, pkg)) {
    var applicationName = UsageInformationUtil.getAppName(pkg);
    var visits = StorageUtil.getVisits(pkg);
    var title = applicationName + " Usage";
    var msg = "You have opened " + applicationName + " " + visits + (visits === 1 ? " time" : " times") + " today";
    
    if (visits % VISITED_NOTIF_INTERVAL === 0) {
      NotificationUtil.sendNotification(context, title, msg, notificationID.VISIT);
    }
  }
};



/*************************************
 *   UNLOCKS/GLANCES INTERVENTIONS   *
 *************************************/
var UNLOCKS_TOAST_INTERVAL = 10;
var GLANCES_TOAST_INTERVAL = 20;
var UNLOCKS_NOTIF_INTERVAL = 25;
var GLANCES_NOTIF_INTERVAL = 35;


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

  if (StorageUtil.canIntervene(StorageUtil.interventions.UNLOCK_NOTIFICATION)) {
    var unlocks = StorageUtil.getUnlocks();
    var title = 'Unlock Alert';
    var msg = "You've unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
    
    if (unlocks % UNLOCKS_NOTIF_INTERVAL === 0) {
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
    Toast.makeText("Today's Unlock Count: 7").show();
    return;
  }

  if (StorageUtil.canIntervene(StorageUtil.interventions.UNLOCK_TOAST)) {
    var unlocks = StorageUtil.getUnlocks();

    if (unlocks % UNLOCKS_TOAST_INTERVAL === 0) {
      Toast.makeText("Today's Unlock Count: " + unlocks).show();
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

  if (StorageUtil.canIntervene(StorageUtil.interventions.GLANCE_NOTIFICATION)) {
    var glances = StorageUtil.getGlances();
    var title = 'Glance Alert';
    var msg = "You've glanced at your phone " + glances + (glances === 1 ? ' time' : ' times') + ' today';

    if (glances % GLANCES_NOTIF_INTERVAL === 0) {
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
    Toast.makeText("Today's Glance Count: 7").show();
    return;
  }

  if (StorageUtil.canIntervene(StorageUtil.interventions.GLANCE_TOAST)) {
    var glances = StorageUtil.getGlances();

    if (glances % GLANCES_TOAST_INTERVAL === 0) {
      Toast.makeText("Today's Glance Count: " + glances).show();
    }
  }
};


/**************************************
 *    VISIT DURATION INTERVENTIONS    *
 **************************************/
var DURATION_TOAST_INTERVAL = 300000; // 5 minutes (in ms)
var DURATION_NOTIF_INTERVAL = 900000; // 15 minutes (in ms)

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
    Toast.makeText("You've been on Facebook for 5 minutes").show();
    return;
  }

  if (StorageUtil.canIntervene(StorageUtil.interventions.DURATION_TOAST, pkg)) {
    var now = System.currentTimeMillis();
    if ((now - visitStart) > DURATION_TOAST_INTERVAL && !sentToast) {
      var applicationName = UsageInformationUtil.getAppName(pkg);
      Toast.makeText("You've been on " + applicationName + " for 5 minutes").show();
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
    NotificationUtil.sentNotification(context, "Facebook Visit Length", "You've been using Facebook for 10 minutes", notificationID.GLANCE);
    return;
  }

  if (StorageUtil.canIntervene(StorageUtil.interventions.DURATION_NOTIFICATION, pkg)) {
    var now = System.currentTimeMillis();
    if ((now - visitStart) > DURATION_NOTIF_INTERVAL && !sentNotification) {
      var applicationName = UsageInformationUtil.getAppName(pkg);
      var title = applicationName + " Visit Length";
      var msg = "You've been using " + applicationName + " for 15 minutes";
      NotificationUtil.sendNotification(context, title, msg, notificationID.GLANCE);
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

  if (shouldBlockVideo && StorageUtil.canIntervene(StorageUtil.interventions.VIDEO_BLOCKER, pkg)) {
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
  var toHome = new Intent(Intent.ACTION_MAIN);
  toHome.addCategory(Intent.CATEGORY_HOME);
  foreground.startActivity(toHome); // THIS LINE IS BUGGY (when the app is killed, undefined foregroundActivity)
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
        DialogOverlay.showPosNegDialogOverlay(context, "Would you like to continue watching?", 
          "Yes", "No", stopVideoBlocking, exitToHome);
      }
    }
});



/**************************************
 *        OVERLAY INTERVENTION        *
 **************************************/
var FULL_SCREEN_OVERLAY_INTERVAL = ; // visits

var showFullScreenOverlay = function (real, pkg) {
  if (!real) {
    FullScreenOverlay.showOverlay(context, "Continue to Faceook?", 
      "You've already been here 25 times today. Want to take a break?", 
      "Continue", "get me out of here!", null, null);
    return;
  }
  
  if (StorageUtil.canIntervene(StorageUtil.interventions.FULL_SCREEN_OVERLAY, pkg)) {
    var visits = StorageUtil.getVisits(pkg);
    if (visits % FULL_SCREEN_OVERLAY_INTERVAL === 0) {
      var applicationName = UsageInformationUtil.getAppName(pkg);
      var title = "Continue to " + applicationName + "?";
      var msg = "You've already been here " + visits + " times today. Want to take a break?";
      FullScreenOverlay.showOverlay(context, title, msg, 
        "Continue", "get me out of here!", null, exitToHome);
    }
  }
}



module.exports = { 
  interventions: [
    null,
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
    showFullScreenOverlay
  ], 
  allowVideoBlocking,
  logVisitStart
};




