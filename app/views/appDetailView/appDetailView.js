var StorageUtil = require('~/util/StorageUtil');
var IM = require('~/interventions/InterventionManager');
var ID = require('~/interventions/InterventionData');
var dialogs = require("ui/dialogs");
var builder = require('ui/builder');
var gestures = require('ui/gestures').GestureTypes;

var frameModule = require("ui/frame");
var view = require("ui/core/view");
var imageSource = require("image-source");
var colorModule = require("tns-core-modules/color")
var Placeholder = require("ui/placeholder")
var app = require("tns-core-modules/application")
var observable = require("data/observable");
var pageData = new observable.Observable();
var context = app.android.context;
var goalApps;
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
var Legend = com.github.mikephil.charting.components.Legend
var Easing = com.github.mikephil.charting.animation.Easing;
var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
var StyleSpan = android.text.style.StyleSpan;
var RelativeSizeSpan = android.text.style.RelativeSizeSpan;
var Typeface = android.graphics.Typeface;
var Resources = android.content.res.Resources;
var SCREEN_HEIGHT = Resources.getSystem().getDisplayMetrics().heightPixels;
var TODAY = 27;
var MINS_MS = 60000;
var LimitLine = com.github.mikephil.charting.components.LimitLine;

var drawer;
var page;
var pkg;
var name;
var icon;
var appStats;
var container;
var events;
var goalChanged;
var open;
var number;

var getGoal = function(txt, add) {
  var num = txt.replace(/[^0-9]/g, '') || 0;

  var newNum = parseInt(num) - 5;
  if (add) {
    newNum += 10;
  }
  
  if (newNum > 1440) {
    newNum = 1440;
  } else if (newNum < 0) {
    newNum = 0
  }
  return newNum;
};

exports.pageNavigating = function(args) {
  page = args.object;
  if (page.navigationContext) {
    pkg = page.navigationContext.packageName;
    appStats = StorageUtil.getAppStats(pkg);
    name = page.navigationContext.name;
    icon = page.navigationContext.icon;
  }
};

exports.pageLoaded = function(args) {
  events = [{category: 'page_visits', index: 'watchlist_detail'}];
  drawer = page.getViewById('sideDrawer');
  container = page.getViewById("slides");
  setUpDetail();
};

var closePrevious = function(openedItem, item) {
  if (openedItem) {
    if (open) {
      open.getViewById('icon2').visibility = 'collapse';
      open.getViewById('description').visibility = 'collapse';
      open.getViewById('button').visibility = 'collapse';
    }
    open = item;
  } else if (!openedItem) {
    open = null;
  }
};

//Sets up goals
var setUpDetail = function() {
  page.getViewById('app-detail-title').text = name;
  page.getViewById('app-detail-icon').src = icon;

  var goalChanger = page.getViewById('goal-changer');
  goalChanger.className += ' goal-changer';
  goalChanger.getViewById('name').visibility = 'collapse';
  goalChanger.getViewById('icon').visibility = 'hidden';
  goalChanger.getViewById('label').text = 'mins';
  
  number = goalChanger.getViewById('number');
  number.text = StorageUtil.getMinutesGoal(pkg);
  number.on("unloaded", function(args) {
    StorageUtil.changeAppGoal(pkg, parseInt(number.text.replace(/[^0-9]/g, '') || 0), 'minutes');
    if (goalChanged) {
      events.push({category: "features", index: "watchlist_detail_appgoal_change"});
    }
  });

  goalChanger.getViewById('plus').on(gestures.tap, function() {
    goalChanged = true;
    number.text = getGoal(number.text, true);
  });

  goalChanger.getViewById('minus').on(gestures.tap, function() {
    goalChanged = true;
    number.text = getGoal(number.text, false);
  });

  var list = page.getViewById('list');
  list.removeChildren();

  var interventions = StorageUtil.getInterventionsForApp(pkg);
  var order = {easy: 0, medium: 1, hard: 2};
  var interventionList = ID.interventionDetails.filter(function (item, id) {
    return item.target === 'app' && (!item.apps || item.apps.includes(pkg)) && IM.interventions[item.id];
  }).sort(function (a, b) {
    return (order[a.level] - order[b.level]) || (a.name < b.name ? -1 : 1);
  });
  
  var first = true;
  interventionList.forEach(function (item) {
    list.addChild(createItem(interventions[item.id], item.id, first));
    first = false;
  });
};

