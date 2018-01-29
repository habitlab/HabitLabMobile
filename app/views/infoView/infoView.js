var drawer;
var StorageUtil = require('~/util/StorageUtil');
var events;

exports.toggleDrawer = function() {
  events.push({category: "navigation", index: "menu"});
  drawer.toggleDrawerState();
};

exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "settings_info"}];
  drawer = args.object.getViewById("sideDrawer"); 
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};