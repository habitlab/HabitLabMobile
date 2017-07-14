var drawer;

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('sideDrawer');
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};