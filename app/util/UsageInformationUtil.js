var application = require("application");
var imageSource = require("image-source");

// contexts
var context = application.android.context.getApplicationContext();
var foregroundActivity = application.android.foregroundActivity;

// Constructor
function UsageInformationUtils() {
	this.pm = context.getPackageManager();	
	var mainIntent = new android.content.Intent(Intent.ACTION_MAIN, null);
    mainIntent.addCategory(Intent.CATEGORY_LAUNCHER);
    this.applications = currentPM.queryIntentActivities(mainIntent, 0);
}

/* getApplicationList
 * ------------------
 * Returns list of objects containing: 
 * 
 *     label: application label
 *     iconSource: icon bitmap that can be assigned to <Image> src field
 *     maxUsage: number of milliseconds this app has been used over last 2 years
 *     todayUsage: number of milliseconds this app has been used today
 *     
 * for every application in the system.
*/
UsageInformationUtils.prototype.getApplicationList = function () {
	var list = [];

	for (var i = 0; i < applications.size(); i++) {
		var info = applications.get(i);

		var label = info.loadLabel(this.pm).toString();
		var iconSource = imageSource.fromNativeSource(info.loadIcon(currentPM).getBitmap(););

	}
}