var StorageUtil = require("~/util/StorageUtil");
var UsageUtil = require('~/util/UsageInformationUtil');
var frameModule = require("ui/frame");
var observable = require("data/observable");
var TargetOverlay = require("~/overlays/TargetOverlay");
var pageData;

var drawer;
var page;
var events;
var pkgs;
var targets;
var fromGoals = false;
var overlayShowing = false;

exports.onItemTap = function(args) {
  events.push({category: "navigation", index: "watchlist_to_detail"});
  
  var info = args.view.bindingContext;
  frameModule.topmost().navigate({
    moduleName: 'views/appDetailView/appDetailView',
    context: { 
      name: info.name,
      icon: info.icon,
      packageName: info.packageName,
      isWatchlist: true // once target apps tracking is implemented, we can show details from this click (simply pass false here)
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
   if (page.navigationContext) {
    var index = page.navigationContext.index;
    fromGoals = page.navigationContext.fromGoals;
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
  if (fromGoals) {
    showTutorialPage();
  } else {
    showMainPage();
  }


  // } else if (StorageUtil.getTargetSelectedPackages().length === 0) { //If no target packages selected 
  //   console.warn("no packages selected")
  //   var list = page.getViewById("targetList");
  //   list.visibility = "collapse";
  //   var msg = page.getViewById("noneSelectedMessage");
  //   msg.visibility = "visible";
  //   var manageTargets = page.getViewById("manageTargets");
  //   manageTargets.visibility = "visible";
  //   console.warn(manageTargets.visibility)
  // } else {
  //   var list = page.getViewById("targetList");
  //   list.visibility = "visible";
  //   var manageTargets = page.getViewById("manageTargets");
  //   manageTargets.visibility = "visible";
  //   var msg = page.getViewById("noneSelectedMessage");
  //   msg.visibility = "collapse";
  // }
};

exports.onIndexChange = function(args) {
    if (args.newIndex === 1) { //If on "targets" page
      if (!StorageUtil.isTargetOn()) {
        if (fromGoals) { //Don't show the first dialog
          showTutorialPage();
        } else {
          showIntroPage();
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

//If user tries to go to the target tab before setting it up, then take them back to the watchlist tab
var redirect = function() {
  var tabView = page.getViewById("tabView")
  tabView.selectedIndex = 0;
}

//The first page of the target tutorial
showIntroPage = function() {
 var list = page.getViewById("targetList");
 list.visibility = "collapse";
 var msg = page.getViewById("noneSelectedMessage");
  msg.visibility = "collapse";
  var manageTargets = page.getViewById("manageTargets");
  manageTargets.visibility = "collapse";
  TargetOverlay.showIntroDialog("Introducing: Targets", "Choose apps you'd rather spend time on to start building positive habits", "Ok!", showTutorialPage, redirect);
  overlayShowing = true;
}

//Second page of the target tutorial
var showTutorialPage = function() {
  var list = page.getViewById("targetList");
  list.visibility = "collapse";
  var manageTargets = page.getViewById("manageTargets");
  manageTargets.visibility = "collapse";
  var tutorialHeader = page.getViewById("tutorialHeader");
  tutorialHeader.visibility = "visible";
  var tutorialImage = page.getViewById("tutorial-image");
  tutorialImage.visibility = "visible";
  var nextTutorial = page.getViewById("nextTutorial");
  nextTutorial.visibility = "visible";
};


//Show the page after the tutorial
showMainPage = function() {
  if (StorageUtil.isTargetOn()) {
    var tutorialHeader = page.getViewById("tutorialHeader");
    tutorialHeader.visibility = "collapse";
    var tutorialImage = page.getViewById("tutorial-image");
    tutorialImage.visibility = "collapse";
    var nextTutorial = page.getViewById("nextTutorial");
    nextTutorial.visibility = "collapse"; 

    if (StorageUtil.getTargetSelectedPackages().length === 0) { //If no target packages selected 
      console.warn("no packages selected")
      var list = page.getViewById("targetList");
      list.visibility = "collapse";
      var msg = page.getViewById("noneSelectedMessage");
      msg.visibility = "visible";
    } else {
      var list = page.getViewById("targetList");
      list.visibility = "visible";
      var msg = page.getViewById("noneSelectedMessage");
      msg.visibility = "collapse";
    }
    var manageTargets = page.getViewById("manageTargets");
    manageTargets.visibility = "visible";
   } 
}

//In the target tutorial, go to select target apps
exports.goNextTutorial = function() {
   StorageUtil.setTargetPresets();
    var options = {
        moduleName: 'views/appsView/appsView',
        context: {
          watchlist: false,
          tutorial: true
        }
    }
    frameModule.topmost().navigate(options);
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
  };
  frameModule.topmost().navigate(options);
};