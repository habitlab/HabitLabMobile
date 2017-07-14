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
//const DAY_MS = 86400000;





// ------------------------APP USAGE--------------------------------------------



/* getTimeOnApplicationSingleDay
 * -----------------------------
 * Returns time (in minutes since epoch) that the provided application
 * has been active. Returns -1 if there is no usage information
 * found. Will only return day-specific data for 7 days
 */
function getTimeOnApplicationSingleDay(packageName, daysAgo) {
	var startOfTarget = getStartOfDay(daysAgo);
	var endOfTarget = Calendar.getInstance();
	endOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() + (86400 * 1000));

	var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
    var usageStatsMap  = usageStatsManager.queryAndAggregateUsageStats(startOfTarget.getTimeInMillis(), endOfTarget.getTimeInMillis());

    var stats = usageStatsMap.get(packageName);
    return stats === null ? -1 : Math.round(stats.getTotalTimeInForeground()/60000);
}




/* getTimeOnAppWeek
 * --------------------
 * Returns array of time (in minutes since epoch) that the provided 
 * application has been active over the last 7 days (including 
 * today). Format:
 * 
 *     [7daysAgo, 6daysAgo, 5daysAgo, ..., today]
 *  
 * Populates index with  -1 if there is no usage information 
 * found for that day. Used in month view and week view. Will
 * only record data for the last week
 */
function getTimeOnAppThisWeek(packageName) {
	var weeklyUsageStatistics = [];
	for (var i = 6; i >= 0; i--) {
		weeklyUsageStatistics.push(getTimeOnApplicationSingleDay(packageName, i));
	}
	return weeklyUsageStatistics;
}

/* getAvgTimeOnAppWeek
 * --------------------
 * Returns array of time (in minutes since epoch) that the provided 
 * application has been active over the last 7 days (including 
 * today). Format:
 * 
 *     [7daysAgo, 6daysAgo, 5daysAgo, ..., today]
 *  
 * Populates index with  -1 if there is no usage information 
 * found for that day. Used in month view and week view. Will
 * only record data for the last week
 */
function getAvgTimeOnAppThisWeek(packageName) {
	var sum = 0;
	var week = getTimeOnAppThisWeek(packageName)
	for (var i = 0; i < week.length; i++) {
		sum += week[i]
	}
	var avg = Math.round(sum/7);
	return avg;
}



/* getTimeOnAppThisWeek
 * --------------------
 * Returns the total time spent on an app in a week. 
 * For a time length greater than a week ago, each 
 * day returns the total time for a week
 */
function getTotalTimeOnAppWeek(packageName, weeksAgo) {
	
	if (weeksAgo == 0) {
		var week = getTimeOnAppWeek(packageName);
		var sum = 0;
		for (var i = 0; i < week.length; i++) {
			sum += week[i];
		}
		return Math.round(sum);
	} else {
		return getTimeOnApplicationSingleDay(packageName, 3+7*weeksAgo);
	}
}


/* getAvgTimesOnAppMonth
 * -----------------------------
 * Returns an array of the total times that an app is used per week 
 * for a month.
 * e.g. 
 * [3 weeks ago, 2 weeks ago, 1 week ago, 0 weeks ago]
 */
function getTimeOnAppMonth(packageName) {
	var appMonth = [];
	for (var i = 3; i <= 0; i--) {
		appMonth.push(getTotalTimeOnAppWeek(packageName, i));
	}
	return appMonth;
}




// ------------------------PHONE USAGE--------------------------------------------



/* getAppsSingleDay
 * -----------------------
 * Returns the apps used in a single day. Specifically returns an array of objects, 
 * where each object is the name of the app and the number of minutes spent on the app today.
 */

function getAppsSingleDay(daysAgo) {
	var start = getStartOfDay(daysAgo);
	var end = Calendar.getInstance();
	end.setTimeInMillis(start.getTimeInMillis() + (86400 * 1000));
	
	var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
    var usageStatsMap  = usageStatsManager.queryAndAggregateUsageStats(start.getTimeInMillis(), end.getTimeInMillis());
    var list = [];

    for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		var packageName = getPackageName(info); 
		var appUsageStats = usageStatsMap.get(packageName);
		var	appUsage = appUsageStats ? appUsageStats.getTotalTimeInForeground() : 0;
		if (appUsage == 0) continue;

		var name = info.loadLabel(pm).toString();
		if (name === "HabitLabMobile") continue; 
		var mins = Math.round(appUsage/60000);
		var app = new dayApp(name, mins);
		list.push(app);
	}

	return list;
	
};


//Data structure for getAppsSingleDay
function dayApp(name, mins) {
	this.name = name;
	this.mins = mins;
}



