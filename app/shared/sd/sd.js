var frameModule = require("ui/frame");
var menu;
var onClicksSet;
var StorageUtil = require('~/util/StorageUtil');
var menuEvents;
var options = ['progress', 'goals', 'settings', 'nudges', 'watchlist', 'lockdown', 'snooze'];
var Toast = require("nativescript-toast");
const CheckboxOverlay = require("~/overlays/CheckboxOverlay");
const CancelOverlay = require("~/overlays/CancelOverlay");
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
  CheckboxOverlay.showOverlay("How long would you like to lock your watchlisted apps for?", "15 mins", "30 mins", "1 hour", "2 hours", false, true);
};


exports.setLockdown = function() {
  menuEvents.push({category: "features", index: "lockdown_opened"});
  if (StorageUtil.inLockdownMode()) {
    menuEvents.push({category: "features", index: "remove_lockdown"});
    CancelOverlay.showCancelLockDialog("Unlock Apps", "You are currently in lockdown mode. Would you like to unlock your apps?", "Yes", "Cancel", unlock, null);
  } else {
    createLockdownDialog();
  }
};

var unlock = function() {
  menuEvents.push({category: "features", index: "remove_lockdown"});
  Toast.makeText('Lockdown Mode disabled').show();
  StorageUtil.removeLockdown();
}


var createSnoozeDialog = function() {
  CheckboxOverlay.showOverlay("How long do you want to set snooze for?", "15 mins", "30 mins", "8 hours", "24 hours", true, false);
};

exports.setSnooze = function() {
  menuEvents.push({category: "features", index: "snooze_opened"});
  if (StorageUtil.inSnoozeMode()) {
    menuEvents.push({category: "features", index: "remove_snooze"});
    CancelOverlay.showCancelSnoozeDialog("Edit Snooze", "You are already in snooze mode. Would you like to remove snooze?", "Yes", "Cancel", removeSnooze, null);
  } else {
    createSnoozeDialog();
  }
};



var removeSnooze = function() {
  menuEvents.push({category: "features", index: "remove_snooze"});
  Toast.makeText('Snooze Removed').show();
  StorageUtil.removeSnooze();
}

exports.onLoaded = function(args) {
  menu = args.object;
  menuEvents = [];
  setOnTouches();
};

exports.menuUnloaded = function(args) {
  StorageUtil.addLogEvents(menuEvents);
};