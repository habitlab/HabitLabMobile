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

	exports.populateListViewsDay();
	// // export.populateChartDay();
	// exports.populateListViewsWeek();


};


exports.populateListViewsDay = function() {
	var timeOnPhoneToday = usageUtil.getTimeOnPhoneSingleDay(0);
	var total = Math.round(timeOnPhoneToday/6)/10;
	//var unlocks = storageUtil.getUnlocks(java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK));
	var goalApps = storageUtil.getSelectedPackages(); 
	var apps = [];

	//populates list of apps
	for(var i = 0; i < goalApps.length; ++i) {
    		var name = usageUtil.getAppName(goalApps[i]);
    		// Edit when get visits
    		var visits = storageUtil.getVisits(goalApps[i], java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK));
    		var imagesrc = usageUtil.getIcon(goalApps[i]);
    		var mins = usageUtil.getTimeOnApplicationSingleDay(goalApps[i],0);
    		var appObj = new app(name, visits, imagesrc, mins);
    		apps.push(appObj);
    }
 
   	var listView = view.getViewById(page, "listview");
	listView.items = apps;

	//'buttons' that show the usage daily overall phone usage 
	var stats = [];
	stats.push(
	{
		value: total,
		desc: "hrs on phone"
	},
	{
		value: 65,
		desc: "unlocks"
	}
	)
	var listButtons = view.getViewById(page, "listButtons");
	listButtons.items = stats;
};


	// Object for an app that contains all the info for the lsit view 
	function app (name, visits, imagesrc, mins) {
		this.name = name;
		this.visits = visits;
		this.image = imagesrc;
		if (mins < 0) mins = 0;
		this.mins = mins;
	};


// // exports.populateChartDay() {
// // 	var apps = usageUtil.getAppsToday();
// // 	console.dir(apps);
// // }


// exports.populateListViewsWeek = function() {
// 	var timeOnPhoneWeek = usageUtil.getAvgTimeOnPhoneWeek();
// 	var weekStats = [];
// 	weekStats.push(
// 	{
// 		value: timeOnPhoneWeek,
// 		desc: "avg time on phone/day"
// 	},
// 	{
// 		value: 72,
// 		desc: "avg unlocks/day"
// 	}
// 	)
// 	var weekButtons = view.getViewById(page, "weekButtons");
// 	weekButtons.items = weekStats;

// }











exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};