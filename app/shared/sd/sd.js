var frameModule = require("ui/frame");
var menu;
var selected;
var options = ['progress-option', 'goals-option', 'settings-option', 'nudges-option', 'feedback-option'];

exports.onLoaded = function(args) {
  menu = args.object;
  resetSelected();
};

var resetSelected = function() {
  options.forEach(function (item) {
    if (item !== selected) {
      menu.getViewById(item).backgroundColor = "#FFFFFF";
    } else {
      menu.getViewById(item).backgroundColor = "#F5F5F5";
    }
  });
};

var setSelected =  function(name) {
  selected = name + '-option';
  resetSelected();
};

exports.goToProgress = function() {
  setSelected('progress');
  frameModule.topmost().navigate("views/progressView/progressView");
};


exports.goToGoals = function() {
  setSelected('goals');
  frameModule.topmost().navigate("views/goalsView/goalsView");
};


exports.goToSettings = function() {
  setSelected('settings');
  frameModule.topmost().navigate("views/settingsView/settingsView");
};


exports.goToNudges = function() {
  setSelected('nudges');
  frameModule.topmost().navigate("views/interventionsView/interventionsView");
};

exports.goToFeedback = function() {
  setSelected('feedback');
  frameModule.topmost().navigate("views/feedbackView/feedbackView");
}