var usageUtil = require('~/util/UsageInformationUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');

// native APIs
var Calendar = java.util.Calendar;

exports.pageLoaded = function (args) {
	if (!permissionUtil.checkActionUsagePermission()) {
		permissionUtil.lauchActionUsageIntent();
	}

	var list = usageUtil.getApplicationList();

	for (var i = 0; i < list.length; i++) {
		var app = list[i];

		var installDate = Calendar.getInstance();
		installDate.setTimeInMillis(app.installationTime);

		console.log(app.label, "INSTALLED: ", (installDate.get(Calendar.MONTH) + 1) + "/" + installDate.get(Calendar.DAY_OF_MONTH) + "/" + installDate.get(Calendar.YEAR));
	}


}

