var StorageUtil = require("~/util/StorageUtil");
var UsageUtil = require('~/util/UsageInformationUtil');

var builder = require('ui/builder');
var frame = require('ui/frame');
var layout = require('ui/layouts/stack-layout');

var drawer;
var page;

var createItem = function(packageName)  {
  var item = builder.load({
    path: 'shared/watchlistelem',
    name: 'watchlistelem',
    page: page
  });

  item.id = packageName;
  item.className = 'watchlist-elem';

  var info = UsageUtil.getBasicInfo(packageName);
  
  var image = item.getViewById('icon');
  image.src = info.icon;
  image.className = 'watchlist-icon';

  var label = item.getViewById("name");
  label.text = info.name;
  label.className = 'watchlist-label';

  item.on("tap, touch", function(args) {
    if (args.eventName === 'tap') {
      frame.topmost().navigate({
        moduleName: 'views/appDetailView/appDetailView',
        context: { 
          name: info.name,
          icon: info.icon,
          packageName: packageName
        },
        animated: true,
        transition: {
          name: "slide",
          duration: 380,
          curve: "easeIn"
        }
      });
    } else {
      if (args.action === 'down') {
        item.backgroundColor = '#F5F5F5';
      } else if (args.action === 'up' || args.action === 'cancel') {
        item.backgroundColor = '#FFFFFF';
      }
    }
  });

  return item;
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
  page = args.object;
  drawer = page.getViewById('sideDrawer');
  setUpList();
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.onManage = function() {
  frame.topmost().navigate('views/appsView/appsView');
};