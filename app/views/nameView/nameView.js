var StorageUtil = require("~/util/StorageUtil");
var frameModule = require("ui/frame");
var page;

exports.pageLoaded = function(args) {
	  // set also in app.js
	  if (StorageUtil.isOnboarded()) {
	    frameModule.topmost().navigate('views/progressView/progressView');
	  } else if (StorageUtil.isSetUp()) {
	    frameModule.topmost().navigate('views/appsView/appsView');
	  }

	  if (!StorageUtil.isSetUp()) {
	    StorageUtil.setUpDB();
	  }
	  page = args.object;
}

//Only lets the user continue past the first slide if a name is entered 
// else, a dialog appears
exports.checkNameNextPage = function(args) {
  var textfield = page.getViewById("name");
  var name = textfield.text;
    StorageUtil.setName(name);
    frameModule.topmost().navigate('views/watchlistOnboardingView/watchlistOnboardingView');
};