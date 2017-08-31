var usageUtil = require('~/util/UsageInformationUtil.js');
var storageUtil = require('~/util/StorageUtil.js');
var permissionUtil = require('~/util/PermissionUtil.js');
var frameModule = require("ui/frame");
var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var gestures = require("ui/gestures");
var tabView = require("ui/tab-view")
var builder = require('ui/builder');
var view = require("ui/core/view");
var imageSource = require("image-source");
var colorModule = require("tns-core-modules/color")
var Placeholder = require("ui/placeholder")
var app = require("tns-core-modules/application")
var observable = require("data/observable");
var ObservableArray = require("data/observable-array").ObservableArray;
var pageData = new observable.Observable();
var context = app.android.context;
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
var IValueFormatter = com.github.mikephil.charting.formatter.IValueFormatter
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
var FancyAlert = require("~/util/FancyAlert");

var TODAY = 27;
var page;
var drawer;
var basic;
var progressInfo;
var trackApps;
var dayApps = new ObservableArray ([]);
var weekApps = new ObservableArray ([]);
var monthApps = new ObservableArray ([]);
var piechart;
var barchart;
var monthchart;
var barchartMade = false;
var piechartMade = false;
var monthchartMade = false;
var fromTutorial = false;
var events;

exports.pageNavigating = function(args) {
    page = args.object;
     if (page.navigationContext) {
        fromTutorial = page.navigationContext.fromTutorial;
    }
    //Progress info is the array of objects containing all info needed for progress view
    progressInfo = storageUtil.getProgressViewInfo();
    //Gets arrays for the 'basic' info of the apps - names and icons    
    basic = getBasic();
    //Gets the top 5 apps to display on graphs
    trackApps = getTrackableApps();
    
}

var cb = function() {
    permissionUtil.launchAccessibilityServiceIntent();
};

exports.pageLoaded = function(args) {
    //For setting up targets from the notification
    var intent = app.android.foregroundActivity.getIntent();
    if (intent) {
        var val = intent.getStringExtra("goToTarget");
        if (val === "true") {
            intent.removeExtra("goToTarget");
            var options = {
                moduleName: 'views/watchlistView/watchlistView',
                context: {
                  index: 1,
                  fromGoals: false
                }
            } 
            frameModule.topmost().navigate(options);
        }
    }

    if (!permissionUtil.checkAccessibilityPermission()) {
        FancyAlert.show(FancyAlert.type.INFO, "Oops!", "Looks like our accessibility service was stopped, please re-enable to allow app tracking!", 
            "Take me there!", cb);
    }

  	drawer = page.getViewById("sideDrawer");
    page.bindingContext = pageData;
    progressInfo = storageUtil.getProgressViewInfo();
    trackApps = getTrackableApps();
    setUp();
};

exports.pageUnloaded = function(args) {
    storageUtil.addLogEvents(events);
};

var pages = ['day', 'week', 'month'];
exports.onIndexChange = function(args) {
    if (!events) {
        events = [];
    }
    events.push({category: "page_visits", index: "progress_" + pages[args.newIndex]});
};

/************************************
 *           DAY GRAPH             *
 ************************************/



//Creates the pie chart on the day tab --called by the placeholder
exports.dayView = function(args) {
    piechart = new PieChart(args.context);
    piechartMade = true;
    rerender_dayview()
    piechart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT,0.5));
    piechart.notifyDataSetChanged();
    piechart.invalidate();
    args.view = piechart;

};


//Refresh function for the piechart
function rerender_dayview() {
    var entries = getDayEntries();
    var dataset = new PieDataSet(entries, "");
    dataset.setSliceSpace(0);
    let dataFormatter = new IValueFormatter({
        getFormattedValue: function(value, entry, dataSetIndex, viewPortHandler) {
            return Math.round(value)+"";
        }
     })     
    // Customize appearence of the pie chart 
    var data = new PieData(dataset);
    data.setValueFormatter(dataFormatter);
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
}


