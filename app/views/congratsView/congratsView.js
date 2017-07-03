var frameModule = require("ui/frame");


exports.goToNavView = function() {
  frameModule.topmost().navigate("views/navView/navView");
};