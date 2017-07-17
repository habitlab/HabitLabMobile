var appSettings = require("application-settings");
var Calendar = java.util.Calendar;
var System = java.lang.System;

var DAY_IN_MS = 86400000;

var days = {
  TODAY: -1,
  ALL: 0,
  SUN: 1,
  MON: 2,
  TUE: 3,
  WED: 4,
  THU: 5,
  FRI: 6,
  SAT: 7
};

var interventions = {
  GLANCE_TOAST: 0,
  GLANCE_NOTIFICATION: 1,
  UNLOCK_TOAST: 2,
  UNLOCK_NOTIFICATION: 3,
  USAGE_TOAST: 4,
  USAGE_NOTIFICATION: 5,
  DURATION_TOAST: 6, // for length of visit to an app
  DURATION_NOTIFICATION: 7,
  VISIT_TOAST: 8, // for amount of time on phone today
  VISIT_NOTIFICATION: 9
};

var interventionDetails = [
  {name: "Glances Toast", description: "Sends a disappearing message with today's glance count", target: 'phone', level: 'easy'},
  {name: "Glances Notification", description: "Sends a notification with today's glance count", target: 'phone', level: 'medium'},
  {name: "Unlocks Toast", description: "Sends a disappearing message with today's unlock count", target: 'phone', level: 'easy'},
  {name: "Unlocks Notification", description: "Sends a notification with today's unlock count", target: 'phone', level: 'medium'},
  {name: "Usage Toast", description: "Sends a disappearing message with today's total phone usage in minutes", target: 'phone', level: 'easy'},
  {name: "Usage Notification", description: "Sends a notification with today's total phone usage in minutes", target: 'phone', level: 'medium'},
  {name: "Visit Length Toast", description: "Sends a disappearing message with visit duration in minutes for a specific app", target: 'app', level: 'easy'},
  {name: "Visit Length Notification", description: "Sends a notification with visit duration in minutes for a specific app", level: 'medium'},
  {name: "Visits Toast", description: "Sends a disappearing message with today's visit count for a specific app", target: 'app', level: 'easy'},
  {name: "Visits Notification", description: "Sends a notification with today's visit count for a specific app", target: 'app', level: 'medium'}
];

exports.days = days;
exports.interventions = interventions;
exports.interventionDetails = interventionDetails;


/************************************
 *             HELPERS              *
 ************************************/


var PkgStat = function() {
  return {visits: 0};
};

var PkgGoal = function() {
  return {minutes: 15};
};

var PhStat = function() {
  return {glances: 0, unlocks: 0};
};

var PhGoal = function() {
  return {glances: 75, unlocks: 50, minutes: 120};
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  appSettings.setString(packageName, JSON.stringify({
      goals: PkgGoal(), 
      stats: [PkgStat(), PkgStat(), PkgStat(), PkgStat(), PkgStat(), PkgStat(), PkgStat()],
      enabled: Array(interventionDetails.length).fill(true)
    }));
};

/* helper: createPhoneData
 * -----------------------
 * Updates storage to include data for general phone.
 */
var createPhoneData = function() {
  appSettings.setString('phone', JSON.stringify({
      goals: PhGoal(), 
      stats: [PhStat(), PhStat(), PhStat(), PhStat(), PhStat(), PhStat(), PhStat()],
      enabled: Array(interventionDetails.length).fill(true)
    }));
};

var startOfDay = function() {
  var startOfTarget = Calendar.getInstance();
  startOfTarget.set(Calendar.HOUR_OF_DAY, 0);
  startOfTarget.set(Calendar.MINUTE, 0);
  startOfTarget.set(Calendar.SECOND, 0);
  startOfTarget.set(Calendar.MILLISECOND, 0);
  return startOfTarget;
};


/************************************
 *           SETTING UP             *
 ************************************/


/* export: setUp
 * -------------
 * Clears storage and resets everything to defaults.
 */
