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

// global vars
var audioManager = context.getSystemService(Context.AUDIO_SERVICE);


var notificationID = {
  GLANCE: 1000,
  UNLOCK: 2000,
  VISIT: 3000
};

var popToastVisited = function(pkg) {
  if (StorageUtil.canIntervene(StorageUtil.interventions.VISIT_TOAST, pkg)) {
    var applicationName = UsageInformationUtil.getAppName(pkg);
    var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);

    if (visits % 3 === 0) {
      Toast.makeText(applicationName + " visits today: " + visits).show();
    }
  }
};

var sendNotificationVisited = function(pkg) {
  if (StorageUtil.canIntervene(StorageUtil.interventions.VISIT_NOTIFICATION, pkg)) {
    var applicationName = UsageInformationUtil.getAppName(pkg);
    var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);
    var title = applicationName + " Usage";
    var msg = "You have opened " + applicationName + " " + visits + (visits === 1 ? " time" : " times") + " today";
    
    if (visits % 5 === 0) {
      NotificationUtil.sendNotification(context, title, msg, notificationID.VISIT);
    }
  }
};

var unlocksNotification = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.UNLOCK_NOTIFICATION)) {
    var unlocks = StorageUtil.getUnlocks(StorageUtil.days.TODAY);
    var title = 'Unlock Alert!';
    var msg = "You've unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
    
    if (unlocks % 2 === 0) {
      NotificationUtil.sendNotification(context, title, msg, notificationID.UNLOCK);
    }
  }
};

var popToastUnlocked = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.UNLOCK_TOAST)) {
    var unlocks = StorageUtil.getUnlocks(StorageUtil.days.TODAY);
    Toast.makeText("Today's Unlock Count: " + unlocks).show();
  }
};

var glancesNotification = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.GLANCE_NOTIFICATION)) {
    var glances = StorageUtil.getGlances(StorageUtil.days.TODAY);
    var title = 'Glance Alert!';
    var msg = "You've glanced at your phone " + glances + (glances === 1 ? ' time' : ' times') + ' today';
    if (glances % 2 === 0) {
      NotificationUtil.sendNotification(context, title, msg, notificationID.GLANCE);
    }
  }
};

var popToastGlanced = function() {
  if (StorageUtil.canIntervene(StorageUtil.interventions.GLANCE_TOAST)) {
    var glances = StorageUtil.getGlances(StorageUtil.days.TODAY);
    if (glances % 2 === 1) {
      Toast.makeText("Today's Glance Count: " + glances).show();
    }
  }
};


var blockMedia = true;

var setBlockMedia = function(bool) {
  blockMedia = bool;
}

var blockAllSoundMedia = function () {
  if (blockMedia) {
    audioManager.requestAudioFocus(audioFocusListener, AudioManager.STREAM_SYSTEM, AudioManager.AUDIOFOCUS_GAIN);
  }
}

var positiveCallback = function () {
  setBlockMedia(false);
};

var negativeCallback = function () {
  var toHome = new Intent(Intent.ACTION_MAIN);
  toHome.addCategory(Intent.CATEGORY_HOME);

  var foregroundActivity = application.android.foregroundActivity;
  foregroundActivity.startActivity(toHome); 
};

var audioFocusListener = new android.media.AudioManager.OnAudioFocusChangeListener({
    onAudioFocusChange: function (change) {
      if (blockMedia && change === AudioManager.AUDIOFOCUS_LOSS) {
        DialogOverlay.showPosNegDialogOverlay(context, "Would you like to continue watching?", 
          "Yes", "No", positiveCallback, negativeCallback);
        // NotificationUtil.sendNotificationWithOptions(context, "Media Intervention", "Would you like to continue watching this video?", 7777);
      }
    }
});





module.exports = { 
  interventions: [
    popToastGlanced,
    glancesNotification,
    popToastUnlocked,
    unlocksNotification,
    null,
    null,
    null,
    null,
    popToastVisited,
    sendNotificationVisited
  ], 
  blockAllSoundMedia,
  setBlockMedia
};




