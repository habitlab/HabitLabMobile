var application = require("application");

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
var ProgressBar = android.widget.ProgressBar;
var LayoutParams = android.view.ViewGroup.LayoutParams;


/******************************
 *          PAINTS            *                           
 ******************************/

// var fillPairs = [
// 	{bkgd: "#FFA730", hdr: "#2EC4B6", pos: "#2EC4B6", neg: "#011627"}
// ]

//Lighter red for main rectange in center
var MAIN = new Paint();
MAIN.setColor(Color.parseColor("#db646f"));

//Darker red for header and footer
var BACKGROUND = new Paint();
BACKGROUND.setColor(Color.parseColor("#d13b49"));

//Orange for icon fill 
var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor("#ffad74"));


// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var ICON_RADIUS = 0.075 * SCREEN_HEIGHT;


var context = application.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		//drawRect(float left, float top, float right, float bottom, Paint paint)
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, BACKGROUND);
		canvas.drawRect(0, 0.2*SCREEN_HEIGHT, SCREEN_WIDTH, 0.8* SCREEN_HEIGHT, MAIN);

		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT) * 0.125;
		var iconBottom = iconTop + 2 * ICON_RADIUS;
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


var overlayView;
var overlayTitle;
var overlayText;
var overlayPosButton;
var overlayLink;
var progBar;
var labelText;

exports.showOverlay = function (title, msg, pos, prog, max, posCallback, negCallback) {
	// add view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayView = new DialogView(context);
    windowManager.addView(overlayView, viewParams);


    // add title
    var titleParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, LayoutParams.WRAP_CONTENT,
    	0.1 * SCREEN_WIDTH, 0.3 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    titleParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayTitle = new TextView(context);
    overlayTitle.setText(title);
    overlayTitle.setTextSize(TypedValue.COMPLEX_UNIT_PT, 14);
    overlayTitle.setTextColor(Color.WHITE);
    overlayTitle.setHorizontallyScrolling(false);
    overlayTitle.setGravity(Gravity.CENTER);
    windowManager.addView(overlayTitle, titleParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, LayoutParams.WRAP_CONTENT,
    	0.1 * SCREEN_WIDTH, 0.435 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayText = new TextView(context);
    overlayText.setText(msg);
    overlayText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    overlayText.setTextColor(Color.WHITE);
    overlayText.setHorizontallyScrolling(false);
    overlayText.setGravity(Gravity.CENTER);
    windowManager.addView(overlayText, textParams);

    //Progress bar 
    var progParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, LayoutParams.WRAP_CONTENT,
    	0, 0.1*SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    progBar = new ProgressBar(context, null, android.R.attr.progressBarStyleHorizontal);
    progBar.setMax(max);
    progBar.setProgress(prog);
    windowManager.addView(progBar, progParams);

    //Time label
    var labelParams = new WindowManager.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT,
    	0.35*SCREEN_WIDTH, 0.12 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    // labelParams.gravity = Gravity.RIGHT | Gravity.TOP;
    labelText = new TextView(context);
    labelText.setText(max + " mins");
    labelText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 5);
    labelText.setTextColor(Color.WHITE);
    labelText.setHorizontallyScrolling(false);
    // labelText.setGravity(Gravity.CENTER);
    windowManager.addView(labelText, labelParams);

    //Add exit button
    var linkParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, LayoutParams.WRAP_CONTENT,
    	0.1 * SCREEN_WIDTH, 0.75 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    linkParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayLink = new TextView(context);
    overlayLink.setText("Turn Off Lockdown Mode");
    overlayLink.setTextSize(TypedValue.COMPLEX_UNIT_PT, 5);
    overlayLink.setTextColor(Color.WHITE);
    overlayLink.setHorizontallyScrolling(false);
    overlayLink.setGravity(Gravity.CENTER);
	overlayLink.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (negCallback) {
	    		negCallback();
	    	}
	        // exports.removeOverlay();
	    }
	}));
    windowManager.addView(overlayLink, linkParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.6 * SCREEN_WIDTH, 
    	0.08 * SCREEN_HEIGHT, 0.2 * SCREEN_WIDTH, 0.65 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayPosButton = new Button(context);
	overlayPosButton.setText(pos);
	overlayPosButton.setTextColor(Color.parseColor("#d13b49"));
	overlayPosButton.getBackground().setColorFilter(Color.parseColor("#eeeeeeff"), android.graphics.PorterDuff.Mode.MULTIPLY);
	overlayPosButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (posCallback) {
	    		posCallback();
	    	}
	        exports.removeOverlay();
	    }
	}));
    windowManager.addView(overlayPosButton, posButtonParams);

    
}

exports.removeOverlay = function () {
	if (overlayView) {
		windowManager.removeView(overlayView);
		overlayView = undefined;
	}

	if (overlayTitle) {
		windowManager.removeView(overlayTitle);
		overlayTitle = undefined;
	}

	if (overlayText) {
		windowManager.removeView(overlayText);
		overlayText = undefined;
	}

	if (overlayPosButton) {
		windowManager.removeView(overlayPosButton);
		overlayPosButton = undefined;
	}

	if (overlayLink) {
		windowManager.removeView(overlayLink);
		overlayLink = undefined;
	}

	if (progBar) {
		windowManager.removeView(progBar);
		progBar = undefined;
	}

	if (labelText) {
		windowManager.removeView(labelText);
		labelText = undefined;
	}
}

