var drawerModule = require("nativescript-telerik-ui/sidedrawer");
var frameModule = require("ui/frame");
var view = require("ui/core/view");
var Observable = require("data/observable").Observable;
var drawer;



var pageData = new Observable();
pageData.data = [
  { key: "One", value: 10 },
  { key: "Two", value: 20 },
  { key: "Three", value: 30 }
];



exports.pageLoaded = function(args) {
    var page = args.object;
    drawer = view.getViewById(page, "sideDrawer");
    page.bindingContext = pageData;
};

exports.toggleDrawer = function() {
	console.log(drawer);
    drawer.toggleDrawerState();
};



