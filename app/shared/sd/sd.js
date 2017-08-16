var frameModule = require("ui/frame");
var menu;
var onClicksSet;
var StorageUtil = require('~/util/StorageUtil');
var dialogs = require("ui/dialogs");
var menuEvents;
var options = ['progress', 'goals', 'settings', 'nudges', 'watchlist', 'block', 'snooze'];
var Toast = require("nativescript-toast");
const BlockerOverlay = require("~/overlays/BlockerOverlay");
const FullScreenOverlay = require("~/overlays/FullScreenOverlay");

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
        if (item === 'snooze' || item === 'block') {
          opt.backgroundColor = '#FFFFFF';
          return;
        } else if (item === 'nudges') {
          item = 'interventions';
        }
        frameModule.topmost().navigate("views/" + item + 'View/' + item + 'View');
      }
    });
  });
};

<<<<<<< HEAD
var showBlockerOverlay = function () {
// showOverlay = function (title, msg, pos, prog, max, negCallback) 

    BlockerOverlay.showOverlay("You're in focus mode", 
      "You have 40 minutes of focus mode left", 
      "Continue", 20, 60, null);
}



=======
>>>>>>> origin/master
var createBlockDialog = function() {
  dialogs.action({
    message: "How long would you like to block your waitlisted apps for?",
    cancelButtonText: "Cancel",
    actions: ["15 minutes", "30 minutes", "1 hour", "2 hours"]
  }).then(function (result) {
    if (result === "15 minutes"){
      menuEvents.push({category: "features", index: "block_set"});
      StorageUtil.setBlock(15);
    } else if (result === "30 minutesr"){
      menuEvents.push({category: "features", index: "block_set"});
      StorageUtil.setBlock(30);
    } else if (result === "1 hour"){
      menuEvents.push({category: "features", index: "block_set"});
      StorageUtil.setBlock(60);
    } else if (result === "2 hours"){
      menuEvents.push({category: "features", index: "block_set"});
      StorageUtil.setBlock(120);
    }

    if (result !== 'Cancel') {
      Toast.makeText('Block waitlist for ' + result).show();
    }
  });
};


exports.setBlock = function() {
  menuEvents.push({category: "features", index: "block_opened"});
  if (StorageUtil.inBlockMode()) {
    dialogs.confirm({
      title: "Remove block",
      message: "You have x minutes remaining of your block. Are you sure you want to remove it?",
      okButtonText: "Yes",
      cancelButtonText: "Nevermind"
    }).then(function (result) {
      if (result === true) {
        menuEvents.push({category: "features", index: "remove_block"});
        Toast.makeText('Block Removed').show();
        StorageUtil.removeBlock();
      }
    });
  } else {
    showBlockerOverlay();
    // createBlockDialog();
  }
};



var createSnoozeDialog = function() {
  dialogs.action({
    message: "How long would you like to snooze HabitLab for?",
    cancelButtonText: "Cancel",
    actions: ["15 minutes", "1 hour", "8 hours", "24 hours"]
  }).then(function (result) {
    if (result === "15 minutes"){
      menuEvents.push({category: "features", index: "snooze_set"});
      StorageUtil.setSnooze(15);
    } else if (result === "1 hour"){
      menuEvents.push({category: "features", index: "snooze_set"});
      StorageUtil.setSnooze(60);
    } else if (result === "8 hours"){
      menuEvents.push({category: "features", index: "snooze_set"});
      StorageUtil.setSnooze(480);
    } else if (result === "24 hours"){
      menuEvents.push({category: "features", index: "snooze_set"});
      StorageUtil.setSnooze(1440);
    }

    if (result !== 'Cancel') {
      Toast.makeText('HabitLab snoozed for ' + result).show();
    }
  });
};

exports.setSnooze = function() {
  menuEvents.push({category: "features", index: "snooze_opened"});
  if (StorageUtil.inSnoozeMode()) {
    dialogs.confirm({
      title: "Edit Snooze",
      message: "You are already in snooze mode. What would you like to do?",
      okButtonText: "Remove Snooze",
      cancelButtonText: "Set New Snooze",
      neutralButtonText: "Cancel"
    }).then(function (result) {
      if (result === true) {
        menuEvents.push({category: "features", index: "remove_snooze"});
        Toast.makeText('Snooze Removed').show();
        StorageUtil.removeSnooze();
      } else if (result === false) {
        createSnoozeDialog();
      }
    });
  } else {
    createSnoozeDialog();
  }
};

exports.onLoaded = function(args) {
  menu = args.object;
  menuEvents = [];
  setOnTouches();
};

exports.menuUnloaded = function(args) {
  StorageUtil.addLogEvents(menuEvents);
};