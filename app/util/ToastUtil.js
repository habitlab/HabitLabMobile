var Toast = android.widget.Toast;

exports.show = function(context, msg, length, bkgdColorHex, textColorHex) {
	var toastLength = (length === 0) ? Toast.LENGTH_SHORT : Toast.LENGTH_LONG;
	var customToast = Toast.makeText(context, msg, toastLength);
	var view = customToast.getView();
	if (bkgdColorHex) {
		view.getBackground().setColorFilter(android.graphics.Color.parseColor(bkgdColorHex), android.graphics.PorterDuff.Mode.SRC_IN);
	}
 	
 	var toastText = customToast.getView().findViewById(android.R.id.message);
 	toastText.setGravity(android.view.Gravity.CENTER);
 	toastText.setTextSize(18);
 	toastText.setShadowLayer(0, 0, 0, 0);

	if (textColorHex) {
		toastText.setTextColor(android.graphics.Color.parseColor(textColorHex));
	}
	
	customToast.show();
};






