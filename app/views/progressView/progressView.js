var usageUtil = require('~/util/UsageInformationUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var drawer;

exports.pageLoaded = function(args) {
  
  drawer = args.object.getViewById(page, "sideDrawer");

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

};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};