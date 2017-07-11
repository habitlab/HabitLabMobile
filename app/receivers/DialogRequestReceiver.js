var application  = require("application");
var NotificationUtil = require("~/util/NotificationUtil");

android.content.BroadcastReceiver.extend("com.habitlab.DialogRequestReceiver", {
	onReceive: function(context, intent) {
		// if (!TrackingService.isServiceRunning()) {
		// 	context.startService(trackingServiceIntent);
		// }

		// if (!UnlockService.isServiceRunning()) {
		// 	context.StartService(unlockServiceIntent);
		// }

		NotificationUtil.sendNotification(context, "HabitLab", "Restarted Services", 23456);
	}
});