var app = require("application");
var Toast = require("nativescript-toast");
var StorageUtil = require('~/util/StorageUtil');

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
var CheckBox = android.widget.CheckBox;
var CompoundButton = android.widget.CompoundButton;
var LayoutParams = android.view.ViewGroup.LayoutParams;
var RadioGroup = android.widget.RadioGroup;
var RadioButton = android.widget.RadioButton;
const RADIO_MARGIN = 0.025


/******************************
 *          PAINTS            *                           
 ******************************/

//turqouise (default), yellow, red
var iconColor = ["#2EC4B6", "#ffcd30", "#d13b49"];


var DIALOG_FILL = new Paint();
DIALOG_FILL.setColor(Color.parseColor("#efede9")); // default

var DIM_BACKGROUND = new Paint();
DIM_BACKGROUND.setColor(Color.BLACK);

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor(iconColor[0]));

var ICON_BACK_FILL = new Paint();
ICON_BACK_FILL.setColor(Color.WHITE);

// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var DIALOG_WIDTH = 0.8 * SCREEN_WIDTH;
var DIALOG_HEIGHT = 0.5 * SCREEN_HEIGHT;
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




/*
* CheckboxOverlay
* -----------------------
* Overlay takes up to four options and a message
*/

var fullScreen;
var text;
var rg;
var selected = 15;
var posButton;
var negButton;
exports.showOverlay = function (msg, op1, op2, op3, op4, snoozeMode, lockdownMode, posCallback, negCallback, toastMsg) {
	var color = iconColor[0];
	if (snoozeMode) {
		color = iconColor[1];
		ICON_FILL.setColor(Color.parseColor(color));
	}
	if (lockdownMode) {
		color = iconColor[2];
		ICON_FILL.setColor(Color.parseColor(color));
	}

	// add whole screen view
	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL |
        WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
    fullScreen = new DialogView(context);
    windowManager.addView(fullScreen, viewParams);

    // add text
    var textParams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.2*DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 0.26*SCREEN_HEIGHT + 0.10*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    textParams.gravity = Gravity.LEFT | Gravity.TOP;
    text = new TextView(context);
    text.setText(msg);
    if (lockdownMode) {
    	text.setTextSize(TypedValue.COMPLEX_UNIT_PT, 9);
    } else {
    	text.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
    }
    
    text.setTextColor(Color.BLACK);
    text.setHorizontallyScrolling(false);
    text.setGravity(Gravity.CENTER);
    windowManager.addView(text, textParams);

   	//radio group
	var rgparams = new WindowManager.LayoutParams(0.8 * DIALOG_WIDTH, 0.5*DIALOG_HEIGHT,
    	0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 0.25*SCREEN_HEIGHT + 0.32*DIALOG_HEIGHT, 
    	WindowManager.LayoutParams.TYPE_SYSTEM_ALERT, 0, PixelFormat.TRANSLUCENT);
    rgparams.gravity = Gravity.LEFT | Gravity.TOP;
    rg = new RadioGroup(context);
    rg.setOrientation(RadioGroup.VERTICAL);
    rg.setOnCheckedChangeListener(new RadioGroup.OnCheckedChangeListener({
    	onCheckedChanged: function(rg, id) {
    		var rb = rg.findViewById(id);
    		selected = rb.getText();
    	}
    }));
    

    //option 1
    var opt1 = new RadioButton(context);
    opt1.setText(op1);
    opt1.setTextSize(TypedValue.COMPLEX_UNIT_PT, 8);
    opt1.setTextColor(Color.BLACK);
    opt1.setClickable(true);
    opt1.setId(1);
    opt1.setPadding(0,0.03*DIALOG_HEIGHT,0,0.03*DIALOG_HEIGHT);
    opt1.setGravity(Gravity.CENTER);
    rg.addView(opt1);


       //option 2
    var opt2 = new RadioButton(context);
    opt2.setText(op2);
    opt2.setTextSize(TypedValue.COMPLEX_UNIT_PT, 8);
    opt2.setTextColor(Color.BLACK);
    opt2.setClickable(true);
    opt2.setId(2);
    opt2.setPadding(DIALOG_WIDTH*0.01, RADIO_MARGIN *DIALOG_HEIGHT, 0, RADIO_MARGIN*DIALOG_HEIGHT);
     opt2.setGravity(Gravity.CENTER);
    rg.addView(opt2);


     //option 3
    var opt3 = new RadioButton(context);
    opt3.setText(op3);
    opt3.setTextSize(TypedValue.COMPLEX_UNIT_PT, 8);
    opt3.setTextColor(Color.BLACK);
    opt3.setClickable(true);
    opt3.setPadding(DIALOG_WIDTH*0.01, RADIO_MARGIN*DIALOG_HEIGHT, 0, RADIO_MARGIN*DIALOG_HEIGHT);
    opt3.setGravity(Gravity.CENTER);
    opt3.setId(3);
    rg.addView(opt3);

    //option 4
    var opt4 = new RadioButton(context);
    opt4.setText(op4);
    opt4.setTextSize(TypedValue.COMPLEX_UNIT_PT, 8);
    opt4.setTextColor(Color.BLACK);
    opt4.setClickable(true);
    opt4.setPadding(DIALOG_WIDTH*0.01, RADIO_MARGIN*DIALOG_HEIGHT, 0, RADIO_MARGIN*DIALOG_HEIGHT);
    opt4.setGravity(Gravity.CENTER);
    opt4.setId(4);
    rg.addView(opt4);
        windowManager.addView(rg, rgparams);

    rg.getChildAt(0).setChecked(true);


    // add positive button
    var posButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.15 * DIALOG_HEIGHT, 0.1 * (SCREEN_WIDTH + DIALOG_WIDTH), 
    	0.35 * SCREEN_HEIGHT + 0.6 * DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    posButton = new Button(context);
	posButton.setText("Ok");
	posButton.setTextColor(Color.WHITE);
	posButton.getBackground().setColorFilter(Color.parseColor(color), android.graphics.PorterDuff.Mode.MULTIPLY);
	posButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	// if (selected === -1) {
	    	// 	Toast.makeText("Please select a value").show();
	    	// 	return;
	    	// }
	    	if (snoozeMode) {
	    		Toast.makeText("HabitLab snoozed for " + selected).show();
	    		var value = parseInt(selected.substr(0, selected.indexOf(" ")));
	    		if (value === 8 || value === 24) { 			
	    			StorageUtil.setSnooze(value*60);
	    		} else {
	    			StorageUtil.setSnooze(value);
	    		}
	    		exports.removeDialog();
	    		return;
	    	} else if (lockdownMode) {
	    		Toast.makeText("Lockdown mode enabled for " + selected).show();
	    		var value = parseInt(selected.substr(0, selected.indexOf(" ")));
	    		if (value === 1 || value === 2) { 			
	    			StorageUtil.setLockdown(value*60);
	    		} else {
	    			StorageUtil.setLockdown(value);
	    		}
	    		exports.removeDialog();
	    		return;
	    	} else {
	    		if (posCallback) {
	    			posCallback();
	    		}
	    		if (toastMsg !== undefined) {
	    			Toast.makeText(toastMsg + selected).show();
	    		}
	    	}
	        exports.removeDialog();
	    }
	}));
    windowManager.addView(posButton, posButtonParams);

    // add positive button
    var negButtonParams = new WindowManager.LayoutParams(0.4 * DIALOG_WIDTH, 
    	0.15 * DIALOG_HEIGHT, 0.1 * SCREEN_WIDTH + 0.55 * DIALOG_WIDTH, 
    	0.35 * SCREEN_HEIGHT + 0.6 * DIALOG_HEIGHT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
		WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
		WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
		PixelFormat.TRANSLUCENT);
   	negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
    negButton = new Button(context);
	negButton.setText("Not now");
	negButton.setTextColor(Color.WHITE);
	negButton.getBackground().setColorFilter(Color.parseColor("#808080"), android.graphics.PorterDuff.Mode.MULTIPLY);
	negButton.setOnClickListener(new android.view.View.OnClickListener({
	    onClick: function() {
	    	if (negCallback) {
	    		negCallback();
	    	}
	        exports.removeDialog();
	    }
	}));
    windowManager.addView(negButton, negButtonParams);
}



exports.removeDialog = function () {
	if (fullScreen) {
		windowManager.removeView(fullScreen);
		fullScreen = undefined;
	}

	if (text) {
		windowManager.removeView(text);
		text = undefined;
	}

	if(rg) {
		windowManager.removeView(rg);
		rg = undefined;
	}

	if (posButton) {
		windowManager.removeView(posButton);
		posButton = undefined;
	}

	if (negButton) {
		windowManager.removeView(negButton);
		negButton = undefined;
	}
}

