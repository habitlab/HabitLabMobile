var frameModule = require("ui/frame");
var menu;
var onClicksSet;
var StorageUtil = require('~/util/StorageUtil');
var dialogs = require("ui/dialogs");
var options = ['progress', 'goals', 'settings', 'nudges', 'watchlist'];

var setOnTouches = function() {

  options.forEach(function (item) {
    var opt = menu.getViewById(item + '-option');
    opt.backgroundColor = menu.page.id === item ? '#F5F5F5' : '#FFFFFF';

    opt.off("touch");
    opt.on("touch", function (args) {
      if (args.action === 'down') {
        opt.backgroundColor = '#DCDCDC';
      } else if (args.action === 'cancel') {
        opt.backgroundColor = menu.page.id === item ? '#F5F5F5' : '#FFFFFF';
      } else if (args.action === 'up') {
        if (item === 'nudges') {
          item = 'interventions';
        }
        frameModule.topmost().navigate("views/" + item + 'View/' + item + 'View');
      }
    });
  });
};

exports.setSnooze = function() {
  if (StorageUtil.inSnoozeMode()) {

  } else {
    dialogs.action({
      message: "How long would you like to snooze HabitLab for?",
      cancelButtonText: "Cancel text",
      actions: ["15 minutes", "1 hour", "8 hours", "Today", ]
    }).then(function (result) {
      if (result === "15 minutes"){
        
      } else if (result === "1 hour"){
          //Do action2
      } else if (result === "8 hours"){
          //Do action2
      } else if (result === "Today"){
          //Do action2
      }
    });
  }
};

exports.onLoaded = function(args) {
  menu = args.object;
  setOnTouches();
};