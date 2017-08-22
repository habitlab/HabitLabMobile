var StorageUtil = require("~/util/StorageUtil");
var IM = require('~/interventions/InterventionManager');
var ID = require('~/interventions/InterventionData');
var Toast = require('nativescript-toast');
var fancyAlert = require("nativescript-fancyalert");
var gestures = require("ui/gestures").GestureTypes;
var observable = require("data/observable");

var builder = require('ui/builder');
var frameModule = require('ui/frame');
var FancyAlert = require("~/util/FancyAlert");

var drawer;
var page;
var interventionList;
var events;
var search;
var pageData = new observable.Observable();

exports.onSearch = function(args) {
  setList();
};

exports.onShowSearch = function(args) {
  search.visibility = search.visibility === 'visible' ? 'collapse' : 'visible';
};

var types = {toast: 0, notification: 1, dialog: 2, overlay: 3};
var order = {priority: 0, easy: 1, medium: 2, hard: 3};
var initializeList = function() {
  interventionList = ID.interventionDetails.filter(function (nudge) {
    // check if the nudge is implemented
    if (!IM.interventions[nudge.id]) return false;

    // check that if apps is specified then they have watchlisted a specified app for that nudge
    var canIntervene = !ID.interventionDetails[nudge.id].apps;
    if (!canIntervene) {
      var appList = StorageUtil.getSelectedPackages();
      var result = appList.filter(function (item) { 
        return ID.interventionDetails[nudge.id].apps.indexOf(item) > -1;
      });
      if (!result.length) return false;
    }

    return true;
  });

  interventionList.push({
    title: 'Hint Bubbles',
    isHeader: true,
    style: 'toast',
    level: 'priority'
  }, {
    title: 'Notifications',
    isHeader: true,
    style: 'notification',
    level: 'priority'
  }, {
    title: 'Alerts',
    isHeader: true,
    style: 'dialog',
    level: 'priority'
  }, {
    title: 'Other',
    isHeader: true,
    style: 'overlay',
    level: 'priority'
  });

  interventionList.sort(function (a, b) {
    return (types[a.style] - types[b.style]) || (order[a.level] - order[b.level]) || (a.name < b.name ? -1 : 1);
  });

  pageData.set('nudges', interventionList);
};

exports.onItemTap = function(args) {
  var tappedItem = pageData.get('nudges')[args.index];
  if (!tappedItem.isHeader) {
    search.dismissSoftInput();
    frameModule.topmost().navigate({
      moduleName: "views/detailView/detailView",
      context: {
        info: tappedItem
      },
      animated: true,
      transition: {
        name: "slide",
        duration: 380,
        curve: "easeIn"
      }
    });
  }
};

// for tracking if there are actually interventions for the headers
var setList = function() {
  var styleCounts = {toast: -1, notification: -1, dialog: -1, overlay: -1};
  var filter = pageData.get('filter');
  tempList = interventionList.filter(function (nudge) {
    // check if the filter is included in the nudge (or if it is a header)
    var include = nudge.isHeader || !filter || nudge.name.toLowerCase().includes(filter) || nudge.style.includes(filter) || nudge.description.toLowerCase().includes(filter) || nudge.summary.toLowerCase().includes(filter);
    if (include) {
      styleCounts[nudge.style]++;
    }
    return include;
  });

  tempList = tempList.filter(function (nudge) {
    return styleCounts[nudge.style];
  });

  pageData.set('nudges', tempList);  
};

var visited = false;
exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "nudges_main"}];
  page = args.object;
  search = page.getViewById('search-bar');
  drawer = page.getViewById('sideDrawer');
  page.bindingContext = pageData;
  pageData.set('filter', '');
  initializeList();
  pageData.addEventListener(observable.Observable.propertyChangeEvent, function (pcd) {
    if (pcd.propertyName.toString() === 'filter') {
      setList();
    }
  });
  if (!StorageUtil.isTutorialComplete()) {
    if (!visited) {
      FancyAlert.show(FancyAlert.type.INFO, "Welcome to Nudges!", "This is where your nudges live. Try tapping on one to see what it does!", "Ok");
      visited = true;
    }
    page.getViewById('finish').visibility = 'visible';
    page.getViewById('search-icon').visibility = 'collapse';
    page.getViewById('nudges-list').height = '90%';
  }
};

exports.goToProgress = function() {
  StorageUtil.addLogEvents([{setValue: new Date().toLocaleString(), category: 'navigation', index: 'finished_tutorial'}]);
  StorageUtil.setTutorialComplete();
  fancyAlert.TNSFancyAlert.showSuccess("All set!", "HabitLab can now start helping you create better mobile habits! Just keep using your phone like normal.", "Awesome!");
  frameModule.topmost().navigate({
    moduleName: "views/progressView/progressView",
    context: { 
      fromTutorial: true
    }
  });
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};

exports.layoutUnloaded = function(args) {
  args.object.removeChildren();
};

exports.toggleDrawer = function() {
 if (!StorageUtil.isTutorialComplete()) {
    fancyAlert.TNSFancyAlert.showError("Almost done!", "Click 'Finish Tutorial' to finish setting up HabitLab!", "Got It!");
  } else {
    search.dismissSoftInput();
    events.push({category: "navigation", index: "menu"});
    drawer.toggleDrawerState();
  }
};