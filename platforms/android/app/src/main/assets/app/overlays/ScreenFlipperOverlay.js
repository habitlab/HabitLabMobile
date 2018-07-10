var app = require("application");
var timer = require("timer");

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
		BACKGROUND.setAlpha(0);
		canvas.drawRect(0, 0, canvas.getWidth(), canvas.getHeight(), BACKGROUND);
	}
});

// dimmer view
var overlayParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
	WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY,
	WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
overlayParams.gravity = Gravity.LEFT | Gravity.TOP;
overlayParams.screenOrientation = 9; // upside down
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
var overlay;
var settingsChanged;
exports.flipScreen = function() {
	var autoRotateOn = android.provider.Settings.System.getInt(context.getContentResolver(), 
		android.provider.Settings.System.ACCELEROMETER_ROTATION);
	if (!autoRotateOn) {
		android.provider.Settings.System.putInt(context.getContentResolver(), 
			android.provider.Settings.System.ACCELEROMETER_ROTATION, 1);
		settingsChanged = true;
	}

	overlay = new OverlayView(context);
	windowManager.addView(overlay, overlayParams);
}


exports.removeOverlay = function() {
	if (overlay) {
		windowManager.removeView(overlay);
		overlay = undefined;
	}

	if (settingsChanged) {
		android.provider.Settings.System.putInt(context.getContentResolver(), 
			android.provider.Settings.System.ACCELEROMETER_ROTATION, 0);
		settingsChanged = undefined;
	}
}

