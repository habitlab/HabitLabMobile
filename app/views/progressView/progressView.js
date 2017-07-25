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
var SpannableString = android.text.SpannableString
var PieData = com.github.mikephil.charting.data.PieData
var Easing = com.github.mikephil.charting.animation.Easing;
var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
var StyleSpan = android.text.style.StyleSpan;
var RelativeSizeSpan = android.text.style.RelativeSizeSpan;
var Typeface = android.graphics.Typeface;
var Resources = android.content.res.Resources;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var progressInfo = storageUtil.getProgressViewInfo();
var TODAY = 27;
var MINS_MS = 60000;
var observable = require("data/observable");
var pageData = new observable.Observable();




const ServiceManager = require("~/services/ServiceManager");
var trackingServiceIntent = new android.content.Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new android.content.Intent(context, com.habitlab.UnlockService.class);
var dummyServiceIntent = new android.content.Intent(context, com.habitlab.DummyService.class);

exports.pageLoaded = function(args) {
  /** SERVICE STARTER **/
  if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
    context.startService(trackingServiceIntent);
  }

  if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
    context.startService(unlockServiceIntent);
  }

  if (!ServiceManager.isRunning(com.habitlab.DummyService.class.getName())) {
    context.startService(dummyServiceIntent);
  }  
	page = args.object;
  	drawer = page.getViewById("sideDrawer");
    pageData.set("showDayGraph", true);
    pageData.set("showWeekGraph", true);
    pageData.set("showMonthGraph", true);
    args.object.bindingContext = pageData;
	exports.populateListViewsDay();
	exports.populateListViewsWeek();
	exports.populateListViewMonth();
};

exports.toggle = function () {
    pageData.set("showDayGraph", !pageData.get("showDayGraph"));
}

exports.toggleWeek = function() {
    pageData.set("showWeekGraph", !pageData.get("showWeekGraph"));
}

exports.toggleMonth = function() {
    pageData.set("showMonthGraph", !pageData.get("showMonthGraph"));
}


//Creates the pie chart on the day tab
exports.dayView = function(args) {
    var appsToday = exports.getAppsToday();//gets the target apps used today
    var total = Math.round((progressInfo.phoneStats[TODAY].totalTime)/MINS_MS);
    console.log(appsToday.length);

    // // add data
    var piechart = new PieChart(args.context);
    var entries = new ArrayList();
    var main = 0;
    var min;

     if (appsToday.length <= 4) {
        min = appsToday.length;
        useOther = false;
     } else if (appsToday.length === 5) {
        useOther = false;
        min = 5
     } else if (appsToday.length > 5) {
        min = 4;
        useOther = true
     }
     for(var i = 0; i < min; i++) {
            if (appsToday[i].mins === 0) continue;
	     	entries.add(new PieEntry(appsToday[i].mins, appsToday[i].name));
	     	main += appsToday[i].mins;
     }
    if (useOther) {
         var leftover = total - main;
        if (leftover > 1){
        	entries.add(new PieEntry(leftover, "Other"));
        }
    }

    //For demo:
    // entries.add(new PieEntry(23, "Facebook"))
    // entries.add(new PieEntry(41, "Instagram"))
    // entries.add(new PieEntry(11, "Snapchat"))
    // entries.add(new PieEntry(7, "Messenger"))
    // entries.add(new PieEntry(18, "YouTube"))

    var dataset = new PieDataSet(entries, "");
    dataset.setSliceSpace(0);
    var data = new PieData(dataset);

    // Customize appearence of the pie chart 
    data.setValueTextSize(11);
    data.setValueTextColor(Color.WHITE);
    var desc = piechart.getDescription();
    piechart.animateY(1400, Easing.EasingOption.EaseInOutQuad);
    desc.setEnabled(Description.false);
    piechart.setDrawSliceText(false);
    piechart.setHoleRadius(70);
    piechart.setTransparentCircleRadius(75);
    piechart.setCenterText(getSpannableString());
    var legend = piechart.getLegend();
    legend.setPosition(Legend.LegendPosition.BELOW_CHART_CENTER);
    dataset.setColors(getColors());

    // Initialize and set pie chart 
    piechart.setData(data);
    piechart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT,0.5));
    piechart.invalidate();
    args.view = piechart;

};




