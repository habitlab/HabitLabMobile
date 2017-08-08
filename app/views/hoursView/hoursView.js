var StorageUtil = require('~/util/StorageUtil');
var imageModule = require('ui/image');
var layout = require('ui/layouts/grid-layout');
var frame = require('ui/frame');
var PercentLength = require("ui/styling/style-properties").PercentLength;

var drawer;
var page;
var days = ['s', 'm', 't', 'w', 't', 'f', 's'];
var selected;
var startPicker;
var endPicker;

// for logging
var events;
var dayChanged;
var prevStart;
var prevEnd;

exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "settings_hours"}];
  page = args.object;
  drawer = page.getViewById('sideDrawer');
  fillTimeInfo();
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};

var setTimes = function(start, end) {
  startPicker = page.getViewById('start-picker');
  endPicker = page.getViewById('end-picker');
  prevStart = start;
  prevEnd = end;

  startPicker.hour = start.h;
  startPicker.minute = start.m;
  endPicker.hour = end.h;
  endPicker.minute = end.m;
};

exports.onTimeChange = function(args) {
  console.log(args.action);
  if (args.action === 'move') {
    hourChanged = true;
  }
};

var fillTimeInfo = function() {
  var activeHours = StorageUtil.getActiveHours();
  selected = activeHours.days;

  setTimes(activeHours.start, activeHours.end);
  fillDaysGrid();
};

var fillDaysGrid = function() {
  var grid = page.getViewById('days-grid');

  days.forEach(function (item, index) {
    var image = new imageModule.Image();
    image.horizontalAlignment = 'center';
    image.verticalAlignmnet = 'center';
    image.className = 'day-label';
    image.src = "~/images/" + item + "_square.png";
    image.backgroundColor = selected[index] ? '#FFA730' : "#DCDCDC";
    image.on('tap', function (args) {
      dayChanged = true;
      selected[index] = !selected[index];
      image.backgroundColor = selected[index] ? '#FFA730' : "#DCDCDC";
    });
    layout.GridLayout.setColumn(image, index);
    grid.addChild(image);
  });

};

exports.onSave = function() {
  var startH = startPicker.hour;
  var startM = startPicker.minute;
  var endH = endPicker.hour;
  var endM = endPicker.minute;
  StorageUtil.setActiveHours({
    days: selected,
    start: {
      h: startH,
      m: startM
    },
    end: {
      h: endH,
      m: endM
    }
  });
  if (dayChanged) {
    events.push({category: "features", index: "active_days_changed"});
  }
  if (prevStart.h !== startH || prevStart.m !== startM || prevEnd.h !== endH || prevEnd.m !== endM) {
    events.push({category: "features", index: "active_hours_changed"});
  }
  frame.topmost().goBack();
};

exports.toggleDrawer = function() {
  events.push({category: "navigation", index: "menu"});
  drawer.toggleDrawerState();
};