/* getTimeOnPhoneSingleDay
 * -----------------------
 * Returns time (in minutes since epoch) that the phone
 * has been active by summing the time on all apps today.
 * daysAgo must be less than 7
 */
function getTimeOnPhoneSingleDay(daysAgo) {
	var totalTimeOnPhone = 0;
	var appsDay = getAppsSingleDay(daysAgo);
	for(var i = 0; i < appsDay.length; i++) {
		totalTimeOnPhone += appsDay[i].mins
	}
    return totalTimeOnPhone;
}





/* getTimeOnPhoneThisWeek
 * ----------------------
 * Returns array of time (in minutes since epoch) that the 
 * phone has been active over the last specified week (including 
 * today). Format:
 * 
 *     [7daysAgo, 6daysAgo, 5daysAgo, ..., today]
 *  
 * Populates index with  -1 if there is no usage information 
 * found for that day.
*/

function getAvgTimeOnPhoneThisWeek() {
	var sum = 0;
	for (var i = (6); i >= 0; i--) {
		sum += getTimeOnPhoneSingleDay(i);
	}
	var avg = Math.round(sum/7);
	return avg;
}



/* getAvgTimeOnPhoneWeek
 * ----------------------
 * Returns the average amount of time spent on phone this week (in the last 7 days).
 * 
 */

// function getTotalTimeOnPhoneWeek(weeksAgo) {
	
// }





/* getAvgTimeOnPhoneThisMonth
 * ----------------------
 * Returns array of average time per week (in minutes since epoch) that the 
 * phone has been active over the last month (including 
 * today). Format:
 * 
 *     [3 weeks ago, 2 weeks ago, 1 weeks ago, 0 week ago]
 *  
 * Populates index with  -1 if there is no usage information 
 * found for that day.
 */

// function getAvgTimeOnPhoneThisMonth() {
// 	var monthlyUsage = [];
// 	var week3 = getTimeOnPhoneSingleDay(17)/7;
// 	var week3 = getTimeOnPhoneSingleDay(17)/7;
// 	var week4 = getTimeOnPhoneSingleDay(24)/7;
// 	monthlyUsage.push(week4);
// 	monthlyUsage.push(week3);
// 	for (var i = 1; i >= 0; i--) {
// 		monthlyUsage.push(getAvgTimeOnPhoneWeek(i));
// 	}
// 	return monthlyUsage;
// }








// ------------------------GET FUNCTIONS------------------------------------------------




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
	var startOfTarget = getStartOfDay(27);

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
};


/*
 * getAppName
 * --------------
 * Returns the application name of the passed-in packageName.
 * Returns "(unknown)" if there is no packageName.
 */
function getAppName(packageName) {
	info = getInfo(packageName);
	var appName = (info != null ? pm.getApplicationLabel(info) : "(unknown)");
	return appName;
}


/*
 * getInfo
 * --------------
 * Returns the icon source when given a packageName. 
 * If no icon available, returns null.
 */

function getIcon(packageName) {
	info = getInfo(packageName);
	var iconSource = (info != null ? imageSource.fromNativeSource(info.loadIcon(pm).getBitmap()) : "~/logo.png");
	return iconSource;
}


/*
 * getInfo
 * --------------
 * Helper function that returns the resolveInfo when given a package name. 
 * If no info available, returns null.
 */

function getInfo(packageName) {
	var info = null;
	try {
		info = pm.getApplicationInfo(packageName, 0);
	} catch (err) {
		info = null;
	}
	return info;
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


/* getTimeOnPhoneSingleDay
 * -----------------------
 * Helper function, returns a calendar object of the start of a day,
 * provided with the number of days ago 
 */
function getStartOfDay(daysAgo) {
	var startOfTarget = Calendar.getInstance();
	startOfTarget.set(Calendar.HOUR_OF_DAY, 0);
	startOfTarget.set(Calendar.MINUTE, 0);
	startOfTarget.set(Calendar.SECOND, 0);
	startOfTarget.setTimeInMillis(startOfTarget.getTimeInMillis() - (86400 * 1000 * daysAgo));
	return startOfTarget;
};




module.exports = {getApplicationList: getApplicationList, 
	getTimeOnApplicationSingleDay: getTimeOnApplicationSingleDay, 
	getTimeOnAppThisWeek : getTimeOnAppThisWeek, 
	getTotalTimeOnAppWeek : getTotalTimeOnAppWeek, 
	getAvgTimeOnAppThisWeek : getAvgTimeOnAppThisWeek,
	getTimeOnAppMonth : getTimeOnAppMonth,
	getAppsSingleDay : getAppsSingleDay,
	getTimeOnPhoneSingleDay : getTimeOnPhoneSingleDay, 
	getAvgTimeOnPhoneThisWeek : getAvgTimeOnPhoneThisWeek, 
	getAppName : getAppName,
	getIcon : getIcon};



