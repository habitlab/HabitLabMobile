var frameModule = require("ui/frame");

exports.goToCongrats = function() {
	console.log("swiped")
  frameModule.topmost().navigate("views/congratsView/congratsView");
}