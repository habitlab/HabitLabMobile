// var app = require("application");

// // native APIs
// var WindowManager = android.view.WindowManager;
// var Paint = android.graphics.Paint;
// var Button = android.widget.Button;
// var Resources = android.content.res.Resources;
// var Color = android.graphics.Color;
// var Context = android.content.Context;
// var PixelFormat = android.graphics.PixelFormat;
// var Gravity = android.view.Gravity;
// var TextView = android.widget.TextView;
// var TypedValue = android.util.TypedValue;
// var Context = app.android.context;

// var PAINT_FILL = new Paint();
// PAINT_FILL.setColor(Color.WHITE); // default
// var DIM_BACKGROUND = new Paint();
// DIM_BACKGROUND.setColor(Color.BLACK);


// var SCREEN_WIDTH = Resources.getSystem().getDisplayMetrics().widthPixels;
// var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;


// var OVERLAY_WIDTH = SCREEN_WIDTH;
// var HEADER_HEIGHT = 0.1*SCREEN_HEIGHT;
// var FOOTER_HEIGHT = 0.05*SCREEN_HEIGHT;
// var LEFT_HEADER = 0
// var TOP_HEADER = 0
// var RIGHT_HEADER = SCREEN_WIDTH
// var BOTTOM_HEADER = HEADER_HEIGHT
// var LEFT_FOOTER = 0
// var TOP_FOOTER = SCREEN_HEIGHT - FOOTER_HEIGHT
// var RIGHT_FOOTER = SCREEN_WIDTH
// var BOTTOM_FOOTER = SCREEN_HEIGHT


// // Custom DialogView 
// var TopTailView = android.view.View.extend({
// 	onDraw: function (canvas) {
// 		DIM_BACKGROUND.setAlpha(128); // 50% dimness
// 		canvas.drawRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, DIM_BACKGROUND);
// 		canvas.drawRect(LEFT_HEADER, TOP_HEADER, RIGHT_HEADER, BOTTOM_HEADER, PAINT_FILL);
// 		canvas.drawRect(LEFT_FOOTER, TOP_FOOTER, RIGHT_FOOTER, BOTTOM_FOOTER, PAINT_FILL);

// 	}
// });




// function showHeaderFooterDisplay(context) {
// 	var windowManager = context.getSystemService(Context.WINDOW_SERVICE);
// 	var viewParams = new WindowManager.LayoutParams(WindowManager.LayoutParams.MATCH_PARENT, 
// 		WindowManager.LayoutParams.MATCH_PARENT, WindowManager.LayoutParams.TYPE_SYSTEM_ALERT,
// 		WindowManager.LayoutParams.FLAG_FULLSCREEN, PixelFormat.TRANSLUCENT);
// 	viewParams.gravity = Gravity.LEFT | Gravity.TOP;
//     var view = new TopTailView(context);
//     windowManager.addView(view, viewParams);

// }

// module.exports = {
// 	showHeaderFooterDisplay
// };

