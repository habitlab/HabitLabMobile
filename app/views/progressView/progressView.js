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
var Calendar = java.util.Calendar;
var SimpleDateFormat = java.text.SimpleDateFormat;
var Locale = java.util.Locale
var GregorianCalendar = java.util.GregorianCalendar
var IAxisValueFormatter = com.github.mikephil.charting.formatter.IAxisValueFormatter
var XAxis = com.github.mikephil.charting.components.XAxis
var YAxis = com.github.mikephil.charting.components.YAxis
var PieChart = com.github.mikephil.charting.charts.PieChart
var PieEntry = com.github.mikephil.charting.data.PieEntry
var Legend = com.github.mikephil.charting.components.Legend
var PieDataSet = com.github.mikephil.charting.data.PieDataSet
var LayoutParams = android.view.ViewGroup.LayoutParams
var LinearLayout = android.widget.LinearLayout
var SpannableString = android.text.SpannableString
var PieData = com.github.mikephil.charting.data.PieData


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
    var appsToday = usageUtil.getAppsSingleDay(0);
    var total = Math.round(usageUtil.getTimeOnTargetAppsSingleDay(0));

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
     var min;
     var extra;
     if (appsToday.length <= 4) {
        min = appsToday
        flag = true;
     } else if (appsToday.length === 5) {
        flag = false;
        min = 5
     } else if (appsToday.length > 5) {
        min = 4;
        flag = true
     }
     for(var i = 0; i < min; i++) {
     	//if (appsToday[i].mins > 3) {
            if (appsToday[i].mins === 0) continue;
	     	entries.add(new PieEntry(appsToday[i].mins, appsToday[i].name));
	     	main += appsToday[i].mins;
     	//}
     }
    if (flag) {
         var leftover = total - main;
        if (leftover > 1){
        	entries.add(new PieEntry(leftover, "Other"));
        }
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
    var text = new SpannableString("Minutes on Target Apps Today")
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




//creates the bar graph on the week tab
exports.weekView = function(args) {
    var barchart = new BarChart(args.context);
    goalApps = storageUtil.getSelectedPackages(); 
    //array of datasets
    var IbarSet = new ArrayList();
    //array of BarEntries
    var entries = new ArrayList();
    for (var day = 6; day >=0; day--) {
   		//array of values for each week
   		var appValues = [];
   		for (var ga = 0; ga < goalApps.length; ga++) {
   			var totalTimeDay = usageUtil.getTimeOnApplicationSingleDay(goalApps[ga], day);
            if (totalTimeDay === 0) totalTimeDay = 0;
   			appValues.push(new java.lang.Integer(totalTimeDay));
   		}
   		//now have an array of values for a week
   		entries.add(new BarEntry(6-day, toJavaFloatArray(appValues)));
   }
  	var dataset = new BarDataSet(entries, "");
    dataset.setStackLabels(getAppNames());
  	dataset.setColors(getColors(goalApps.length));
  	IbarSet.add(dataset);
	var data = new BarData(IbarSet);
    data.setValueTextColor(Color.WHITE);
    barchart.setData(data);

    //set axis labels
    var xLabels = getDayLabels();
     let axisformatter = new IAxisValueFormatter({
        getFormattedValue: function(value, axis) {
            return xLabels[value]
        },
        getDecimalDigits: function() {
            return 0
        }
     })

     var xAxis = barchart.getXAxis()
     var yAxis = barchart.getAxisLeft()
     yAxis.setAxisMinimum(0)
     xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
     xAxis.setGranularity(1)
     xAxis.setDrawGridLines(false);
      barchart.getAxisRight().setEnabled(false);
     xAxis.setValueFormatter(axisformatter)
     var desc = barchart.getDescription();
    desc.setEnabled(Description.false);
    yAxis.setStartAtZero(true);
    barchart.setDrawValueAboveBar(false);
    var legend = barchart.getLegend();
    legend.setPosition(Legend.LegendPosition.BELOW_CHART_CENTER);

     barchart.animateY(3000);
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
            if (totalTimeWeekApp < 0) totalTimeWeekApp = 0;
   			appValues.push(new java.lang.Integer(totalTimeWeekApp));
   		}
   		//now have an array of values for a week
   		entries.add(new BarEntry(4-week, toJavaFloatArray(appValues)));
   }
  	var dataset = new BarDataSet(entries, "");
    dataset.setStackLabels(getAppNames());
  	dataset.setColors(getColors(goalApps.length));
  	IbarSet.add(dataset);
	var data = new BarData(IbarSet);
    data.setValueTextColor(Color.WHITE);
    barchart.setData(data);

    var xLabels = toJavaStringArray(["4 weeks ago", "3 weeks ago", "2 weeks ago", "Last Week", "This Week" ])
     let axisformatter = new IAxisValueFormatter({
        getFormattedValue: function(value, axis) {
            return xLabels[value]
        },
        getDecimalDigits: function() {
            return 0
        }
     })

     var xAxis = barchart.getXAxis()
     var yAxis = barchart.getAxisLeft()
     yAxis.setAxisMinimum(0)
     xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
     xAxis.setGranularity(1)
     xAxis.setDrawGridLines(false);
      barchart.getAxisRight().setEnabled(false);
     xAxis.setValueFormatter(axisformatter)
     var desc = barchart.getDescription();
    desc.setEnabled(Description.false);
    yAxis.setStartAtZero(true);
    barchart.setDrawValueAboveBar(false);
    var legend = barchart.getLegend();
    legend.setPosition(Legend.LegendPosition.BELOW_CHART_CENTER);

	 
     barchart.animateY(3000);
	 barchart.setFitBars(true);
	 barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 800, 0.5));
	 barchart.invalidate();
	 args.view = barchart;

}







