var application = require("application");
var imageSource = require("image-source");

// global vars 
const DAY_MS = 86400000;
var context = application.android.context;


/****** LIST OF ALL LAUNCHABLE APPLICATIONS *****/
var pm = context.getPackageManager();	
var mainIntent = new android.content.Intent(android.content.Intent.ACTION_MAIN, null);
mainIntent.addCategory(android.content.Intent.CATEGORY_LAUNCHER);
var applications = pm.queryIntentActivities(mainIntent, 0); // all launchable packages


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
	var list = [];
	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		var packageName = info.activityInfo.packageName;
		
		// filter out habitlab and duplicates
		if (packageName === "com.stanfordhci.habitlab") { continue; }
		
		var label = info.loadLabel(pm).toString();
		if (label === "Voice Search") { continue; }
		
		var iconSource = imageSource.fromNativeSource(info.loadIcon(pm).getBitmap());
		
		// construct object
		var applicationObj = {
			packageName: packageName,
			label: label, 
			iconSource: iconSource
		};

		list.push(applicationObj);
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
		"com.snapchat.android", "com.instagram.android", "com.netflix.mediaclient", "com.pinterest",
		"com.twitter.android", "com.reddit.frontpage", "com.buzzfeed.android", "com.ninegag.android.app", 
		"com.amazon.mShop.android.shopping", "com.hulu.plus", "com.tinder", "com.espn.score_center"];
	var installedPresets = [];

	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		var packageName = info.activityInfo.packageName;
		if (presets.includes(packageName)) {
			installedPresets.push(packageName);
		}
	}

	return installedPresets;
}



exports.getApplicationBitmap = function(pkg) {
	var appInfo;
	try {
		appInfo = pm.getApplicationInfo(pkg, 0);
	} catch (e) {
		appInfo = null;
	}

	return appInfo ? appInfo.loadIcon(pm).getBitmap() : null;
}
