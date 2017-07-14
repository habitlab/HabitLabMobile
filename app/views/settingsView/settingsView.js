var application = require("application");

const TrackingService = require("~/services/TrackingService");
const UnlockService = require("~/services/UnlockService");
const ServiceManager = require("~/services/ServiceManager");
const PermissionUtil = require("~/util/PermissionUtil");
const StorageUtil = require("~/util/StorageUtil");

var Toast = require("nativescript-toast");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var dialogs = require("ui/dialogs");

// expose native APIs
var Intent = android.content.Intent;
var Settings = android.provider.Settings;
var AppOpsManager = android.app.AppOpsManager;
var Process = android.os.Process;
var Context = android.content.Context;
var ActivityManager = android.app.ActivityManager;
var Integer = java.lang.Integer;

// global vars
var context = application.android.context.getApplicationContext();
var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);
var drawer;

exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer"); 

	if (!PermissionUtil.checkSystemOverlayPermission()) {
		PermissionUtil.launchSystemOverlayIntent();
	} 
};

exports.reset = function() {
	StorageUtil.setUp();
};

exports.enableServices = function() {
	if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		context.startService(trackingServiceIntent);
	}

	if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		context.startService(unlockServiceIntent);
	}
};

exports.disableServices = function () {
	if (ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
		TrackingService.stopTimer();
		context.stopService(trackingServiceIntent);
	}

	if (ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
		context.stopService(unlockServiceIntent);
	}
};

exports.toggleDrawer = function() {
	drawer.toggleDrawerState();
};


var WindowManager = android.view.WindowManager;

var Paint = android.graphics.Paint;
// var Button = android.widget.Button;
var Resources = android.content.res.Resources;


var fill = new Paint();
fill.setColor(android.graphics.Color.BLACK);

var CustomView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRect(0, 0, Resources.getSystem().getDisplayMetrics().widthPixels, Resources.getSystem().getDisplayMetrics().heightPixels,fill);
	}
})

exports.getRunningServices = function() {
	var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

	// add view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY,
		0, android.graphics.PixelFormat.TRANSLUCENT);
	viewParams.gravity = android.view.Gravity.LEFT | android.view.Gravity.TOP;
    viewParams.setTitle("Load Average");
    var view = new CustomView(context);
    windowManager.addView(view, viewParams);

    // add button
    var buttonParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.WRAP_CONTENT, 
		WindowManager.LayoutParams.WRAP_CONTENT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY,
		0, android.graphics.PixelFormat.TRANSLUCENT);
	buttonParams.gravity = android.view.Gravity.LEFT | android.view.Gravity.TOP;
    var button = new Button(context);
	button.setText("Push Me!");
    windowManager.addView(button, buttonParams);

	// ServiceManager.getRunningServices();
};











