var app = require("application");
var timer = require("timer");

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

 var timerFill = [207, 0.97, 0.15];
 var timerBorder = [34, 0.81, 1];


var TIMER_FILL = new Paint();
TIMER_FILL.setColor(Color.WHITE); // default

var BORDER = new Paint();
BORDER.setColor(Color.HSVToColor(timerBorder));
BORDER.setStyle(Paint.Style.STROKE);
BORDER.setStrokeWidth(15.0);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.HSVToColor(timerBorder));



// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var TIMER_WIDTH = 0.47 * SCREEN_WIDTH;
var TIMER_HEIGHT = 0.09 * SCREEN_HEIGHT;
var CORNER_RADIUS = 15;
var OFFSET = 0.05 * SCREEN_WIDTH;

// Custom DialogView 
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		// timer box
		canvas.drawRect(SCREEN_WIDTH - TIMER_WIDTH - OFFSET, SCREEN_HEIGHT - TIMER_HEIGHT - 2 * OFFSET, 
			SCREEN_WIDTH - OFFSET, SCREEN_HEIGHT - 2*OFFSET, TIMER_FILL);
		canvas.drawRoundRect(SCREEN_WIDTH - TIMER_WIDTH - OFFSET, SCREEN_HEIGHT - TIMER_HEIGHT - 2 * OFFSET, 
			SCREEN_WIDTH - OFFSET, SCREEN_HEIGHT - 2*OFFSET, CORNER_RADIUS, CORNER_RADIUS, BORDER);

		// icon box
		canvas.drawRect(SCREEN_WIDTH - TIMER_WIDTH - OFFSET, SCREEN_HEIGHT - TIMER_HEIGHT - 2 * OFFSET, 
			SCREEN_WIDTH - TIMER_WIDTH - OFFSET + TIMER_HEIGHT, SCREEN_HEIGHT - 2 * OFFSET, ICON_FILL);

		// add icon
		var icon_id = app.android.context.getResources().getIdentifier("ic_habitlab_white", 
			"drawable", app.android.context.getPackageName());
		var bitmap = app.android.context.getResources().getDrawable(icon_id).getBitmap();
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = 0.75 * TIMER_HEIGHT;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);

		var bitmapLeft = SCREEN_WIDTH - TIMER_WIDTH - OFFSET + (TIMER_HEIGHT - newWidth - 7.5) / 2;
		var bitmapTop = SCREEN_HEIGHT - TIMER_HEIGHT - 2 * OFFSET + (TIMER_HEIGHT - newHeight - 7.5) / 2;

		canvas.drawBitmap(icon, bitmapLeft, bitmapTop, new Paint());
	},


	onTouchEvent: function (e) {
		console.warn("here");
		console.warn(e.getAction());
		return true;
	}
});

var timerID;
var textView;
var view;

exports.showCountUpTimer = function(context) {
	var time = 0;
	var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

	// add timer in bottom right
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY,
		WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    view = new DialogView(context);
    windowManager.addView(view, viewParams);

    // add timer text    
    textView = new TextView(context);
    textView.setText("00:00:00");
    textView.setTextSize(TypedValue.COMPLEX_UNIT_PT, 12);
    textView.setTextColor(Color.BLACK);
    textView.setHorizontallyScrolling(false);
    textView.setGravity(Gravity.CENTER);
    textView.setWidth(TIMER_WIDTH - TIMER_HEIGHT);
    textView.setHeight(TIMER_HEIGHT);

    var textParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.WRAP_CONTENT, 
			WindowManager.LayoutParams.WRAP_CONTENT, SCREEN_WIDTH - TIMER_WIDTH - OFFSET + TIMER_HEIGHT, 
	    	SCREEN_HEIGHT - TIMER_HEIGHT - 2 * OFFSET, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY, 0, 
	    	PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
   	windowManager.addView(textView, textParams);


    timerID = timer.setInterval(() => {
	    time++;

	    var hours = Math.floor(time / 3600);
	    time = time % 3600;
	    var minutes = Math.floor(time / 60);
	    var seconds = time % 60;

	    hours = "0" + hours;
	    minutes = "0" + minutes;
	    seconds = "0" + seconds;

	    hours = hours.substr(hours.length - 2, 2);
	    minutes = minutes.substr(minutes.length - 2, 2);
	    seconds = seconds.substr(seconds.length - 2, 2); 

	    textView.setText(hours + ":" + minutes + ":" + seconds);
	}, 1000);
}


exports.dismissTimer = function (context) {
	var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
	if (textView) {
		windowManager.removeView(textView);
		textView = null;
	}

	if (view) {
		windowManager.removeView(view);
		view = null;
	}

	if (timerID) {
		timer.clearInterval(timerID);
		timerID = 0;
	}
}

