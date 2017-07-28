var appSettings = require("application-settings");
var ID = require('~/interventions/interventionData');

var Calendar = java.util.Calendar;
var System = java.lang.System;

var DAY_IN_MS = 86400000;
var MIN_IN_MS = 60000;

/************************************
 *             HELPERS              *
 ************************************/

var daysSinceEpoch = function(ms) {
  if (ms) {
    return Math.floor(ms / DAY_IN_MS);
  } else {
    return Math.floor(java.lang.System.currentTimeMillis() / DAY_IN_MS);
  }
};

var index = function(ms) {
  return daysSinceEpoch(ms) % 28;
};

var PkgStat = function() {
  return {visits: 0, time: 0};
};

var PkgGoal = function() {
  return {minutes: 15};
};

var PhStat = function() {
  return {glances: 0, unlocks: 0, totalTime: 0, time: 0};
};

var PhGoal = function() {
  return {glances: 75, unlocks: 50, minutes: 120};
};

var randBW = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

var FakePkgStat = function() {
  return {
    visits: randBW(10, 40), 
    time: randBW(600000, 2700000)
  };
};

var FakePkgGoal = function() {
  return {minutes: 15};
};

var FakePhStat = function() {
  var numGlances = randBW(50, 120);
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  var total = 0;
  list.forEach(function(item) {
    total += exports.getAppTime(item);
  });

  return {
    glances: numGlances, 
    unlocks: randBW(numGlances, numGlances*2), 
    totalTime: randBW(total, total + 5400000), 
    time: total
  };
};

