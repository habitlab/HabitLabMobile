var localStorage = require( "nativescript-localstorage" );

var days = {
  ALL: 0,
  TODAY: java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK),
  SUN: 1,
  MON: 2,
  TUE: 3,
  WED: 4,
  THU: 5,
  FRI: 6,
  SAT: 7
};

exports.days = days;


/* export: getSelectedPackages
 * ---------------------------
 * Returns array of package names (strings) that are currently 'blacklisted'.
 */
exports.getSelectedPackages = function() {
  return localStorage.getItem('selectedPackages');
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  localStorage.setItem(packageName, {
      goals: {'minutes': 15}, 
      stats: [{'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}]
    });
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

  localStorage.setItem('phone', {
    goals: {'minutes': 120, 'glances': 75, 'unlocks': 50}, 
    stats: [{'unlocks': 0, 'glances': 0}, {'unlocks': 0, 'glances': 0}, {'unlocks': 0, 'glances': 0}, {'unlocks': 0, 'glances': 0}, 
            {'unlocks': 0, 'glances': 0}, {'unlocks': 0, 'glances': 0}, {'unlocks': 0, 'glances': 0}]
  });

  preset.forEach(function (item) {
    createPackageData(item);
  });
};

/* export: isSetUp
 * ---------------
 * Checks if the user has been onboarded yet.
 */
exports.isSetUp = function() {
  return localStorage.getItem('onboarded');
};

/* export: bootstrap
 * -----------------
 * Clears storage.
 */
exports.bootstrap = function() {
  localStorage.clear();
};

/* export: isPackageSelected
 * -------------------------
 * Checks if the given package name is blacklisted.
 */
exports.isPackageSelected = function(packageName) {
  return exports.getSelectedPackages().includes(packageName);
};

/* helper: rearrangeData
 * ---------------------
 * Arranges the data so it is from least recent to most recent (for graphs, etc.).
 */
var rearrangeData = function(dataArr) {
  var i = days.TODAY;
  if (i === 7) {
    return dataArr;
  }
  return dataArr.splice(i, dataArr.length).concat(dataArr.splice(0, i));
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
  return (index && index < 7) ? packageData[index-1] : rearrangeData(packageData);
};

/* export: visited
 * ---------------
 * Adds one to the visits for today.
 */
exports.visited = function(packageName) {
  localStorage.getItem(packageName).stats[days.TODAY-1]['visits']++;
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
  return (index && index < 7) ? phoneData[index-1] : rearrangeData(phoneData);
};

/* export: unlocked
 * ----------------
 * Adds one to the unlocks for today.
 */
exports.unlocked = function() {
  localStorage.getItem('phone').stats[days.TODAY-1]['unlocks']++;
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
  return (index && index < 7) ? phoneData[index-1] : rearrangeData(phoneData);
};

/* export: glanced
 * ---------------
 * Adds one to the glances for today.
 */
exports.glanced = function() {
  var phoneData = localStorage.getItem('phone').stats[days.TODAY-1]['glances']++;
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  localStorage.setItem(packageName, {
      goals: {'minutes': 15}, 
      stats: [{'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}]
    });
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  localStorage.setItem(packageName, {
      goals: {'minutes': 15}, 
      stats: [{'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}]
    });
};

/* helper: wipeTodaysData
 * ----------------------
 * Runs every night at midnight to make room for the new data.
 */
exports.wipeTodaysData = function() {

  localStorage.getItem('phone').stats[days.TODAY] = {
    glances: 0,
    unlocks: 0
  };

  var list = localStorage.getItem('selectedPackages');
  list.forEach(function (packageName) {
    localStorage.getItem(packageName).stats[days.TODAY] = {
      visits: 0
    };
  });

};