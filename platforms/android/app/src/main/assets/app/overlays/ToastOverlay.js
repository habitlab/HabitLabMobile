var app = require("application");
var Toast = require("nativescript-toast");
var permissions = require("~/util/PermissionUtil");

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
var imageBitmap;



/******************************
 *          PAINTS            *
 ******************************/


var TOAST_FILL = new Paint();
TOAST_FILL.setColor(Color.parseColor("#69BD68")); // Green

var TOAST_OUTLINE_FILL = new Paint();
TOAST_OUTLINE_FILL.setColor(Color.parseColor("#337332")); // Green


var DIM_BACKGROUND = new Paint();
DIM_BACKGROUND.setColor(Color.BLACK);
DIM_BACKGROUND.setAlpha(70);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor("#2EC4B6")); //turquoise

var ICON_BACK_FILL = new Paint();
ICON_BACK_FILL.setColor(Color.parseColor("#69BD68"));
// ICON_BACK_FILL.setAlpha(100);

var CLOSE_FILL = new Paint();
CLOSE_FILL.setColor(Color.parseColor("#8d978d")); //grey




// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var DIALOG_WIDTH = 0.8 * SCREEN_WIDTH;
var DIALOG_HEIGHT = 0.1 * SCREEN_WIDTH;
var LEFT = 0.1 * SCREEN_WIDTH;
var RIGHT = LEFT + DIALOG_WIDTH;
var TOP = 0.8*SCREEN_HEIGHT;
var BOTTOM = TOP + DIALOG_HEIGHT;
var ICON_HEIGHT = DIALOG_HEIGHT;
var CORNER_RADIUS = 15;
var PADDING = 0.01 * SCREEN_WIDTH;


var context = app.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
		canvas.drawRect(LEFT, TOP, RIGHT, BOTTOM, TOAST_OUTLINE_FILL); //outline
		canvas.drawRect(RIGHT - DIALOG_HEIGHT - PADDING, TOP + PADDING, RIGHT - PADDING, BOTTOM - PADDING, CLOSE_FILL); //grey
		canvas.drawRect(LEFT + PADDING, TOP + PADDING, RIGHT - DIALOG_HEIGHT + PADDING, BOTTOM - PADDING, TOAST_FILL); //green main

		// // add icon frame
		var iconLeft = LEFT +  2 * PADDING;
		var iconRight = iconLeft + DIALOG_HEIGHT;
		var iconTop = TOP + 2 * PADDING;
		var iconBottom = BOTTOM - 2 * PADDING;
		canvas.drawRect(iconLeft, iconTop, iconRight, iconBottom, ICON_BACK_FILL);

		// // add icon
		if (imageBitmap === null) return;
		var bitmap = imageBitmap;
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = ICON_HEIGHT - 4 * PADDING;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);

		canvas.drawBitmap(icon, iconLeft, iconTop, ICON_FILL);
	}
});


// Custom DialogView
var FakeDialogView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRoundRect(0.24*SCREEN_WIDTH, TOP-0.01*SCREEN_WIDTH, RIGHT+0.11*SCREEN_WIDTH, BOTTOM+0.01*SCREEN_WIDTH, CORNER_RADIUS, CORNER_RADIUS, TOAST_OUTLINE_FILL); //outline
		canvas.drawRoundRect(RIGHT, TOP, RIGHT+0.1*SCREEN_WIDTH, BOTTOM, CORNER_RADIUS, CORNER_RADIUS, CLOSE_FILL); //grey
		canvas.drawRect(LEFT-0.01*SCREEN_WIDTH, TOP, RIGHT+0.01*SCREEN_WIDTH, BOTTOM, TOAST_FILL); //green main

		// // add icon frame
		var iconLeft = 0.25*SCREEN_WIDTH;
		var iconRight = LEFT;
		var iconTop = TOP;
		var iconBottom = BOTTOM;
		canvas.drawRoundRect(iconLeft, iconTop, iconRight, iconBottom, CORNER_RADIUS, CORNER_RADIUS, ICON_BACK_FILL);

		// // add icon
		if (imageBitmap === null) return;
		var bitmap = imageBitmap;
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = ICON_HEIGHT;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);

		canvas.drawBitmap(icon, iconLeft, TOP, ICON_FILL);
	}
});

var fullScreen;
var text;
var closeButton;
exports.showToastOverlay = function (msg, iconBitmap, callback, real) {
	imageBitmap = iconBitmap;
	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT,
		WindowManager.LayoutParams.MATCH_PARENT, permissions.getOverlayType(),
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
	if (!real) {
		fullScreen = new FakeDialogView(context);
	} else {
		fullScreen = new DialogView(context);
	}
    windowManager.addView(fullScreen, viewParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
    	LEFT+0.1*DIALOG_WIDTH, TOP + 0.13*DIALOG_HEIGHT,
    	permissions.getOverlayType(), WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
    	PixelFormat.TRANSLUCENT);
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
    	0.1*SCREEN_WIDTH, RIGHT - DIALOG_HEIGHT,
    	TOP, permissions.getOverlayType(),
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
		PixelFormat.TRANSLUCENT);
   	closeButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    closeButton = new Button(context);
	closeButton.setText("X");
	closeButton.setTextColor(Color.WHITE);
	closeButton.setStateListAnimator(null);
	closeButton.getBackground().setColorFilter(Color.parseColor("#8d978d"), android.graphics.PorterDuff.Mode.MULTIPLY);
	closeButton.getBackground().setAlpha(170);
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