var FakePhGoal = function() {
  return {
    glances: 75, 
    unlocks: 50, 
    minutes: 120
  };
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  appSettings.setString(packageName, JSON.stringify({
      goals: PkgGoal(), 
      stats: Array(28).fill(PkgStat()),
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

/* helper: createPhoneData
 * -----------------------
 * Updates storage to include data for general phone.
 */
var createPhoneData = function() {
  appSettings.setString('phone', JSON.stringify({
      goals: PhGoal(), 
      stats: Array(28).fill(PhStat()),
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

var createFakePackageData = function(packageName) {
  var stats = []
  for (var i = 0; i < 28; i++) {
    stats.push(FakePkgStat());
  }
  appSettings.setString(packageName, JSON.stringify({
      goals: FakePkgGoal(), 
      stats: stats,
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

var createFakePhoneData = function() {
  appSettings.setString('phone', JSON.stringify({
      goals: FakePhGoal(), 
      stats: Array(28).fill(FakePhStat()),
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

var startOfDay = function() {
  var startOfTarget = Calendar.getInstance();
  startOfTarget.set(Calendar.HOUR_OF_DAY, 0);
  startOfTarget.set(Calendar.MINUTE, 0);
  startOfTarget.set(Calendar.SECOND, 0);
  startOfTarget.set(Calendar.MILLISECOND, 0);
  return startOfTarget.getTimeInMillis();
};


/************************************
 *           SETTING UP             *
 ************************************/

exports.eraseData = function() {
  appSettings.clear();
};

/* export: setUp
 * -------------
 * Clears storage and resets everything to defaults.
 */
exports.setUpDB = function() {
  var preset = require("~/util/UsageInformationUtil").getInstalledPresets();

  appSettings.setString('selectedPackages', JSON.stringify(preset));
  appSettings.setNumber('lastDateActive', startOfDay());
  appSettings.setBoolean('setup', true);

  preset.forEach(function (item) {
    createPackageData(item);
  });
  createPhoneData();

  appSettings.setString('enabled', JSON.stringify(Array(ID.interventionDetails.length).fill(true)));
};

exports.setUpFakeDB = function() {
  var preset = require("~/util/UsageInformationUtil").getInstalledPresets();
  appSettings.setString('selectedPackages', JSON.stringify(preset));
  appSettings.setBoolean('setup', true);

  preset.forEach(function (item) {
    createFakePackageData(item);
  });
  createFakePhoneData();
}

exports.setOnboarded = function() {
  appSettings.setBoolean('onboarded', true);
};

/* export: isSetUp
 * ---------------
 * Checks if the user has been onboarded yet.
 */
exports.isSetUp = function() {
  return appSettings.getBoolean('setup');
};

exports.isOnboarded = function() {
  return appSettings.getBoolean('onboarded');
};

exports.setName = function(newName) {
  appSettings.setString('name', newName);
};

exports.getName = function() {
  return appSettings.getString('name');
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
 *          DATA AND STATS          *
 ************************************/


/* helper: arrangeData
 * -------------------
 * Depending on the index passed in gives the user, the desired data. If it is with flag ALL, 
 * arranges the data so it is from least recent to most recent (for graphs, etc.).
 */
var arrangeData = function(dataArr) {
  var i = index();
  return dataArr.splice(i+1, dataArr.length).concat(dataArr.splice(0, i+1));
};

/* export: getVisits
 * -----------------
 * Gets number of visits to the specified packageName.
 */
exports.getVisits = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).stats[index()]['visits']; 
};

/* export: visited
 * ---------------
 * Adds one to the visits for today.
 */
exports.visited = function(packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo['stats'][index()]['visits']++;
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: decrementVisits
 * -----------------------
 * Minuses one to the visits for today.
 */
exports.decrementVisits = function(packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  if (appInfo['stats'][index()]['visits']) {
    appInfo['stats'][index()]['visits']--;
  }
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: getUnlocks
 * ------------------
 * Gets number of unlocks on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getUnlocks = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['unlocks']; 
};

/* export: unlocked
 * ----------------
 * Adds one to the unlocks for today.
 */
exports.unlocked = function() {
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][index()]['unlocks']++;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getGlances
 * ------------------
 * Gets number of glances on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getGlances = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['glances']; 
};

/* export: glanced
 * ---------------
 * Adds one to the glances for today. Also erases any old data that needs to be overridden
 */
exports.glanced = function() {
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][index()]['glances']++;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: updateAppTime
 * ---------------------
 * Called when an app has been visited to update the time spent on that app for the 
 * day (time is in milliseconds).
 */
exports.updateAppTime = function(packageName, time) {

  var i = index();
  var appInfo = JSON.parse(appSettings.getString(packageName));
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  time = Math.round(time / MIN_IN_MS);
  appInfo['stats'][i]['time'] += time;
  phoneInfo['stats'][i]['time'] += time;
  appSettings.setString(packageName, JSON.stringify(appInfo));
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getAppTime
 * ------------------
 * Returns time on the app so far today (in ms).
 */
exports.getAppTime = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).stats[index()]['time'];
};

/* export: getTargetTime
 * ---------------------
 * Returns total time on target apps so far today (in ms).
 */
exports.getTargetTime = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['time'];
};

/* export: updateTotalTime
 * -----------------------
 * Called when the phone has been used. Updates the total time for the day (time is in milliseconds).
 */
exports.updateTotalTime = function(time) {  
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][index()]['totalTime'] += time;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getTotalTime
 * --------------------
 * Returns total time on phone so far today (in ms).
 */
exports.getTotalTime = function() {
  return JSON.parse(appSettings.getString('phone')).stats[index()]['totalTime'];
};

exports.midnightReset = function() {
  var today = index();
  appSettings.setNumber('lastDateActive', startOfDay());

  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo.stats[today] = PhStat();
  appSettings.setString('phone', JSON.stringify(phoneInfo));

  var list = JSON.parse(appSettings.getString('selectedPackages'));
  list.forEach(function (packageName) {
    var appInfo = JSON.parse(appSettings.getString(packageName));
    appInfo.stats[today] = PkgStat();
    appSettings.setString(packageName, JSON.stringify(appInfo));
  });
};

/************************************
 *           INTERVENTIONS          *
 ************************************/

 exports.getInterventionsForApp = function(pkg) {
  return JSON.parse(appSettings.getString(pkg)).enabled;
 };

/* export: enableForAll
 * --------------------
 * Completely enables the given intervention (by id).
 */
exports.enableForAll = function(id) {
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = true;
  appSettings.setString('enabled', JSON.stringify(enabled));
};

/* export: disableForAll
 * ---------------------
 * Completely disables the given intervention (by id).
 */
exports.disableForAll = function(id) {
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = false;
  appSettings.setString('enabled', JSON.stringify(enabled));
};

/* export: toggleForAll
 * --------------------
 * Completely disables/enables the given intervention (by id).
 */
exports.toggleForAll = function(id) {
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = !enabled[id];
  appSettings.setString('enabled', JSON.stringify(enabled));
};

/* export: enable
 * ---------------
 * Enables the given intervention for a specific package (by id).
 */
exports.enableForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = true;
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: disable
 * ----------------
 * Disables the given intervention for a specific package (by id).
 */
exports.disableForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = false;
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: toggle
 * ----------------
 * Toggles the given intervention for a specific package (by id).
 */
exports.toggleForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = !appInfo.enabled[id];
  appSettings.setString(packageName, JSON.stringify(appInfo));
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
  var target = ID.interventionDetails[id].target; // 'phone' or 'app'
  var can = JSON.parse(appSettings.getString('enabled'))[id]; // enabled overall
  if (target === 'phone') {
    return can;
  } else if (can) { // target === 'app'
    var specified = ID.interventionDetails[id].apps;
    return (!specified || specified.includes(packageName)) && JSON.parse(appSettings.getString(packageName)).enabled[id];
  }
};

/*****************************
 *           GOALS           *
 *****************************/

/* export: chagneAppGoal
 * ---------------------
 * Used to update the goals for specific apps. Give the package name, the new goal amount
 * (e.g. 20 if the new goal is 20 minutes), and the type of goal that is being set (can be 
 * only minutes for now).
 */
exports.changeAppGoal = function(packageName, newGoal, type) {
  if (PkgGoal()[type] === undefined) {
    return;
  }
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.goals[type] = newGoal;
  appSettings.setString(packageName, JSON.stringify(appInfo));
};

/* export: changePhoneGoal
 * -----------------------
 * Used to update the goals for phone usage. Give the new goal amount
 * (e.g. 20 if the new goal is 20 minutes), and the type of goal that is being set (can be 
 * only minutes, glances, or unlocks for now).
 */
exports.changePhoneGoal = function(newGoal, type) {
  if (!PhGoal()[type]) {
    return;
  }
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo.goals[type] = newGoal;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getPhoneGoals
 * -----------------------
 * Returns all the types and values of goals for the phone.
 */
exports.getPhoneGoals = function() {
  return JSON.parse(appSettings.getString('phone')).goals;
};

/* export: getAppGoals
 * -------------------
 * Returns all the types and values of goals for the specific app.
 */
exports.getAppGoals = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).goals;
};

/* export: getGlanceGoal
 * ---------------------
 * Returns the glance goal.
 */
exports.getGlanceGoal = function() {
  return JSON.parse(appSettings.getString('phone')).goals.glances;
};

/* export: getUnlockGoal
 * ---------------------
 * Returns the unlock goal.
 */
exports.getUnlockGoal = function() {
  return JSON.parse(appSettings.getString('phone')).goals.unlocks;
};

/* export: getUsageGoal
 * --------------------
 * Returns the usage goal.
 */
exports.getUsageGoal = function() {
  return JSON.parse(appSettings.getString('phone')).goals.minutes;
};

/* export: getMinutesGoal
 * ----------------------
 * Returns the minutes goal for the specific app.
 */
exports.getMinutesGoal = function(packageName) {
  return JSON.parse(appSettings.getString(packageName)).goals.minutes;
};

exports.getProgressViewInfo = function() {
  var retObj = {}
  retObj.phoneStats = arrangeData(JSON.parse(appSettings.getString('phone')).stats);
  
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  retObj.appStats = [];
  list.forEach(function (item) {
    var appStat = arrangeData(JSON.parse(appSettings.getString(item)).stats);
    appStat.packageName = item;
    retObj.appStats.push(appStat);
  });
  return retObj;
};


//To be used for app detail view -- returns an appStats object when passed a package name
exports.getAppStats = function(packageName) {
  var obj = JSON.parse(appSettings.getString(packageName));
  var arr = arrangeData(obj.stats);
  arr.goals = obj.goals;
  return arr;
};