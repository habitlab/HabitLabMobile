var localStorage = require( "nativescript-localstorage" );

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

/* helper: arrangeData
 * -------------------
 * Depending on the index passed in gives the user, the desired data. If it is with flag ALL, 
 * arranges the data so it is from least recent to most recent (for graphs, etc.).
 */
var arrangeData = function(dataArr, index) {
  if (index < -1 || index > 7) {
    return -1;
  }

  var i = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);

  console.log("Arrange:", i);

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
  var i = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);
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
  var i = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);

  console.log("Unlocked:", i);
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
 * Adds one to the glances for today.
 */
exports.glanced = function() {
  var i = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);

  console.log("Glanced:", i);

  var phoneData = localStorage.getItem('phone').stats[i-1]['glances']++;
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

  var i = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);

  console.log("Wiping:", i);

  localStorage.getItem('phone').stats[i-1] = {
    glances: 0,
    unlocks: 0
  };

  var list = localStorage.getItem('selectedPackages');
  list.forEach(function (packageName) {
    localStorage.getItem(packageName).stats[i-1] = {
      visits: 0
    };
  });

};