exports.setUp = function() {
  appSettings.clear();
  var preset = ['com.facebook.katana', 'com.google.android.youtube', 'com.facebook.orca', 
                'com.snapchat.android', 'com.instagram.android'];

  appSettings.setBoolean('onboarded', true);
  appSettings.setString('selectedPackages', JSON.stringify(preset));
  appSettings.setNumber('lastDateActive', startOfDay().getTimeInMillis());

  createPhoneData();
  preset.forEach(function (item) {
    createPackageData(item);
  });

  appSettings.setString('enabled', JSON.stringify(Array(interventionDetails.length).fill(true)));
  
};

/* export: isSetUp
 * ---------------
 * Checks if the user has been onboarded yet.
 */
exports.isSetUp = function() {
  return appSettings.getBoolean('onboarded');
};


/************************************
 *           MANAGEMENT             *
 ************************************/


/* export: getSelectedPackages
 * ---------------------------
 * Returns array of package names (strings) that are currently 'blacklisted'.
 */
exports.getSelectedPackages = function() {
  return JSON.parse(appSettings.getString('selectedPackages'));
};

/* export: addPackage
 * ------------------
 * Adds the specified package to storage (with default goals, no data).
 */
exports.addPackage = function(packageName) {
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  if (!list.includes(packageName)) {
    list.push(packageName);
    createPackageData(packageName);
    appSettings.setString('selectedPackages', JSON.stringify(list));
  }
};

/* export: removePackage
 * ---------------------
 * Removes the specified package.
 */
exports.removePackage = function(packageName) {
  var list = JSON.parse(appSettings.getString('selectedPackages')).filter(function (item) {
    return item !== packageName;
  });
  appSettings.remove(packageName);
  appSettings.setString('selectedPackages', JSON.stringify(list));
};

/* export: togglePackage
 * ---------------------
 * If the specified package is currently blacklisted, removes it from the list.
 * If the package is currently not blacklisted, adds it.
 */
exports.togglePackage = function(packageName) {
  var removed = false;
  var list = JSON.parse(appSettings.getString('selectedPackages')).filter(function (item) {
    if (item === packageName) {
      appSettings.remove(packageName);
      removed = true;
    }
    return item !== packageName;
  });

  if (!removed) {
    createPackageData(packageName);
    list.push(packageName);
  }

  appSettings.setString('selectedPackages', JSON.stringify(list));
  return !removed;
};

/* export: isPackageSelected
 * -------------------------
 * Checks if the given package name is blacklisted.
 */
exports.isPackageSelected = function(packageName) {
  return JSON.parse(appSettings.getString('selectedPackages')).includes(packageName);
};


/************************************
 *          DATA aND STATS          *
 ************************************/


/* helper: arrangeData
 * -------------------
 * Depending on the index passed in gives the user, the desired data. If it is with flag ALL, 
 * arranges the data so it is from least recent to most recent (for graphs, etc.).
 */
var arrangeData = function(dataArr, index) {
  if (index < -1 || index > 7) {
    return -1;
  }

  var i = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
  if (index === days.TODAY) {
    return dataArr[i-1];
  } else if (index) {
    return dataArr[index-1];
  } else {
    if (i === 7) {
      return dataArr;
    }
    return dataArr.splice(i, dataArr.length).concat(dataArr.splice(0, i));
  }
  
};

/* export: getVisits
 * -----------------
 * Gets number of visits to the specified packageName on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getVisits = function(packageName, index) {
  var packageData = JSON.parse(appSettings.getString(packageName)).stats.map(function (item) { 
    return item['visits']; 
  });
  return arrangeData(packageData, index);
};

/* export: visited
 * ---------------
 * Adds one to the visits for today.
 */
