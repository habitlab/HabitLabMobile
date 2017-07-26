var StorageUtil = require('~/util/StorageUtil');
var UsageUtil = require('~/util/UsageInformationUtil');
var IM = require('~/interventions/InterventionManager');

var builder = require('ui/builder');
var gestures = require('ui/gestures').GestureTypes;

var usageUtil = require('~/util/UsageInformationUtil.js');
var storageUtil = require('~/util/StorageUtil.js');
var frameModule = require("ui/frame");
var gestures = require("ui/gestures");
var view = require("ui/core/view");
var imageSource = require("image-source");
var colorModule = require("tns-core-modules/color")
var Placeholder = require("ui/placeholder")
var app = require("tns-core-modules/application")
var observable = require("data/observable");
var pageData = new observable.Observable();
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
var Legend = com.github.mikephil.charting.components.Legend
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

var drawer;
var page;
var pkg;
var name;
var icon;
var index;

var createItem = function(enabled, id)  {
  var item = builder.load({
    path: 'shared/togglelistelem',
    name: 'togglelistelem'
  });

  item.id = 'intervention' + id;
  item.className = 'app-detail-grid';

  var label = item.getViewById("name");
  label.text = StorageUtil.interventionDetails[id].name;
  label.className = "app-detail-label";
    
  var sw = item.getViewById("switch");
  sw.checked = enabled;
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForApp(id, pkg);
  });

  return item;
};

var setUpDetail = function(packageName) {
  page.getViewById('app-detail-title').text = name;
  page.getViewById('app-detail-icon').src = icon;

  var goalChanger = page.getViewById('goal-changer');
  goalChanger.getViewById('name').text = 'Goal:';
  goalChanger.getViewById('icon').visibility = 'collapse';
  goalChanger.getViewById('number').text = StorageUtil.getMinutesGoal(pkg);
  goalChanger.getViewById('label').text = 'mins';

  goalChanger.getViewById('plus').on(gestures.tap, function() {
    var newNum = getGoal(number.text, true);
    number.text = newNum;
    StorageUtil.changeAppGoal(pkg, newNum, 'minutes');
  });

  goalChanger.getViewById('minus').on(gestures.tap, function() {
    var newNum = getGoal(number.text, false);
    number.text = newNum;
    StorageUtil.changeAppGoal(pkg, newNum, 'minutes');
  });

  var layout = page.getViewById('list');
  var interventions = StorageUtil.getInterventionsForApp(packageName);

  interventions.forEach(function (enabled, id) {
    if (!layout.getViewById('intervention' + id) && StorageUtil.interventionDetails[id].target === 'app') {
      layout.addChild(createItem(enabled, id));
    }
  });

};

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};




exports.pageNavigating = function(args) {
  console.log('pageNavigating')
  page = args.object;
  if ( page.navigationContext) {
    console.log('pageNavigating have navigationContext')
    pkg = page.navigationContext.packageName;
    console.dir(pkg);
    name = page.navigationContext.name;
    icon = page.navigationContext.icon;
    setUpDetail(pkg);
  }
}





function toJavaStringArray(arr) {
    var output = Array.create(java.lang.String, arr.length)
    for (let i = 0; i < arr.length; ++i) {
        output[i] = arr[i]
    }
    return output
}



exports.weekView = function(args) {
  var packageNames = progressInfo.appStats.map(function(app){
      return app.packageName;
    });
    index = packageNames.indexOf(pkg);
    var barchart = new BarChart(args.context);
    //array of datasets
    var IbarSet = new ArrayList();
    //array of BarEntries
    var entries = new ArrayList();
    for (var day = 6; day >=0; day--) {
      //array of values for each week
      var totalTimeDay = Math.round(progressInfo.appStats[index][TODAY-day].time/MINS_MS)
      entries.add(new BarEntry(6-day, totalTimeDay));
   }
    var dataset = new BarDataSet(entries, "");
    //dataset.setStackLabels(toJavaStringArray(getAppNames()));
    dataset.setColor(Color.parseColor("#DAECF3"));
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
    legend.setEnabled(false);

     barchart.animateY(3000);
   barchart.setFitBars(true);
   barchart.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0.42*SCREEN_HEIGHT, 0.5));
   barchart.invalidate();
   args.view = barchart;
};





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
