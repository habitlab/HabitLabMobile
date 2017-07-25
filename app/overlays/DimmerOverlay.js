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

var BACKGROUND = new Paint();
BACKGROUND.setColor(Color.BLACK);

// CONSTANTS
var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;

var context = app.android.context;

// Custom DialogView 
var OverlayView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, BACKGROUND);
	}
});

var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
var overlayParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_OVERLAY,
		WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
overlayParams.gravity = Gravity.LEFT | Gravity.TOP;
var overlays = [];


function initDimmer() {
	BACKGROUND.setAlpha(1);
	var overlayView = new OverlayView(context);
    windowManager.addView(overlayView, overlayParams);
    overlays.push(overlayView);
}


function dim() {
	var alphaToSet = BACKGROUND.getAlpha() + 1;
	if (alphaToSet > 255) {
		alphaToSet = 255;
	}
	BACKGROUND.setAlpha(alphaToSet);
	var newView = new OverlayView(context);
	windowManager.addView(newView, overlayParams);
	overlays.push(newView);
}

function removeDimmer() {
	if (overlays.length === 0) return;
	
	try {
		for (var i = 0; i < overlays.length; i++) {
			windowManager.removeView(overlays[i]);
		}
	} catch (e) {}
}


module.exports = {
	initDimmer,
	dim,
	removeDimmer
};


