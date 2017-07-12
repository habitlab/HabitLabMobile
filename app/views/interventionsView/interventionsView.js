var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var StorageUtil = require("~/util/StorageUtil");
var gestures = require("ui/gestures").GestureTypes;
var builder = require('ui/builder');

var drawer;
var interventionList;
var setUp;

var createItem = function(id)  {
  var item = builder.load({
    path: 'shared/togglelistelem',
    name: 'togglelistelem'
  });

  item.getViewById("name").text = interventionList[id].name;
  item.getViewById("description").text = interventionList[id].description;
  var sw = item.getViewById("switch");
  sw.checked = StorageUtil.isEnabledForAll(id);
  sw.on(gestures.tap, function() {
    StorageUtil.toggleForAll(id);
  });

  return item;

  // TODO: WRITE TRYOUT CODE 
  // var button = item.getViewById("button").tap = tryIntervention();
};

var setUpList = function(args) {
  setUp = true;
  var interventionLayout = args.object.getViewById("interventionLayout");
  interventionList = StorageUtil.interventionDetails;

  for (var i = 0; i < interventionList.length; i++) {
    interventionLayout.addChild(createItem(i));
  }
};

exports.pageLoaded = function(args) {
    drawer = args.object.getViewById("sideDrawer");
    if (!setUp) {
      setUpList(args);
    }
};

exports.toggleDrawer = function() {
    drawer.toggleDrawerState();
};