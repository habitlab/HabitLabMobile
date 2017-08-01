var application = require("application");
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


// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var TIMER_WIDTH = 0.47 * SCREEN_WIDTH;
var TIMER_HEIGHT = 0.09 * SCREEN_HEIGHT;
var CORNER_RADIUS = 15;
var OFFSET = 0.05 * SCREEN_WIDTH;
var BORDER_WIDTH = 0.01 * TIMER_WIDTH;


/******************************
 *          PAINTS            *                           
 ******************************/

var timerFills = ["#FFA730", "#E71D36", "#2EC4B6", "#72e500", "#011627"];

var TIMER_FILL = new Paint();
TIMER_FILL.setColor(Color.WHITE); // default

var BORDER = new Paint();
BORDER.setColor(Color.parseColor(timerFills[0]));
BORDER.setStyle(Paint.Style.STROKE);
BORDER.setStrokeWidth(BORDER_WIDTH);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor(timerFills[0]));


var context = application.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);


// Custom DialogView 
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		// timer box
		canvas.drawRect(BORDER_WIDTH, BORDER_WIDTH, TIMER_WIDTH - BORDER_WIDTH, 
			TIMER_HEIGHT - BORDER_WIDTH, TIMER_FILL);
		canvas.drawRect(BORDER_WIDTH, BORDER_WIDTH, TIMER_WIDTH - BORDER_WIDTH, 
			TIMER_HEIGHT - BORDER_WIDTH, BORDER);

		// icon box
		canvas.drawRect(BORDER_WIDTH, BORDER_WIDTH, TIMER_HEIGHT, 
			TIMER_HEIGHT - BORDER_WIDTH, ICON_FILL);

		// add icon
		var icon_id = context.getResources().getIdentifier("ic_habitlab_white", 
			"drawable", context.getPackageName());
		var bitmap = context.getResources().getDrawable(icon_id).getBitmap();
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = 0.75 * TIMER_HEIGHT;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);

		var bitmapLeft = (TIMER_HEIGHT - newWidth) / 2;
		var bitmapTop = (TIMER_HEIGHT - newHeight) / 2;

		canvas.drawBitmap(icon, bitmapLeft, bitmapTop, new Paint());
	}
});


