var usageUtil = require('~/util/UsageInformationUtil.js');
var storageUtil = require('~/util/StorageUtil.js');
var view = require("ui/core/view");
var thisView;


exports.onLoad = args =>{
	thisView = args.object;
	var timeOnPhoneToday = usageUtil.getTimeOnPhoneSingleDay(0);
	var total = Math.round(timeOnPhoneToday/6)/10;
	// var hrs = Math.floor(timeOnPhoneToday/60);
	// var min = timeOnPhoneToday%60;

	// // label.bindingContext = {
	// // 	todayHrs: hrs,
	// // 	todayMins: min
	// // };
	var goalApps = storageUtil.getSelectedPackageNames(); 
	

    var items = [];
    items.push(
    	for (String packageName : goalApps) {
		    {
		    	itemName: usageUtil.getAppName(packageName),
		    	itemDesc: "Opened 6 times"
		    }
		}
    )
   var listView = view.getViewById(thisView, "listview");
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
	var listButtons = view.getViewById(thisView, "listButtons");
	listButtons.items = stats;

}





