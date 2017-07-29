var StorageUtil = require("~/util/StorageUtil");
var IM = require('~/interventions/InterventionManager');
var ID = require('~/interventions/InterventionData');
var Toast = require('nativescript-toast');

var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');
var frame = require('ui/frame');

var drawer;
var page;
var interventionList;

var createItem = function(id)  {
  var item = builder.load({
    path: 'shared/detailelem',
    name: 'detailelem'
  });

  item.id = 'item' + id;
  item.className = 'intervention-grid';
  
  var image = item.getViewById('icon');
  image.src = interventionList[id].icon;
  image.className = 'intervention-icon';

  var label = item.getViewById("name");
  label.text = interventionList[id].name;
  label.className = 'intervention-label';

  item.on("tap, touch", function(args) {
    if (args.eventName === 'tap') {
      var options = {
        moduleName: 'views/detailView/detailView',
        context: {
          id: id
        }
      };
      frame.topmost().navigate(options);
    } else {
      if (args.action === 'down') {
        item.backgroundColor = '#F5F5F5';
      } else if (args.action === 'up' || args.action === 'cancel') {
        item.backgroundColor = '#FFFFFF';
      }
    }
  });

  var sw = item.getViewById("switch");
  sw.checked = StorageUtil.isEnabledForAll(id);
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForAll(id);
  });

  return item;
};

var setUpList = function() {
  var interventionLayout = page.getViewById("interventionLayout");
  interventionList = ID.interventionDetails;
  interventionLayout.removeChildren();

  for (var i = 0; i < interventionList.length; i++) {
    if (IM.interventions[i]) {
      interventionLayout.addChild(createItem(i));
    }
  }
};

exports.pageLoaded = function(args) {
  page = args.object;
  drawer = page.getViewById('sideDrawer');
  setUpList();
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};