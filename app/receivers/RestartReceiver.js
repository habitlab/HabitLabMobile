const application = require("application");
const Intent = android.content.Intent;

android.content.BroadcastReceiver.extend("com.habitlab.RestartReceiver", {
	onReceive: function(context, intent) {
		var action = intent.getAction();
		if (action === Intent.ACTION_BOOT_COMPLETED) {
			// do stuff on phone reboot
	
		} else if (action === Intent.ACTION_SHUTDOWN) {
			// do stuff on phone shutdown
		}
	}
});