var application = require("application");
var timer = require("timer");
var permissions = require("~/util/PermissionUtil");

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
var BACKGROUND = new Paint();
BACKGROUND.setColor(Color.parseColor("#2EC4B6"));

var MAIN = new Paint();
MAIN.setColor(Color.parseColor("#6CD5CB"));

var ICON_FILL = new Paint();
ICON_FILL.setColor(Color.parseColor("#FFA730"));

var INTERSTITIAL_BACKGROUND = new Paint();
INTERSTITIAL_BACKGROUND.setColor(Color.parseColor("#011627"));

var INTERSTITIAL_MAIN = new Paint();
INTERSTITIAL_MAIN.setColor(Color.parseColor("#1A2D3C"));

var INTERSTITIAL_ICON = new Paint();
INTERSTITIAL_ICON.setColor(Color.parseColor("#E71D36"));

// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var ICON_RADIUS = 0.075 * SCREEN_HEIGHT;


var context = application.android.context;
var windowManager = context.getSystemService(Context.WINDOW_SERVICE);

// Custom DialogView 
var DialogView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, MAIN);
		canvas.drawRect(0, 0.25 * SCREEN_HEIGHT, SCREEN_WIDTH, 0.75 * SCREEN_HEIGHT, BACKGROUND);


		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT) * 0.175;
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

// Custom DialogView 
var InterstitialView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, INTERSTITIAL_MAIN);
		canvas.drawRect(0, 0.25 * SCREEN_HEIGHT, SCREEN_WIDTH, 0.75 * SCREEN_HEIGHT, INTERSTITIAL_BACKGROUND);


		// add icon frame
		var iconLeft = SCREEN_WIDTH / 2 - ICON_RADIUS;
		var iconRight = iconLeft + 2 * ICON_RADIUS;
		var iconTop = (SCREEN_HEIGHT) * 0.175;
		var iconBottom = iconTop + 2 * ICON_RADIUS;
		canvas.drawOval(iconLeft, iconTop, iconRight, iconBottom, INTERSTITIAL_ICON);

		// add icon
		var icon_id = context.getResources().getIdentifier("ic_habitlab_white", "drawable", context.getPackageName());
		var bitmap = context.getResources().getDrawable(icon_id).getBitmap();
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = 1.5 * ICON_RADIUS;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);
		
		var bitmapLeft = iconLeft + (iconRight - iconLeft) / 2 - newWidth / 2;
		var bitmapTop = iconTop + (iconBottom - iconTop) / 2 - newHeight * 9 / 16;

		canvas.drawBitmap(icon, bitmapLeft, bitmapTop, INTERSTITIAL_ICON);
	}
});


var overlayView;
var overlayTitle;
var overlayText;
var overlayPosButton;
var overlayNegButton;
var overlayLink;
var progBar;
var id;
exports.showOverlay = function (title, msg, pos, neg, posCallback, negCallback) {
    if (permissions.checkSystemOverlayPermission()) {
		// add view
		var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
			WindowManager.LayoutParams.MATCH_PARENT, permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
		viewParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayView = new DialogView(context);
		windowManager.addView(overlayView, viewParams);


		// add title
		var titleParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, WindowManager.LayoutParams.WRAP_CONTENT,
			0.1 * SCREEN_WIDTH, 0.375 * SCREEN_HEIGHT, 
			permissions.getOverlayType(), 0, PixelFormat.TRANSLUCENT);
		titleParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayTitle = new TextView(context);
		overlayTitle.setText(title);
		overlayTitle.setTextSize(TypedValue.COMPLEX_UNIT_PT, 15);
		overlayTitle.setTextColor(Color.WHITE);
		overlayTitle.setHorizontallyScrolling(false);
		overlayTitle.setGravity(Gravity.CENTER);
		windowManager.addView(overlayTitle, titleParams);

		// add text
		var textParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, WindowManager.LayoutParams.WRAP_CONTENT,
			0.1 * SCREEN_WIDTH, 0.475 * SCREEN_HEIGHT, 
			permissions.getOverlayType(), 0, PixelFormat.TRANSLUCENT);
		textParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayText = new TextView(context);
		overlayText.setText(msg);
		overlayText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
		overlayText.setTextColor(Color.WHITE);
		overlayText.setHorizontallyScrolling(false);
		overlayText.setGravity(Gravity.CENTER);
		windowManager.addView(overlayText, textParams);

		//Add exit button
		var linkParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, WindowManager.LayoutParams.WRAP_CONTENT,
			0.1 * SCREEN_WIDTH, 0.7 * SCREEN_HEIGHT, 
			permissions.getOverlayType(), WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL, 
			PixelFormat.TRANSLUCENT);
		linkParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayLink = new TextView(context);
		overlayLink.setText(pos);
		overlayLink.setTextSize(TypedValue.COMPLEX_UNIT_PT, 5);
		overlayLink.setTextColor(Color.WHITE);
		overlayLink.setHorizontallyScrolling(false);
		overlayLink.setGravity(Gravity.CENTER);
		overlayLink.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				if (posCallback) {
					posCallback();
				}
				exports.removeOverlay();
			}
		}));
		windowManager.addView(overlayLink, linkParams);

		// add positive button
		var posButtonParams = new WindowManager.LayoutParams(0.6 * SCREEN_WIDTH, 
			0.08 * SCREEN_HEIGHT, 0.2 * SCREEN_WIDTH, 0.6 * SCREEN_HEIGHT, 
			permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayPosButton = new Button(context);
		overlayPosButton.setText(neg);
		overlayPosButton.setTextColor(Color.parseColor("#2EC4B6"));
		overlayPosButton.getBackground().setColorFilter(Color.parseColor("#eeeeeeff"), android.graphics.PorterDuff.Mode.MULTIPLY);
		overlayPosButton.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				if (negCallback) {
					negCallback();
				}
				exports.removeOverlay();
			}
		}));
		windowManager.addView(overlayPosButton, posButtonParams);
    } else {
        permissions.launchSystemOverlayIntent(); 
    }
 	
}


