var StorageUtil = require("~/util/StorageUtil");
var UsageUtil = require('~/util/UsageInformationUtil');
var frameModule = require("ui/frame");
var observable = require("data/observable");
var TargetOverlay = require("~/overlays/TargetOverlay");

var drawer;
var page;
var events;
var pkgs;
var targets;

exports.onItemTap = function(args) {
  events.push({category: "navigation", index: "watchlist_to_detail"});
  
  var info = args.view.bindingContext;
  frameModule.topmost().navigate({
    moduleName: 'views/appDetailView/appDetailView',
    context: { 
      name: info.name,
      icon: info.icon,
      packageName: info.packageName,
      isWatchlist: true
    },
    animated: true,
    transition: {
      name: "slide",
      duration: 380,
      curve: "easeIn"
    }
  });
};

exports.onTargetTap = function(args) {
  events.push({category: "navigation", index: "watchlist_to_detail"});

  var info = args.view.bindingContext;
  frameModule.topmost().navigate({
    moduleName: 'views/appDetailView/appDetailView',
    context: { 
      name: info.name,
      icon: info.icon,
      packageName: info.packageName,
      isWatchlist: false
    },
    animated: true,
    transition: {
      name: "slide",
      duration: 380,
      curve: "easeIn"
    }
  });
};


var setUpList = function() {
  var listLayout = page.getViewById('watchlist-list');
  listLayout.removeChildren();

  var appList = StorageUtil.getSelectedPackages();
  appList.forEach(function (pkg) {
    listLayout.addChild(createItem(pkg));
  });
};



exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "watchlist_main"}];
  page = args.object;
  pageData = new observable.Observable();
  page.bindingContext = pageData;
  drawer = page.getViewById('sideDrawer');

  //set up watchlist list
  pkgs = StorageUtil.getSelectedPackages().map(function (pkgName) {
    var basicInfo = UsageUtil.getBasicInfo(pkgName);
    return {
      packageName: pkgName,
      name: basicInfo.name,
      icon: basicInfo.icon
    }
  });
  pageData.set('watchlist', pkgs);

  //set up targets list
  targets = StorageUtil.getTargetSelectedPackages().map(function (pkgName) {
    var basicInfo = UsageUtil.getBasicInfo(pkgName);
    return {
      packageName: pkgName,
      name: basicInfo.name,
      icon: basicInfo.icon
    }
  });
  pageData.set("target", targets);
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};

exports.toggleDrawer = function() {
  events.push({category: "navigation", index: "menu"});
  drawer.toggleDrawerState();
};

exports.onManageTargets = function() {
  var options = {
        moduleName: 'views/appsView/appsView',
        context: {
          watchlist: false
        }
  }
  frameModule.topmost().navigate(options);
};

exports.onManageWatchlist = function() {
  var options = {
        moduleName: 'views/appsView/appsView',
        context: {
          watchlist: true
        }
  }
  frameModule.topmost().navigate(options);
};