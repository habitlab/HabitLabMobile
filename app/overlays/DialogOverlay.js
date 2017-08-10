var app = require("application");

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


/******************************
 *          PAINTS            *                           
 ******************************/

var iconBackgrounds = ["#FFA730", "#E71D36", "#2EC4B6", "#4ce500", "#011627"];

var DIALOG_FILL = new Paint();
DIALOG_FILL.setColor(Color.WHITE); // default

var DIM_BACKGROUND = new Paint();
DIM_BACKGROUND.setColor(Color.BLACK);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor(iconBackgrounds[0]));

var ICON_BACK_FILL = new Paint();
ICON_BACK_FILL.setColor(Color.WHITE);

// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var DIALOG_WIDTH = 0.8 * SCREEN_WIDTH;
var DIALOG_HEIGHT = 0.3 * SCREEN_HEIGHT;
var LEFT = 0.1 * SCREEN_WIDTH;
var RIGHT = LEFT + DIALOG_WIDTH;
var TOP = (SCREEN_HEIGHT - DIALOG_HEIGHT) / 2;
var BOTTOM = TOP + DIALOG_HEIGHT;
var ICON_RADIUS = 0.13 * DIALOG_WIDTH;
var CORNER_RADIUS = 15;


var context = app.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		DIM_BACKGROUND.setAlpha(128); // 50% dimness
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
		canvas.drawRoundRect(LEFT, TOP, RIGHT, BOTTOM, CORNER_RADIUS, CORNER_RADIUS, DIALOG_FILL);

		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT - DIALOG_HEIGHT) / 2 - 1 * ICON_RADIUS;
		var iconBottom = iconTop + 2 * ICON_RADIUS;
		canvas.drawOval(iconLeft - 10, iconTop - 10, iconRight + 10, iconBottom + 10, ICON_BACK_FILL);
		canvas.drawOval(iconLeft, iconTop, iconRight, iconBottom, ICON_FILL);

		// add icon
		var icon_id = context.getResources().getIdentifier("ic_habitlab_white", "drawable", context.getPackageName());
		var bitmap = context.getResources().getDrawable(icon_id).getBitmap();
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = 1.5 * ICON_RADIUS;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);
		
		var bitmapLeft = iconLeft + (iconRight - iconLeft) / 2 - newWidth / 2;
		var bitmapTop = iconTop + (iconBottom - iconTop) / 2 - newHeight * 9 / 16;

		canvas.drawBitmap(icon, bitmapLeft, bitmapTop, ICON_FILL);
	}
});


var twoOptionView;
var twoOptionText;
var twoOptionPosButton;
var twoOptionNegButton;
exports.showTwoOptionDialogOverlay = function (msg, pos, neg, posCallback, negCallback) {
	var color = changeIconColor(4);

	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    twoOptionView = new DialogView(context);
    windowManager.addView(twoOptionView, viewParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 0.37 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    twoOptionText = new TextView(context);
    twoOptionText.setText(msg);
    twoOptionText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    twoOptionText.setTextColor(Color.BLACK);
    twoOptionText.setHorizontallyScrolling(false);
    twoOptionText.setGravity(Gravity.CENTER);
    windowManager.addView(twoOptionText, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.35 * DIALOG_WIDTH, 
    	0.3 * DIALOG_HEIGHT, 0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 
    	0.35 * SCREEN_HEIGHT + 0.6 * DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    twoOptionPosButton = new Button(context);
	twoOptionPosButton.setText(pos);
	twoOptionPosButton.setTextColor(Color.WHITE);
	twoOptionPosButton.getBackground().setColorFilter(Color.parseColor(color), android.graphics.PorterDuff.Mode.MULTIPLY);
	twoOptionPosButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (posCallback) {
	    		posCallback();
	    	}
	        exports.removeTwoOptionDialog();
	    }
	}));
    windowManager.addView(twoOptionPosButton, posButtonParams);

    // add positive button
    var negButtonParams = new WindowManager.LayoutParams(0.35 * DIALOG_WIDTH, 
    	0.3 * DIALOG_HEIGHT, 0.1 * SCREEN_WIDTH + 0.55 * DIALOG_WIDTH, 
    	0.35 * SCREEN_HEIGHT + 0.6 * DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    twoOptionNegButton = new Button(context);
	twoOptionNegButton.setText(neg);
	twoOptionNegButton.setTextColor(Color.WHITE);
	twoOptionNegButton.getBackground().setColorFilter(Color.parseColor("#011627"), android.graphics.PorterDuff.Mode.MULTIPLY);
	twoOptionNegButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (negCallback) {
	    		negCallback();
	    	}
	        exports.removeTwoOptionDialog();
	    }
	}));
    windowManager.addView(twoOptionNegButton, negButtonParams);
}



exports.removeTwoOptionDialog = function () {
	if (twoOptionView) {
		windowManager.removeView(twoOptionView);
		twoOptionView = undefined;
	}

	if (twoOptionText) {
		windowManager.removeView(twoOptionText);
		twoOptionText = undefined;
	}

	if (twoOptionPosButton) {
		windowManager.removeView(twoOptionPosButton);
		twoOptionPosButton = undefined;
	}

	if (twoOptionNegButton) {
		windowManager.removeView(twoOptionNegButton);
		twoOptionNegButton = undefined;
	}
}


var oneOptionView;
var oneOptionText;
var oneOptionButton;
exports.showOneOptionDialogOverlay = function (msg, buttonText) {
	var color = changeIconColor(5);

	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
        PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    oneOptionView = new DialogView(context);
    windowManager.addView(oneOptionView, viewParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 0.37 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    oneOptionText = new TextView(context);
    oneOptionText.setText(msg);
    oneOptionText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    oneOptionText.setTextColor(Color.BLACK);
    oneOptionText.setHorizontallyScrolling(false);
    oneOptionText.setGravity(Gravity.CENTER);
    windowManager.addView(oneOptionText, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.6 * DIALOG_WIDTH, 
    	0.275 * DIALOG_HEIGHT, 0.1 * SCREEN_WIDTH + 0.2 * DIALOG_WIDTH, 
    	0.35 * SCREEN_HEIGHT + 0.625 * DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
        PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    oneOptionButton = new Button(context);
    oneOptionButton.getBackground().setColorFilter(Color.parseColor(color), android.graphics.PorterDuff.Mode.MULTIPLY);
	oneOptionButton.setText(buttonText);
	oneOptionButton.setTextColor(Color.WHITE);
	oneOptionButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	        exports.removeOneOptionDialog();
	    }
	}));
    windowManager.addView(oneOptionButton, posButtonParams);
}


exports.removeOneOptionDialog = function () {
	if (oneOptionView) {
		windowManager.removeView(oneOptionView);
		oneOptionView = undefined;
	}

	if (oneOptionText) {
		windowManager.removeView(oneOptionText);
		oneOptionText = undefined;
	}

	if (oneOptionButton) {
		windowManager.removeView(oneOptionButton);
		oneOptionButton = undefined;
	}
}



function changeIconColor(num) {
	var index = Math.floor(Math.random() * num);
	var color = iconBackgrounds[index];
	ICON_FILL.setColor(Color.parseColor(color));
	return color;
}