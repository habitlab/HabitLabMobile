var app = require("application");
var permissions = require('~/util/PermissionUtil');
//This is a full screen overlay under tabs, with a dialog in the center. Used in target onboarding.

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
var DIALOG_HEIGHT = 0.3 * SCREEN_HEIGHT;
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





/******************************
 *     CANCEL PAINTS            *                           
 ******************************/

var DIALOG_FILL = new Paint();
DIALOG_FILL.setColor(Color.WHITE); // default

var HEADER_FILL = new Paint();
HEADER_FILL.setColor(Color.parseColor("#ffad74")); //orange


var context = app.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var IntroDialog = android.view.View.extend({
	onDraw: function (canvas) {
		DIM_BACKGROUND.setAlpha(128); // 50% dimness
		DIALOG_FILL.setAlpha = (170);

		canvas.drawRect(0, 0.145*SCREEN_HEIGHT, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
		canvas.drawRoundRect(LEFT, TOP, RIGHT, BOTTOM, CORNER_RADIUS, CORNER_RADIUS, DIALOG_FILL);
		canvas.drawRoundRect(LEFT, TOP, RIGHT, HEADER_BOTTOM, CORNER_RADIUS, CORNER_RADIUS, HEADER_FILL);

		canvas.drawRect(LEFT, HEADER_BOTTOM - 0.01*DIALOG_HEIGHT, RIGHT, HEADER_BOTTOM + 0.01*DIALOG_HEIGHT, DIALOG_FILL);
	}
});




var dialog;
var title;
var text;
var button;
var lastX;
var lastY;
//Redirect occurs when the user taps outside of the overlay area. Call back occurs when the user presses the button
exports.showIntroDialog = function (titleMsg, msg, butt, callback, redirect) {
	if (permissions.checkSystemOverlayPermission()) {
		// add whole screen view
		var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
			WindowManager.LayoutParams.MATCH_PARENT, permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE | WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH, 
			PixelFormat.TRANSLUCENT);
		viewParams.gravity = Gravity.LEFT | Gravity.TOP;
		dialog = new IntroDialog(context);
		dialog.setOnTouchListener(new android.view.View.OnTouchListener({
			onTouch: function (v, event) {
				var action = event.getAction();
				var currentX = event.getX();
				var currentY = event.getY();
				//If taps above the dialog height
				if(currentY < 0.145 * SCREEN_HEIGHT){
					if (redirect) {
						redirect();
					}
					exports.removeIntroDialog();
				}
				if (action === android.view.MotionEvent.ACTION_DOWN) {
					lastX = currentX;
					lastY = currentY;
				} else if (action === android.view.MotionEvent.ACTION_UP) {
					//swipe left to change tab
					if (currentX - lastX > (0.05 * SCREEN_WIDTH)) {
						if (redirect) {
							redirect();
						}
						exports.removeIntroDialog();
					}
				}
				return false;
			}

				

		}));
		windowManager.addView(dialog, viewParams);

		// add title
		var titleParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.15 * DIALOG_HEIGHT,
			0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), TOP + 0.075*DIALOG_HEIGHT, 
			permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		titleParams.gravity = Gravity.LEFT | Gravity.TOP;
		title = new TextView(context);
		title.setText(titleMsg);
		title.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
		title.setTextColor(Color.WHITE);
		title.setHorizontallyScrolling(false);
		title.setGravity(Gravity.CENTER);
		windowManager.addView(title, titleParams);


		// add text
		var textParams = new WindowManager.LayoutParams(0.85 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
			LEFT + 0.075 * DIALOG_WIDTH, TOP+0.22*DIALOG_HEIGHT, 
			permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		textParams.gravity = Gravity.LEFT | Gravity.TOP;
		text = new TextView(context);
		text.setText(msg);
		text.setTextSize(TypedValue.COMPLEX_UNIT_PT, 9);
		text.setTextColor(Color.parseColor("#808080")); //grey
		text.setHorizontallyScrolling(false);
		text.setGravity(Gravity.CENTER);
		windowManager.addView(text, textParams);

		// add positive button
		var buttonParams = new WindowManager.LayoutParams(0.6 * DIALOG_WIDTH, 
			0.2 * DIALOG_HEIGHT, 0.1* SCREEN_WIDTH + 0.2 * DIALOG_WIDTH, 
			TOP+0.75*DIALOG_HEIGHT, permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		buttonParams.gravity = Gravity.LEFT | Gravity.TOP;
		button = new Button(context);
		button.getBackground().setColorFilter(Color.parseColor("#2EC4B6"), android.graphics.PorterDuff.Mode.MULTIPLY); //turqouise
		button.setText(butt);
		button.setVisibility(android.view.Visible);
		button.setTextColor(Color.WHITE);
		button.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				if (callback) {
					callback();
				}
				exports.removeIntroDialog();
			}
		}));
		windowManager.addView(button, buttonParams);
	} else {
		permissions.launchSystemOverlayIntent();
	}
	
  
}


exports.removeIntroDialog = function () {
	if (dialog) {
		windowManager.removeView(dialog);
		dialog = undefined;
	}

	if (title) {
		windowManager.removeView(title);
		title = undefined;
	}

	if (text) {
		windowManager.removeView(text);
		text = undefined;
	}

	if (button) {
		windowManager.removeView(button);
		button = undefined;
	}
}


// CONSTANTS

var TARGET_HEIGHT = 0.4 * SCREEN_HEIGHT;
var TARGETTOP = (SCREEN_HEIGHT - TARGET_HEIGHT) / 2;
var TARGETBOTTOM = TARGETTOP + TARGET_HEIGHT;
var ICON_RADIUS = 0.08 * DIALOG_WIDTH;
var CORNER_RADIUS = 15;

