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

var iconBkgd = [34, 0.81, 1];

var DIALOG_FILL = new Paint();
DIALOG_FILL.setColor(Color.WHITE); // default

var DIM_BACKGROUND = new Paint();
DIM_BACKGROUND.setColor(Color.BLACK);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.HSVToColor(iconBkgd));

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


var appCtx = app.android.context;

var textToDisplay = "DISPLAY TEXT";

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
		var icon_id = appCtx.getResources().getIdentifier("logo_bubbles", "drawable", appCtx.getPackageName());
		var bitmap = appCtx.getResources().getDrawable(icon_id).getBitmap();
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = 1.5 * ICON_RADIUS;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);
		
		var bitmapLeft = iconLeft + (iconRight - iconLeft) / 2 - newWidth / 2;
		var bitmapTop = iconTop + (iconBottom - iconTop) / 2 - newHeight * 9 / 16;

		canvas.drawBitmap(icon, bitmapLeft, bitmapTop, ICON_FILL);
	}
});



function showPosNegDialogOverlay(context, msg, pos, neg, posCallback, negCallback) {
	var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    var view = new DialogView(context);
    windowManager.addView(view, viewParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.65 * DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 0.36 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    var textView = new TextView(context);
    textView.setText(msg);
    textView.setTextSize(TypedValue.COMPLEX_UNIT_PT, 12);
    textView.setTextColor(Color.BLACK);
    textView.setHorizontallyScrolling(false);
    textView.setGravity(Gravity.CENTER);
    windowManager.addView(textView, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.35 * DIALOG_WIDTH, 
    	0.3 * DIALOG_HEIGHT, 0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 
    	0.35 * SCREEN_HEIGHT + 0.6 * DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL, PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    var posButton = new Button(context);
	posButton.setText(pos);
	posButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (posCallback) {
	    		posCallback();
	    	}
	        removeViews();
	    }
	}));
    windowManager.addView(posButton, posButtonParams);

    // add positive button
    var negButtonParams = new WindowManager.LayoutParams(0.35 * DIALOG_WIDTH, 
    	0.3 * DIALOG_HEIGHT, 0.1 * SCREEN_WIDTH + 0.55 * DIALOG_WIDTH, 
    	0.35 * SCREEN_HEIGHT + 0.6 * DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL, PixelFormat.TRANSLUCENT);
   	negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    var negButton = new Button(context);
	negButton.setText(neg);
	negButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (negCallback) {
	    		negCallback();
	    	}
	        removeViews();
	    }
	}));
    windowManager.addView(negButton, negButtonParams);

    var removeViews = function () {
    	windowManager.removeView(view);
    	windowManager.removeView(textView);
	    windowManager.removeView(posButton);
	    windowManager.removeView(negButton);
    }
}

module.exports = {
	showPosNegDialogOverlay
};