//Entries for the pie chart
getDayEntries = function() {
    var total = progressInfo.phoneStats[TODAY].time;
    var entries = new ArrayList();
     for(var i = 0; i < trackApps.length; i++) {
        if (trackApps[i].mins === 0) continue;
        entries.add(new PieEntry(trackApps[i].mins, trackApps[i].name));
     }
    piechart.notifyDataSetChanged();
    piechart.invalidate();
    return entries;
}




/************************************
 *           WEEK GRAPH            *
 ************************************/



// creates the bar graph on the week tab
exports.weekView = function(args) {
    barchart = new BarChart(args.context);
    barchartMade = true;
    rerender_weekview();
    barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT, 0.5));
    barchart.notifyDataSetChanged();
    barchart.invalidate();
    args.view = barchart;
};



//Refresh view for week
function rerender_weekview() {
    var entries = getWeekEntries();
    var dataset = new BarDataSet(entries, "");
    dataset.setStackLabels(getAppNames());
    dataset.setColors(getColors(trackApps.length));
     //array of datasets
    var IbarSet = new ArrayList();
    IbarSet.add(dataset);
    var data = new BarData(IbarSet);
    data.setValueTextColor(Color.WHITE);

    let dataFormatter = new IValueFormatter({
        getFormattedValue: function(value, entry, dataSetIndex, viewPortHandler) {
            return Math.round(value)+"";
        }
     })
     data.setValueFormatter(dataFormatter);


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
    // Customize appearence of the axis
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

    //Setting up barchart
    barchart.setData(data);
    barchart.animateY(3000);
    barchart.setFitBars(true);
}



//Data for week view - returns an array of barchartentries
getWeekEntries = function() {
    //array of BarEntries
    var entries = new ArrayList();
    var other = getOther();
    for (var day = 6; day >=0; day--) {
        //array of values for each week
        var appValues = [];
        for (var app = 0; app < trackApps.length; app++) {
            if (trackApps[app].name === "Other") {
                appValues.push(other[TODAY-day]);
            } else {
                var totalTimeDay = progressInfo.appStats[trackApps[app].index][TODAY-day].time
                appValues.push(new java.lang.Integer(totalTimeDay));
            }
        }
        //now have an array of values for a week
        entries.add(new BarEntry(6-day, toJavaFloatArray(appValues)));
   }
   return entries;
}




/************************************
 *           MONTH GRAPH            *
 ************************************/


//Creates a stacked bar chart for the month view
exports.monthView = function(args) {
    monthchart = new BarChart(args.context);  
    monthchartMade = true;
    rerender_monthchart();
    monthchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT, 0.5));
    monthchart.notifyDataSetChanged();
    monthchart.invalidate();
    args.view = monthchart;
};



rerender_monthchart = function() {
    //array of BarEntries
    var entries = getMonthEntries();
    var dataset = new BarDataSet(entries, "");
    dataset.setStackLabels(getAppNames());
    dataset.setColors(getColors(trackApps.length));
    //array of datasets
    var IbarSet = new ArrayList();
    IbarSet.add(dataset);
    var data = new BarData(IbarSet);
    data.setValueTextColor(Color.WHITE);
    //Label formatters
    let dataFormatter = new IValueFormatter({
        getFormattedValue: function(value, entry, dataSetIndex, viewPortHandler) {
            return Math.round(value)+"";
        }
     })
     data.setValueFormatter(dataFormatter);
    var xLabels = toJavaStringArray(["4 weeks ago", "3 weeks ago", "2 weeks ago", "Last Week", "This Week" ])
     let axisformatter = new IAxisValueFormatter({
        getFormattedValue: function(value, axis) {
            return xLabels[value]
        },
        getDecimalDigits: function() {
            return 0
        }
     })
     //Customize appearence of the axis
    var xAxis = monthchart.getXAxis()
    var yAxis = monthchart.getAxisLeft()
    yAxis.setAxisMinimum(0)
    xAxis.setPosition(XAxis.XAxisPosition.BOTTOM);
    xAxis.setGranularity(1)
    xAxis.setDrawGridLines(false);
    monthchart.getAxisRight().setEnabled(false);
    xAxis.setValueFormatter(axisformatter)
    var desc = monthchart.getDescription();
    desc.setEnabled(Description.false);
    yAxis.setStartAtZero(true);
    monthchart.setDrawValueAboveBar(false);
    var legend = monthchart.getLegend();
    legend.setPosition(Legend.LegendPosition.BELOW_CHART_CENTER);   

    //Setting up barchart 
    monthchart.setData(data);
    monthchart.animateY(3000);
    monthchart.setFitBars(true);
}



