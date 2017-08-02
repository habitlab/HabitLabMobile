var application = require("application");
var imageSource = require("image-source");

// global vars 
const DAY_MS = 86400000;
var context = application.android.context;
var usageStatsManager = context.getSystemService(android.content.Context.USAGE_STATS_SERVICE);


/****** LIST OF ALL LAUNCHABLE APPLICATIONS *****/
var pm = context.getPackageManager();	
var mainIntent = new android.content.Intent(android.content.Intent.ACTION_MAIN, null);
mainIntent.addCategory(android.content.Intent.CATEGORY_LAUNCHER);
var applications = pm.queryIntentActivities(mainIntent, 0);


/* refreshApplicationList
 * ----------------------
 * Repopulates applications global variable with an updated list of
 * installed applications (in the event a new application is installed).
 */
exports.refreshApplicationList = function() {
	applications = pm.queryIntentActivities(mainIntent, 0);
}


/* getApplicationList
 * ------------------
 * Returns list of objects containing following fields: 
 * 
 *     packageName: package name,
 *     label: application label,
 *     iconSource: icon bitmap that can be assigned to <Image> src field,
 *     averageUsage: average usage over last 4 weeks or since installation,
 *     
 * for every application in the system.
 */
exports.getApplicationList = function() {
 	// 4 weeks ago
	var startOfTarget = getStartOfDay(14);
    var usageStatsMap  = usageStatsManager.queryAndAggregateUsageStats(startOfTarget.getTimeInMillis(), 
    	java.lang.System.currentTimeMillis());

    // construct list
	var list = [];
	var earliestTimeStamp;
	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		var packageName = getPackageName(info);
		
		// filter out habitlab and duplicates
		if (packageName === "org.nativescript.HabitLabMobile") { continue };
		
		var label = info.loadLabel(pm).toString();
		if (label === "Voice Search") { continue; }
		
		var iconSource = imageSource.fromNativeSource(info.loadIcon(pm).getBitmap());
		var time = 0;

		var stats = usageStatsMap.get(packageName);
		if (stats) {
			time = stats.getTotalTimeInForeground() / (60000);
			var firstTimeStamp = stats.getFirstTimeStamp();
			if (!earliestTimeStamp || firstTimeStamp < earliestTimeStamp) {
				earliestTimeStamp = firstTimeStamp; // save the earliest time stamp
			}
		}
		
		// construct object
		var applicationObj = {
			packageName: packageName,
			label: label, 
			iconSource: iconSource, 
			averageUsage: time
		};

		list.push(applicationObj);
	}

	var daysBetween = (java.lang.System.currentTimeMillis() - earliestTimeStamp) / DAY_MS;
	console.warn(daysBetween);

	for (var z = 0; z < list.length; z++) {
		var obj = list[z];
		obj.averageUsage = obj.averageUsage / daysBetween;
	}

	return list;
};


/*
 * getBasicInfo
 * ------------
 * Returns the application name and icon of the specified 
 * packageName. Returns null if no such package exists.
 */
exports.getBasicInfo = function(packageName) {
	var appInfo;
	try {
		appInfo = pm.getApplicationInfo(packageName, 0);
	} catch (e) {
		appInfo = null;
	}

	if (appInfo) {
		var applicationName = pm.getApplicationLabel(appInfo);
  		var iconSource = imageSource.fromNativeSource(appInfo.loadIcon(pm).getBitmap());
  		return {
  			name: applicationName,
  			icon: iconSource
  		};
	} else {
		return {
			name: "(placeholder)",
			icon: "res://ic_habitlab_logo"
		};
	}
}


/*
 * getInstalledPresets
 * -------------------
 * Returns list of presets that are installed on the
 * device (returns empty array if none of the presets
 * are installed).
 */
exports.getInstalledPresets = function() {
	var presets = ["com.facebook.katana", "com.google.android.youtube", "com.facebook.orca", 
		"com.snapchat.android", "com.instagram.android"];
	var installedPresets = [];

	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		var packageName = getPackageName(info);
		if (presets.includes(packageName)) {
			installedPresets.push(packageName);
		}
	}

	return installedPresets;
}


/*
 * getPackageName
 * --------------
 * Returns the package name of the passed-in ResolveInfo
 * object. Returns null if there is no packageName.
 */
 function getPackageName(info) {
	if (info.activityInfo) {
		return info.activityInfo.packageName;
	} else if (info.serviceInfo) {
		return info.serviceInfo.packageName;
	} else if (info.providerInfo) {
		return info.providerInfo.packageName;
	} else {
		return null;
	}
}

/*
 * getInstallationTime
 * -------------------
 * Returns the first install date of the passed-in
 * package.
 */
 function getInstallationTime(packageName) {
	try {
        return pm.getPackageInfo(packageName, 0).firstInstallTime;
    } catch (error) {
        return null;
    }
 }


/*
 * getStartOfDay
 * -------------
 * Returns Calendar object set to 12:00:00 AM of the 
 * day that occurred the specified number of daysAgo
 */
function getStartOfDay(daysAgo) {
	var startOfTarget = java.util.Calendar.getInstance();
	startOfTarget.set(java.util.Calendar.HOUR_OF_DAY, 0);
	startOfTarget.set(java.util.Calendar.MINUTE, 0);
	startOfTarget.set(java.util.Calendar.SECOND, 0);
	startOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() - (86400 * 1000 * daysAgo));
	return startOfTarget;
};


