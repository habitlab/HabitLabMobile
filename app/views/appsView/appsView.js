var application = require("application");
var UsageUtil = require("~/util/UsageInformationUtil");
var StorageUtil = require("~/util/StorageUtil");
var fancyAlert = require("nativescript-fancyalert");

var frame = require('ui/frame');
var observable = require("data/observable");
var layout = require("ui/layouts/grid-layout");
var timer = require("timer");
var LoadingIndicator = require("nativescript-loading-indicator").LoadingIndicator;

var drawer;
var pkgs;
var page;
var events;
var search;
var noResults;
var toToggle;
var appList;
var listView;
var pageData;
var isWatchlist;

exports.closeKeyboard = function() {
  search.dismissSoftInput();
};

exports.onShowSearch = function(args) {
  search.visibility = search.visibility === 'visible' ? 'collapse' : 'visible';
};

exports.itemTap = function(args) {
  events.push({category: 'features', index: 'watchlist_manage_change'});

  var index = args.object.id;

  var viewObject = args.object.parent.parent.parent.bindingContext;
  viewObject[index].isSelected = !viewObject[index].isSelected;
  toToggle[viewObject[index].packageName] = !toToggle[viewObject[index].packageName];

  listView.refresh();
};

var initializeGrid = function() {
  appList = UsageUtil.getApplicationList().map(function (appInfo) {
    appInfo.isSelected = pkgs.includes(appInfo.packageName);
    return appInfo;
  });

  appList.sort(function (a, b){
    if (a.isSelected && !b.isSelected) {
      return -1;
    } else if (!a.isSelected && b.isSelected) {
      return 1;
    }  else {
      return a.label < b.label ? -1 : 1;
    }
  });

  setGrid();
};

var setGrid = function() {

  var tempList = appList;
  var filter = pageData.get('filter');
  tempList = tempList.filter(function (appInfo) {
    return appInfo.label.toLowerCase().includes(filter.toLowerCase());
  });

  var apps = [];
  var temp;
  tempList.forEach(function (appInfo, index) {
    var toPush = (index + 1) === tempList.length;
    var mod = index % 3;

    if (mod === 0) {
      temp = {one: appInfo};
    } else if (mod === 1) {
      temp.two = appInfo;
    } else {
      temp.three = appInfo;
      toPush = true; 
    }

    if (toPush) {
      apps.push(temp);
    }
  });

  if (!apps.length) {
    noResults.visibility = 'visible';
  } else {
    noResults.visibility = 'collapse';
  }

  pageData.set('apps', apps);
};

exports.pageLoaded = function(args) { 
  events = [{category: 'page_visits', index: 'watchlist_manage'}];

  page = args.object;
  if (page.navigationContext) {
    isWatchlist = page.navigationContext.watchlist;
  }
  pageData = new observable.Observable();
  page.bindingContext = pageData;
  search = page.getViewById('search-bar');
  noResults = page.getViewById('no-results');
  drawer = page.getViewById('sideDrawer');
  listView = page.getViewById('app-list-view');

  toToggle = {};
  //edit so that selected in one doesn't show up in both

  if (isWatchlist) {
    pkgs = StorageUtil.getSelectedPackages();
    pageData.set("title", "Select apps to spend less time on");
    pageData.set("header", "Manage Watchlist");
  } else {
    pkgs = StorageUtil.getTargetSelectedPackages();
    pageData.set("title", "Select apps to spend more time on");
    pageData.set("header", "Manage Targets");
  }

  pageData.set('filter', '');
  var loader = new LoadingIndicator();
  var options = {
    message: 'Retrieving installed applications...',
    progress: 0.65,
    android: {
      indeterminate: true,
      cancelable: false,
      max: 100,
      progressNumberFormat: "%1d/%2d",
      progressPercentFormat: 0.53,
      progressStyle: 1,
      secondaryProgress: 1
    }
  };
  loader.show(options);

  timer.setTimeout(() => {
    initializeGrid();
    loader.hide();
  }, 500);

  pageData.addEventListener(observable.Observable.propertyChangeEvent, function (pcd) {
    if (pcd.propertyName === 'filter') {
      setGrid();
    }
  });
};

exports.toggleDrawer = function() {
  search.dismissSoftInput();
  events.push({category: 'navigation', index: 'menu'});
  drawer.toggleDrawerState();
};

exports.onDone = function() {
  var numToRemove = 0;
  var hasAddedPkg = false;
  Object.keys(toToggle).forEach(function(key) {
    if (!hasAddedPkg && toToggle[key]) {
      if (pkgs.includes(key)) {
        numToRemove++;
      } else {
        hasAddedPkg = true;
      }
    }
  });

  if (hasAddedPkg || (numToRemove !== pkgs.length && pkgs.length !== 0)) {
    Object.keys(toToggle).forEach(function(key) {
      if (toToggle[key]) {
        if (isWatchlist) {
          StorageUtil.togglePackage(key);
        } else {
          StorageUtil.toggleTargetPackage(key);
        }
      }
    });
    frame.topmost().goBack();
  } else {
    fancyAlert.TNSFancyAlert.showError("Uh Oh!", "Please select at least one app to monitor!", "Okay");
  }

};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};