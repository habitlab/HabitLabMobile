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
exports.showIntroDialog = function (titleMsg, msg, butt, callback) {
	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    dialog = new IntroDialog(context);
    windowManager.addView(dialog, viewParams);

     // add title
    var titleParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.15 * DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), TOP + 0.075*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
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
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
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
    	TOP+0.75*DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	buttonParams.gravity = Gravity.LEFT | Gravity.TOP;
    button = new Button(context);
    button.getBackground().setColorFilter(Color.parseColor("#2EC4B6"), android.graphics.PorterDuff.Mode.MULTIPLY); //turqouise
	button.setText(butt);
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





