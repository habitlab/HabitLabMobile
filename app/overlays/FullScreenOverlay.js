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


var appCtx = app.android.context;

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
		var icon_id = appCtx.getResources().getIdentifier("ic_habitlab_white", "drawable", appCtx.getPackageName());
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



function showOverlay(context, title, msg, pos, neg, posCallback, negCallback) {
	var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

	// add view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    var view = new DialogView(context);
    windowManager.addView(view, viewParams);


    // add title
    var textParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, 0.2 * SCREEN_HEIGHT,
    	0.1 * SCREEN_WIDTH, 0.275 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    var titleView = new TextView(context);
    titleView.setText(title);
    titleView.setTextSize(TypedValue.COMPLEX_UNIT_PT, 14);
    titleView.setTextColor(Color.BLACK);
    titleView.setHorizontallyScrolling(false);
    titleView.setGravity(Gravity.CENTER);
    windowManager.addView(titleView, textParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, 0.4 * SCREEN_HEIGHT,
    	0.1 * SCREEN_WIDTH, 0.3 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    var textView = new TextView(context);
    textView.setText(msg);
    textView.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    textView.setTextColor(Color.BLACK);
    textView.setHorizontallyScrolling(false);
    textView.setGravity(Gravity.CENTER);
    windowManager.addView(textView, textParams);

    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.35 * SCREEN_WIDTH, 
    	0.1 * SCREEN_HEIGHT, 0.1 * SCREEN_WIDTH, 0.65 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
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
    var negButtonParams = new WindowManager.LayoutParams(0.35 * SCREEN_WIDTH, 
    	0.1 * SCREEN_HEIGHT, 0.55 * SCREEN_WIDTH, 0.65 * SCREEN_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
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
    	windowManager.removeView(titleView);
	    windowManager.removeView(posButton);
	    windowManager.removeView(negButton);
    }
}

module.exports = {
	showOverlay
};


