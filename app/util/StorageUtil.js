var localStorage = require( "nativescript-localstorage" );
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
  {name: "Glances Toast", description: "Sends a disappearing message with today's glance count", target: 'phone'},
  {name: "Glances Notification", description: "Sends a notification with today's glance count", target: 'phone'},
  {name: "Unlocks Toast", description: "Sends a disappearing message with today's unlock count", target: 'phone'},
  {name: "Unlocks Notification", description: "Sends a notification with today's unlock count", target: 'phone' },
  {name: "Usage Toast", description: "Sends a disappearing message with today's phone usage in minutes", target: 'phone' },
  {name: "Usage Notification", description: "Sends a notification with today's phone usage in minutes", target: 'phone' },
  {name: "Visit Length Toast", description: "Sends a disappearing message with visit duration on a specific app", target: 'app' },
  {name: "Visit Length Notification", description: "Sends a notification with visit duration on a specific app" },
  {name: "Visits Toast", description: "Sends a disappearing message with today's visit count to a specific app", target: 'app' },
  {name: "Visits Notification", description: "Sends a notification with today's visit count to a specific app", target: 'app' }
];

exports.days = days;
exports.interventions = interventions;
exports.interventionDetails = interventionDetails;


/************************************
 *             HELPERS              *
 ************************************/


var PkgStat = function() {
  return {'visits': 0};
};

var PkgGoal = function() {
  return {'minutes': 15};
};

var PhStat = function() {
  return {'glances': 0, 'unlocks': 0};
};

var PhGoal = function() {
  return {'glances': 75, 'unlocks': 50, 'minutes': 120};
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  localStorage.setItem(packageName, {
      goals: PkgGoal(), 
      stats: [PkgStat(), PkgStat(), PkgStat(), PkgStat(), PkgStat(), PkgStat(), PkgStat()],
      disabled: Array(interventions.length).fill(false)
    });
};

/* helper: createPhoneData
 * -----------------------
 * Updates storage to include data for general phone.
 */
var createPhoneData = function() {
  localStorage.setItem('phone', {
      goals: PhGoal(), 
      stats: [PhStat(), PhStat(), PhStat(), PhStat(), PhStat(), PhStat(), PhStat()],
      disabled: Array(interventions.length).fill(false)
    });
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
  localStorage.clear();
  var preset = ['com.facebook.katana', 'com.google.android.youtube', 'com.facebook.orca', 
                'com.snapchat.android', 'com.instagram.android'];

  localStorage.setItem('onboarded', true);
  localStorage.setItem('selectedPackages', preset);
  localStorage.setItem('lastDateActive', startOfDay().getTimeInMillis());

  createPhoneData();
  preset.forEach(function (item) {
    createPackageData(item);
  });

  localStorage.setItem('enabled', Array(interventionDetails.length).fill(true));
};

/* export: isSetUp
 * ---------------
 * Checks if the user has been onboarded yet.
 */
exports.isSetUp = function() {
  return localStorage.getItem('onboarded');
};


/************************************
 *           MANAGEMENT             *
 ************************************/


/* export: getSelectedPackages
 * ---------------------------
 * Returns array of package names (strings) that are currently 'blacklisted'.
 */
exports.getSelectedPackages = function() {
  return localStorage.getItem('selectedPackages');
};

/* export: addPackage
 * ------------------
 * Adds the specified package to storage (with default goals, no data).
 */
exports.addPackage = function(packageName) {
  var list = localStorage.getItem('selectedPackages');
  if (!list.includes(packageName)) {
    list.push(packageName);
    createPackageData(packageName);
    localStorage.setItem('selectedPackages', list);
  }
};

/* export: removePackage
 * ---------------------
 * Removes the specified package.
 */
exports.removePackage = function(packageName) {
  var list = localStorage.getItem('selectedPackages').filter(function (item) {
    return item !== packageName;
  });
  localStorage.removeItem(packageName);
  localStorage.set('selectedPackages', list);
};

/* export: togglePackage
 * ---------------------
 * If the specified package is currently blacklisted, removes it from the list.
 * If the package is currently not blacklisted, adds it.
 */
exports.togglePackage = function(packageName) {
  var removed = false;
  var list = localStorage.getItem('selectedPackages');
  list = list.filter(function (item) {
    if (item === packageName) {
      localStorage.removeItem(packageName);
      removed = true;
    }
    return item !== packageName;
  });

  if (!removed) {
    createPackageData(packageName);
    list.push(packageName);
  }

  localStorage.setItem('selectedPackages', list);
  return !removed;
};

/* export: isPackageSelected
 * -------------------------
 * Checks if the given package name is blacklisted.
 */
