var usageUtil = require('~/util/UsageInformationUtil.js');
var storageUtil = require('~/util/StorageUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var gestures = require("ui/gestures");
var tabView = require("ui/tab-view")
var view = require("ui/core/view");
var page;
var drawer;

exports.pageLoaded = function(args) {
	page = args.object;
  drawer = page.getViewById("sideDrawer");

  if (!permissionUtil.checkActionUsagePermission()) {
		permissionUtil.launchActionUsageIntent();
	}
	exports.populateListViews();


};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};



exports.populateListViews = function() {
	var timeOnPhoneToday = usageUtil.getTimeOnPhoneSingleDay(0);
	var total = Math.round(timeOnPhoneToday/6)/10;
	var goalApps = storageUtil.getSelectedPackages(); 
	var i;

	for(i = 0; i < goalApps.length; ++i) {
    		console.log(goalApps[i]);
    		console.log(usageUtil.getAppName(goalApps[i]));
    	}

    var items = [];
    items.push(
    	var i;
    	for(i = 0; i < goalApps.length; ++i) {
		    {
		    	itemName: usageUtil.getAppName(goalApps[0]),
		    	itemDesc: "Opened 6 times"
		    }
		}
    )
   var listView = view.getViewById(page, "listview");
	listView.items = items;



	var stats = [];
	stats.push(
	{
		value: total,
		desc: "hrs on phone"
	},
	{
		value: "61",
		desc: "unlocks"
	}
	)
	var listButtons = view.getViewById(page, "listButtons");
	listButtons.items = stats;
}