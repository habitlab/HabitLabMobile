var application  = require("application");
var context = application.android.context.getApplicationContext();
var NotificationUtil = require("~/util/NotificationUtil");

const Context = android.content.Context;
const Intent = android.content.Intent;
const InterventionManager = require("~/interventions/InterventionManager");

android.content.BroadcastReceiver.extend("com.habitlab.AlarmReceiver", {
	onReceive: function(context, intent) {
		NotificationUtil.sendNotification(context, "HabitLab", "Daily Midnight Notification", 98765);
		// TODO: Whatever needs to be done at midnight
	}
});