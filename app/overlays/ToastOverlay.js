var app = require("application");
var Toast = require("nativescript-toast");

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
var LayoutParams = android.view.ViewGroup.LayoutParams;
var ImageView =	android.widget.ImageView;



/******************************
 *          PAINTS            *                           
 ******************************/


var TOAST_FILL = new Paint();
TOAST_FILL.setColor(Color.parseColor("#69BD68")); // Green

var DIM_BACKGROUND = new Paint();
DIM_BACKGROUND.setColor(Color.BLACK);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor("#2EC4B6")); //turquoise

var ICON_BACK_FILL = new Paint();
ICON_BACK_FILL.setColor(Color.WHITE);

var CLOSE_FILL = new Paint();
CLOSE_FILL.setColor(Color.parseColor("#5f5e5d"));

// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var DIALOG_WIDTH = 0.4 * SCREEN_WIDTH;
var DIALOG_HEIGHT = 0.1 * SCREEN_WIDTH;
var LEFT = 0.25 * SCREEN_WIDTH;
var RIGHT = LEFT + DIALOG_WIDTH;
var TOP = 0.8*SCREEN_HEIGHT;
var BOTTOM = TOP + DIALOG_HEIGHT;
var ICON_RADIUS = 0.5*DIALOG_HEIGHT;
var CORNER_RADIUS = 15;


var context = app.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		DIM_BACKGROUND.setAlpha(128); // 50% dimness
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
		canvas.drawRect(LEFT, TOP, RIGHT, BOTTOM, TOAST_FILL);
		canvas.drawRect(RIGHT, TOP, RIGHT+0.1*SCREEN_WIDTH, BOTTOM, CLOSE_FILL);

		// // add icon frame
		// var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		// var iconRight = iconLeft + 2 * ICON_RADIUS;
		// var iconTop = (SCREEN_HEIGHT - DIALOG_HEIGHT) / 2 - 1 * ICON_RADIUS;
		// var iconBottom = iconTop + 2 * ICON_RADIUS;
		// canvas.drawOval(iconLeft - 10, iconTop - 10, iconRight + 10, iconBottom + 10, ICON_BACK_FILL);
		// canvas.drawOval(iconLeft, iconTop, iconRight, iconBottom, ICON_FILL);

		// // add icon
		// var icon_id = context.getResources().getIdentifier("ic_habitlab_white", "drawable", context.getPackageName());
		// var bitmap = context.getResources().getDrawable(icon_id).getBitmap();
		// var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		// var newHeight = 1.5 * ICON_RADIUS;
		// var newWidth = newHeight * hToWRatio;
		// var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);
		
		// var bitmapLeft = iconLeft + (iconRight - iconLeft) / 2 - newWidth / 2;
		// var bitmapTop = iconTop + (iconBottom - iconTop) / 2 - newHeight * 9 / 16;

		// canvas.drawBitmap(icon, bitmapLeft, bitmapTop, ICON_FILL);
	}
});


var fullScreen;
var text;
var closeButton;
exports.showToastOverlay = function (msg, callback) {

	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    fullScreen = new DialogView(context);
    windowManager.addView(fullScreen, viewParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
    	LEFT+0.1*DIALOG_WIDTH, TOP + 0.13*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    text = new TextView(context);
    text.setText(msg);
    text.setTextSize(TypedValue.COMPLEX_UNIT_PT, 7);
    text.setTextColor(Color.WHITE);
    text.setHorizontallyScrolling(false);
    text.setGravity(Gravity.CENTER);
    text.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (callback) {
	    		callback();
	    	}
	        exports.removeOverlay();
	    }
	}));

    windowManager.addView(text, textParams);


    // add neg button
    var closeButtonParams = new WindowManager.LayoutParams(0.1*SCREEN_WIDTH, 
    	0.1*SCREEN_WIDTH, RIGHT, 
    	TOP, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	closeButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    closeButton = new Button(context);
	closeButton.setText("X");
	closeButton.setTextColor(Color.WHITE);
	closeButton.setStateListAnimator(null);
	closeButton.getBackground().setColorFilter(Color.parseColor("#5f5e5d"), android.graphics.PorterDuff.Mode.MULTIPLY);
	closeButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	        exports.removeOverlay();
	    }
	}));
    windowManager.addView(closeButton, closeButtonParams);
}



exports.removeOverlay = function () {
	if (fullScreen) {
		windowManager.removeView(fullScreen);
		fullScreen = undefined;
	}

	if (text) {
		windowManager.removeView(text);
		text = undefined;
	}

	if (closeButton) {
		windowManager.removeView(closeButton);
		closeButton = undefined;
	}
}