var HEADER_HEIGHT = 0.3*TARGET_HEIGHT;
var HEADER_BOTTOM = TARGETTOP + HEADER_HEIGHT;

var DIM_BACKGROUND = new Paint();
DIM_BACKGROUND.setColor(Color.BLACK);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor("#ffad74")); //orange




var TARGET_DIALOG_FILL = new Paint();
TARGET_DIALOG_FILL.setColor(Color.WHITE); // default


var TARGET_HEADER_FILL = new Paint();
TARGET_HEADER_FILL.setColor(Color.parseColor("#FF9F1C")); //yellow


var context = app.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var TargetEnableDialog = android.view.View.extend({
	onDraw: function (canvas) {
		DIM_BACKGROUND.setAlpha(128); // 50% dimness
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
		canvas.drawRoundRect(LEFT, TARGETTOP, RIGHT, TARGETBOTTOM, CORNER_RADIUS, CORNER_RADIUS, TARGET_DIALOG_FILL);
		canvas.drawRoundRect(LEFT, TARGETTOP, RIGHT, HEADER_BOTTOM, CORNER_RADIUS, CORNER_RADIUS, TARGET_HEADER_FILL);

		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT - HEADER_HEIGHT) / 2 - 1 * ICON_RADIUS - 0.05*TARGET_HEIGHT;
		var iconBottom = iconTop + 2 * ICON_RADIUS;
		// canvas.drawOval(iconLeft - 10, iconTop - 10, iconRight + 10, iconBottom + 10, ICON_BACK_FILL);
		canvas.drawOval(iconLeft, iconTop, iconRight, iconBottom, ICON_FILL);
		canvas.drawRect(LEFT, HEADER_BOTTOM - 0.01*TARGET_HEIGHT, RIGHT, HEADER_BOTTOM + 0.01*TARGET_HEIGHT, ICON_FILL);

		// add icon
		var icon_id = context.getResources().getIdentifier("ic_unlock", "drawable", context.getPackageName());
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




var targetDialog;
var targetTitle;
var targetText;
var targetPosButton;
var targetNegButton;
exports.showTargetEnableOverlay = function (title, msg, pos, neg, posCallback, negCallback) {
	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, permissions.getOverlayType(),
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    targetDialog = new TargetEnableDialog(context);
    windowManager.addView(targetDialog, viewParams);

     // add title
    var titleParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.1 * TARGET_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), TARGETTOP + 0.075*TARGET_HEIGHT, 
    	permissions.getOverlayType(), 0, PixelFormat.TRANSLUCENT);
    titleParams.gravity = Gravity.LEFT | Gravity.TOP;
    targetTitle = new TextView(context);
    targetTitle.setText(title);
    targetTitle.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    targetTitle.setTextColor(Color.WHITE);
    targetTitle.setHorizontallyScrolling(false);
    targetTitle.setGravity(Gravity.CENTER);
    windowManager.addView(targetTitle, titleParams);


    // add text
    var textParams = new WindowManager.LayoutParams(0.85 * DIALOG_WIDTH, 0.65 * TARGET_HEIGHT,
    	LEFT + 0.075 * DIALOG_WIDTH, TARGETTOP+0.22*TARGET_HEIGHT, 
    	permissions.getOverlayType(), 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    targetText = new TextView(context);
    targetText.setText(msg);
    targetText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 9);
    targetText.setTextColor(Color.parseColor("#808080")); //grey
    targetText.setHorizontallyScrolling(false);
    targetText.setGravity(Gravity.CENTER);
    windowManager.addView(targetText, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.18 * TARGET_HEIGHT, 0.1* SCREEN_WIDTH + 0.067 * DIALOG_WIDTH, 
    	TARGETTOP+0.75*TARGET_HEIGHT, permissions.getOverlayType(),
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    targetPosButton = new Button(context);
    targetPosButton.getBackground().setColorFilter(Color.parseColor("#51b270"), android.graphics.PorterDuff.Mode.MULTIPLY); //green
	targetPosButton.setText(pos);
	targetPosButton.setTextColor(Color.WHITE);
	targetPosButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	        if (posCallback) {
	    		posCallback();
	    	}
	        exports.removeTargetDialog();
	    }
	}));
    windowManager.addView(targetPosButton, posButtonParams);


        // add positive button
    var negButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.18 * TARGET_HEIGHT, 0.1 * SCREEN_WIDTH + 0.534 * DIALOG_WIDTH, 
    	TARGETTOP+0.75*TARGET_HEIGHT, permissions.getOverlayType(),
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    targetNegButton = new Button(context);
    targetNegButton.getBackground().setColorFilter(Color.parseColor("#d13b49"), android.graphics.PorterDuff.Mode.MULTIPLY); //red
	targetNegButton.setText(neg);
	targetNegButton.setTextColor(Color.WHITE);
	targetNegButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	        if (negCallback) {
	    		negCallback();
	    	}
	        exports.removeTargetDialog();
	    }
	}));
    windowManager.addView(targetNegButton, negButtonParams);
}


exports.removeTargetDialog = function () {
	if (targetDialog) {
		windowManager.removeView(targetDialog);
		targetDialog = undefined;
	}

	if (targetTitle) {
		windowManager.removeView(targetTitle);
		targetTitle = undefined;
	}

	if (targetText) {
		windowManager.removeView(targetText);
		targetText = undefined;
	}

	if (targetPosButton) {
		windowManager.removeView(targetPosButton);
		targetPosButton = undefined;
	}

	if (targetNegButton) {
		windowManager.removeView(targetNegButton);
		targetNegButton = undefined;
	}
}