// creates the bar graph on the week tab
exports.weekView = function(args) {
    var barchart = new BarChart(args.context);
    //array of datasets
    var IbarSet = new ArrayList();
    //array of BarEntries
    var entries = new ArrayList();
    for (var day = 6; day >=0; day--) {
   		//array of values for each week
   		var appValues = [];
   		for (var app = 0; app < progressInfo.appStats.length; app++) {
            var totalTimeDay = Math.round(progressInfo.appStats[app][TODAY-day].time/MINS_MS)
   			appValues.push(new java.lang.Integer(totalTimeDay));
   		}
   		//now have an array of values for a week
   		entries.add(new BarEntry(6-day, toJavaFloatArray(appValues)));
   }
  	var dataset = new BarDataSet(entries, "");
    dataset.setStackLabels(getAppNames());
  	dataset.setColors(getColors(progressInfo.appStats.length));
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
	 barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT, 0.5));
	 barchart.invalidate();
	 args.view = barchart;
};



exports.monthView = function(args) {
    var barchart = new BarChart(args.context);
    var IbarSet = new ArrayList();
    //array of datasets
    var IbarSet = new ArrayList();
    //array of BarEntries
    var entries = new ArrayList();
   for (var weeksAgo = 3; weeksAgo >=0; weeksAgo--) {
   		//array of values for each week
   		var appValues = [];
   		for (var app = 0; app < progressInfo.appStats.length; app++) {
            var totalTimeWeekApp = (getTotalTimeAppWeek(progressInfo.appStats[app], weeksAgo) === 0 ? 0 : Math.round(getTotalTimeAppWeek(progressInfo.appStats[app], weeksAgo)/MINS_MS));
   			appValues.push(new java.lang.Integer(totalTimeWeekApp));
   		}
   		//now have an array of values for a week
   		entries.add(new BarEntry(4-weeksAgo, toJavaFloatArray(appValues)));
   }
  	var dataset = new BarDataSet(entries, "");
    dataset.setStackLabels(getAppNames());
  	dataset.setColors(getColors(progressInfo.appStats.length));
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
    barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT, 0.5));
    barchart.invalidate();
    args.view = barchart;

};





exports.populateListViewsDay = function() {   
     var unlocks = progressInfo.phoneStats[TODAY].unlocks
     var glances = progressInfo.phoneStats[TODAY].glances
     var total = (progressInfo.phoneStats[TODAY].totalTime === 0 ? 0 : Math.round(progressInfo.phoneStats[TODAY].totalTime/MINS_MS));
     var targetTime = (progressInfo.phoneStats[TODAY].time === 0 ? 0 : Math.round(progressInfo.phoneStats[TODAY].time/MINS_MS));
     var perc = (total === 0 ? 0 : Math.round(targetTime/total*100)); 


    var apps = exports.getAppsToday();

    //For demo:
    // var list = []
    // list.push ({
    //     name: "Instagram",
    //     image: usageUtil.getIcon("com.instagram.android"),
    //     visits: 11,
    //     mins: 41
    // },
    // {
    //     name: "Facebook",
    //     image: usageUtil.getIcon("com.facebook.katana"),
    //     visits: 4,
    //     mins: 23
    // },
    // {
    //     name: "YouTube",
    //     image: usageUtil.getIcon("com.google.android.youtube"),
    //     visits: 2,
    //     mins: 18
    // },
    // {
    //     name: "Snapchat",
    //     image: usageUtil.getIcon("com.snapchat.android"),
    //     visits: 15,
    //     mins: 11
    // }
    // )
    var listView = view.getViewById(page, "listview");
    listView.items = apps;

	//'buttons' that show the usage daily overall phone usage 
    var hrsTotal = Math.round(total/6)/10;
	var stats = [];
	stats.push(
	{
		value: glances,
		desc: "glances"
	},
	{
		value: hrsTotal,
		desc: "hrs on phone"
	},
    {
        value: perc + "%",
        desc: "time on watchlist"
    }
	)
    //For demo"
    // stats.push(
    // {
    //     value: 91,
    //     desc: "glances"
    // },
    // {
    //     value: 72,
    //     desc: "unlocks"
    // },
    // {
    //     value: 77 + "%",
    //     desc: "of phone time on watchlist"
    // }
    // )
	var listButtons = view.getViewById(page, "listButtons");
	listButtons.items = stats;
    console.warn("list view day done")
};



