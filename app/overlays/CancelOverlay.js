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



// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var DIALOG_WIDTH = 0.8 * SCREEN_WIDTH;
var DIALOG_HEIGHT = 0.4 * SCREEN_HEIGHT;
var LEFT = 0.1 * SCREEN_WIDTH;
var RIGHT = LEFT + DIALOG_WIDTH;
var TOP = (SCREEN_HEIGHT - DIALOG_HEIGHT) / 2;
var BOTTOM = TOP + DIALOG_HEIGHT;
var ICON_RADIUS = 0.08 * DIALOG_WIDTH;
var CORNER_RADIUS = 15;

var HEADER_HEIGHT = 0.3*DIALOG_HEIGHT;
var HEADER_BOTTOM = TOP + HEADER_HEIGHT;

var DIM_BACKGROUND = new Paint();
DIM_BACKGROUND.setColor(Color.BLACK);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor("#ffad74")); //orange



/******************************
 *     CANCEL PAINTS            *                           
 ******************************/

var LOCK_DIALOG_FILL = new Paint();
LOCK_DIALOG_FILL.setColor(Color.parseColor("#db646f")); // light red

var LOCK_DIALOG_HEADER = new Paint();
LOCK_DIALOG_HEADER.setColor(Color.parseColor("#d13b49")); //dark red

var context = app.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var CancelLockDialog = android.view.View.extend({
	onDraw: function (canvas) {
		DIM_BACKGROUND.setAlpha(128); // 50% dimness
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
		canvas.drawRoundRect(LEFT, TOP, RIGHT, BOTTOM, CORNER_RADIUS, CORNER_RADIUS, LOCK_DIALOG_FILL);
		canvas.drawRoundRect(LEFT, TOP, RIGHT, HEADER_BOTTOM, CORNER_RADIUS, CORNER_RADIUS, LOCK_DIALOG_HEADER);

		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT - HEADER_HEIGHT) / 2 - 1 * ICON_RADIUS - 0.05*DIALOG_HEIGHT;
		var iconBottom = iconTop + 2 * ICON_RADIUS;
		// canvas.drawOval(iconLeft - 10, iconTop - 10, iconRight + 10, iconBottom + 10, ICON_BACK_FILL);
		canvas.drawOval(iconLeft, iconTop, iconRight, iconBottom, ICON_FILL);
		canvas.drawRect(LEFT, HEADER_BOTTOM - 0.01*DIALOG_HEIGHT, RIGHT, HEADER_BOTTOM + 0.01*DIALOG_HEIGHT, ICON_FILL);

		// add icon
		var icon_id = context.getResources().getIdentifier("ic_key", "drawable", context.getPackageName());
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


var cancelDialog;
var cancelTitle;
var cancelText;
var cancelPosButton;
var cancelNegButton;
exports.showCancelLockDialog = function (title, msg, pos, neg, posCallback, negCallback) {

	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    cancelDialog = new CancelLockDialog(context);
    windowManager.addView(cancelDialog, viewParams);

    // add title
    var titleParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.1 * DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), TOP + 0.075*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    titleParams.gravity = Gravity.LEFT | Gravity.TOP;
    cancelTitle = new TextView(context);
    cancelTitle.setText(title);
    cancelTitle.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    cancelTitle.setTextColor(Color.WHITE);
    cancelTitle.setHorizontallyScrolling(false);
    cancelTitle.setGravity(Gravity.CENTER);
    windowManager.addView(cancelTitle, titleParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.85 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
    	LEFT + 0.075 * DIALOG_WIDTH, TOP+0.22*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    cancelText = new TextView(context);
    cancelText.setText(msg);
    cancelText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 9);
    cancelText.setTextColor(Color.WHITE);
    cancelText.setHorizontallyScrolling(false);
    cancelText.setGravity(Gravity.CENTER);
    windowManager.addView(cancelText, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.18 * DIALOG_HEIGHT, 0.1* SCREEN_WIDTH + 0.067 * DIALOG_WIDTH, 
    	TOP+0.75*DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    cancelPosButton = new Button(context);
	cancelPosButton.setText(pos);
	cancelPosButton.setTextColor(Color.parseColor("#d13b49"));	//Red
	cancelPosButton.getBackground().setColorFilter(Color.WHITE, android.graphics.PorterDuff.Mode.MULTIPLY);
	cancelPosButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (posCallback) {
	    		posCallback();
	    	}
	        exports.removeCancelLockDialog();
	    }
	}));
    windowManager.addView(cancelPosButton, posButtonParams);

    // add positive button
    var negButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.18 * DIALOG_HEIGHT, 0.1 * SCREEN_WIDTH + 0.534 * DIALOG_WIDTH, 
    	TOP+0.75*DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    cancelNegButton = new Button(context);
	cancelNegButton.setText(neg);
	cancelNegButton.setTextColor(Color.parseColor("#69BD68")); //Green
	cancelNegButton.getBackground().setColorFilter(Color.WHITE, android.graphics.PorterDuff.Mode.MULTIPLY);
	cancelNegButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (negCallback) {
	    		negCallback();
	    	}
	        exports.removeCancelLockDialog();
	    }
	}));
    windowManager.addView(cancelNegButton, negButtonParams);
}



