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
var goalApps;
var drawer;
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
var Description = com.github.mikephil.charting.components.Description
var ColorTemplate = com.github.mikephil.charting.utils.ColorTemplate;


exports.pageLoaded = function(args) {
	page = args.object;
  	drawer = page.getViewById("sideDrawer");
  	goalApps = storageUtil.getSelectedPackages(); 
	exports.populateListViewsDay();
	exports.populateListViewsWeek();
	exports.populateListViewMonth();
};


//Creates the pie chart on the day tab
exports.dayView = function(args) {
    var PieChart = com.github.mikephil.charting.charts.PieChart
    var PieEntry = com.github.mikephil.charting.data.PieEntry
    var Legend = com.github.mikephil.charting.components.Legend
    var PieDataSet = com.github.mikephil.charting.data.PieDataSet
    var LayoutParams = android.view.ViewGroup.LayoutParams
    var LinearLayout = android.widget.LinearLayout
    var SpannableString = android.text.SpannableString
    var PieData = com.github.mikephil.charting.data.PieData
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
     dataset.setColors(getColors());

    // Initialize and set pie chart 
    piechart.setData(data);
    piechart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 800, 0.5));
    piechart.invalidate();
    args.view = piechart;

}


getColors = function() {
	var colors = new ArrayList();
 	colors.add(new java.lang.Integer(Color.parseColor("#E71D36")));
    colors.add(new java.lang.Integer(Color.parseColor("#FFA730")));
     colors.add(new java.lang.Integer(Color.parseColor("#A0E4DD")));
    colors.add(new java.lang.Integer(Color.parseColor("#F18391")));
    colors.add(new java.lang.Integer(Color.parseColor("#747F89")));
    colors.add(new java.lang.Integer(Color.parseColor("#DAECF3")));
    colors.add(new java.lang.Integer(Color.parseColor("#2EC4B6")));  
	return colors;
}



function toJavaFloatArray(arr) {
    var output = Array.create('float', arr.length)
    for (let i = 0; i < arr.length; ++i) {
        output[i] = arr[i]
    }
    return output
}

function toJavaStringArray(arr) {
    var output = Array.create('String', arr.length)
    for (let i = 0; i < arr.length; ++i) {
        output[i] = arr[i]
    }
    return output
}



function getAppNames() {
    var names = Array.create(java.lang.String, goalApps.length);
    for (let i = 0; i < goalApps.length; ++i) {
        names[i] = usageUtil.getAppName(goalApps[i]);
    }
    return names;
}



//creates the line graph on the week tab
exports.weekView = function(args) {
    var barchart = new BarChart(args.context);
    goalApps = storageUtil.getSelectedPackages(); 
    //array of datasets
    var IbarSet = new ArrayList();
    //array of BarEntries
    var entries = new ArrayList();
    for (var day = 7; day >=0; day--) {
   		//array of values for each week
   		var appValues = [];
   		for (var ga = 0; ga < goalApps.length; ga++) {
   			var totalTimeDay = usageUtil.getTimeOnApplicationSingleDay(goalApps[ga], day);
   			appValues.push(new java.lang.Integer(totalTimeDay));
   		}
   		//now have an array of values for a week
   		entries.add(new BarEntry(7-day, toJavaFloatArray(appValues)));
   }
  	var dataset = new BarDataSet(entries, "Total Time On Target Apps Per Day");
    var appNames = getAppNames();
    dataset.setStackLabels();
  	dataset.setColors(getColors());
  	IbarSet.add(dataset);


    // for(var i = 0; i < goalApps.length; i++) {
    // 	var entries = new ArrayList();
    // 	var appWeek = usageUtil.getTimeOnAppThisWeek(goalApps[i]);
    // 	//console.dir(appWeek);
    // 	entries.add(new BarEntry(1, appWeek[6]));
    // 	entries.add(new BarEntry(2, appWeek[5]));
    // 	entries.add(new BarEntry(3, appWeek[4]));
    // 	entries.add(new BarEntry(4, appWeek[3]));
    // 	entries.add(new BarEntry(5, appWeek[2]));
    // 	entries.add(new BarEntry(6, appWeek[1]));
    // 	entries.add(new BarEntry(7, appWeek[0]));
    // 	var dataset = new BarDataSet(entries, usageUtil.getAppName(goalApps[i]));
    // 	 dataset.setColors(getColors());
    // 	//  var labels = new ArrayList();
    // 	// labels.add("M");
    // 	// labels.add("Tu");
    // 	// labels.add("W");
    // 	// labels.add("Th");
    // 	// labels.add("F");
    // 	// labels.add("S");
    // 	// labels.add("S");
    // 	// dataset.setStackLabels(labels);
    // 	IbarSet.add(dataset);

    // }
	 var data = new BarData(IbarSet);
	 barchart.setData(data);
	 barchart.setFitBars(true);
	 barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 800, 0.5));
	 barchart.invalidate();
	 args.view = barchart;
}



