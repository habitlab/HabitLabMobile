var app = require("application");
var timer = require("timer");
var permission = require("~/util/PermissionUtil")

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
var ImageView = android.widget.ImageView;

var paint = new Paint();
paint.setColor(Color.BLACK);
paint.setAlpha(220);

var iconPaint = new Paint();
iconPaint.setColor(Color.WHITE);
iconPaint.setStrokeWidth(2);
iconPaint.setStyle(Paint.Style.STROKE);

var context = app.android.context;

// Custom DialogView 
var OverlayView = android.view.View.extend({
	onDraw: function (canvas) {
		canvas.drawRect(0, 0, canvas.getWidth(), canvas.getHeight(), paint);

		var diameter = canvas.getWidth() * 0.15;

		// add icon frame
		var iconLeft = (canvas.getWidth() - diameter) / 2;
		var iconRight = (canvas.getWidth() + diameter) / 2;
		var iconTop = canvas.getHeight() * 0.35;
		var iconBottom = iconTop + diameter;

		canvas.drawLine(0.07 * canvas.getWidth(), iconTop + diameter / 2, 
			iconLeft - canvas.getWidth() * 0.01, iconTop + diameter / 2, iconPaint);
		canvas.drawLine(iconRight + canvas.getWidth() * 0.01, iconTop + diameter / 2, 
			0.93 * canvas.getWidth(), iconTop + diameter / 2, iconPaint);

		canvas.drawOval(iconLeft, iconTop, iconRight, iconBottom, iconPaint);

		// add icon
		var icon_id = context.getResources().getIdentifier("ic_habitlab_white", "drawable", context.getPackageName());
		var bitmap = context.getResources().getDrawable(icon_id).getBitmap();
		var hToWRatio = bitmap.getWidth() / bitmap.getHeight();
		var newHeight = 0.75 * diameter;
		var newWidth = newHeight * hToWRatio;
		var icon = Bitmap.createScaledBitmap(bitmap, newWidth, newHeight, false);
		
		var bitmapLeft = iconLeft + (iconRight - iconLeft) / 2 - newWidth / 2;
		var bitmapTop = iconTop + (iconBottom - iconTop) / 2 - newHeight * 9 / 16;

		canvas.drawBitmap(icon, bitmapLeft, bitmapTop, new Paint());
	}
});


var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
var overlay;
var text;
var posButton;
var negButton;

exports.showYoutube = function(width, height, pos, neg) {
    if (permissions.checkSystemOverlayPermission()) {
			// overlay to block video
		var overlayParams = new WindowManager.LayoutParams(width, height, 0, 0,
			WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY, WindowManager.LayoutParams.FLAG_FULLSCREEN, 
			PixelFormat.TRANSLUCENT);
		overlayParams.gravity = Gravity.LEFT | Gravity.TOP;
		overlay = new OverlayView(context);
		windowManager.addView(overlay, overlayParams);

		// add text
		var textParams = new WindowManager.LayoutParams(0.8 * width, 0.2 * height, 0.1 * width, 0.1 * height, 
			WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY, 0, PixelFormat.TRANSLUCENT);
		textParams.gravity = Gravity.LEFT | Gravity.TOP;
		text = new TextView(context);
		text.setText("Keep Watching?");
		text.setTextSize(TypedValue.COMPLEX_UNIT_PT, 12);
		text.setTextColor(Color.WHITE);
		text.setHorizontallyScrolling(false);
		text.setGravity(Gravity.CENTER);
		windowManager.addView(text, textParams);


		// add positive button
		var posButtonParams = new WindowManager.LayoutParams(0.3 * width, 
			0.25 * height, 0.14 * width, 0.625 * height, WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
			WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		posButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
		posButton = new Button(context);
		posButton.setText("Continue");
		posButton.setTextColor(Color.WHITE);
		posButton.getBackground().setColorFilter(Color.parseColor("#CD201F"), android.graphics.PorterDuff.Mode.MULTIPLY);
		posButton.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				if (pos) {
					pos();
				}
				exports.removeVideoBlocker();
			}
		}));
		windowManager.addView(posButton, posButtonParams);


		// add negative button
		var negButtonParams = new WindowManager.LayoutParams(0.3 * width, 
			0.25 * height, 0.56 * width, 0.625 * height, WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY,
			WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL | 
			WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE, 
			PixelFormat.TRANSLUCENT);
		negButtonParams.gravity = Gravity.LEFT | Gravity.TOP;
		negButton = new Button(context);
		negButton.setText("Exit");
		negButton.setTextColor(Color.WHITE);
		negButton.getBackground().setColorFilter(Color.parseColor("#CD201F"), android.graphics.PorterDuff.Mode.MULTIPLY);
		negButton.setOnClickListener(new android.view.View.OnClickListener({
			onClick: function() {
				if (neg) {
					neg();
				}
				exports.removeVideoBlocker();
			}
		}));
		windowManager.addView(negButton, negButtonParams);
    } else {
        permissions.launchSystemOverlayIntent(); 
    }

}


exports.removeVideoBlocker = function() {
	if (overlay) {
		windowManager.removeView(overlay);
		overlay = undefined;
	}

	if (posButton) {
		windowManager.removeView(posButton);
		posButton = undefined;
	}

	if (negButton) {
		windowManager.removeView(negButton);
		negButton = undefined;
	}

	if (text) {
		windowManager.removeView(text);
		text = undefined;
	}
}

