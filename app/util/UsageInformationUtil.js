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


// Returns an array of the amount of time spent (minutes) on a particular app this week
// i.e. getTimeonApp(facebookPackageName, 07052017, 3) 

function getTimeOnAppThisWeek(packageName) {

	var today = Calendar.getInstance();
	var firstDayOfWeek = Calendar.set(Calendar.DAY, today.firstDayOfWeek)
	// 	set(int year, int month, int date, int hourOfDay, int minute)
	

}



/* getTimeOnApplicationSingleDay
 * -----------------------------
 * Returns time (in ms since epoch) that the provided application
 * has been active. Returns -1 if there is no usage information
 * found.
 */
function getTimeOnApplicationSingleDay (packageName, daysAgo) {
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



/* getApplicationList
 * ------------------
 * Returns list of objects containing following fields: 
 * 
 *     label: application label,
 *     iconSource: icon bitmap that can be assigned to <Image> src field,
 *     maxUsage: usage (in milliseconds from epoch) over last 2 years,
 *     todayUsage: usage (in milliseconds from epoch) since 12:00:00 AM today,
 *     lastActivated: last time (in milliseconds from epoch) app was activated (-1 if not used),
 *     installationTime: time (in milliseconds from epoch) since application was first installed on device
 *     
 * for every application in the system.
 */
function getApplicationList() {
	// 2 years ago from now
	var maxTimeAgo = Calendar.getInstance();
 	maxTimeAgo.set(Calendar.YEAR, maxTimeAgo.get(Calendar.YEAR) - 2);
 	
 	// today at 12:00:00 AM
 	var earlierToday = Calendar.getInstance();
 	earlierToday.set(Calendar.HOUR_OF_DAY, 0);
 	earlierToday.set(Calendar.MINUTE, 0);
 	earlierToday.set(Calendar.SECOND, 0);

 	// current time
 	var now = System.currentTimeMillis();

 	// obtain usage statistics
 	var usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE);
    var usageStatsMapToday  = usageStatsManager.queryAndAggregateUsageStats(earlierToday.getTimeInMillis(), now);
    var usageStatsMapMax  = usageStatsManager.queryAndAggregateUsageStats(maxTimeAgo.getTimeInMillis(), now);

    // construct list
	var list = [];
	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);

		// get package name
		var packageName;
		if (info.activityInfo) {
			packageName = info.activityInfo.packageName;
		} else if (info.serviceInfo) {
			packageName = info.serviceInfo.packageName;
		} else {
			packageName = info.providerInfo.packageName;
		}

		// installation time
		var installationTime;
		try {
            installationTime = pm.getPackageInfo(packageName, 0).firstInstallTime;
        } catch (error) {
            installationTime = -1;
        }

		var label = info.loadLabel(pm).toString();
		var iconSource = imageSource.fromNativeSource(info.loadIcon(pm).getBitmap());
		var maxUsageStats = usageStatsMapMax.get(packageName);
		var todayUsageStats = usageStatsMapToday.get(packageName);


		// construct object
		var applicationObj = {
			label: label, 
			iconSource: iconSource, 
			maxUsage: maxUsageStats ? maxUsageStats.getTotalTimeInForeground() : 0,
			todayUsage: todayUsageStats ? todayUsageStats.getTotalTimeInForeground() : 0,
			lastActivated: maxUsageStats ? maxUsageStats.getLastTimeUsed() : -1,
			installationTime: installationTime
		};

		list.push(applicationObj);
	}

	return list;
}

module.exports = {getApplicationList: getApplicationList, getTimeOnApplicationSingleDay: getTimeOnApplicationSingleDay};