//Returns an array of barentries
getMonthEntries = function() {
    var entries = new ArrayList();
    var other = getOther();
   for (var weeksAgo = 3; weeksAgo >=0; weeksAgo--) {
        //array of values for each week
        var appValues = [];
        for (var app = 0; app < trackApps.length; app++) {
            if (trackApps[app].name === "Other") {
                var timeOther = getTotalTimeOtherWeek(other, weeksAgo);
                appValues.push(new java.lang.Integer(timeOther));
            } else {
                var totalTimeWeekApp = getTotalTimeAppWeek(progressInfo.appStats[trackApps[app].index], weeksAgo);
                appValues.push(new java.lang.Integer(totalTimeWeekApp));
            }
        }
        entries.add(new BarEntry(4-weeksAgo, toJavaFloatArray(appValues)));
   }
   return entries;
}



/************************************
 *        LIST POPULATING           *
 ************************************/




//Creates a list view for the dayView, showing name, #times opened, and minutes 
populateListViewsDay = function() {   
     var unlocks = progressInfo.phoneStats[TODAY].unlocks;
     var glances = progressInfo.phoneStats[TODAY].glances;
     var total = progressInfo.phoneStats[TODAY].totalTime;
     var targetTime = progressInfo.phoneStats[TODAY].time;
    
	//If less than 1 hour, show minutes instead of 0.2hrs
    var totalReport;
    var timeTotalDesc;
    if (total <= 60) {
        totalReport = total;
        totalTimeDesc = "mins on phone"
    } else {
        totalReport = Math.round(total/6)/10;
        totalTimeDesc = "hrs on phone"
    }

    //'buttons' that show the usage daily overall phone usage 
	var dayStats = [];
	dayStats.push(
	{
		value: unlocks,
		desc: "unlocks"
	},
	{
		value: glances,
		desc: "glances"
	},
    {
        value: totalReport,
        desc: totalTimeDesc
    }
	)
    pageData.set("dayButtons", dayStats);
    var dayButtons = view.getViewById(page, "dayButtons");
    dayButtons.height = 0.04*SCREEN_HEIGHT;
    dayApps = getAppsToday();
    pageData.set("dayItems", dayApps);
};


//Creates list view for week, showing name, avg min.day and total minutes
populateListViewsWeek = function() {
    var timeOnPhoneWeek = totalTimeWeek(0, "total")
    var timeOnTargetAppsWeek = totalTimeWeek(0, "target");
    var unlocks = totalTimeWeek(0, "unlocks");
  
    var watchlistReport;
    var timeWatchlistDesc;
    if (timeOnTargetAppsWeek <= 60) {
        watchlistReport = timeOnTargetAppsWeek;
        timeWatchlistDesc = "mins on watchlist"
    } else {
        watchlistReport = Math.round(timeOnTargetAppsWeek/6)/10;
        timeWatchlistDesc = "hrs on watchlist"
    }

    //If less than 1 hour, show minutes instead of 0.2hrs
    var totalReport;
    var timeTotalDesc;
    if (timeOnPhoneWeek <= 60) {
        totalReport = timeOnPhoneWeek;
        totalTimeDesc = "mins on phone"
    } else {
        totalReport = Math.round(timeOnPhoneWeek/6)/10;
        totalTimeDesc = "hrs on phone"
    }


	var weekStats = [];
	weekStats.push(
	{
		value: unlocks,
        desc: "unlocks"

	},
	{
	    value: watchlistReport,
        desc: timeWatchlistDesc
	},
    {
        value: totalReport,
        desc: totalTimeDesc
    }
	)
	pageData.set("weekButtons", weekStats);
    var weekButtons = view.getViewById(page, "weekButtons");
    weekButtons.height = 0.04*SCREEN_HEIGHT;
    var weekApps = getAppsWeek();
	pageData.set("weekItems", weekApps);
 }

