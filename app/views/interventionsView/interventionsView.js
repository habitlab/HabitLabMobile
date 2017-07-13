var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var StorageUtil = require("~/util/StorageUtil");
var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');

var page;
var drawer;
var interventionList;

var createItem = function(id)  {
  var item = builder.load({
    path: 'shared/togglelistelem',
    name: 'togglelistelem'
  });

  item.id = 'item' + id;
  item.getViewById("name").text = interventionList[id].name;
  
  var sw = item.getViewById("switch");
  sw.checked = StorageUtil.isEnabledForAll(id);
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForAll(id);
  });

  return item;

  // TODO: WRITE TRYOUT CODE 
  // var button = item.getViewById("button").tap = tryIntervention();
};

var setUpList = function() {
  var interventionLayout = page.getViewById("interventionLayout");
  interventionList = StorageUtil.interventionDetails;

  for (var i = 0; i < interventionList.length; i++) {
    if (!page.getViewById('item' + i)) {
      interventionLayout.addChild(createItem(i));
    }
  }
};

exports.pageLoaded = function(args) {
  page = args.object;
  drawer = page.getViewById("sideDrawer");
  setUpList();
};

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};