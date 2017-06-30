var frameModule = require("ui/frame");


exports.goToNavView = function() {
	console.log("swiped")
  frameModule.topmost().navigate("views/navView/navView");
}