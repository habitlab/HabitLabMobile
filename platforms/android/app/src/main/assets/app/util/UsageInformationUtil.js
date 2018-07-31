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
var Bitmap = android.graphics.Bitmap
var Canvas = android.graphics.Canvas

/* refreshApplicationList
 * ----------------------
 * Repopulates applications global variable with an updated list of
 * installed applications (in the event a new application is installed).
 */
exports.refreshApplicationList = function() {
	applications = pm.queryIntentActivities(mainIntent, 0);
}


function convertToBitmap(drawable) {
    if (drawable.getBitmap != null) {
        return drawable.getBitmap()
    }
    const bmp = Bitmap.createBitmap(drawable.getIntrinsicWidth(), drawable.getIntrinsicHeight(), Bitmap.Config.ARGB_8888)
    const canvas = new Canvas(bmp);
    drawable.setBounds(0, 0, canvas.getWidth(), canvas.getHeight())
    drawable.draw(canvas)
    return bmp
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

    let bitmap = convertToBitmap(info.loadIcon(pm))
    var iconSource = imageSource.fromNativeSource(bitmap);

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
      var bitmap = exports.getApplicationBitmap(packageName)
  		var iconSource = imageSource.fromNativeSource(bitmap);
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
 * Returns an object of a list of presets that are installed on the
 * device(returns empty array if none of the presets
 * are installed).
 * getInstalledPresets.watchlist returns the installed presets for the watchlsit
 * getInstalledPresets.targets returns the installed presets for the targets
 */
exports.getInstalledPresets = function() {
	var presets = ["com.facebook.katana", "com.google.android.youtube", "com.facebook.orca",
		"com.snapchat.android", "com.instagram.android", "com.netflix.mediaclient", "com.pinterest",
		"com.twitter.android", "com.reddit.frontpage", "com.buzzfeed.android", "com.ninegag.android.app",
		"com.amazon.mShop.android.shopping", "com.hulu.plus", "com.tinder", "com.espn.score_center",
		"com.whatsapp", "com.google.android.gm", "com.microsoft.office.outlook", "com.youku.phone",
		"com.android.chrome"];
	var installedPresets = [];
	var targetPresets = ["com.quora.android", "com.curiosity.dailycuriosity", "com.wonder", "com.memrise.android.memrisecompanion",
						"bbc.mobile.news.ww", "com.duolingo", "com.blinkslabs.blinkist.android", "com.nytimes.android",
						"com.magoosh.gre.quiz.vocabulary", "flipboard.app", "com.guardian"];
	var installedTargets = [];

	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);
		var packageName = info.activityInfo.packageName;
		if (presets.includes(packageName)) {
			installedPresets.push(packageName);
		}
		if (targetPresets.includes(packageName)) {
			installedTargets.push(packageName);
		}
	}

	return {
		targets: installedTargets,
		watchlist: installedPresets
	};
}




exports.getApplicationBitmap = function(pkg) {
	let icon = pm.getApplicationIcon(pkg)
	return icon ? convertToBitmap(icon): null
}
