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

exports.pageLoaded = function(args) {
  page = args.object;
  drawer = page.getViewById('sideDrawer');
  fillTimeInfo();
};

var setTimes = function(start, end) {
  startPicker = page.getViewById('start-picker');
  endPicker = page.getViewById('end-picker');

  startPicker.hour = start.h;
  startPicker.minute = start.m;
  endPicker.hour = end.h;
  endPicker.minute = end.m;
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
      selected[index] = !selected[index];
      image.backgroundColor = selected[index] ? '#FFA730' : "#DCDCDC";
    });
    layout.GridLayout.setColumn(image, index);
    grid.addChild(image);
  });

};

exports.onSave = function() {
  StorageUtil.setActiveHours({
    days: selected,
    start: {
      h: startPicker.hour,
      m: startPicker.minute
    },
    end: {
      h: endPicker.hour,
      m: endPicker.minute
    }
  });
  frame.topmost().goBack();
};
exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};