//Creates a list view for the month view, with name, avg min/day and total mintues
populateListViewMonth = function () {
	var totalTimePhoneMonth = totalTimeMonth("total");
    var totalTarget = totalTimeMonth("target");
    var unlocks = totalTimeMonth("unlocks"); 

    //If less than 1 hour, show minutes instead of 0.2hrs
    var watchlistReport;
    var timeWatchlistDesc;
    if (totalTarget <= 60) {
        watchlistReport = totalTarget;
        timeWatchlistDesc = "mins on watchlist"
    } else {
        watchlistReport = Math.round(totalTarget/6)/10;
        timeWatchlistDesc = "hrs on watchlist"
    }

    //If less than 1 hour, show minutes instead of 0.2hrs
    var totalReport;
    var timeTotalDesc;
    if (totalTimePhoneMonth <= 60) {
        totalReport = totalTimePhoneMonth;
        totalTimeDesc = "mins on phone"
    } else {
        totalReport = Math.round(totalTimePhoneMonth/6)/10;
        totalTimeDesc = "hrs on phone"
    }

	var monthStats = [];
	monthStats.push(
	{
		value: unlocks,
        desc: "unlocks"
	},
	   {
        value: watchlistReport,
        desc: timeWatchlistDesc
    },
    {
        value: totalReport,
        desc: totalTimeDesc
    }
	)
	pageData.set("monthButtons", monthStats);
    var monthButtons = view.getViewById(page, "monthButtons");
    monthButtons.height = 0.04*SCREEN_HEIGHT;
    var monthApps = getAppsMonth();
    pageData.set("monthItems", monthApps);
};


/************************************
 *          HELPER FUNCTIONS        *
 ************************************/

//Sets up the progress view 
setUp = function() {
    //Initialize all 'show/hide' buttons of the graphs
    pageData.set("showDayGraph", true);
    pageData.set("showWeekGraph", true);
    pageData.set("showMonthGraph", true);

    //populate all lists 
    populateListViewsDay();
    populateListViewsWeek();
    populateListViewMonth();

    //invalidate charts
    if(piechartMade) {
       rerender_dayview()
        piechart.notifyDataSetChanged();
        piechart.invalidate();
    }
    if (barchartMade) {
        rerender_weekview()
        barchart.notifyDataSetChanged();
        barchart.invalidate();
    }
    if (monthchartMade) {
        rerender_monthchart()
        monthchart.notifyDataSetChanged();
        monthchart.invalidate();
    }
    storageUtil.updateTargetDB();
}

//Allows the list to be pressable 
exports.goToDetailApps = function(args) {
    var tappedItem = args.view.bindingContext;
    events.push({category: "navigation", index: "progress_to_detail"});

    frameModule.topmost().navigate({
    moduleName: 'views/appDetailView/appDetailView',
    context: { 
        packageName: getPackageName(tappedItem.name),
        name: tappedItem.name,
        icon: tappedItem.image,
        isWatchlist: true
    },
    animated: true,
    transition: {
      name: "slide",
      duration: 380,
      curve: "easeIn"
    }
  });
}


getOther = function() {
    var appsAll = getAppsToday();
    var other = [];
    for (var day = TODAY; day >=0; day--) {
        var otherSum = 0;
        for (var i = 4; i < appsAll.length; i++) {
            otherSum += progressInfo.appStats[appsAll[i].index][TODAY-day].time
        }
        other[TODAY-day] = otherSum;
    }
    return other;
}


