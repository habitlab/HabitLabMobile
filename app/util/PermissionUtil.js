var application = require("application");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;

// contexts
var context = application.android.context.getApplicationContext();
var foregroundActivity = application.android.foregroundActivity;


/* checkActionUsagePermission
 * --------------------------
 * Checks the system for the permission required to 
 * access application usage time. Returns true if the 
 * permission has already been obtained, false 
 * otherwise.
 */
function checkActionUsagePermission() {
	var appOps = context.getSystemService(Context.APP_OPS_SERVICE);
	var mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.getPackageName());
    return mode === AppOpsManager.MODE_ALLOWED;
}


/* checkActionUsagePermissionAndLaunchIntent
 * -----------------------------------------
 * Same as checkActionUsagePermission function above, 
 * except if the necessary permission is not found, 
 * launches intent to the system page where user can
 * allow permission.
 */
function launchActionUsageIntent() {
	var int = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
	foregroundActivity.startActivity(int);	
}

module.exports = {checkActionUsagePermission: checkActionUsagePermission, 
	launchActionUsageIntent: launchActionUsageIntent};