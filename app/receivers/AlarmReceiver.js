var application  = require("application");
var context = application.android.context.getApplicationContext();

const Context = android.content.Context;
const Intent = android.content.Intent;
const InterventionManager = require("~/interventions/InterventionManager");

android.content.BroadcastReceiver.extend("com.habitlab.AlarmReceiver", {
	onReceive: function(context, intent) {
		console.warn("HERE");
		
		// TODO: Whatever needs to be done at midnight

	}
});