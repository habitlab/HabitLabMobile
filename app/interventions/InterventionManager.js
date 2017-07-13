const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const Toast = require("nativescript-toast");

var application = require('application');
var context = application.android.context.getApplicationContext();

var notificationID = {
  GLANCE: 1000,
  UNLOCK: 2000,
  VISIT: 3000
};

var popToastVisited = function(pkg) {
	var applicationName = UsageInformationUtil.getAppName(pkg);
	var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);
	Toast.makeText(applicationName + " visits today: " + visits).show();
};

var sendNotificationVisited = function(pkg) {
  var applicationName = UsageInformationUtil.getAppName(pkg);
  var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);
  var title = applicationName + " Usage";
  var msg = "You have opened " + applicationName + (visits === 1 ? " time" : " times") + " today";
  NotificationUtil.sendNotification(context, title, msg, notificationID.VISIT);
}

var unlocksNotification = function() {
  var unlocks = StorageUtil.getUnlocks(StorageUtil.days.TODAY);
  var title = 'Unlock Alert!';
  var msg = "You've unlocked your phone " + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';
  NotificationUtil.sendNotification(context, title, msg, notificationID.UNLOCK);
};

var glancesNotification = function() {
  var glances = StorageUtil.getGlances(StorageUtil.days.TODAY);
  var title = 'Glance Alert!';
  var msg = "You've glanced at your phone " + glances + (glances === 1 ? ' time' : ' times') + ' today';
  NotificationUtil.sendNotification(context, title, msg, notificationID.GLANCE);
};




module.exports = {
	popToastVisited: popToastVisited,
  sendNotificationVisited: sendNotificationVisited,
  glancesNotification: glancesNotification,
  unlocksNotification: unlocksNotification
};




