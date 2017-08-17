var app = require("application");
var timer = require("timer");
var toast = require("nativescript-toast");

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
		BACKGROUND.setAlpha(50);
		canvas.drawRoundRect(0, 0, canvas.getWidth(), canvas.getHeight(), 15, 15, BACKGROUND);
	}
});

var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
var overlay;
var overlayParams;

exports.grayOut = function(rect) {
	var width = rect.right - rect.left;
	var height = rect.bottom - rect.top;

	console.warn(rect.flattenToString() + " " + getStatusBarHeight());

	if (!overlay && rect.left > 0 && rect.right < SCREEN_WIDTH) {
		overlayParams = new WindowManager.LayoutParams(width, height, rect.left, rect.top - getStatusBarHeight(),
			WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		overlayParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlay = new OverlayView(context);
		windowManager.addView(overlay, overlayParams);

		overlay.setOnTouchListener(new android.view.View.OnTouchListener({
			onTouch: function (v, event) {
				var action = event.getAction();

				if (action === android.view.MotionEvent.ACTION_UP) {
					toast.makeText("unavailable").show();
				}

				return true;
			}
		})); 

	} else {

		if (rect.left > 0 && rect.right < SCREEN_WIDTH) {
			overlayParams.x = rect.left;
			overlayParams.y = rect.top - getStatusBarHeight();
			windowManager.updateViewLayout(overlay, overlayParams);
		} else {
			exports.removeGrayOut();
		}	
	}
}


exports.removeGrayOut = function() {
	if (overlay) {
		windowManager.removeView(overlay);
		overlay = undefined;
	}
}

var getStatusBarHeight = function() {
    var id = context.getResources().getIdentifier("status_bar_height", "dimen", "android");
    if (id) {
        var height = context.getResources().getDimensionPixelSize(id);
        return height;
    }
    return null;
}


