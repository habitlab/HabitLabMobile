var frameModule = require("ui/frame");
var menu;
var onClicksSet;
var StorageUtil = require('~/util/StorageUtil');
var dialogs = require("ui/dialogs");
var menuEvents;
var options = ['progress', 'goals', 'settings', 'nudges', 'watchlist', 'lockdown', 'snooze'];
var Toast = require("nativescript-toast");
const ToastOverlay = require("~/overlays/ToastOverlay");
const CheckboxOverlay = require("~/overlays/CheckboxOverlay");
const UsageInformationUtil = require("~/util/UsageInformationUtil");

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
        if (item === 'snooze' || item === 'lockdown') {
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







var createLockdownDialog = function() {
  dialogs.action({
    message: "How long would you like to lock your watchlisted apps for?",
    cancelButtonText: "Cancel",
    actions: ["15 minutes", "30 minutes", "1 hour", "2 hours"]
  }).then(function (result) {
    if (result === "15 minutes"){
      menuEvents.push({category: "features", index: "lockdown_set"});
      StorageUtil.setLockdown(15);
    } else if (result === "30 minutes"){
      menuEvents.push({category: "features", index: "lockdown_set"});
      StorageUtil.setLockdown(30);
    } else if (result === "1 hour"){
      menuEvents.push({category: "features", index: "lockdown_set"});
      StorageUtil.setLockdown(60);
    } else if (result === "2 hours"){
      menuEvents.push({category: "features", index: "lockdown_set"});
      StorageUtil.setLockdown(120);
    }

    if (result !== 'Cancel') {
      Toast.makeText('Lockdown Mode enabled for ' + result).show();
    }
  });
};


exports.setLockdown = function() {
  menuEvents.push({category: "features", index: "lockdown_opened"});
  if (StorageUtil.inLockdownMode()) {
    dialogs.confirm({
      title: "Unlock Apps",
      message: "You are currently in lockdown mode. Would you like to unlock your apps?",
      okButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then(function (result) {
      if (result === true) {
        menuEvents.push({category: "features", index: "remove_lockdown"});
        Toast.makeText('Lockdown Mode disabled').show();
        StorageUtil.removeLockdown();
      }
    });
  } else {
    createLockdownDialog();
  }
};


var createSnoozeDialog = function() {
  CheckboxOverlay.showOverlay("How long do you want to set snooze for?", "15 mins", "30 mins", "8 hours", "24 hours", true, null, null, null);
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