exports.populateListViewsWeek = function() {
    var timeOnPhoneWeek = ((totalTimeWeek(0, "total") === 0) ? 0 : Math.round(totalTimeWeek(0, "total")/MINS_MS))
    var timeOnTargetAppsWeek = ((totalTimeWeek(0, "target") === 0) ? 0 : Math.round(totalTimeWeek(0, "target")/MINS_MS));
    var perc = (timeOnPhoneWeek === 0 ? 0 : Math.round(timeOnTargetAppsWeek/timeOnPhoneWeek*100)); 
    var unlocks = totalTimeWeek(0, "unlocks");
    // var avgUnlocks = Math.round(total/unlocks.length);
    var hrsOnWatchlistWeek = Math.round(timeOnTargetAppsWeek/6)/10;

	var weekStats = [];
	weekStats.push(
	{
		value: hrsOnWatchlistWeek,
		desc: "hrs on watchlist"
	},
	{
		value: unlocks,
		desc: "unlocks"
	},
    {
        value: perc + "%",
        desc: "time on watchlist"
    }
	)
	var weekButtons = view.getViewById(page, "weekButtons");
	weekButtons.items = weekStats;
    var change;


	var weekApps=[];
	for(var i = 0; i < progressInfo.appStats.length; ++i) {
		var name = usageUtil.getAppName(progressInfo.appStats[i].packageName);
        var totalMins = (getTotalTimeAppWeek(progressInfo.appStats[i], 0) === 0 ? 0 : Math.round(getTotalTimeAppWeek(progressInfo.appStats[i], 0)/(MINS_MS)));
        var avgMins = Math.round(totalMins/28);
		var imagesrc = usageUtil.getIcon(progressInfo.appStats[i].packageName);
		change = (getTotalTimeAppWeek(progressInfo.appStats[i], 0) === 0 ? 0.1 : Math.round((getTotalTimeAppWeek(progressInfo.appStats[i], 0) - getTotalTimeAppWeek(progressInfo.appStats[i], 1))/getTotalTimeAppWeek(progressInfo.appStats[i], 0)));
        var percChange = (change ===  0.1 ? "" : (change > 0 ? "+" : "-") + change + "%");
        var appObj = new weekApp(name, avgMins, imagesrc, percChange, totalMins);
		weekApps.push(appObj);
    }
    weekApps.sort(function compare(a, b) {
    if (a.totalMins < b.totalMins) {
      return 1;
    } else if (a.totalMins > b.totalMins) {
      return -1;
    }
    return 0;
  	});
    var weekList = view.getViewById(page, "weekList");
	weekList.items = weekApps;
    //COME BACK TO 
    var pChange = view.getViewById(page, "perChange");
    console.log(pChange);
    if (change >= 0) {
        pChange.color(Color.GREEN);
    } else {
        pChange.color(Color.RED);
    }
 }


exports.populateListViewMonth = function () {
	var totalTimePhoneMonth = (totalTimeMonth("total") === 0 ? 0 : Math.round(totalTimeMonth("total")/MINS_MS));
    var totalTarget = (totalTimeMonth("target") === 0 ? 0 : Math.round(totalTimeMonth("target")/MINS_MS));
    var perc = (totalTimePhoneMonth === 0 ? 0 : Math.round(totalTarget/totalTimePhoneMonth)*100); 
    var avgUnlocks = (totalTimeMonth("unlocks") === 0 ? 0 : Math.round(totalTimeMonth("unlocks")/28));
    var avgHrs = Math.round(totalTimePhoneMonth/(28*6))/10

	var monthStats = [];
	monthStats.push(
	{
		value: avgHrs,
		desc: "avg hrs on phone/day"
	},
	{
		value: avgUnlocks,
		desc: "avg unlocks/day"
	},
    {
        value: perc + "%",
        desc: "time on watchlist"
    }
	)
	var monthButtons = view.getViewById(page, "monthButtons");
	monthButtons.items = monthStats;

    var monthApps=[];
    for(var i = 0; i < progressInfo.appStats.length; ++i) {
        var name = usageUtil.getAppName(progressInfo.appStats[i].packageName);
        var totalMins = (getTotalTimeAppMonth(progressInfo.appStats[i], 0) === 0 ? 0 : Math.round(getTotalTimeAppWeek(progressInfo.appStats[i], 0)/(MINS_MS)));
        var avgMins = Math.round(totalMins/28);
        var imagesrc = usageUtil.getIcon(progressInfo.appStats[i].packageName);
        var appObj = new monthApp(name, avgMins, imagesrc, totalMins);
        monthApps.push(appObj);
    }
    monthApps.sort(function compare(a, b) {
    if (a.totalMins < b.totalMins) {
      return 1;
    } else if (a.totalMins > b.totalMins) {
      return -1;
    }
    return 0;
    });
    var monthList = view.getViewById(page, "monthList");
    monthList.items = monthApps;
  


};





getTotalTimeAppMonth = function(array) {
    var sum = 0;
    for (var i = 0; i <= TODAY; i++) {
        sum += array[i].time;
    }
    return sum;
}





