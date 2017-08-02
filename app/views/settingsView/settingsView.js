var application = require("application");
var frame = require("ui/frame");
var fancyAlert = require("nativescript-fancyalert");
const StorageUtil = require("~/util/StorageUtil");
const Toast = require("nativescript-toast");

// expose native APIs
var drawer;
exports.toggleDrawer = function() {
	drawer.toggleDrawerState();
};


exports.editName = function () {
	var layout = new android.widget.LinearLayout(application.android.context);
    var parms = new android.widget.LinearLayout.LayoutParams(android.widget.LinearLayout.LayoutParams.MATCH_PARENT, 
    	android.widget.LinearLayout.LayoutParams.WRAP_CONTENT);
    layout.setOrientation(android.widget.LinearLayout.VERTICAL);
    layout.setLayoutParams(parms);
    layout.setGravity(android.view.Gravity.CLIP_VERTICAL);
    layout.setPadding(100, 50, 100, 50);

    var editText = new android.widget.EditText(application.android.foregroundActivity);
    var currentName = StorageUtil.getName();
    editText.setText(currentName);
    editText.setSelection(currentName.length);
    editText.setGravity(android.view.Gravity.CENTER);
 	layout.addView(editText, new android.widget.LinearLayout.LayoutParams(android.widget.LinearLayout.LayoutParams.MATCH_PARENT, 
 		android.widget.LinearLayout.LayoutParams.WRAP_CONTENT));
 	

	var alert = new android.app.AlertDialog.Builder(application.android.foregroundActivity);
    alert.setTitle("Change Your Name");
    alert.setMessage("What would you like us to call you?");
    alert.setPositiveButton("Change Name", onClickListener);
    alert.setNegativeButton("Cancel", null);
    alert.setView(layout);
    var dialog = alert.show();

    var onClickListener = new android.view.View.OnClickListener({
	    onClick: function (view) {
	    	var newName = editText.getText().toString();
	    	if (newName) {
	    		StorageUtil.setName(newName);
	    		dialog.dismiss();
	    	} else {
	    		Toast.makeText("Please enter your name").show();
	    	} 	
	    }
	});

    dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).setOnClickListener(onClickListener);
};

exports.setFakeData = function() {
  StorageUtil.setUpFakeDB();
};


exports.setHours = function () {
    var permission = require("~/util/PermissionUtil");
    if (!permission.checkAccessibilityPermission()) {
        permission.launchAccessibilityServiceIntent();
    }
    
	// fancyAlert.TNSFancyAlert.showInfo("Coming Soon!", "This feature is not yet available, but it will be soon! Interested? Let us know in the feedback section!", "Got it");
};


exports.goToFAQ = function () {
	frame.topmost().navigate("views/faqView/faqView");
};


exports.eraseData = function() {
	var alert = new android.app.AlertDialog.Builder(application.android.foregroundActivity);
    alert.setTitle("Destroy All Data?");
    alert.setMessage("HabitLab will lose track of all your progress! Would you still like to continue?");
    alert.setPositiveButton("Delete", onClickListener);
    alert.setNegativeButton("Cancel", null);
    var dialog = alert.show();

    var onClickListener = new android.view.View.OnClickListener({
	    onClick: function (view) {
	    	StorageUtil.setUpDB();
	    	dialog.dismiss();
	    }
	});

    dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).setOnClickListener(onClickListener);
};


exports.pageLoaded = function(args) {
	drawer = args.object.getViewById("sideDrawer"); 
};

exports.onInfo = function() {
    frame.topmost().navigate('views/infoView/infoView');
};