exports.removeCancelLockDialog = function () {
	if (cancelDialog) {
		windowManager.removeView(cancelDialog);
		cancelDialog = undefined;
	}

	if (cancelTitle) {
		windowManager.removeView(cancelTitle);
		cancelTitle = undefined;
	}

	if (cancelText) {
		windowManager.removeView(cancelText);
		cancelText = undefined;
	}

	if (cancelPosButton) {
		windowManager.removeView(cancelPosButton);
		cancelPosButton = undefined;
	}

	if (cancelNegButton) {
		windowManager.removeView(cancelNegButton);
		cancelNegButton = undefined;
	}
}



var SNOOZE_DIALOG_FILL = new Paint();
SNOOZE_DIALOG_FILL.setColor(Color.WHITE); // default

var SNOOZE_HEADER_FILL = new Paint();
SNOOZE_HEADER_FILL.setColor(Color.parseColor("#51b270")); //green


var context = app.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var CancelSnoozeDialog = android.view.View.extend({
	onDraw: function (canvas) {
		DIM_BACKGROUND.setAlpha(128); // 50% dimness
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
		canvas.drawRoundRect(LEFT, TOP, RIGHT, BOTTOM, CORNER_RADIUS, CORNER_RADIUS, SNOOZE_DIALOG_FILL);
		canvas.drawRoundRect(LEFT, TOP, RIGHT, HEADER_BOTTOM, CORNER_RADIUS, CORNER_RADIUS, SNOOZE_HEADER_FILL);

		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT - HEADER_HEIGHT) / 2 - 1 * ICON_RADIUS - 0.05*DIALOG_HEIGHT;
		var iconBottom = iconTop + 2 * ICON_RADIUS;
		// canvas.drawOval(iconLeft - 10, iconTop - 10, iconRight + 10, iconBottom + 10, ICON_BACK_FILL);
		canvas.drawOval(iconLeft, iconTop, iconRight, iconBottom, ICON_FILL);
		canvas.drawRect(LEFT, HEADER_BOTTOM - 0.01*DIALOG_HEIGHT, RIGHT, HEADER_BOTTOM + 0.01*DIALOG_HEIGHT, ICON_FILL);

		// add icon
		var icon_id = context.getResources().getIdentifier("ic_timer", "drawable", context.getPackageName());
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






var snoozeDialog;
var snoozeTitle;
var snoozeText;
var snoozePosButton;
var snoozeNegButton;
exports.showCancelSnoozeDialog = function (title, msg, pos, neg, posCallback, negCallback) {
	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    snoozeDialog = new CancelSnoozeDialog(context);
    windowManager.addView(snoozeDialog, viewParams);

     // add title
    var titleParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.1 * DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), TOP + 0.075*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    titleParams.gravity = Gravity.LEFT | Gravity.TOP;
    snoozeTitle = new TextView(context);
    snoozeTitle.setText(title);
    snoozeTitle.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    snoozeTitle.setTextColor(Color.WHITE);
    snoozeTitle.setHorizontallyScrolling(false);
    snoozeTitle.setGravity(Gravity.CENTER);
    windowManager.addView(snoozeTitle, titleParams);


    // add text
    var textParams = new WindowManager.LayoutParams(0.85 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
    	LEFT + 0.075 * DIALOG_WIDTH, TOP+0.22*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    snoozeText = new TextView(context);
    snoozeText.setText(msg);
    snoozeText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 9);
    snoozeText.setTextColor(Color.parseColor("#808080")); //grey
    snoozeText.setHorizontallyScrolling(false);
    snoozeText.setGravity(Gravity.CENTER);
    windowManager.addView(snoozeText, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.18 * DIALOG_HEIGHT, 0.1* SCREEN_WIDTH + 0.067 * DIALOG_WIDTH, 
    	TOP+0.75*DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    snoozePosButton = new Button(context);
    snoozePosButton.getBackground().setColorFilter(Color.parseColor("#51b270"), android.graphics.PorterDuff.Mode.MULTIPLY); //green
	snoozePosButton.setText(pos);
	snoozePosButton.setTextColor(Color.WHITE);
	snoozePosButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	        if (posCallback) {
	    		posCallback();
	    	}
	        exports.removeCancelSnoozeDialog();
	    }
	}));
    windowManager.addView(snoozePosButton, posButtonParams);


        // add positive button
    var negButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.18 * DIALOG_HEIGHT, 0.1 * SCREEN_WIDTH + 0.534 * DIALOG_WIDTH, 
    	TOP+0.75*DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    snoozeNegButton = new Button(context);
    snoozeNegButton.getBackground().setColorFilter(Color.parseColor("#d13b49"), android.graphics.PorterDuff.Mode.MULTIPLY); //red
	snoozeNegButton.setText(neg);
	snoozeNegButton.setTextColor(Color.WHITE);
	snoozeNegButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	        if (negCallback) {
	    		negCallback();
	    	}
	        exports.removeCancelSnoozeDialog();
	    }
	}));
    windowManager.addView(snoozeNegButton, negButtonParams);
}


exports.removeCancelSnoozeDialog = function () {
	if (snoozeDialog) {
		windowManager.removeView(snoozeDialog);
		snoozeDialog = undefined;
	}

	if (snoozeTitle) {
		windowManager.removeView(snoozeTitle);
		snoozeTitle = undefined;
	}

	if (snoozeText) {
		windowManager.removeView(snoozeText);
		snoozeText = undefined;
	}

	if (snoozePosButton) {
		windowManager.removeView(snoozePosButton);
		snoozePosButton = undefined;
	}

	if (snoozeNegButton) {
		windowManager.removeView(snoozeNegButton);
		snoozeNegButton = undefined;
	}
}

