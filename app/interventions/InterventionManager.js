const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const Toast = require("nativescript-toast");

var application = require('application');

var id = {
  GLANCE: 1,
  UNLOCK: 2,
  VISIT: 3
};

var visitedToast = function(pkg) {
	var applicationName = UsageInformationUtil.getAppName(pkg);
	var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);
	Toast.makeText(applicationName + " visits today: " + visits).show();
};

var unlocksNotification = function() {
  var unlocks = StorageUtil.getUnlocks(StorageUtil.days.TODAY);
  var message = 'You\'ve unlocked your phone ' + unlocks + (unlocks === 1 ? ' time' : ' times') + ' today';

  NotificationUtil.sendNotification(application.android.context.getApplicationContext(), 'Unlock Alert!', message, id.UNLOCK);
};

var glancesNotification = function() {
  var glances = StorageUtil.getGlances(StorageUtil.days.TODAY);
  var message = 'You\'ve glanced at your phone ' + glances + (glances === 1 ? ' time' : ' times') + ' today';

  NotificationUtil.sendNotification(application.android.context.getApplicationContext(), 'Glance Alert!', message, id.GLANCE);
};







module.exports = {
	visitedToast: visitedToast,
  glancesNotification: glancesNotification,
  unlocksNotification: unlocksNotification
};