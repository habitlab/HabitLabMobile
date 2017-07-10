var application = require("application");
var imageSource = require("image-source");

// expose native APIs 
var Intent = android.content.Intent;
var Calendar = java.util.Calendar;
var System = java.lang.System;
var Context = android.content.Context;
var PackageManager = android.content.pm.PackageManager;

// contexts
var context = application.android.context.getApplicationContext();
var foregroundActivity = application.android.foregroundActivity;

// global information
var pm = context.getPackageManager();	
var mainIntent = new Intent(Intent.ACTION_MAIN, null);
mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
var applications = pm.queryIntentActivities(mainIntent, 0);


/* getTimeOnAppThisWeek
 * --------------------
 * Returns array of time (in ms since epoch) that the provided 
 * application has been active over the last 7 days (including 
 * today). Format:
 * 
 *     [7daysAgo, 6daysAgo, 5daysAgo, ..., today]
 *  
 * Populates index with  -1 if there is no usage information 
 * found for that day.
 */
function getTimeOnAppThisWeek(packageName) {
	var weeklyUsageStatistics = [];

	for (var i = 6; i >= 0; i--) {
		weeklyUsageStatistics.push(getTimeOnApplicationSingleDay(packageName, i));
	}
	return weeklyUsageStatistics;
}



/* getTimeOnApplicationSingleDay
 * -----------------------------
 * Returns time (in ms since epoch) that the provided application
 * has been active. Returns -1 if there is no usage information
 * found.
 */
function getTimeOnApplicationSingleDay(packageName, daysAgo) {
	var startOfTarget = Calendar.getInstance();
	startOfTarget.set(Calendar.HOUR_OF_DAY, 0);
	startOfTarget.set(Calendar.MINUTE, 0);
	startOfTarget.set(Calendar.SECOND, 0);
	startOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() - (86400 * 1000 * daysAgo));

	var endOfTarget = Calendar.getInstance();
	endOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() + (86400 * 1000));
	

	var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
    var usageStatsMap  = usageStatsManager.queryAndAggregateUsageStats(startOfTarget.getTimeInMillis(), endOfTarget.getTimeInMillis());

    var stats = usageStatsMap.get(packageName);
    return stats === null ? -1 : stats.getTotalTimeInForeground();
}


/* getTimeOnPhoneSingleDay
 * -----------------------
 * Returns time (in minutes since epoch) that the phone
 * has been active.
 */
function getTimeOnPhoneSingleDay(daysAgo) {
	var startOfTarget = Calendar.getInstance();
	startOfTarget.set(Calendar.HOUR_OF_DAY, 0);
	startOfTarget.set(Calendar.MINUTE, 0);
	startOfTarget.set(Calendar.SECOND, 0);
	startOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() - (86400 * 1000 * daysAgo));

	var endOfTarget = Calendar.getInstance();
	endOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() + (86400 * 1000));
	

	var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
    var usageStatsMap  = usageStatsManager.queryAndAggregateUsageStats(startOfTarget.getTimeInMillis(), endOfTarget.getTimeInMillis());

    var totalTimeOnPhone = 0;
    //Calculate sum of all time spent on apps in a single day
    var list = [];
	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		// get package name
		var packageName = getPackageName(info);
		//Time on one app
		var appUsageStats = usageStatsMap.get(packageName);
		var	appUsage = appUsageStats ? appUsageStats.getTotalTimeInForeground() : 0;

		totalTimeOnPhone += appUsage;
	}
	totalTimeOnPhone = Math.round(totalTimeOnPhone/60000);
    return totalTimeOnPhone;
}


/* getTimeOnPhoneThisWeek
 * ----------------------
 * Returns array of time (in ms since epoch) that the 
 * phone has been active over the last 7 days (including 
 * today). Format:
 * 
 *     [7daysAgo, 6daysAgo, 5daysAgo, ..., today]
 *  
 * Populates index with  -1 if there is no usage information 
 * found for that day.
 */
function getTimeOnPhoneThisWeek() {
	var weeklyUsageStatistics = [];
	for (var i = 6; i >= 0; i--) {
		weeklyUsageStatistics.push(getTimeOnPhoneSingleDay(i));
	}

	return weeklyUsageStatistics;
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
function getApplicationList() {
 	// 4 weeks ago
 	var startOfTarget = Calendar.getInstance();
	startOfTarget.set(Calendar.HOUR_OF_DAY, 0);
	startOfTarget.set(Calendar.MINUTE, 0);
	startOfTarget.set(Calendar.SECOND, 0);
	startOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() - (86400 * 1000 * 27));

 	var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
    var usageStatsMap  = usageStatsManager.queryAndAggregateUsageStats(startOfTarget.getTimeInMillis(), System.currentTimeMillis());

    // construct list
	var list = [];
	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		var packageName = getPackageName(info);
		var label = info.loadLabel(pm).toString();
		var iconSource = imageSource.fromNativeSource(info.loadIcon(pm).getBitmap());
		var averageUsage = getAverageUsage(usageStatsMap, packageName, getInstallationTime(packageName));

		// construct object
		var applicationObj = {
			packageName: packageName,
			label: label, 
			iconSource: iconSource, 
			averageUsage: averageUsage
		};

		list.push(applicationObj);
	}

	return list;
}


/*
 * getAppName
 * --------------
 * Returns the application name of the passed-in packageName.
 * Returns "(unknown)" if there is no packageName.
 */
function getAppName(packageName) {
	var info = null;
	try {
		info = pm.getApplicationInfo(packageName, 0);
	} catch (err) {
		info = null;
	}
	var appName = (info != null ? pm.getApplicationLabel(info) : "(unknown)");
	return appName;
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
 * getAverageUsage
 * ---------------
 * Takes in a UsageStats map, a packageName, and the installation
 * time of the provided package and returns the amount of time (on
 * average) the package is used. Averages over last 4 weeks, or since 
 * installation time if the package was installed less than 4 weeks ago/
 */
function getAverageUsage(map, pkg, installTime) {
    var stats = map.get(pkg);
    if (stats) {
    	var days;
    	if (stats.getFirstTimeStamp() < installTime) {
    		days = Math.ceil((System.currentTimeMillis() - installTime) * 1000 * 60 * 60 * 24);
    	} else {
    		days = 28;
    	} 
    	return stats.getTotalTimeInForeground() / days;
    } else {
    	return null;
    }

    var averages = [];

    for (var i = 0; i < packageNames.length; i++) {
    	var name = packageNames[i];
    	var stats = usageStatsMap.get(name);
    	if (stats) {
    		averages.push(stats.getTotalTimeInForeground() / 28);
    	} else {
    		averages.push(-1);
    	}
    }

    return averages;
}



module.exports = {getApplicationList: getApplicationList, 
	getTimeOnApplicationSingleDay: getTimeOnApplicationSingleDay, 
	getTimeOnPhoneThisWeek : getTimeOnPhoneThisWeek, 
	getTimeOnPhoneSingleDay : getTimeOnPhoneSingleDay, 
	getTimeOnAppThisWeek : getTimeOnAppThisWeek,
	getAppName : getAppName};