var timerID;
var textView;
var view;
exports.showCountUpTimer = function() {
	changeTimerColor();	
	var time = 0;

	var timerOpen = true;
	var startX = SCREEN_WIDTH - TIMER_WIDTH;
	var startY = SCREEN_HEIGHT - TIMER_HEIGHT;
	var lastX;
	var lastY;

	// layout params for wrapped content overlay (background clickable)
	var startParams = new WindowManager.LayoutParams(TIMER_WIDTH, TIMER_HEIGHT,
		startX, startY, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	startParams.gravity = Gravity.LEFT | Gravity.TOP;

	// add timer in bottom left corner
    view = new DialogView(context);
    windowManager.addView(view, startParams);

    // add timer text    
    textView = new TextView(context);
    textView.setText("00:00");
    textView.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    textView.setTextColor(Color.BLACK);
    textView.setHorizontallyScrolling(false);
    textView.setGravity(Gravity.CENTER);
    textView.setWidth(TIMER_WIDTH - TIMER_HEIGHT);
    textView.setHeight(TIMER_HEIGHT);

    var textParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.WRAP_CONTENT, 
			WindowManager.LayoutParams.WRAP_CONTENT, SCREEN_WIDTH - TIMER_WIDTH - BORDER_WIDTH + TIMER_HEIGHT, 
	    	SCREEN_HEIGHT - TIMER_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY, 
	    	WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
   	windowManager.addView(textView, textParams);


   	view.setOnTouchListener(new android.view.View.OnTouchListener({
		onTouch: function (v, event) {
			var action = event.getAction();
			var currentX = event.getX();
			var currentY = event.getY();

			if (action === android.view.MotionEvent.ACTION_DOWN) {
				lastX = currentX;
				lastY = currentY;
			} else if (action === android.view.MotionEvent.ACTION_UP) {
				if (currentX === lastX && currentY === lastY && currentX > 0 && currentX < TIMER_HEIGHT
					&& currentY > 0 && currentY < TIMER_HEIGHT) {
					if (timerOpen) {
						textView.setVisibility(android.view.View.INVISIBLE);
						startParams.width = TIMER_HEIGHT;
						startParams.x = startParams.x === 0 ? 0 : SCREEN_WIDTH - TIMER_HEIGHT;
						timerOpen = false;
					} else {
						startParams.width = TIMER_WIDTH;
						startParams.x = startParams.x === 0 ? 0 : SCREEN_WIDTH - TIMER_WIDTH;
						timerOpen = true;
						textView.setVisibility(android.view.View.VISIBLE);
					}
				} else {
					// swipe
					if (currentX - lastX < (-0.05 * SCREEN_WIDTH)) {
						startParams.x = 0; 
						textParams.x = TIMER_HEIGHT - BORDER_WIDTH;
					} else if (currentX - lastX > (0.05 * SCREEN_WIDTH)) {
						startParams.x = SCREEN_WIDTH - startParams.width;
						textParams.x = SCREEN_WIDTH - TIMER_WIDTH - BORDER_WIDTH + TIMER_HEIGHT;
					}

					if (currentY - lastY < (-0.05 * SCREEN_HEIGHT)) {
						startParams.y = 0;
						textParams.y = 0;
					} else if (currentY - lastY > (0.05 * SCREEN_HEIGHT)) {
						startParams.y = SCREEN_HEIGHT - TIMER_HEIGHT;
						textParams.y = SCREEN_HEIGHT - TIMER_HEIGHT;
					}
				}

				windowManager.updateViewLayout(v, startParams);
				windowManager.updateViewLayout(textView, textParams);
			}

			return true;
		}
	})); 


    timerID = timer.setInterval(() => {
	    time++;

	    var minutes = Math.floor(time / 60);
	    var seconds = time % 60;

	    if (minutes === 5) {
	    	textView.setTextColor(Color.parseColor("#FF7538"));
	    } else if (minutes === 10) {
	    	textView.setTextColor(Color.parseColor("#C41E3A"));
	    } 

	    minutes = "0" + minutes;
	    seconds = "0" + seconds;

	    minutes = minutes.substr(minutes.length - 2, 2);
	    seconds = seconds.substr(seconds.length - 2, 2); 

	    textView.setText(minutes + ":" + seconds);
	}, 1000);
}


exports.showCountDownTimer = function (timeInMins, callback) {
	changeTimerColor();
	var time = timeInMins * 60;

	var timerOpen = true;
	var startX = SCREEN_WIDTH - TIMER_WIDTH;
	var startY = SCREEN_HEIGHT - TIMER_HEIGHT;
	var lastX;
	var lastY;

	var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

	// layout params for wrapped content overlay (background clickable)
	var startParams = new WindowManager.LayoutParams(TIMER_WIDTH, TIMER_HEIGHT,
		startX, startY, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
	startParams.gravity = Gravity.LEFT | Gravity.TOP;

	// add timer in bottom left corner
    view = new DialogView(context);
    windowManager.addView(view, startParams);

    // add timer text    
    textView = new TextView(context);

    var initMins = Math.floor(time / 60);
	var initSecs = time % 60;

    initMins = "0" + initMins;
    initSecs = "0" + initSecs;

    initMins = initMins.substr(initMins.length - 2, 2);
    initSecs = initSecs.substr(initSecs.length - 2, 2); 

    textView.setText(initMins + ":" + initSecs);
    textView.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    textView.setTextColor(Color.BLACK);
    textView.setHorizontallyScrolling(false);
    textView.setGravity(Gravity.CENTER);
    textView.setWidth(TIMER_WIDTH - TIMER_HEIGHT);
    textView.setHeight(TIMER_HEIGHT);

    var textParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.WRAP_CONTENT, 
			WindowManager.LayoutParams.WRAP_CONTENT, SCREEN_WIDTH - TIMER_WIDTH - BORDER_WIDTH + TIMER_HEIGHT, 
	    	SCREEN_HEIGHT - TIMER_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY,
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
	    	PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
   	windowManager.addView(textView, textParams);


   	view.setOnTouchListener(new android.view.View.OnTouchListener({
		onTouch: function (v, event) {
			var action = event.getAction();
			var currentX = event.getX();
			var currentY = event.getY();

			if (action === android.view.MotionEvent.ACTION_DOWN) {
				lastX = currentX;
				lastY = currentY;
			} else if (action === android.view.MotionEvent.ACTION_UP) {
				if (currentX === lastX && currentY === lastY && currentX > 0 && currentX < TIMER_HEIGHT
					&& currentY > 0 && currentY < TIMER_HEIGHT) {
					if (timerOpen) {
						textView.setVisibility(android.view.View.INVISIBLE);
						startParams.width = TIMER_HEIGHT;
						startParams.x = startParams.x === 0 ? 0 : SCREEN_WIDTH - TIMER_HEIGHT;
						timerOpen = false;
					} else {
						startParams.width = TIMER_WIDTH;
						startParams.x = startParams.x === 0 ? 0 : SCREEN_WIDTH - TIMER_WIDTH;
						timerOpen = true;
						textView.setVisibility(android.view.View.VISIBLE);
					}
				} else {
					// swipe
					if (currentX - lastX < (-0.05 * SCREEN_WIDTH)) {
						startParams.x = 0; 
						textParams.x = TIMER_HEIGHT - BORDER_WIDTH;
					} else if (currentX - lastX > (0.05 * SCREEN_WIDTH)) {
						startParams.x = SCREEN_WIDTH - startParams.width;
						textParams.x = SCREEN_WIDTH - TIMER_WIDTH - BORDER_WIDTH + TIMER_HEIGHT;
					}

					if (currentY - lastY < (-0.05 * SCREEN_HEIGHT)) {
						startParams.y = 0;
						textParams.y = 0;
					} else if (currentY - lastY > (0.05 * SCREEN_HEIGHT)) {
						startParams.y = SCREEN_HEIGHT - TIMER_HEIGHT;
						textParams.y = SCREEN_HEIGHT - TIMER_HEIGHT;
					}
				}

				windowManager.updateViewLayout(v, startParams);
				windowManager.updateViewLayout(textView, textParams);
			}

			return true;
		}
	})); 


    timerID = timer.setInterval(() => {
	    time--;

	    var minutes = Math.floor(time / 60);
	    var seconds = time % 60;

	    if (minutes === 0 && seconds === 0) {
			exports.dismissTimer();
			if (callback) { callback(); }
			return;
	    }

	    if (time === 60) {
	    	textView.setTextColor(Color.parseColor("#FF7538"));
	    } else if (time === 30) {
	    	textView.setTextColor(Color.parseColor("#C41E3A"));
	    } 

	    minutes = "0" + minutes;
	    seconds = "0" + seconds;

	    minutes = minutes.substr(minutes.length - 2, 2);
	    seconds = seconds.substr(seconds.length - 2, 2); 

	    textView.setText(minutes + ":" + seconds);
	}, 1000);
}

exports.dismissTimer = function () {
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



function changeTimerColor() {
	var index = Math.floor(Math.random() * 5);
	var color = timerFills[index];
	BORDER.setColor(Color.parseColor(color));
	ICON_FILL.setColor(Color.parseColor(color));
	return color;
}
