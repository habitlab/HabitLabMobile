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


/******************************
 *          PAINTS            *                           
 ******************************/

var iconBkgd = [34, 0.81, 1];
var headerBkgd = [174, .77, .77];

var BACKGROUND = new Paint();
BACKGROUND.setColor(Color.WHITE);

var HEADER = new Paint();
HEADER.setColor(Color.HSVToColor(headerBkgd));

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.HSVToColor(iconBkgd));

// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var ICON_RADIUS = 0.075 * SCREEN_HEIGHT;


var context = application.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, BACKGROUND);
		canvas.drawRect(0, 0, SCREEN_WIDTH, 0.225 * SCREEN_HEIGHT, HEADER);

		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT) * 0.15;
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
var overlayNegButton;
exports.showOverlay = function (title, msg, pos, neg, posCallback, negCallback) {

	// add view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayView = new DialogView(context);
    windowManager.addView(overlayView, viewParams);


    // add title
    var titleParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, 0.2 * SCREEN_HEIGHT,
    	0.1 * SCREEN_WIDTH, 0.275 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    titleParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayTitle = new TextView(context);
    overlayTitle.setText(title);
    overlayTitle.setTextSize(TypedValue.COMPLEX_UNIT_PT, 14);
    overlayTitle.setTextColor(Color.BLACK);
    overlayTitle.setHorizontallyScrolling(false);
    overlayTitle.setGravity(Gravity.CENTER);
    windowManager.addView(overlayTitle, titleParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, 0.4 * SCREEN_HEIGHT,
    	0.1 * SCREEN_WIDTH, 0.3 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayText = new TextView(context);
    overlayText.setText(msg);
    overlayText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    overlayText.setTextColor(Color.BLACK);
    overlayText.setHorizontallyScrolling(false);
    overlayText.setGravity(Gravity.CENTER);
    windowManager.addView(overlayText, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.35 * SCREEN_WIDTH, 
    	0.1 * SCREEN_HEIGHT, 0.1 * SCREEN_WIDTH, 0.65 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL, PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayPosButton = new Button(context);
	overlayPosButton.setText(pos);
	overlayPosButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (posCallback) {
	    		posCallback();
	    	}
	        exports.removeOverlay();
	    }
	}));
    windowManager.addView(overlayPosButton, posButtonParams);

    // add positive button
    var negButtonParams = new WindowManager.LayoutParams(0.35 * SCREEN_WIDTH, 
    	0.1 * SCREEN_HEIGHT, 0.55 * SCREEN_WIDTH, 0.65 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL, PixelFormat.TRANSLUCENT);
   	negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    overlayNegButton = new Button(context);
	overlayNegButton.setText(neg);
	overlayNegButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (negCallback) {
	    		negCallback();
	    	}
	        exports.removeOverlay();
	    }
	}));
    windowManager.addView(overlayNegButton, negButtonParams);
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

	if (overlayNegButton) {
		windowManager.removeView(overlayNegButton);
		overlayNegButton = undefined;
	}
}