var createItem = function(enabled, id, first)  {
  var item = builder.load({
    path: 'shared/detailelem',
    name: 'detailelem',
    page: page
  });

  item.id = 'intervention' + id;
  item.className = 'app-detail-grid';
  var button = item.getViewById('button');
  button.text = 'DISABLE ALL';
  button.className = 'app-detail-disable-button';
  button.on('tap', function() {
    events.push({category: 'features', index: 'watchlist_detail_disable_all'});
    dialogs.confirm({
      title: "Disable this Nudge?",
      message: "This means the nudge will no longer show up for any apps.",
      okButtonText: "Disable",
      cancelButtonText: "Cancel"
    }).then(function (result) {
      if (result) {
        StorageUtil.disableForAll(id);
        events.push({category: 'features', index: 'watchlist_detail_disable_all_confirm'});
      }
    });
  });

  var description = item.getViewById('description');
  description.className = 'app-detail-nudge-description';
  description.text = ID.interventionDetails[id].summary;
  description.textWrap = true;

  var image = item.getViewById('icon');
  image.src = ID.interventionDetails[id].icon;
  image.className = 'app-intervention-icon';

  var image2 = item.getViewById('icon2');
  image2.src = ID.interventionDetails[id].icon;
  image2.className = 'app-intervention-icon';

  if (first) {
    open = item;
    image2.visibility = 'hidden';
    description.visibility = 'visible';
    button.visibility = 'visible';
  }

  var sw = item.getViewById("switch");
  sw.checked = enabled;
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForApp(id, pkg);
    events.push({category: 'features', index: 'watchlist_detail_toggle'});
  });

  var label = item.getViewById("name");
  label.text = ID.interventionDetails[id].name;
  label.className = "app-detail-label";

  var firstRow = item.getViewById('firstrow');
  firstRow.className = ID.interventionDetails[id].level + '-level';

  item.on("tap, touch", function (args) {
    if (args.eventName === 'tap') {
      image2.visibility = image2.visibility === 'hidden' ? 'collapse' : 'hidden';
      description.visibility = description.visibility === 'visible' ? 'collapse' : 'visible';
      button.visibility = description.visibility;
      closePrevious(image2.visibility === 'hidden', item);
      events.push({category: 'features', index: 'watchlist_detail_expand'});
    } else {
      if (args.action === 'down') {
        item.backgroundColor = '#F5F5F5';
      } else if (args.action === 'up' || args.action === 'cancel') {
        item.backgroundColor = '#FFFFFF';
      }
    }
  });
  
  return item;
}


// //Sets up graph
exports.weekView = function(args) {
    var barchart = new BarChart(args.context);
    //array of datasets
    var IbarSet = new ArrayList();
    //array of BarEntries
    var entries = makeWeekArray();
    var dataset = new BarDataSet(entries, "");
    dataset.setColor(Color.parseColor("#FFA730"));
    IbarSet.add(dataset);
    var data = new BarData(IbarSet);
    data.setValueTextColor(Color.WHITE);
    let dataFormatter = new IValueFormatter({
      getFormattedValue: function(value, entry, dataSetIndex, viewPortHandler) {
          return Math.round(value)+"";
      }
   })
   data.setValueFormatter(dataFormatter);
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
    legend.setEnabled(false);

     //goal and average lines 
    var avg = Math.round(getTotalTimeAppWeek(appStats, 0)/(7));
    var avgLine = new LimitLine(avg, "Average");
    avgLine.setLineWidth(2);
    avgLine.setTextColor(Color.parseColor("#737373"));
    var goal = appStats.goals.minutes;
    var goalLine = new LimitLine(goal, "Goal");
    goalLine.setLineWidth(2);
    //Gray
    goalLine.setTextColor(Color.parseColor("#737373"));
    //Blue
    goalLine.setLineColor(Color.parseColor("#37879A"));
    if (avg <= goal) {
      //Green
      avgLine.setLineColor(Color.parseColor("#69BD68"));
    } else {
      //Red
      avgLine.setLineColor(Color.parseColor("#E71D36"));
    }
    yAxis.addLimitLine(avgLine);
    yAxis.addLimitLine(goalLine);



    //disable all touch events
    barchart.setTouchEnabled(false);
    barchart.setDragEnabled(false);

    barchart.animateY(1000);
    barchart.setFitBars(true);
    barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT, 0.5));
    barchart.invalidate();
    args.view = barchart;
};


