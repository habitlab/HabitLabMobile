var frameModule = require("ui/frame");


// var gestures = require("ui/gestures");
// var labelModule = require("ui/label");
// var label = new labelModule.Label();
// label.on(gestures.GestureTypes.swipe, function (args) {
//     frameModule.topmost().navigate("views/navView/navView");
// });


exports.goToNavView = function() {
	console.log("swiped")
  frameModule.topmost().navigate("views/navView/navView");
}