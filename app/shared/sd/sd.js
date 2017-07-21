var frameModule = require("ui/frame");
var menu;
var selected;
var options = ['progress-option', 'goals-option', 'settings-option', 'nudges-option', 'feedback-option'];

exports.onLoaded = function(args) {
  menu = args.object;
};

var clearSelected = function() {
  options.forEach(function (item) {
    menu.getViewById(item).className = "side-option";
  });
};

exports.goToProgress = function() {
  clearSelected();
  menu.getViewById('progress-option').className = "side-option selected-option";
  frameModule.topmost().navigate("views/progressView/progressView");
};


exports.goToGoals = function() {
  clearSelected();
  menu.getViewById('goals-option').className = "side-option selected-option";
  frameModule.topmost().navigate("views/goalsView/goalsView");
};


exports.goToSettings = function() {
  clearSelected();
  menu.getViewById('settings-option').className = "side-option selected-option";
  frameModule.topmost().navigate("views/settingsView/settingsView");
};


exports.goToNudges = function() {
  clearSelected();
  menu.getViewById('nudges-option').className = "side-option selected-option";
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};

exports.goToFeedback = function() {
  clearSelected();
  menu.getViewById('feedback-option').className = "side-option selected-option";
  frameModule.topmost().navigate("views/feedbackView/feedbackView");
}