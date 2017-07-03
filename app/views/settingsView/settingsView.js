var usageUtil = require('~/util/UsageInformationUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');

exports.pageLoaded = function (args) {
	if (!permissionUtil.checkActionUsagePermission()) {
		permissionUtil.lauchActionUsageIntent();
	}

	var list = usageUtil.getApplicationList();

	for (var i = 0; i < list.length; i++) {
		var app = list[i];

		console.log(app.label, app.maxUsage, app.todayUsage, app.lastActivated);
	}


}

