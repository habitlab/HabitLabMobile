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


// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;

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

var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
var overlayParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY,
		WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
overlayParams.gravity = Gravity.LEFT | Gravity.TOP;
var overlay;
var timerID;

exports.dim = function(context, interval) {
	var brightness = android.provider.Settings.System.getInt(context.getContentResolver(),
        android.provider.Settings.System.SCREEN_BRIGHTNESS) / 255;
	overlayParams.screenBrightness = brightness;

	overlay = new OverlayView(context);
	windowManager.addView(overlay, overlayParams);

	timerID = timer.setInterval(() => {
		brightness = brightness - interval;
		if (brightness > 0) {
			overlayParams.screenBrightness = brightness;
			windowManager.updateViewLayout(overlay, overlayParams);
		} else {
			brightness = 0;
			overlayParams.screenBrightness = brightness;
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
}