//Gets the reduced list of up to 5 app (objects) to track. Eack app is an object with a:
// name: name,
// visits: visits,
// image: icon,
// mins: mins,
// index: index
//Apart from other, which has a name, and mins
getTrackableApps = function() {
    var appsToday = getAppsToday();
    if (appsToday.length <= 5) {
        return appsToday;
     } else if (appsToday.length > 5) {
        //If there are more than 4 entries in the pie chart, use 'other' for the 5th label
        var trackApps;
        trackApps = appsToday.slice(0,4);
        var other = getOther();
        trackApps.push({
            name: "Other",
            mins: other[TODAY]
        })
    }
    return trackApps;
}


//Returns the total time spent on a specific app in a month when passed in that app's object
getTotalTimeAppMonth = function(array) {
    var sum = 0;
    for (var i = 0; i <= TODAY; i++) {
        sum += array[i].time;
    }
    return sum;
}

//Returns the total time spent on an app in a week in mins when passed in an appStat
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

//Returns the total time spent on 'other' in a week in mins
getTotalTimeOtherWeek = function(array, weeksAgo) {
    var week = 4-weeksAgo
    var start = 7*(week-1)
    var end = week*7
    var sum = 0;
    for (var i = start; i < end; i++) {
        sum += array[i];
    }
    return sum;
}



//Returns the total # of any value for any given week (0, 1, 2 or 3 weeks ago)
totalTimeWeek = function(weeksAgo, value) {
    var week = 4-weeksAgo
    var start = 7*(week-1)
    var end = week*7
    var sum = 0;
    for (var i = start; i < end; i++) {
        switch(value) {
            case ("total"):
                 sum += progressInfo.phoneStats[i].totalTime;
                 continue;
            case ("target"):
                sum += progressInfo.phoneStats[i].time;
                continue;
            case ("glances"):
                sum += progressInfo.phoneStats[i].glances;
                continue;
            case ("unlocks"):
                sum += progressInfo.phoneStats[i].unlocks;
                continue;
        }
    }
    return sum;
}

//Returns the total # of any value for a month
totalTimeMonth = function(value) {
    var sum = 0;
    for (var i = 0; i <= TODAY; i++) {
        switch(value) {
            case ("total"):
                 sum += progressInfo.phoneStats[i].totalTime;
                 continue;
            case ("target"):
                sum += progressInfo.phoneStats[i].time;
                continue;
            case ("glances"):
                sum += progressInfo.phoneStats[i].glances;
                continue;
            case ("unlocks"):
                sum += progressInfo.phoneStats[i].unlocks;
                continue;
        }
    }
    return sum;
}


