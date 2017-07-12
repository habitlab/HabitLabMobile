android.content.BroadcastReceiver.extend("com.habitlab.ServiceRestarterReceiver", {
	onReceive: function(context, intent) {
		var action = intent.getAction();

		if (action === "action.string.APPLICATION_KILLED") {
			console.log("Hello!");
		}
	}
});