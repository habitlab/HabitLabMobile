var Observable = require("data/observable").Observable;
var ObservableArray = require("data/observable-array").ObservableArray;
var usageUtil = require('~/util/UsageInformationUtil.js');
var view = require("ui/core/view");
var items = new ObservableArray([]);
var pageData = new Observable();
var label;


exports.onLoad = args =>{
	var label = args.object;
	var timeOnPhoneToday = usageUtil.getTimeOnPhoneSingleDay(0);
	var total = Math.round(timeOnPhoneToday/6)/10;
	// var hrs = Math.floor(timeOnPhoneToday/60);
	// var min = timeOnPhoneToday%60;

	// label.bindingContext = {
	// 	todayHrs: hrs,
	// 	todayMins: min
	// };



	label.bindingContext = pageData;

    items.push(
    {
    	itemName: "Facebook",
    	itemDesc: "Opened 6 times"
    },
    {
    	itemName: "Instagram",
    	itemDesc: "Opened 12 times"
    },
    {
    	itemName: "Youtube",
    	itemDesc: "Opened 4 times"
    },
    {
    	itemName: "Snapchat",
    	itemDesc: "Opened 17 times"
    }
    )
    pageData.set("items", items);



	// var stats = [];
	// stats.push(
	// {
	// 	value: total,
	// 	desc: "hrs on phone"
	// },
	// {
	// 	value: "61",
	// 	desc: "unlocks"
	// }
	// )
	// var listButtons = view.getViewById(label, "listButtons");
	// listButtons.items = stats;

}