exports.isPackageSelected = function(packageName) {
  return localStorage.getItem('selectedPackages').includes(packageName);
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
  var packageData = localStorage.getItem(packageName).stats.map(function (item) { 
    return item['visits']; 
  });
  return arrangeData(packageData, index);
};

/* export: visited
 * ---------------
 * Adds one to the visits for today.
 */
exports.visited = function(packageName) {
  var i = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
  localStorage.getItem(packageName).stats[i-1]['visits']++;
};

/* export: getUnlocks
 * ------------------
 * Gets number of unlocks on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getUnlocks = function(index) {
  var phoneData = localStorage.getItem('phone').stats.map(function (item) { 
    return item['unlocks']; 
  });
  return arrangeData(phoneData, index);
};

/* export: unlocked
 * ----------------
 * Adds one to the unlocks for today.
 */
exports.unlocked = function() {
  var i = Calendar.getInstance().get(Calendar.DAY_OF_WEEK);
  localStorage.getItem('phone').stats[i-1]['unlocks']++;
};

/* export: getGlances
 * ------------------
 * Gets number of glances on the given day. Returns as
 * either a number or an array of numbers (with today as the last index).
 */
exports.getGlances = function(index) {
  var phoneData = localStorage.getItem('phone').stats.map(function (item) { 
    return item['glances']; 
  });
  return arrangeData(phoneData, index);
};

/* export: glanced
 * ---------------
 * Adds one to the glances for today. Also erases any old data that needs to be overridden
 */
exports.glanced = function() {
  var lastDateActive = localStorage.getItem('lastDateActive');
  var today = startOfDay();
  var i = today.get(Calendar.DAY_OF_WEEK);
  var difference = Math.round((today.getTimeInMillis() - lastDateActive) / DAY_IN_MS);

  resetData(difference, i);

  var phoneData = localStorage.getItem('phone').stats[i-1]['glances']++;
};

/* helper: resetData
 * -----------------
 * Runs whenever a glance happens to erase data that will now be overwritten (if there is any).
 */
var resetData = function(days, today) {
  if (days) {
    localStorage.setItem('lastDateActive', startOfDay().getTimeInMillis());
  }

  for (var i = 0; i < days; i++) {
    localStorage.getItem('phone').stats[(today+6-i)%7] = {
      glances: 0,
      unlocks: 0
    };

    var list = localStorage.getItem('selectedPackages');
    list.forEach(function (packageName) {
      localStorage.getItem(packageName).stats[(today+6-i)%7] = {
        visits: 0
      };
    });
  }
};

/************************************
 *           INTERVENTIONS          *
 ************************************/

/* export: enableForAll
 * --------------------
 * Completely enables the given intervention (by id).
 */
exports.enableForAll = function(id) {
  localStorage.getItem('enabled')[id] = true;
};

/* export: disableForAll
 * ---------------------
 * Completely disables the given intervention (by id).
 */
exports.disableForAll = function(id) {
  localStorage.getItem('enabled')[id] = false;
};

/* export: toggleForAll
 * --------------------
 * Completely disables/enables the given intervention (by id).
 */
exports.toggleForAll = function(id) {
  var enabled = localStorage.getItem('enabled')[id];
  localStorage.getItem('enabled')[id] = !enabled;
  console.log('intervention ' + id + ' is now ' + (localStorage.getItem('enabled')[id] === true ? 'enabled' : 'disabled'));
};

/* export: enable
 * ---------------
 * Enables the given intervention for a specific package (by id).
 */
exports.enable = function(id, packageName) {
  localStorage.getItem(packageName).disabled[id] = true;
};

/* export: disable
 * ----------------
 * Disables the given intervention for a specific package (by id).
 */
exports.disable = function(id, packageName) {
  localStorage.getItem(packageName).disabled[id] = false;
};

/* export: toggle
 * ----------------
 * Toggles the given intervention for a specific package (by id).
 */
exports.toggle = function(id, packageName) {
  var enabled = localStorage.getItem(packageName).disabled[id];
  localStorage.getItem(packageName).disabled[id] = !enabled;
};

/* export: isEnabledForApp
 * -----------------------
 * Returns whether the given intervention is enabled for package specific interventions.
 */
exports.isEnabledForApp = function(id, packageName) {
  return !localStorage.getItem(packageName).disabled[id];
};

/* export: isEnabledForAll
 * -----------------------
 * Returns whether the given intervention is enabled generally.
 */
exports.isEnabledForAll = function(id) {
  return localStorage.getItem('enabled')[id];
};

/* export: canIntervene
 * --------------------
 * Returns whether the given intervention is should run.
 */
exports.canIntervene = function(id, packageName) {
  return localStorage.getItem('enabled')[id] && 
        (interventionDetails[id].target === 'phone' || !localStorage.getItem(packageName).disabled[id]);
};