exports.showInterstitial = function(title, msg, button, callback) {
    if (permissions.checkSystemOverlayPermission()) {
		// add view
		var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
			WindowManager.LayoutParams.MATCH_PARENT, permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, PixelFormat.TRANSLUCENT);
		viewParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayView = new InterstitialView(context);
		windowManager.addView(overlayView, viewParams);

		// add title
		var titleParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, WindowManager.LayoutParams.WRAP_CONTENT,
			0.1 * SCREEN_WIDTH, 0.35 * SCREEN_HEIGHT, 
			permissions.getOverlayType(), 0, PixelFormat.TRANSLUCENT);
		titleParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayTitle = new TextView(context);
		overlayTitle.setText(title);
		overlayTitle.setTextSize(TypedValue.COMPLEX_UNIT_PT, 15);
		overlayTitle.setTextColor(Color.WHITE);
		overlayTitle.setHorizontallyScrolling(false);
		overlayTitle.setGravity(Gravity.CENTER);
		windowManager.addView(overlayTitle, titleParams);

		// add text
		var textParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, WindowManager.LayoutParams.WRAP_CONTENT,
			0.1 * SCREEN_WIDTH, 0.435 * SCREEN_HEIGHT, 
			permissions.getOverlayType(), 0, PixelFormat.TRANSLUCENT);
		textParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayText = new TextView(context);
		overlayText.setText(msg);
		overlayText.setTextSize(TypedValue.COMPLEX_UNIT_PT, 10);
		overlayText.setTextColor(Color.WHITE);
		overlayText.setHorizontallyScrolling(false);
		overlayText.setGravity(Gravity.CENTER);
		windowManager.addView(overlayText, textParams);

		//Progress bar 
		var progParams = new WindowManager.LayoutParams(0.8 * SCREEN_WIDTH, android.view.ViewGroup.LayoutParams.WRAP_CONTENT,
			0, 0.1 * SCREEN_HEIGHT, 
			permissions.getOverlayType(), 0, PixelFormat.TRANSLUCENT);
		progBar = new android.widget.ProgressBar(context, null, android.R.attr.progressBarStyleHorizontal);
		progBar.setMax(10000);
		progBar.setProgress(0);
		windowManager.addView(progBar, progParams);

		// add positive button
		var posButtonParams = new WindowManager.LayoutParams(0.6 * SCREEN_WIDTH, 
			0.08 * SCREEN_HEIGHT, 0.2 * SCREEN_WIDTH, 0.63 * SCREEN_HEIGHT, 
			permissions.getOverlayType(),
			WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlayPosButton = new Button(context);
		overlayPosButton.setText(button);
		overlayPosButton.setTextColor(Color.parseColor("#011627"));
		overlayPosButton.getBackground().setColorFilter(Color.parseColor("#eeeeeeff"), android.graphics.PorterDuff.Mode.MULTIPLY);
		overlayPosButton.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				if (callback) {
					callback();
				}
				exports.removeOverlay();
			}
		}));
		windowManager.addView(overlayPosButton, posButtonParams);		 	
		var count = 0;
		id = timer.setInterval(() => {
			if (count === 100) {
				exports.removeOverlay();
				timer.clearInterval(id);
				id = 0;
			} else {
				var toSet = progBar.getProgress() + 100;
				progBar.setProgress(toSet);
			}
			count++;
		}, 100);
    } else {
        permissions.launchSystemOverlayIntent(); 
    }
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

	if (overlayLink) {
		windowManager.removeView(overlayLink);
		overlayLink = undefined;
	}

	if (progBar) {
		windowManager.removeView(progBar);
		progBar = undefined;
	} 

	if (id) {
		timer.clearInterval(id);
		id = 0;
	}
}

