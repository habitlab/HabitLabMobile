var usageUtil = require('~/util/UsageInformationUtil.js');
var storageUtil = require('~/util/StorageUtil.js');
var view = require("ui/core/view");
var imageSource = require("image-source");
var thisView;


exports.onLoad = args =>{
	thisView = args.object;
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
    		console.log(imagesrc);
    		var appObj = new app(name, visits, imagesrc);
    		apps.push(appObj);
    }
    console.dir(apps);
   	var listView = view.getViewById(thisView, "listview");
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
	var listButtons = view.getViewById(thisView, "listButtons");
	listButtons.items = stats;
}


	//Object for an app that contains all the info for the lsit view 
	function app (name, visits, imagesrc) {
		this.name = name;
		this.visits = visits;
		this.image = imagesrc;
	}

}





