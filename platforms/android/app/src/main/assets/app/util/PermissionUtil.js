var application = require("application");
var permission = require('nativescript-permissions');
var storage = require("~/util/StorageUtil");
// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var AccessibilityServiceInfo = android.accessibilityservice.AccessibilityServiceInfo;
var WindowManager = android.view.WindowManager;
var AccountManager = android.accounts.AccountManager;

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
	var foreground = application.android.foregroundActivity;
	if (foreground) {
		foreground.startActivity(int);
	}
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
	var foreground = application.android.foregroundActivity;
	if (foreground) {
		foreground.startActivity(int);
		foreground.finish();
	}
}

/**
 * getOverlayType
 * --------------
 * Returns the overlay type used for dialogs.
 * If the phone has a new API version,
 * WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY is returned.
 * If the phone has an old API version,
 * WindowManager.LayoutParams.TYPE_SYSTEM_ALERT is returned.
 */
exports.getOverlayType = function(otherOverlay) {
	if (android.os.Build.VERSION.SDK_INT < 26)
		return otherOverlay != null ? otherOvelay : otherWindowManager.LayoutParams.TYPE_SYSTEM_ALERT;
	return WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY;
}

/**
 * Prompt User to Associate Email with User Account
 * For now, just ask if we can for our data collection purposes.
 * @param callback: callback function to be executed after email sucess.
 * @return Promise instance to fetch email.
 */
exports.promptUserForEmail = function() {
	return new Promise(function(resolve, reject){
		var context = application.android.context.getApplicationContext();
		permission.requestPermission(android.Manifest.permission.GET_ACCOUNTS,
			"Can we associate your data with your email address? This will be used to sync" +
			" cross-device interent usage in a future release!").then(function() {
				//Great! So, let's fetch it.
				var manager = AccountManager.get(context);
				var accounts = manager.getAccounts();
				if (accounts.length > 0) {
					//We got it! Now, let's add it to local storage for safekeeping.
					resolve(accounts[0].name);
				} else {
					reject("Couldn't get your email.")
				}
			}).catch(function() {
				//Error here (or permission not granted). We just don't do anything then.
				reject("You did not give us permission to view your email.");
			});
	});
}
