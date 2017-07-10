var usageUtil = require('~/util/UsageInformationUtil.js');
var storageUtil = require('~/util/StorageUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var gestures = require("ui/gestures");
var tabView = require("ui/tab-view")
var view = require("ui/core/view");
var imageSource = require("image-source");
var page;
var drawer;

exports.pageLoaded = function(args) {
	page = args.object;
  drawer = page.getViewById("sideDrawer");

  if (!permissionUtil.checkActionUsagePermission()) {
		permissionUtil.launchActionUsageIntent();
	}
	exports.populateListViewsDay();


};


exports.populateListViewsDay = function() {
	var timeOnPhoneToday = usageUtil.getTimeOnPhoneSingleDay(0);
	var total = Math.round(timeOnPhoneToday/6)/10;
	var goalApps = storageUtil.getSelectedPackages(); 
	var i;
	var apps = [];

	//populates list of apps
	for(i = 0; i < goalApps.length; ++i) {
    		var name = usageUtil.getAppName(goalApps[i]);
    		// Edit when get visits
    		var visits = 6;
    		var imagesrc = usageUtil.getIcon(goalApps[i]);
    		var appObj = new app(name, visits, imagesrc);
    		apps.push(appObj);
    }
 
   	var listView = view.getViewById(page, "listview");
   	   console.dir(listView);
	listView.items = apps;


	//'buttons' that show the usage daily overall phone usage 
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
	console.dir(listButtons);
	listButtons.items = stats;
}


	//Object for an app that contains all the info for the lsit view 
	function app (name, visits, imagesrc) {
		this.name = name;
		this.visits = visits;
		this.image = imagesrc;
	}


exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};