exports.visited = function(packageName) {
  var today = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo['stats'][today-1]['visits']++;
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: getUnlocks
 * ------------------
 * Gets number of unlocks on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getUnlocks = function(index) {
  var phoneData = JSON.parse(appSettings.getString('phone')).stats.map(function (item) { 
    return item['unlocks']; 
  });
  return arrangeData(phoneData, index);
};

/* export: unlocked
 * ----------------
 * Adds one to the unlocks for today.
 */
exports.unlocked = function() {
  var today = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][today-1]['unlocks']++;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getGlances
 * ------------------
 * Gets number of glances on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getGlances = function(index) {
  var phoneData = JSON.parse(appSettings.getString('phone')).stats.map(function (item) { 
    return item['glances']; 
  });
  return arrangeData(phoneData, index);
};

/* export: glanced
 * ---------------
 * Adds one to the glances for today. Also erases any old data that needs to be overridden
 */
exports.glanced = function() {
  var lastDateActive = appSettings.getNumber('lastDateActive');
  var start = startOfDay();
  var today = start.get(Calendar.DAY_OF_WEEK);
  var difference = Math.round((start.getTimeInMillis() - lastDateActive) / DAY_IN_MS);
  resetData(difference, today);

  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][today-1]['glances']++;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* helper: resetData
 * -----------------
 * Runs whenever a glance happens to erase data that will now be overwritten (if there is any).
 */
var resetData = function(days, today) {
  if (!days) {
    return;
  }

  appSettings.setNumber('lastDateActive', startOfDay().getTimeInMillis());

  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  for (var i = 0; i < days && i < 7; i++) {
    phoneInfo.stats[(today + 6 - i) % 7] = {
      glances: 0,
      unlocks: 0
    };
  }
  appSettings.setString('phone', JSON.stringify(phoneInfo));

  var list = JSON.parse(appSettings.getString('selectedPackages'));
  list.forEach(function (packageName) {
    var appInfo = JSON.parse(appSettings.getString(packageName));
    for (var i = 0; i < days && i < 7; i++) {
      appInfo['stats'][(today + 6 - i) % 7] = {
        visits: 0
      };
    }
    appSettings.setString(packageName, JSON.stringify(appInfo));
  });
};

/************************************
 *           INTERVENTIONS          *
 ************************************/

/* export: enableForAll
 * --------------------
 * Completely enables the given intervention (by id).
 */
exports.enableForAll = function(id) {
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = true;
  appSettings.setString('enabled', enabled);
};

/* export: disableForAll
 * ---------------------
 * Completely disables the given intervention (by id).
 */
exports.disableForAll = function(id) {
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = false;
  appSettings.setString('enabled', enabled);
};

/* export: toggleForAll
 * --------------------
 * Completely disables/enables the given intervention (by id).
 */
exports.toggleForAll = function(id) {
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = !enabled[id];
  appSettings.setString('enabled', enabled);
};

/* export: enable
 * ---------------
 * Enables the given intervention for a specific package (by id).
 */
exports.enableForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = true;
  appSettings.setString(packageName, appInfo);
};

/* export: disable
 * ----------------
 * Disables the given intervention for a specific package (by id).
 */
exports.disableForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = false;
  appSettings.setString(packageName, appInfo);
};

/* export: toggle
 * ----------------
 * Toggles the given intervention for a specific package (by id).
 */
exports.toggleForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = !appInfo.enabled[id];
  appSettings.setString(packageName, appInfo);
};

/* export: isEnabledForApp
 * -----------------------
 * Returns whether the given intervention is enabled for package specific interventions.
 */
exports.isEnabledForApp = function(id, packageName) {
  return JSON.parse(appSettings.getString(packageName)).enabled[id];
};

/* export: isEnabledForAll
 * -----------------------
 * Returns whether the given intervention is enabled generally.
 */
exports.isEnabledForAll = function(id) {
  return JSON.parse(appSettings.getString('enabled'))[id];
};

/* export: canIntervene
 * --------------------
 * Returns whether the given intervention is should run.
 */
exports.canIntervene = function(id, packageName) {
  return JSON.parse(appSettings.getString('enabled'))[id] && 
        (interventionDetails[id].target === 'phone' || JSON.parse(appSettings.getString(packageName)).enabled[id]);
};