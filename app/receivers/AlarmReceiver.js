var application  = require("application");
var context = application.android.context.getApplicationContext();
var NotificationUtil = require("~/util/NotificationUtil");
var StorageUtil = require('~/util/StorageUtil');
var AccessibilityService = require("~/services/AccessibilityService");

const Context = android.content.Context;
const Intent = android.content.Intent;
const InterventionManager = require("~/interventions/InterventionManager");

android.content.BroadcastReceiver.extend("com.habitlab.AlarmReceiver", {
	onReceive: function(context, intent) {
		NotificationUtil.sendNotification(context, "HabitLab", "Daily Midnight Notification", 12936273);
		AccessibilityService.markMidnight();
	}
});