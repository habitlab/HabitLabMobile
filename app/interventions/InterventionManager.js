const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const DialogOverlay = require("~/overlays/DialogOverlay");
const Toast = require("nativescript-toast");

var application = require('application');
var context = application.android.context.getApplicationContext();

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
var popToastVisited = function(pkg) {
  if (StorageUtil.canIntervene(StorageUtil.interventions.VISIT_TOAST, pkg)) {
    var applicationName = UsageInformationUtil.getAppName(pkg);
    var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);

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
var sendNotificationVisited = function(pkg) {
  if (StorageUtil.canIntervene(StorageUtil.interventions.VISIT_NOTIFICATION, pkg)) {
    var applicationName = UsageInformationUtil.getAppName(pkg);
    var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);
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
var GLANCES_NOTIF_INTERVAL = 30;


/**
 * sendUnlocksNotification
 * -----------------------
 * Displays a notification after UNLOCKS_NOTIF_INTERVAL device unlocks.
 */
var sendUnlocksNotification = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.UNLOCK_NOTIFICATION)) {
    var unlocks = StorageUtil.getUnlocks(StorageUtil.days.TODAY);
    var title = 'Unlock Alert!';
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
var popToastUnlocked = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.UNLOCK_TOAST)) {
    var unlocks = StorageUtil.getUnlocks(StorageUtil.days.TODAY);

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
var sendNotificationGlances = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.GLANCE_NOTIFICATION)) {
    var glances = StorageUtil.getGlances(StorageUtil.days.TODAY);
    var title = 'Glance Alert!';
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
var popToastGlanced = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.GLANCE_TOAST)) {
    var glances = StorageUtil.getGlances(StorageUtil.days.TODAY);

    if (glances % GLANCES_TOAST_INTERVAL === 0) {
      Toast.makeText("Today's Glance Count: " + glances).show();
    }
  }
};


/**************************************
 *    VISIT DURATION INTERVENTIONS    *
 **************************************/
var DURATION_TOAST_INTERVAL = 300000; // in ms
var DURATION_NOTIF_INTERVAL = 600000; // in ms

// logging vars
var openTime = 0;
var sentToast = false;
var sentNotification = false;


/**
 * logOpenTime
 * -----------
 * Takes note of the time a given application is opened and 
 * resets necessary logging variables.
 */
var logOpenTime = function() {
  openTime = System.currentTimeMillis();
  sentToast = false;
  sendNotification = false;
};


/**
 * popToastVisitLength
 * -------------------
 * Displays a toast after DURATION_TOAST_INTERVAL ms on the 
 * specified package.
 */
var popToastVisitLength = function (pkg) {
  if (StorageUtil.canIntervene(StorageUtil.interventions.DURATION_TOAST, pkg)) {
    var now = System.currentTimeMillis();
    if ((now - openTime) > DURATION_TOAST_INTERVAL && !sentToast) {
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
var sendNotificationVisitLength = function (pkg) {
  if (StorageUtil.canIntervene(StorageUtil.interventions.DURATION_NOTIFICATION, pkg)) {
    var now = System.currentTimeMillis();
    if ((now - openTime) > DURATION_NOTIF_INTERVAL && !sentNotification) {
      var applicationName = UsageInformationUtil.getAppName(pkg);
      var title = applicationName + " Visit Length";
      var msg = "You've been using " + applicationName + " for 10 minutes";
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
var allowVideoBlocking = function(bool) {
  shouldBlockVideo = bool;
};


/**
 * blockVideo
 * ----------
 * Blocks all videos from the current package by constantly 
 * requesting audio focus.
 */
var blockVideo = function () {
  if (shouldBlockVideo) {
    audioManager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_SYSTEM, AudioManager.AUDIOFOCUS_GAIN);
  }
};


// callback function for audioFocusListener
var positiveCallback = function () {
  allowVideoBlocking(false);
};

// callback function for audioFocusListener
var negativeCallback = function () {
  var toHome = new Intent(Intent.ACTION_MAIN);
  toHome.addCategory(Intent.CATEGORY_HOME);

  var foregroundActivity = application.android.foregroundActivity;
  foregroundActivity.startActivity(toHome); 
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
          "Yes", "No", positiveCallback, negativeCallback);
      }
    }
});



module.exports = { 
  interventions: [
    popToastGlanced,
    sendNotificationGlances,
    popToastUnlocked,
    sendUnlocksNotification,
    null,
    null,
    popToastVisitLength,
    sendNotificationVisitLength,
    popToastVisited,
    sendNotificationVisited,
    blockVideo
  ], 
  allowVideoBlocking,
  logOpenTime
};




