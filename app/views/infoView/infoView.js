var drawer;

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById("sideDrawer"); 
};