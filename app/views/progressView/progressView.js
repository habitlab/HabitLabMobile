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
var Placeholder = require("ui/placeholder")
var app = require("tns-core-modules/application")
var page;
var context = app.android.context;
var drawer;

exports.pageLoaded = function(args) {
	page = args.object;
  drawer = page.getViewById("sideDrawer");

	exports.populateListViewsDay();
	exports.populateListViewsWeek();
	exports.populateListViewMonth();
};


//Creates the pie chart on the day tab
exports.dayView = function(args) {
    var PieChart = com.github.mikephil.charting.charts.PieChart
    var PieEntry = com.github.mikephil.charting.data.PieEntry
    var Entry = com.github.mikephil.charting.data.Entry
    var Color = android.graphics.Color
    var Legend = com.github.mikephil.charting.components.Legend
    var Description = com.github.mikephil.charting.components.Description
    var PieDataSet = com.github.mikephil.charting.data.PieDataSet
    var LayoutParams = android.view.ViewGroup.LayoutParams
    var LinearLayout = android.widget.LinearLayout
    var SpannableString = android.text.SpannableString
    var PieData = com.github.mikephil.charting.data.PieData
    var ArrayList = java.util.ArrayList 
    var appsToday = usageUtil.getAppsSingleDay(0);
    var total = Math.round(usageUtil.getTimeOnPhoneSingleDay(0));
    console.log(args.context);
	//sort appsToday
	appsToday.sort(function compare(a, b) {
    if (a.mins < b.mins) {
      return 1;
    } else if (a.mins > b.mins) {
      return -1;
    }
    return 0;
  	});

    // add data
    var piechart = new PieChart(args.context);
     var entries = new ArrayList();
     var main = 0;
     var min = (appsToday.length < 4 ? appsToday : 4);
     for(var i = 0; i < min; i++) {
     	if (appsToday[i].mins > 3) {
	     	entries.add(new PieEntry(appsToday[i].mins, appsToday[i].name));
	     	main += appsToday[i].mins;
     	}
     }
     var leftover = total - main;
    if (leftover > 1){
    	entries.add(new PieEntry(leftover, "Other"));
    }
    var dataset = new PieDataSet(entries, "");
    dataset.setSliceSpace(0);
    var data = new PieData(dataset);

    // Customize appearence of the pie chart 
    data.setValueTextSize(11);
    data.setValueTextColor(Color.WHITE);
    var desc = piechart.getDescription();
    desc.setEnabled(Description.false);
    piechart.setDrawSliceText(false);
    piechart.setHoleRadius(70);
    piechart.setTransparentCircleRadius(75);
    var text = new SpannableString("Minutes per App")
    piechart.setCenterText(text);
    var legend = piechart.getLegend();
    legend.setPosition(Legend.LegendPosition.BELOW_CHART_CENTER);

    // Set Colors of pie chart 
    var colors = new ArrayList()
    colors.add(new java.lang.Integer(Color.parseColor("#E71D36")));
    colors.add(new java.lang.Integer(Color.parseColor("#FFA730")));
    colors.add(new java.lang.Integer(Color.parseColor("#2EC4B6")));
    colors.add(new java.lang.Integer(Color.parseColor("#011627")));
    colors.add(new java.lang.Integer(Color.parseColor("#FFA730")));
     dataset.setColors(colors)

    // Initialize and set pie chart 
    piechart.setData(data);
    piechart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 700, 0.5));
    piechart.invalidate();
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

//creates the line graph on the week tab
exports.weekView = function(args) {
	var LineChart = com.github.mikephil.charting.charts.LineChart;
	var LineDataSet = com.github.mikephil.charting.data.LineDataSet;
	 var Entry = com.github.mikephil.charting.data.Entry;
	 var ILineDataSet = com.github.mikephil.charting.interfaces.datasets.ILineDataSet;
	 var ArrayList = java.util.ArrayList;
	 var LineData = com.github.mikephil.charting.data.LineData;
	 var context= app.android.context;
	 var LayoutParams = android.view.ViewGroup.LayoutParams
    var LinearLayout = android.widget.LinearLayout
	 
	 console.dir(args);
	var linechart = new LineChart(args.context);
	 var FBentries = new ArrayList();
	 FBentries.add(new Entry(4, 0));
	FBentries.add(new Entry(8, 1));
	 FBentries.add(new Entry(10, 2));
	  FBentries.add(new Entry(3, 3));
	 FBentries.add(new Entry(5, 4));
	 var FBdataset = new LineDataSet(FBentries, "Mins on Facebook");
	 var IdataSet = new ArrayList();
	 IdataSet.add(FBdataset);
	 var labels = new ArrayList();
    labels.add("M");
    labels.add("Tu");
    labels.add("W");
    labels.add("Th");
    labels.add("F");

    var data = new LineData(IdataSet);
    linechart.setData(data);
    //linechart.setDescription("");
    linechart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 700, 0.5));
    linechart.invalidate();
    args.view = linechart;
}



exports.monthView = function(args) {
	var BarChart = com.github.mikephil.charting.charts.BarChart
    var BarEntry = com.github.mikephil.charting.data.BarEntry
    var Entry = com.github.mikephil.charting.data.Entry
    var Color = android.graphics.Color
    var ArrayList = java.util.ArrayList 
    var BarDataSet = com.github.mikephil.charting.data.BarDataSet
    var BarData = com.github.mikephil.charting.data.BarData
    var IBarDataSet = com.github.mikephil.charting.interfaces.datasets.IBarDataSet;
    var LayoutParams = android.view.ViewGroup.LayoutParams
    var LinearLayout = android.widget.LinearLayout

    var barchart = new BarChart(args.context);
    var entries = new ArrayList();
	 entries.add(new BarEntry(4, 0));
	entries.add(new BarEntry(8, 1));
	 entries.add(new BarEntry(10, 2));
	  entries.add(new BarEntry(3, 3));
	 entries.add(new BarEntry(5, 4));
	 var dataset = new BarDataSet(entries, "Time on Phone");
	 var IbarSet = new ArrayList();
	 IbarSet.add(dataset);
	 var data = new BarData(IbarSet);
	 barchart.setData(data);
	 barchart.setFitBars(true);
	 barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 700, 0.5));
	 barchart.invalidate();
	 args.view = barchart;

}





	// Object for an app that contains all the info for the list view 
	function dayApp (name, visits, imagesrc, mins) {
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
    		var appObj = new dayApp(name, visits, imagesrc, mins);
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
    var weekList = view.getViewById(page, "weekList");
	weekList.items = weekApps;
 }


exports.populateListViewMonth = function () {
	var monthStats = [];
	var goalApps = storageUtil.getSelectedPackages(); 
	monthStats.push(
	{
		value: 120,
		desc: "avg min on phone/day"
	},
	{
		value: 72,
		desc: "avg unlocks/day"
	}
	)
	var monthButtons = view.getViewById(page, "monthButtons");
	monthButtons.items = monthStats;
}








exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};