//Returns the total time spent on an app in a week in ms when passed in an appStat
getTotalTimeAppWeek = function(array, weeksAgo) {
    var week = 4-weeksAgo
    var start = 7*(week-1)
    var end = week*7
    var sum = 0;
    for (var i = start; i < end; i++) {
        sum += array[i].time;
    }
    return sum;
}




totalTimeWeek = function(weeksAgo, value) {
    var week = 4-weeksAgo
    var start = 7*(week-1)
    var end = week*7
    var sum = 0;
    for (var i = start; i < end; i++) {
        switch(value) {
            case ("total"):
                 sum += progressInfo.phoneStats[i].totalTime;
            case ("target"):
                sum += progressInfo.phoneStats[i].time;
            case ("glances"):
                sum += progressInfo.phoneStats[i].glances;
            case ("unlocks"):
                sum += progressInfo.phoneStats[i].unlocks;
        }
    }
    return sum;
}

totalTimeMonth = function(value) {
    var sum = 0;
    for (var i = 0; i <= TODAY; i++) {
        switch(value) {
            case ("total"):
                 sum += progressInfo.phoneStats[i].totalTime;
            case ("target"):
                sum += progressInfo.phoneStats[i].time;
            case ("glances"):
                sum += progressInfo.phoneStats[i].glances;
            case ("unlocks"):
                sum += progressInfo.phoneStats[i].unlocks;
        }
    }
    return sum;
}


//Returns a list of apps used today with their name, visits, icon and minutes in ascending order
exports.getAppsToday = function() {
    var list = [];
    for (i = 0; i < progressInfo.appStats.length; i++) {
        var mins = Math.round(progressInfo.appStats[i][TODAY].time/MINS_MS);
        var visits = progressInfo.appStats[i][TODAY].visits;
        var name = usageUtil.getAppName(progressInfo.appStats[i].packageName);
        var icon = usageUtil.getIcon(progressInfo.appStats[i].packageName);
        list.push({
            name: name,
            visits: visits,
            image: icon,
            mins: mins
        })
    }
    // sort appsToday
    list.sort(function compare(a, b) {
    if (a.mins < b.mins) {
      return 1;
    } else if (a.mins > b.mins) {
      return -1;
    }
    return 0;
    })
    return list;
};

   

function monthApp(name, avgMins, imagesrc, totalMins) {
    this.name = name;
    if (avgMins < 0) avgMins = 0;
    this.avgMins = avgMins;
    this.image = imagesrc;
    this.totalMins = totalMins;
}

function weekApp(name, avgMins, imagesrc, percChange, totalMins) {
    this.name = name;
    if (avgMins < 0) avgMins = 0;
    this.avgMins = avgMins;
    this.percChange = percChange;
    this.image = imagesrc;
    this.totalMins = totalMins;
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
    var names = Array.create(java.lang.String, progressInfo.appStats.length);
    for (let i = 0; i < progressInfo.appStats.length; ++i) {
        names[i] = usageUtil.getAppName(progressInfo.appStats[i].packageName);
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


//Returns the spannable string for the center of the pie chart
function getSpannableString() {
    var total = (Math.round(progressInfo.phoneStats[TODAY].time/MINS_MS));
    if (total === 0) {
        var myString = new SpannableString("You have not spent any time on your target apps today!\n Keep up the good work!" );
        myString.setSpan(new RelativeSizeSpan(1.2), 0, myString.length(), 0);
        myString.setSpan(new ForegroundColorSpan(Color.GRAY), 0, myString.length(), 0);
        myString.setSpan(new StyleSpan(Typeface.ITALIC),0, myString.length(), 0);
        return myString;
    }
    //Total
    var myString = new SpannableString("Total:\n" + total + "\nmins" );
    myString.setSpan(new RelativeSizeSpan(1.2), 0, 6, 0);
    myString.setSpan(new ForegroundColorSpan(Color.GRAY), 0, 6, 0);

    //#mins
    myString.setSpan(new RelativeSizeSpan(2.0), 6,myString.length()-5,0);
    if (total <= storageUtil.getPhoneGoals().minutes) {
        myString.setSpan(new ForegroundColorSpan(Color.parseColor("#69BD68")), 6,myString.length()-5,0);

    } else {
        myString.setSpan(new ForegroundColorSpan(Color.RED), 6,myString.length()-5,0);
    }
  
    //mins
    myString.setSpan( new RelativeSizeSpan(0.9), myString.length()-5, myString.length(), 0);
    myString.setSpan(new ForegroundColorSpan(Color.GRAY), myString.length()-5, myString.length(), 0);
    myString.setSpan(new StyleSpan(Typeface.ITALIC), myString.length()-5, myString.length(), 0);
    return myString;

}


exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};