var StorageUtil = require("~/util/StorageUtil");
var UsageUtil = require('~/util/UsageInformationUtil');
var frame = require('ui/frame');
var observable = require("data/observable");

var drawer;
var page;
var events;
var pkgs;

exports.onItemTap = function(args) {
  events.push({category: "navigation", index: "watchlist_to_detail"});
  
  var info = args.view.bindingContext;
  frame.topmost().navigate({
    moduleName: 'views/appDetailView/appDetailView',
    context: { 
      name: info.name,
      icon: info.icon,
      packageName: info.packageName
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
  pkgs = StorageUtil.getSelectedPackages().map(function (pkgName) {
    var basicInfo = UsageUtil.getBasicInfo(pkgName);
    return {
      packageName: pkgName,
      name: basicInfo.name,
      icon: basicInfo.icon
    }
  });
  pageData.set('watchlist', pkgs);
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};

exports.toggleDrawer = function() {
  events.push({category: "navigation", index: "menu"});
  drawer.toggleDrawerState();
};

exports.onManage = function() {
  frame.topmost().navigate('views/appsView/appsView');
};