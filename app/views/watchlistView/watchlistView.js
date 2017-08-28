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
  console.warn("is console.warn working")
  events = [{category: "page_visits", index: "watchlist_main"}];
  page = args.object;
   if (page.navigationContext) {
    var index = page.navigationContext.index;
    var fromGoals = page.navigationContext.fromGoals;
  }
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

  if (index) {
    var tabView = page.getViewById("tabView")
    tabView.selectedIndex = index;
  }
};

var overlayShowing = false;
var isTutorialComplete = false;

exports.onIndexChange = function(args) {
    if (args.newIndex === 1) {
      if (!StorageUtil.isTargetOn()) {
        if (fromGoals) {
          showTutorialPage();
        } else {
          TargetOverlay.showIntroDialog("Introducing: Targets", "Choose apps you'd rather spend time on to start building positive habits", "Ok!", showTutorialPage, redirect);
          overlayShowing = true;
        }
        
      } else {
        showMainPage();
      }
    } else {
      if (overlayShowing) {
        TargetOverlay.removeIntroDialog();
        overlayShowing = false;
      }
    }
};


redirect = function() {
  var tabView = page.getViewById("tabView")
  tabView.selectedIndex = 0;
}


showTutorialPage = function() {
  var list = page.getViewById("targetList");
  list.visibility = "collapsed";
  var manageTargets = page.getViewById("manageTargets");
  manageTargets.visibility = "collapsed";
  var tutorialHeader = page.getViewById("tutorialHeader");
  tutorialHeader.visibility = "visible";
  var nextTutorial = page.getViewById("nextTutorial");
  nextTutorial.visibility = "visible";
}

showMainPage = function() {
  var tutorialHeader = page.getViewById("tutorialHeader");
  tutorialHeader.visibility = "collapsed";
  var nextTutorial = page.getViewById("nextTutorial");
  nextTutorial.visibility = "collapsed";
}


exports.goNextTutorial = function() {
  if (!StorageUtil.isTargetOn) {
    var options = {
        moduleName: 'views/appsView/appsView',
        context: {
          watchlist: false,
          tutorial: true
        }
    }
    StorageUtil.setTargetOn();
    frameModule.topmost().navigate(options);
  }
    
}



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
          watchlist: false,
          tutorial: false
        }
  }
  frameModule.topmost().navigate(options);
};

exports.onManageWatchlist = function() {
  var options = {
        moduleName: 'views/appsView/appsView',
        context: {
          watchlist: true,
          tutorial: false
        }
  }
  frameModule.topmost().navigate(options);
};