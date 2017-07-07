var usageUtil = require('~/util/UsageInformationUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var Observable = require("data/observable").Observable;
var drawer;



exports.pageLoaded = function(args) {
    var page = args.object;
    drawer = view.getViewById(page, "sideDrawer");
    if (!permissionUtil.checkActionUsagePermission()) {
		permissionUtil.launchActionUsageIntent();
	}
	var timeOnPhoneToday = usageUtil.getTimeOnPhoneSingleDay(0);
	console.log(timeOnPhoneToday);

	var hrs = Math.floor(timeOnPhoneToday/60);
	var min = timeOnPhoneToday%60;
	console.log(hrs);
	console.log(min);

	page.bindingContext = {
		todayHrs: hrs,
		todayMins: min
	};



	var timeOnPhoneWeek = usageUtil.getTimeOnPhoneThisWeek();
	//console.dir(timeOnPhoneWeek);





};

exports.toggleDrawer = function() {
	console.log(drawer);
    drawer.toggleDrawerState();
};