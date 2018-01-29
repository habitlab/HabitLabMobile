var application = require("application");
var frame = require("ui/frame");
var fancyAlert = require("nativescript-fancyalert");
var observable = require("data/observable");
const StorageUtil = require("~/util/StorageUtil");
const Toast = require("nativescript-toast");

var drawer;
var events;
var page;
var pageData;

exports.toggleDrawer = function() {
    events.push({category: "navigation", index: "menu"});
	drawer.toggleDrawerState();
};

var editName = function () {
    events.push({category: "features", index: "editname"});
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
                events.push({category: "features", index: "editname_changed"});
	    		StorageUtil.setName(newName);
	    		dialog.dismiss();
                Toast.makeText("Name changed to " + newName).show();
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

exports.startAccessibilityService = function() {
    var permission = require("~/util/PermissionUtil");
    if (!permission.checkAccessibilityPermission()) {
        permission.launchAccessibilityServiceIntent();
    } else {
        Toast.makeText("Already enabled").show();
    }
}

var setHours = function() {
    frame.topmost().navigate({
        moduleName: "views/hoursView/hoursView",
        animated: true,
        transition: {
          name: "slide",
          duration: 380,
          curve: "easeIn"
        }
    });
};

var goToFAQ = function () {
	frame.topmost().navigate({
        moduleName: "views/faqView/faqView",
        animated: true,
        transition: {
          name: "slide",
          duration: 380,
          curve: "easeIn"
        }
    });
};

var goToFeedback = function() {
    frame.topmost().navigate({
        moduleName: "views/feedbackView/feedbackView",
        animated: true,
        transition: {
          name: "slide",
          duration: 380,
          curve: "easeIn"
        }
    });
};

var eraseData = function() {
    events.push({category: "features", index: "erase_data"});
	var alert = new android.app.AlertDialog.Builder(application.android.foregroundActivity);
    alert.setTitle("Destroy All Data?");
    alert.setMessage("HabitLab will lose track of all your progress! Would you still like to continue?");
    alert.setPositiveButton("Delete", onClickListener);
    alert.setNegativeButton("Cancel", null);
    var dialog = alert.show();

    var onClickListener = new android.view.View.OnClickListener({
	    onClick: function (view) {
            events.push({category: "features", index: "erase_data_confirm"});
	    	StorageUtil.setUpDB(true);
	    	dialog.dismiss();
            Toast.makeText("Data Erased").show();
	    }
	});

    dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).setOnClickListener(onClickListener);
};


exports.onItemTap = function(args) {
    args.view.bindingContext.onTap();
};

exports.pageLoaded = function(args) {
    events = [{category: "page_visits", index: "settings_main"}];
	drawer = args.object.getViewById("sideDrawer"); 
    page = args.object;
    pageData = new observable.Observable();
    page.bindingContext = pageData;
    var settings = [{
        title: 'Edit Name',
        subtitle: 'Set your preferred name',
        icon: 'res://ic_account',
        onTap: editName
    }, {
        title: 'Active Hours',
        subtitle: 'Set when HabitLab can nudge you',
        icon: 'res://ic_alarm',
        hasArrow: true,
        onTap: setHours
    }, {
        title: 'Feedback',
        subtitle: 'Tell us what you think about HabitLab',
        icon: 'res://ic_feedback',
        hasArrow: true,
        onTap: goToFeedback
    }, {
        title: 'FAQ',
        subtitle: '',
        icon: 'res://ic_faq',
        hasArrow: true,
        onTap: goToFAQ
    }, {
        title: 'Erase Data',
        subtitle: '',
        icon: 'res://ic_trash',
        onTap: eraseData
    }];
    pageData.set('settings', settings);
};
 
exports.pageUnloaded = function(args) {
    StorageUtil.addLogEvents(events);
};

exports.onInfo = function() {
    frame.topmost().navigate('views/infoView/infoView');
};