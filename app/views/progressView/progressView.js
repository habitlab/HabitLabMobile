var usageUtil = require('~/util/UsageInformationUtil.js');
var storageUtil = require('~/util/StorageUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var gestures = require("ui/gestures");
var tabView = require("ui/tab-view")
var view = require("ui/core/view");
var imageSource = require("image-source");
var colorModule = require("tns-core-modules/color")
var page;
var drawer;

exports.pageLoaded = function(args) {
	page = args.object;
  drawer = page.getViewById("sideDrawer");

	exports.populateListViewsDay();
	exports.populateListViewsWeek();

	// Chart
	var appsToday = usageUtil.getAppsToday();
	console.dir(appsToday);
	// var chart = view.getViewById(page, "chart");
	// //chart.setUsePercentageValues(true);
	// var entries = [4, 11, 2, 4, 1];
	// chart.setData(entries);

};

function toArrayList(list) {
  var output = new java.util.ArrayList()
  for (let item of list) {
  	output.add(item)
  }
  return output
}

function toListOfColors(list) {
  var output = new java.util.ArrayList()
  for (let item of list) {
  	output.add(android.graphics.Color.valueOf(item))
  }
  return output
}

exports.creatingView = function(args) {

    var PieChart = com.github.mikephil.charting.charts.PieChart
    var PieEntry = com.github.mikephil.charting.data.PieEntry
    var Entry = com.github.mikephil.charting.data.Entry
    var Color = android.graphics.Color
    var PieDataSet = com.github.mikephil.charting.data.PieDataSet
    var LayoutParams = android.view.ViewGroup.LayoutParams
    var LinearLayout = android.widget.LinearLayout
    var PieData = com.github.mikephil.charting.data.PieData
    var ArrayList = java.util.ArrayList
    var entries = new ArrayList()
    entries.add(new PieEntry(20))
    entries.add(new PieEntry(30))
    //var colors = [Color.parseColor("#DCDEE0"),Color.parseColor("#466A80"),Color.parseColor("#0078CA"),Color.parseColor("#5BC2E7"),Color.parseColor("#99E4FF")]
    //var colors = [new colorModule.Color("#DCDEE0"), new colorModule.Color("#466A80"), new colorModule.Color("#0078CA"), new colorModule.Color("#5BC2E7"), new colorModule.Color("#99E4FF")]
    //var colors = ["#DCDEE0", "#466A80", "#0078CA", "#5BC2E7", "#99E4FF"]
    //var color_list = new java.util.ArrayList()
    //for (let color of colors) {
      //color_list.add(Color.valueOf(Color.parseColor(color)))
      //color_list.add(Color.parseColor(color))
      //color_list.add(Color.valueOf(parseInt(Color.parseColor("#466A80"))))
      //color_list.add(new colorModule.Color("#DCDEE0").android)
    //}
    /*
    var colors = new ArrayList()
    colors.add(Color.GRAY);
    colors.add(Color.BLUE);
    colors.add(Color.RED);
    colors.add(Color.GREEN);
    colors.add(Color.CYAN);
    colors.add(Color.YELLOW);
    colors.add(Color.MAGENTA);
    */
    var dataset = new PieDataSet(entries, "# of Calls")
    //dataset.setColors(color_list)
    //dataset.setColors(toListOfColors(colors))
    dataset.setSliceSpace(3)
    var labels = new ArrayList()
    labels.add("January")
    labels.add("February")
    var piechart = new PieChart(args.context)
    piechart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT, 0.5))
    //var data = new PieData(labels, dataset)
    var data = new PieData(dataset)
    piechart.setData(data)
    piechart.invalidate()
    args.view = piechart;
}

/*
exports.creatingView = function(args) {
    var nativeView = new android.widget.TextView(args.context);
    nativeView.setSingleLine(true);
    nativeView.setEllipsize(android.text.TextUtils.TruncateAt.END);
    nativeView.setText("Native");
    args.view = nativeView;
}
*/

exports.populateListViewsDay = function() {
	var timeOnPhoneToday = usageUtil.getTimeOnPhoneSingleDay(0);
	var total = Math.round(timeOnPhoneToday/6)/10;
	var unlocks = storageUtil.getUnlocks(java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK));
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
		value: unlocks,
		desc: "unlocks"
	}
	)
	var listButtons = view.getViewById(page, "listButtons");
	listButtons.items = stats;
};


	// Object for an app that contains all the info for the list view 
	function app (name, visits, imagesrc, mins) {
		this.name = name;
		this.visits = visits;
		this.image = imagesrc;
		if (mins < 0) mins = 0;
		this.mins = mins;
	};


	function weekApp(name, avgMins, imagesrc) {
		this.name = name;
		if (avgMins < 0) avgMins = 0;
		this.avgMins = avgMins;
		// this.perChange = perChange;
		this.image = imagesrc;
	}




exports.populateListViewsWeek = function() {
	var timeOnPhoneWeek = Math.round(usageUtil.getAvgTimeOnPhoneWeek()/6)/10;
	var weekStats = [];
	var goalApps = storageUtil.getSelectedPackages(); 
	weekStats.push(
	{
		value: timeOnPhoneWeek,
		desc: "avg min on phone/day"
	},
	{
		value: 72,
		desc: "avg unlocks/day"
	}
	)
	var weekButtons = view.getViewById(page, "weekButtons");
	weekButtons.items = weekStats;


	var weekApps=[];

	for(var i = 0; i < goalApps.length; ++i) {
    		var name = usageUtil.getAppName(goalApps[i]);
    		var avgMins = usageUtil.getAvgTimeOnAppWeek(goalApps[i]);
    		var imagesrc = usageUtil.getIcon(goalApps[i]);
    		var appObj = new weekApp(name, avgMins, imagesrc);
    		weekApps.push(appObj);
    }
    //Why isn't this working ??
 //    var weekList = view.getViewById("weekList");
	// weekList.items = weekApps;
 }


// exports.populateChartDay = function () {
// 	var appsToday = usageUtil.getAppsToday();
// 	console.dir(appsToday);
// }








exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};