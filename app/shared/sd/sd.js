var frameModule = require("ui/frame");
var menu;
var selected;
var options = ['progress-option', 'goals-option', 'settings-option', 'nudges-option', 'feedback-option'];

exports.onLoaded = function(args) {
  menu = args.object;
  menu.getViewById('menu-title-label').android.setGravity(80);
  resetSelected();
};

var resetSelected = function() {
  options.forEach(function (item) {
    if (item !== selected) {
      menu.getViewById(item).className = "side-option";
    } else {
      menu.getViewById(item).className = "side-option selected-option";
    }
  });
};

exports.goToProgress = function() {
  selected = 'progress-option';
  resetSelected();
  frameModule.topmost().navigate("views/progressView/progressView");
};


exports.goToGoals = function() {
  selected = 'goals-option';
  resetSelected();
  frameModule.topmost().navigate("views/goalsView/goalsView");
};


exports.goToSettings = function() {
  selected = 'settings-option';
  resetSelected();
  frameModule.topmost().navigate("views/settingsView/settingsView");
};


exports.goToNudges = function() {
  selected = 'nudges-option';
  resetSelected();
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};

exports.goToFeedback = function() {
  selected = 'feedback-option';
  resetSelected();
  frameModule.topmost().navigate("views/feedbackView/feedbackView");
}