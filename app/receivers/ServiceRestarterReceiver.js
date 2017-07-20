const NotificationUtil = require("~/util/NotificationUtil");
const TrackingService = require("~/services/TrackingService");

var Intent = android.content.Intent;

android.content.BroadcastReceiver.extend("com.habitlab.ServiceRestarterReceiver", {
	onReceive: function(context, intent) {
		var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
		var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);

		var action = intent.getAction();
		if (action === Intent.ACTION_BOOT_COMPLETED) {
			// on phone reboot
			context.startService(trackingServiceIntent);
			context.startService(unlockServiceIntent);
		} else if (action === Intent.ACTION_SHUTDOWN) {
			// on phone shutdown
			context.stopService(trackingServiceIntent);
			context.stopService(unlockServiceIntent);
		}
	}
});