exports.goToMonth = function() {
  container.nextSlide();
  events.push({category: 'features', index: 'watchlist_detail_arrow'});
}

exports.goToWeek = function() {
  container.previousSlide();
  events.push({category: 'features', index: 'watchlist_detail_arrow'});
}


exports.monthView = function(args) {
  var barchart = new BarChart(args.context);
  //array of datasets
  var IbarSet = new ArrayList();
  //array of BarEntries
  var entries = makeMonthArray();
  var dataset = new BarDataSet(entries, "");
  dataset.setColor(Color.parseColor("#F18391"));
  var xLabels = getMonthLabels();
  
  IbarSet.add(dataset);
  var data = new BarData(IbarSet);
   let dataFormatter = new IValueFormatter({
      getFormattedValue: function(value, entry, dataSetIndex, viewPortHandler) {
          return Math.round(value)+"";
      }
   })
   data.setValueFormatter(dataFormatter);
  data.setValueTextColor(Color.WHITE);

  //set axis labels
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
    legend.setEnabled(false);

    //goal and average lines 
    var avg = Math.round(getTotalTimeAppMonth(appStats)/(28));
    var avgLine = new LimitLine(avg, "Average");
    avgLine.setLineWidth(2);
    avgLine.setTextColor(Color.parseColor("#737373"));
    var goal = appStats.goals.minutes;
    var goalLine = new LimitLine(goal, "Goal");
    goalLine.setLineWidth(2);
    //Gray
    goalLine.setTextColor(Color.parseColor("#737373"));
    //Blue
    goalLine.setLineColor(Color.parseColor("#37879A"));
    if (avg <= goal) {
      //Green
      avgLine.setLineColor(Color.parseColor("#69BD68"));
    } else {
      //Red
      avgLine.setLineColor(Color.parseColor("#E71D36"));
    }
    yAxis.addLimitLine(avgLine);
    yAxis.addLimitLine(goalLine);

     //disable all touch events
    barchart.setTouchEnabled(false);
    barchart.setDragEnabled(false);
    barchart.setData(data);
    barchart.animateY(1000);
    barchart.setFitBars(true);
    barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT, 0.5));
    barchart.invalidate();
    args.view = barchart;
    
  };



// //Returns the total time spent on an app in a month when passed in that app's object
getTotalTimeAppMonth = function(array) {
    var sum = 0;
    for (var i = 0; i <= TODAY; i++) {
        sum += array[i].time;
    }
    return sum;
}


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


makeWeekArray = function() {
  var weekData = new ArrayList();
     for (var day = 6; day >=0; day--) {
      //array of values for each week
      var totalTimeDay = Math.round(appStats[TODAY-day].time)
      weekData.add(new BarEntry(6-day, totalTimeDay));
   }
   return weekData;
}

makeMonthArray = function() {
  var monthData = new ArrayList();
  for (var day = 27; day >= 0; day--) {
    var totalTimeDay = Math.round(appStats[TODAY-day].time)
    monthData.add(new BarEntry(27-day, totalTimeDay));
  }
  return monthData;
}



getMonthLabels = function() {
  var monthLabels = [];
  var format = new SimpleDateFormat("MMM d", Locale.US);
  var today = Calendar.getInstance();

   for (var i = 0; i < 28; i++) {
        var end = Calendar.getInstance();
        end.setTimeInMillis(today.getTimeInMillis() - (27-i)*(86400 * 1000));
        var day = format.format(end.getTime());
        monthLabels.push(day);
    }
    return monthLabels;
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
  number.dismissSoftInput();
  events.push({category: 'navigation', index: 'menu'});
  drawer.toggleDrawerState();
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};