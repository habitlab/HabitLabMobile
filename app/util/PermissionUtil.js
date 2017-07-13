var application = require("application");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;


/* 
 * checkActionUsagePermission
 * --------------------------
 * Checks the system for the permission required to 
 * access application usage time. Returns true if the 
 * permission has already been obtained, false 
 * otherwise.
 */
function checkActionUsagePermission() {
	var context = application.android.context.getApplicationContext();
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
function launchActionUsageIntent() {
	var foregroundActivity = application.android.foregroundActivity;
	var int = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
	foregroundActivity.startActivity(int);	
}


/* 
 * checkSystemOverlayPermission
 * ----------------------------
 * Checks the system for the permission required to 
 * draw on top of other applications. Returns true 
 * if the permission has already been obtained, 
 * false otherwise.
 */
function checkSystemOverlayPermission() {
	var context = application.android.context.getApplicationContext();
	var appOps = context.getSystemService(Context.APP_OPS_SERVICE);
	var mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_SYSTEM_ALERT_WINDOW, Process.myUid(), context.getPackageName());
    return mode === AppOpsManager.MODE_ALLOWED;
}

/* 
 * launchSystemOverlayIntent
 * -------------------------
 * Launches intent to the system page where user can
 * allow permission to draw system overlays.
 */
function launchSystemOverlayIntent() {
	var foregroundActivity = application.android.foregroundActivity;
	var int = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION);
	foregroundActivity.startActivity(int);	
}




module.exports = {
	checkActionUsagePermission, 
	launchActionUsageIntent,
	checkSystemOverlayPermission,
	launchSystemOverlayIntent
};




