var frameModule = require("ui/frame");

exports.goToProgress = function() {
  frameModule.topmost().navigate("views/progressView/progressView");
};

exports.goToGoals = function() {
  frameModule.topmost().navigate("views/goalsView/goalsView");
};

exports.goToInterventions = function() {
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};

exports.goToSettings = function() {
  frameModule.topmost().navigate("views/settingsView/settingsView");
};

exports.pageLoaded = function() {

};