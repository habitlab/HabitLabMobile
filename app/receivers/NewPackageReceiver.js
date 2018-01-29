var application  = require("application");
var context = application.android.context.getApplicationContext();
var UsageUtil = require('~/util/UsageInformationUtil');
var StorageUtil = require('~/util/StorageUtil');

const Context = android.content.Context;
const Intent = android.content.Intent;
const InterventionManager = require("~/interventions/InterventionManager");

android.content.BroadcastReceiver.extend("com.habitlab.NewPackageReceiver", {
	onReceive: function(context, intent) {	
		var action = intent.getAction();
    var pkg = intent.getData().getSchemeSpecificPart();

    // reset application list
    UsageUtil.refreshApplicationList();

		if (action === Intent.ACTION_PACKAGE_ADDED) {
      // package was added or updated

		} else if (action === Intent.ACTION_PACKAGE_REMOVED) {
      // package was removed
      StorageUtil.removePackage(pkg);
    }
	}
});