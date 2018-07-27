var app = require("application");
var timer = require("timer");
var permissions = require("~/util/PermissionUtil")

// native APIs
var WindowManager = android.view.WindowManager;
var Paint = android.graphics.Paint;
var Button = android.widget.Button;
var Resources = android.content.res.Resources;
var Color = android.graphics.Color;
var Context = android.content.Context;
var PixelFormat = android.graphics.PixelFormat;
var Gravity = android.view.Gravity;
var TextView = android.widget.TextView;
var BitmapFactory = android.graphics.BitmapFactory;
var Bitmap = android.graphics.Bitmap;
var TypedValue = android.util.TypedValue;
var ImageView = android.widget.ImageView;


// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var ICON_SIDE = SCREEN_HEIGHT * 0.075

var iconFills = ["#FFA730", "#E71D36", "#2EC4B6", "#72e500", "#011627"];

var context = app.android.context;

// Custom DialogView
var OverlayView = android.view.View.extend({
	onDraw: function (canvas) {
		var BACKGROUND = new Paint();
		BACKGROUND.setColor(Color.BLACK);
		BACKGROUND.setAlpha(0);
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, BACKGROUND);
	}
});

// dimmer view
var overlayParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT,
	WindowManager.LayoutParams.MATCH_PARENT, permissions.getOverlayType(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY),
	WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
overlayParams.gravity = Gravity.LEFT | Gravity.TOP;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
var overlay;
var timerID;

// icon view
var iconParams = new WindowManager.LayoutParams(ICON_SIDE, ICON_SIDE, SCREEN_WIDTH - ICON_SIDE,
	0, permissions.getOverlayType(WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY),
	WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
var icon_id = context.getResources().getIdentifier("ic_lightbulb",
		"drawable", context.getPackageName());
var bitmap = context.getResources().getDrawable(icon_id).getBitmap();
var iconView;
var iconTimerID;

exports.dim = function(interval) {
	exports.removeDimmer()
	var brightness = android.provider.Settings.System.getInt(context.getContentResolver(),
        android.provider.Settings.System.SCREEN_BRIGHTNESS) / 255;
	overlayParams.screenBrightness = brightness;
	overlay = new OverlayView(context);
	windowManager.addView(overlay, overlayParams);

	var randomIndex = Math.floor(Math.random() * 5);
	iconView = new ImageView(context);
	iconView.setImageBitmap(bitmap);
	iconView.setBackgroundColor(Color.parseColor(iconFills[randomIndex]));
	iconView.setPadding(ICON_SIDE * 0.15, ICON_SIDE * 0.15, ICON_SIDE * 0.15, ICON_SIDE * 0.15);
	windowManager.addView(iconView, iconParams);

	iconTimerID = timer.setTimeout(() => {
		if (iconView) {
			windowManager.removeView(iconView);
			iconView = undefined;
		}
	}, 5000);


	timerID = timer.setInterval(() => {
		brightness = brightness - interval;
		if (brightness > 0) {
			overlayParams.screenBrightness = brightness;
			windowManager.updateViewLayout(overlay, overlayParams);
		} else {
			overlayParams.screenBrightness = 0;
			windowManager.updateViewLayout(overlay, overlayParams);
			timer.clearInterval(timerID);
			timerID = 0;
		}
	}, 1000);
}


exports.removeDimmer = function() {
	if (overlay) {
		windowManager.removeView(overlay);
		overlay = undefined;
	}

	if (timerID) {
		timer.clearInterval(timerID);
		timerID = 0;
	}

	if (iconView) {
		windowManager.removeView(iconView);
		iconView = undefined;
	}
}
