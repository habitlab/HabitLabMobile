var application = require("application");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var AccessibilityServiceInfo = 	android.accessibilityservice.AccessibilityServiceInfo;


/* 
 * checkActionUsagePermission
 * --------------------------
 * Checks the system for the permission required to 
 * access application usage time. Returns true if the 
 * permission has already been obtained, false 
 * otherwise.
 */
exports.checkActionUsagePermission = function () {
	var context = application.android.context;
	var appOps = context.getSystemService(Context.APP_OPS_SERVICE);
	var mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.getPackageName());
    return mode === AppOpsManager.MODE_ALLOWED;
}


/* 
 * launchActionUsageIntent
 * -----------------------
 * Launches intent to the system page where user can
 * allow permission to usage statistics.
 */
exports.launchActionUsageIntent = function () {
	var int = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
	application.android.foregroundActivity.startActivity(int);
}


/* 
 * checkSystemOverlayPermission
 * ----------------------------
 * Checks the system for the permission required to 
 * draw on top of other applications. Returns true 
 * if the permission has already been obtained, 
 * false otherwise.
 */
exports.checkSystemOverlayPermission = function () {
	if (android.os.Build.VERSION.SDK_INT < 23) return true;
	var context = application.android.context;
	var appOps = context.getSystemService(Context.APP_OPS_SERVICE);
	var mode = appOps.checkOpNoThrow("android:system_alert_window", Process.myUid(), context.getPackageName());
    return mode === AppOpsManager.MODE_ALLOWED;
}

/* 
 * launchSystemOverlayIntent
 * -------------------------
 * Launches intent to the system page where user can
 * allow permission to draw system overlays.
 */
exports.launchSystemOverlayIntent = function () {
	var int = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
	application.android.foregroundActivity.startActivity(int);
}


/* 
 * checkAccessibilityPermission
 * ----------------------------
 * Checks the system for the permission required to 
 * run the accessibility service. Returns true 
 * if the permission has already been obtained, 
 * false otherwise.
 */
exports.checkAccessibilityPermission = function () {
	var context = application.android.context;
	var pm = context.getPackageManager();
	var accessibilityManager = context.getSystemService(Context.ACCESSIBILITY_SERVICE);
	var runningServices = accessibilityManager.getEnabledAccessibilityServiceList(AccessibilityServiceInfo.FEEDBACK_GENERIC);
	for (var i = 0; i < runningServices.size(); i++) {
		var service = runningServices.get(i);
		var resolveInfo = service.getResolveInfo();
		var label = resolveInfo.loadLabel(pm).toString();
		if (label === "HabitLab") { return true; }
	}

	return false;
}

/* 
 * launchSystemOverlayIntent
 * -------------------------
 * Launches intent to the system page where user can
 * allow permission to run the accessibility service.
 */
exports.launchAccessibilityServiceIntent = function () {
	var int = new Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS);
	application.android.foregroundActivity.startActivity(int);
}