exports.populateListViewsDay = function() {
	var timeOnTargetToday = usageUtil.getTimeOnTargetAppsSingleDay(0);
	var totalTarget = Math.round(timeOnTargetToday/6)/10;
    var total = usageUtil.getTimeOnPhoneSingleDay(0);
    var perc = Math.round((timeOnTargetToday/total)*100)
	var unlocks = storageUtil.getUnlocks(storageUtil.days.TODAY);
	var apps = [];

	//populates list of apps
	for(var i = 0; i < goalApps.length; ++i) {
    		var name = usageUtil.getAppName(goalApps[i]);
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
		value: totalTarget,
		desc: "hrs on target apps"
	},
	{
		value: unlocks,
		desc: "unlocks"
	},
    {
        value: perc,
        desc: "% phone time on target apps"
    }
	)
	var listButtons = view.getViewById(page, "listButtons");
	listButtons.items = stats;
};




exports.populateListViewsWeek = function() {

	var timeOnPhoneWeek = Math.round(usageUtil.getTotalTimeOnPhoneWeek(0)/6)/10;
    var timeOnTargetAppsWeek = Math.round(usageUtil.getTimeOnTargetAppsWeek(0)/6)/10;
    var perc = Math.round(timeOnTargetAppsWeek/timeOnPhoneWeek)*100;

    var unlocks = storageUtil.getUnlocks();
    var total = 0;
    for (var i = 0; i < unlocks.length; i++) {
        total += unlocks[i]
    }
    var avgUnlocks = Math.round(total/unlocks.length);

	var weekStats = [];
	weekStats.push(
	{
		value: timeOnTargetAppsWeek,
		desc: "hrs on target apps this week"
	},
	{
		value: total,
		desc: "total unlocks this week"
	},
    {
        value: perc,
        desc: "% phone time on target apps"
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
 

	var monthStats = [];
	monthStats.push(
	{
		value: avgTimePhoneMonth,
		desc: "avg hrs on phone/day"
	},
	{
		value: 72,
		desc: "avg unlocks/day"
	},
    {
        value: 18,
        desc: "% phone time on target apps"
    }
	)
	var monthButtons = view.getViewById(page, "monthButtons");
	monthButtons.items = monthStats;
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


getColors = function(stacksize) {
    var colors = [];
    //Deep yellow
    colors.push(new java.lang.Integer(Color.parseColor("#FFA730")));
    //Red
    colors.push(new java.lang.Integer(Color.parseColor("#E71D36")));
     //Turquoise
    colors.push(new java.lang.Integer(Color.parseColor("#2EC4B6"))); 
    //Light blue
     colors.push(new java.lang.Integer(Color.parseColor("#A0E4DD")));     
     //Pink
    colors.push(new java.lang.Integer(Color.parseColor("#F18391")));
    //Grey
    colors.push(new java.lang.Integer(Color.parseColor("#747F89")));
     //Light blue 
     colors.push(new java.lang.Integer(Color.parseColor("#DAECF3")));
    

    var sublist = colors.slice(0,stacksize);
    return toJavaIntArray(sublist);
}



function toJavaFloatArray(arr) {
    var output = Array.create('float', arr.length)
    for (let i = 0; i < arr.length; ++i) {
        output[i] = arr[i]
    }
    return output
}

function toJavaIntArray(arr) {
    var output = Array.create('int', arr.length)
    for (let i = 0; i < arr.length; ++i) {
        output[i] = arr[i]
    }
    return output
}

function toJavaStringArray(arr) {
    var output = Array.create(java.lang.String, arr.length)
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


//returns [today, yesterday, day before...]
function getDayLabels() {
    var weekDay =[];
    var format = new SimpleDateFormat("E", Locale.US);
    var today = Calendar.getInstance();

    for (var i = 0; i < 7; i++) {
        var end = Calendar.getInstance();
        end.setTimeInMillis(today.getTimeInMillis() - (6-i)*(86400 * 1000));
        var day = format.format(end.getTime());
        weekDay.push(day);
    }
    return weekDay;
}



exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};