exports.monthView = function(args) {
    var barchart = new BarChart(args.context);
     var IbarSet = new ArrayList();
      goalApps = storageUtil.getSelectedPackages(); 
    //array of datasets
    var IbarSet = new ArrayList();
    //array of BarEntries
    var entries = new ArrayList();
   for (var week = 3; week >=0; week--) {
   		//array of values for each week
   		var appValues = [];
   		for (var ga = 0; ga < goalApps.length; ga++) {
   			var totalTimeWeekApp = usageUtil.getTotalTimeOnAppWeek(goalApps[ga], week);
   			appValues.push(new java.lang.Integer(totalTimeWeekApp));
   		}
   		//now have an array of values for a week
   		entries.add(new BarEntry(4-week, toJavaFloatArray(appValues)));
   }
  	var dataset = new BarDataSet(entries, "Total Time On Target Apps Per Week");
  	dataset.setColors(getColors());
  	IbarSet.add(dataset);


 //    var entries = new ArrayList();
	//  entries.add(new BarEntry(4, 0));
	// entries.add(new BarEntry(8, 1));
	//  entries.add(new BarEntry(10, 2));
	//   entries.add(new BarEntry(3, 3));
	//  entries.add(new BarEntry(5, 4));
	 // var dataset = new BarDataSet(entries, "Time on Phone");
	
	 // IbarSet.add(dataset);
	var data = new BarData(IbarSet);
	 barchart.setData(data);
	 barchart.setFitBars(true);
	 barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 800, 0.5));
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
	var unlocks = storageUtil.getUnlocks(storageUtil.days.TODAY);
	var apps = [];

	//populates list of apps
	for(var i = 0; i < goalApps.length; ++i) {
    		var name = usageUtil.getAppName(goalApps[i]);
    		// Edit when get visits
    		var visits = storageUtil.getVisits(goalApps[i], storageUtil.days.TODAY);
    		var imagesrc = usageUtil.getIcon(goalApps[i]);
    		var mins = Math.round(usageUtil.getTimeOnApplicationSingleDay(goalApps[i],0));
    		var appObj = new dayApp(name, visits, imagesrc, mins);
    		apps.push(appObj);
    }
 	apps.sort(function compare(a, b) {
    if (a.mins < b.mins) {
      return 1;
    } else if (a.mins > b.mins) {
      return -1;
    }
    return 0;
  	});
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
	console.log(usageUtil.getAvgTimeOnPhoneThisWeek());
	var timeOnPhoneWeek = Math.round(usageUtil.getAvgTimeOnPhoneThisWeek()/6)/10;
	var weekStats = [];
	weekStats.push(
	{
		value: timeOnPhoneWeek,
		desc: "avg hrs on phone/day"
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
    		var avgMins = usageUtil.getAvgTimeOnAppThisWeek(goalApps[i]);
    		var imagesrc = usageUtil.getIcon(goalApps[i]);
    		var appObj = new weekApp(name, avgMins, imagesrc);
    		weekApps.push(appObj);
    }
    weekApps.sort(function compare(a, b) {
    if (a.avgMins < b.avgMins) {
      return 1;
    } else if (a.avgMins > b.avgMins) {
      return -1;
    }
    return 0;
  	});
    var weekList = view.getViewById(page, "weekList");
	weekList.items = weekApps;
 }


exports.populateListViewMonth = function () {
	// var timePhoneMonth = usageUtil.getTimeOnPhoneThisMonth();
	var avgTimePhoneMonth = Math.round(usageUtil.getAvgTimeOnPhoneThisMonth()/6)/10;
	// console.dir(timePhoneMonth);
	// console.dir(avgTimePhoneMonth);
	var monthStats = [];
	monthStats.push(
	{
		value: avgTimePhoneMonth,
		desc: "avg hrs on phone/day"
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