//Returns a list of apps used today with their name, visits, icon and minutes in ascending order
getAppsToday = function() {
    var list = [];
    for (i = 0; i < progressInfo.appStats.length; i++) {
        var mins = progressInfo.appStats[i][TODAY].time;
        var visits = progressInfo.appStats[i][TODAY].visits;
        var name = basic[i].name;
        var icon = basic[i].icon;
        var index = i;
        list.push({
            name: name,
            visits: visits,
            icon: icon,
            mins: mins,
            index: index
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

//Returns the total time spent on waitlist apps this week as an array of app objects
getAppsWeek = function () {
    var weekApps = [];
    for(var i = 0; i < progressInfo.appStats.length; ++i) {
        var name = basic[i].name;
        var totalMins = getTotalTimeAppWeek(progressInfo.appStats[i], 0);
        var avgMins = Math.round(totalMins/7);
        var icon = basic[i].icon;
        var change = (getTotalTimeAppWeek(progressInfo.appStats[i], 1) === 0  || getTotalTimeAppWeek(progressInfo.appStats[i],0) === 0 ? 0.1 : Math.round(((getTotalTimeAppWeek(progressInfo.appStats[i], 0) - getTotalTimeAppWeek(progressInfo.appStats[i], 1))/getTotalTimeAppWeek(progressInfo.appStats[i], 0))*100));
        var percChange = (change ===  0.1 ? "" : (change > 0 ? "+" : "") + change + "%");
        var percDesc = (percChange === "" ? "" : "from last week");
        weekApps.push({
            name: name,
            avgMins: avgMins,
            image: icon,
            percChange: percChange,
            totalMins: totalMins,
            percDesc: percDesc
        })
    }
    weekApps.sort(function compare(a, b) {
    if (a.totalMins < b.totalMins) {
      return 1;
    } else if (a.totalMins > b.totalMins) {
      return -1;
    }
    return 0;
    });
    return weekApps;
}

//Returns the total time spent on waitlist apps this month as an array of app objects
getAppsMonth = function() {
    var monthApps = [];
     for(var i = 0; i < progressInfo.appStats.length; ++i) {
        var icon = basic[i].icon;
        var totalMins = getTotalTimeAppMonth(progressInfo.appStats[i], 0);
        var avgMins = Math.round(totalMins/28);
        var name = basic[i].name;
        monthApps.push({
            name: name,
            avgMins: avgMins,
            image: icon,
            totalMins: totalMins
        })
    }
    monthApps.sort(function compare(a, b) {
    if (a.totalMins < b.totalMins) {
      return 1;
    } else if (a.totalMins > b.totalMins) {
      return -1;
    }
    return 0;
    });
    return monthApps;
}

//Gets basic info (name and icon) from usageUtil
getBasic = function() {
    var basic = [];
    for (let i = 0; i < progressInfo.appStats.length; ++i) {
        var appInfo = usageUtil.getBasicInfo(progressInfo.appStats[i].packageName);
        var name = appInfo.name;
        var icon = appInfo.icon;
        basic.push({
            name: name,
            icon: icon
        })
    }
    return basic;
}



//Colors to be used in graphs 
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


//Convert javascript arrays to java arrays
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


//Returns a java array of just the app names (used for stack labels)
function getAppNames() {
    var names = Array.create(java.lang.String, 5);
    for (let i = 0; i < trackApps.length; ++i) {
        names[i] = trackApps[i].name;
    }
    return names;
}

//Returns the package name for a given app 'name' - used in navigation
function getPackageName(name) {
     for (let i = 0; i < progressInfo.appStats.length; ++i) {
        if (name === basic[i].name) {
            return progressInfo.appStats[i].packageName;
        }
    }
    return null;
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
    var total = progressInfo.phoneStats[TODAY].time;
    if (total === 0) {
        var myString;
        if (fromTutorial) {
            myString = new SpannableString("This is where your daily progress will show up.\n Happy habit building!")
        } else {
             myString = new SpannableString("You have not spent any time on your watchlist apps today!\n Keep up the good work!" );
        }
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

//Toggle for day/week/month graphs
exports.toggle = function () {
    pageData.set("showDayGraph", !pageData.get("showDayGraph"));
}

exports.toggleWeek = function() {
    pageData.set("showWeekGraph", !pageData.get("showWeekGraph"));
}

exports.toggleMonth = function() {
    pageData.set("showMonthGraph", !pageData.get("showMonthGraph"));
}

exports.onDayTap = function(args) {
    events.push({category: "features", index: "progress_toggle_graph"});
    exports.toggle();
}

exports.onWeekTap = function(args) {
    events.push({category: "features", index: "progress_toggle_graph"});
    exports.toggleWeek();
}

exports.onMonthTap = function(args) {
    events.push({category: "features", index: "progress_toggle_graph"});
    exports.toggleMonth();
}


exports.toggleDrawer = function() {
    events.push({category: "navigation", index: "menu"});
    drawer.toggleDrawerState();
};


//Controlls the back button
exports.backEvent = function(args) {
   if(fromTutorial) {
        var foreground = app.android.foregroundActivity;
        if (foreground) {
            foreground.finish();
        }
   } else {
        frameModule.topmost().goBack();
   }
}

//Checks if the pernission service is running 
var permissionServiceIsRunning = function () {
    var manager = app.android.context.getSystemService(android.content.Context.ACTIVITY_SERVICE);
    var services = manager.getRunningServices(java.lang.Integer.MAX_VALUE);
    for (var i = 0; i < services.size(); i++) {
        var service = services.get(i);
        if (service.service.getClassName() === com.habitlab.AccessibilityCheckerService.class.getName()) {
            return true;
        }
    }
    return false;
};





