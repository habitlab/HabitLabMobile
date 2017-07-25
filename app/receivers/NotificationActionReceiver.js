var application  = require("application");
var context = application.android.context.getApplicationContext();

const Context = android.content.Context;
const Intent = android.content.Intent;
const InterventionManager = require("~/interventions/InterventionManager");

android.content.BroadcastReceiver.extend("com.habitlab.NotificationActionReceiver", {
	onReceive: function(context, intent) {	
		var action = intent.getAction();
		var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);

		if (action === "action.habitlab.NotificationPositive") {
			InterventionManager.setBlockMedia(false);
			notificationManager.cancel(7777);
		} else if (action === "action.habitlab.NotificationNegative") {
			notificationManager.cancel(7777);
			var toHome = new Intent(Intent.ACTION_MAIN);
	        toHome.addCategory(Intent.CATEGORY_HOME);

	        var foregroundActivity = application.android.foregroundActivity;
			foregroundActivity.startActivity(toHome);	
		}
	}
});