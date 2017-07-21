var application  = require("application");
var context = application.android.context.getApplicationContext();

const Context = android.content.Context;
const Intent = android.content.Intent;
const InterventionManager = require("~/interventions/InterventionManager");

android.content.BroadcastReceiver.extend("com.habitlab.NewPackageReceiver", {
	onReceive: function(context, intent) {	
		var action = intent.getAction();

		if (action === Intent.ACTION_PACKAGE_ADDED || action === Intent.ACTION_PACKAGE_REMOVED) {
			// reset application list 
			
		} 	
	}
});