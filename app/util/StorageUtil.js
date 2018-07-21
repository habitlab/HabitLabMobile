var appSettings = require("application-settings");
var ID = require('~/interventions/InterventionData');
var http = require('http');
var askForEmail = require("~/views/onboarding/askForEmailView/askForEmailView")

var Calendar = java.util.Calendar;
var System = java.lang.System;

var DAY_IN_MS = 86400000;
var MIN_IN_MS = 60000;
var SEC_IN_MS = 1000;

/************************************
 *             HELPERS              *
 ************************************/

/* helper: daysSinceEpoch
 * ----------------------
 * Returns the number of days since UTC time began (THIS IS COORDINATED TO 
 * LOCAL TIME). To be used for indexing.
 */
var daysSinceEpoch = function() {
  var offset = new Date().getTimezoneOffset();
  var now = Date.now() - (offset * MIN_IN_MS);
  return Math.floor(now / DAY_IN_MS);
};

/* helper: index
 * -------------
 * Gives the index that should be used to get today's data from a database stat array.
 */
var index = function() {
  return daysSinceEpoch() % 28;
};

/**
 * Generates 24-character hex string as unique id.
 */
var genUserId = function() {
  userID = ''
  for (var i = 0; i < 24; i++) {
    userID += '0123456789abcdef'[Math.floor(Math.random() * 16)]
  }
  return userID
}
/* helpers: PkgStat, PkgGoal, PhStat, PhGoal
 * -----------------------------------------
 * To be used for setting up empty data in the database. Each app and the phone get a
 * object in the database which includes a stat array, goal object, and enabled array.
 */
var PkgStat = function() {
  return {visits: 0, time: 0};
};

// see comment above PkgStat
var PkgGoal = function() {
  return {minutes: 15};
};

// see comment above PkgStat
var PhStat = function() {
  return {glances: 0, unlocks: 0, totalTime: 0};
};

// see comment above PkgStat
var PhGoal = function() {
  return {glances: 75, unlocks: 50, minutes: 120};
};

/* helper: randBW
 * --------------
 * Helper which returns a random integer between min and max inclusive.
 */
var randBW = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

/* helpers: FakePkgStat, FakePkgGoal, FakePhStats, FakePhGoal
 * ----------------------------------------------------------
 * To be used for setting up fake data in the database. Each app and the phone get a
 * object in the database which includes a stat array, goal object, and enabled array.
 */
var FakePkgStat = function() {
  return {visits: randBW(3, 20), time: randBW(5, 30)};
};

// see comment above FakePkgStat
var FakePkgGoal = function() {
  return {minutes: 15};
};

// see comment above FakePkgStat
var FakePhStats = function() {
  var phStats = [];
  var appStats = [];
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  list.forEach(function (pkg) {
    appStats.push(JSON.parse(appSettings.getString(pkg)).stats);
  });
  var targetList = JSON.parse(appSettings.getString('targetPackages'));
  list.forEach(function (pkg) {
    appStats.push(JSON.parse(appSettings.getString(pkg)).stats);
  });

  for (var i = 0; i < 28; i++) {
    var numUnlocks = randBW(30, 70);
    var total = 0;
    appStats.forEach(function(pkgData) {
      total += pkgData[i]['time'];
    });

    phStats.push({
      glances: randBW(numUnlocks, numUnlocks*2), 
      unlocks: numUnlocks,
      totalTime: randBW(total, total + 30)
    });
  }
  return phStats;
};

// see comment above FakePkgStat
var FakePhGoal = function() {
  return {glances: 75, unlocks: 50, minutes: 120};
};

/* helper: createPackageData
 * -------------------------
 * Updates storage to include data for newly added packages.
 */
var createPackageData = function(packageName) {
  var enabled = true
  appSettings.setString(packageName, JSON.stringify({
      goals: PkgGoal(), 
      stats: Array(28).fill(PkgStat()),
      enabled: Array(ID.interventionDetails.length).fill(enabled),
      sessions: Array(28).fill([])
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

/* helper: createFakePackageData
 * -----------------------------
 * Updates storage to include FAKE data for newly added packages.
 */
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

/* helper: createFakePhoneData
 * ---------------------------
 * Updates storage to include FAKE data for general phone.
 */
var createFakePhoneData = function() {
  appSettings.setString('phone', JSON.stringify({
      goals: FakePhGoal(), 
      stats: FakePhStats(),
      enabled: Array(ID.interventionDetails.length).fill(true)
    }));
};

/* helper: ActiveHours
 * -------------------
 * Returns an object to be used for managing active hours. If the start and end 
 * are the same, interventions are active all the time (as long as the day is a
 * selected day).
 */
var ActiveHours = function() {
  return {
    start: {h: 0, m: 0},
    end: {h: 0, m: 0},
    days: Array(7).fill(true)
  };
};


/************************************
 *           SETTING UP             *
 ************************************/

/* export: eraseData
 * -----------------
 * FOR DEVELOPMENT ONLY
 * Erases entire database.
 */
exports.eraseData = function() {
  appSettings.clear();
};

/* export: setUpLogging
 * --------------------
 * Set up logging part of DB (sorry it's gross).
 */
var setUpLogging = function() {
  appSettings.setString('log', JSON.stringify({
    page_visits: {
      total_visits: 0,
      progress_day: 0,
      progress_week: 0,
      progress_month: 0,
      watchlist_main: 0,
      watchlist_manage: 0,
      watchlist_detail: 0,
      nudges_main: 0,
      nudges_detail: 0,
      goals: 0,
      settings_main: 0,
      settings_hours: 0,
      settings_faq: 0,
      settings_feedback: 0,
      settings_info: 0
    },
    navigation: {
      progress_to_detail: 0,
      watchlist_to_detail: 0,
      menu: 0
    },
    features: {
      active_days_changed: 0,
      active_hours_changed: 0,
      snooze_opened: 0,
      snooze_set: 0,
      remove_snooze: 0,
      editname: 0,
      editname_changed: 0,
      erase_data: 0,
      erase_data_confirm: 0,
      nudge_detail_demo: 0,
      nudge_detail_toggle: 0,
      nudge_detail_toggle_all: 0,
      progress_toggle_graph: 0,
      watchlist_detail_expand: 0,
      watchlist_detail_toggle: 0,
      watchlist_detail_disable_all: 0,
      watchlist_detail_disable_all_confirm: 0,
      watchlist_detail_arrow: 0,
      watchlist_detail_appgoal_change: 0,
      watchlist_manage_change: 0,
      goals_appgoal_change: 0,
      goals_phonegoal_change: 0,
      feedback_wiki: 0,
      feedback_email: 0,
      feedback_survey: 0,
      feedback_extension: 0,
      faq_item: 0,
      tooltips: 0
    },
    nudges: Array(ID.interventionDetails.length).fill(0)
  }));
};

/* export: setUp
 * -------------
 * Resets all data to defaults. Does not get rid of onboarded, setUp, or name
 */
exports.setUpDB = function(erasingData) {
  if (erasingData) {
    sendLog();
  }

  if (!appSettings.getString('userID')) {
    appSettings.setString('userID', genUserId());
  }
  var watchlistPreset = appSettings.getString("installedPresets", "null")
  if (watchlistPreset != "null") {
    watchlistPreset = JSON.parse(watchlistPreset)
  } else {
    watchlistOptions = require("~/util/UsageInformationUtil").getInstalledPresets().watchlist;  
    if (appSettings.getString("experiment") == "conservation") {
      // we need to randomly recommend installed presets.
      watchlistPreset = []
      for (var option of watchlistOptions) {
        if (Math.random() < .5) {
          watchlistPreset.push(option)
        }
      }
    } else {
      watchlistPreset = watchListOptions
    }
  }
  appSettings.setString("watchlistPreset", JSON.stringify(watchlistPreset))
  appSettings.setString('selectedPackages', JSON.stringify(watchlistPreset));
  appSettings.setString('targetPackages', JSON.stringify([]));
  appSettings.setString('lastActive', daysSinceEpoch() + '');
  appSettings.setString('activeHours', JSON.stringify(ActiveHours()));

  watchlistPreset.forEach(function (item) {
    createPackageData(item);
  });


  createPhoneData();
  appSettings.setString('enabled', JSON.stringify(Array(ID.interventionDetails.length).fill(true)));

  setUpLogging();
};

/* export: setUpFakeDB
 * -------------------
 * Puts in completely fake data. Does not get rid of onboarded, setUp, or name.
 */
exports.setUpFakeDB = function() {
  var watchlistPreset = require("~/util/UsageInformationUtil").getInstalledPresets().watchlist;
  var targetPreset = require("~/util/UsageInformationUtil").getInstalledPresets().targets;

  appSettings.setString('selectedPackages', JSON.stringify(watchlistPreset));
  appSettings.setString('targetPackages', JSON.stringify(targetPreset));
  appSettings.setString('lastActive', daysSinceEpoch() + '');
  appSettings.setString('activeHours', JSON.stringify(ActiveHours()));

  watchlistPreset.forEach(function (item) {
    createFakePackageData(item);
  });
  targetPreset.forEach(function (item) {
    createFakePackageData(item);
  });
  createFakePhoneData();
  appSettings.setString('enabled', JSON.stringify(Array(ID.interventionDetails.length).fill(true)));

  setUpLogging();
}

/* export: isSetUp
 * ---------------
 * Checks if the user has a database and has finished pre-app onboarding yet.
 */
exports.isOnboardingComplete = function() {
  return appSettings.getBoolean('onboardingComplete');
};

/* export: setSetUp
 * ----------------
 * Sets the boolean 'setUp' to true which means the user doesn't need to go through pre-app
 * onboarding anymore.
 */
exports.setOnboardingComplete = function() {
  appSettings.setBoolean('onboardingComplete', true);
};

/* export: isOnboarded
 * -------------------
 * Checks if the user has finished the in-app onboarding yet.
 */
exports.isTutorialComplete = function() {
  return appSettings.getBoolean('tutorialComplete');
};

/* export: setOnboarded
 * --------------------
 * Sets the boolean 'onboarded' to true which means the user doesn't need to go through in-app
 * onboarding anymore.
 */
exports.setTutorialComplete = function() {
  appSettings.setBoolean('tutorialComplete', true);
};

/* export: setTargetOn
 * --------------------
 * Sets the boolean 'targetOn' to true which means the user has enabled
 * 'target' goals and gone through the tutorial
 */
exports.setTargetOn = function() {
  appSettings.setBoolean('targetOn', true);
};


/* export: isTargetOn
 * --------------------
 * Checks if the user has set target on
 */
exports.isTargetOn = function() {
  return appSettings.getBoolean('targetOn');
};


/* export: setName
 * ---------------
 * Sets the personalized name.
 */
exports.setName = function(newName) {
  appSettings.setString('name', newName);
};

/* export: getName
 * ---------------
 * Gets the personalized name.
 */
exports.getName = function() {
  return appSettings.getString('name');
};

/* export: setEmail
 * ---------------
 * Sets the personalized email.
 */
exports.setEmail = function(email) {
  appSettings.setString('email', email);
};

/* export: getEmail
 * ---------------
 * Gets the personalized email.
 */
exports.getEmail = function() {
  return appSettings.getString('email');
};

/***********************************
 *           WATCHLIST             *
 ***********************************/


/* export: getSelectedPackages
 * ---------------------------
 * Returns array of package names (strings) that are currently 'blacklisted'.
 */
exports.getSelectedPackages = function() {
  return JSON.parse(appSettings.getString('selectedPackages')) || [];
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
  var targetlist = JSON.parse(appSettings.getString('targetPackages')).filter(function (item) {
    return item !== packageName;
  });
  sendLog();
  appSettings.remove(packageName);
  appSettings.setString('selectedPackages', JSON.stringify(list));
  appSettings.setString('targetPackages', JSON.stringify(targetlist));
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
      sendLog();
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


/***********************************
 *           TARGETS             *
 ***********************************/


// /* export: getTargetSelectedPackages
//  * ---------------------------
//  * Returns array of package names (strings) that are currently in 'target'.
//  */
exports.getTargetSelectedPackages = function() {
  return JSON.parse(appSettings.getString('targetPackages')) || [];
};

// /* export: addTargetPackage
//  * ------------------
//  * Adds the specified package to storage for target apps (with default goals, no data).
//  */
exports.addTargetPackage = function(packageName) {
  var list = JSON.parse(appSettings.getString('targetPackages'));
  if (!list.includes(packageName)) {
    list.push(packageName);
    createPackageData(packageName);
    appSettings.setString('targetPackages', JSON.stringify(list));
  }
};

// /* export: removeTargetPackage
//  * ---------------------
//  * Removes the specified package from target.
//  */
exports.removeTargetPackage = function(packageName) {
  var list = JSON.parse(appSettings.getString('targetPackages')).filter(function (item) {
    return item !== packageName;
  });
  sendLog();
  appSettings.remove(packageName);
  appSettings.setString('targetPackages', JSON.stringify(list));
};

// /* export: toggleTargetPackage
//  * ---------------------
//  * If the specified package is currently in target, removes it from the list.
//  * If the package is currently not in target, adds it.
//  */
exports.toggleTargetPackage = function(packageName) {
  var removed = false;
  var list = JSON.parse(appSettings.getString('targetPackages')).filter(function (item) {
    if (item === packageName) {
      sendLog();
      appSettings.remove(packageName);
      removed = true;
    }
    return item !== packageName;
  });

  if (!removed) {
    createPackageData(packageName);
    list.push(packageName);
  }

  appSettings.setString('targetPackages', JSON.stringify(list));
  return !removed;
};

// /* export: isTargetPackageSelected
//  * -------------------------
//  * Checks if the given package name is in target apps.
//  */
exports.isTargetPackageSelected = function(packageName) {
  return JSON.parse(appSettings.getString('targetPackages')).includes(packageName);
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

// called on every glance to determine whether to start a new day of data
var eraseExpiredData = function() {
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  var today = daysSinceEpoch();
  var diff = today - Number(appSettings.getString('lastActive'));
  if (diff) {

    appSettings.setString('lastActive', today + '');
    sendLog();

    for (var i = 0; i < diff; i++) {
      phoneInfo.stats[(today - i + 28) % 28] = PhStat();
    }

    var watchlist = JSON.parse(appSettings.getString('selectedPackages'));
    watchlist.forEach(function (packageName) {
      var appInfo = JSON.parse(appSettings.getString(packageName));
      for (var i = 0; i < diff; i++) {
        appInfo.stats[(today - i + 28) % 28] = PkgStat();
      }
      appSettings.setString(packageName, JSON.stringify(appInfo));
    });

    var targetlist = JSON.parse(appSettings.getString('targetPackages'));
    targetlist.forEach(function (packageName) {
      var appInfo = JSON.parse(appSettings.getString(packageName));
      for (var i = 0; i < diff; i++) {
        appInfo.stats[(today - i + 28) % 28] = PkgStat();
      }
      appSettings.setString(packageName, JSON.stringify(appInfo));
    });
  }

  return phoneInfo;
};

/* export: glanced
 * ---------------
 * Adds one to the glances for today. Also erases any old data that needs to be overridden
 */
exports.glanced = function() {
  var phoneInfo = eraseExpiredData();
  phoneInfo['stats'][index()]['glances']++;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: updateAppTime
 * ---------------------
 * Called when an app has been visited to update the time spent on that app for the 
 * day (time is in minutes).
 */
exports.updateAppTime = async function(currentApplication, time) {
  let packageName = currentApplication.packageName
  var today = new Date();
  var start = new Date();
  start.setMilliseconds(today.getMilliseconds() - time);
  var idx = index()
  //Let's store this session information locally if this app is on our watchlist.
  var appInfo = appSettings.getString(packageName, "null");
  if (appInfo != "null") {
    appInfo = JSON.parse(appInfo)
    // In case this session crosses over to a different day, we should break it up when storing it locally
    if (start.getDay() !== today.getDay()) {
      today.setHours(0, 0, 0, 0); // calculate today's midnight
      var yesterdayTime = today.getTime() - start.getTime();
      var time = time - yesterdayTime;
      // duration is in seconds, but the local storage saves it in minutes.
      appInfo['stats'][(idx + 27) % 28]['time'] += Math.round(yesterdayTime / MIN_IN_MS )
    } 
    appInfo['stats'][(idx + 27) % 28]['time'] += Math.round(time / MIN_IN_MS) 
    appSettings.setString(packageName, JSON.stringify(appInfo));
  }
  // Now, log today's portion of the session.
  var session_object = {timestamp: start.getTime(), duration: Math.round(time /SEC_IN_MS), domain: packageName, interventions: currentApplication.interventions}
  logSession(session_object)
};

/* export: getAppTime
 * ------------------
 * Returns time on the app so far today (in minutes).
 */
exports.getAppTime = function(packageName) {
  return Math.ceil(JSON.parse(appSettings.getString(packageName)).stats[index()]['time']);
};

/* export: getTargetTime
 * ---------------------
 * Returns total time on target apps so far today (in minutes).
 */
var getTargetTime = function() {
  var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
  var time = 0;
  pkgs.forEach(function (pkg) {
    time += Math.ceil(JSON.parse(appSettings.getString(pkg)).stats[index()]['time']);
  });
  return time;
};

/* export: updateTotalTime
 * -----------------------
 * Called when the phone has been used. Updates the total time for the day (time is in minutes).
 */
exports.updateTotalTime = function(time) {  
  var phoneInfo = JSON.parse(appSettings.getString('phone'));
  phoneInfo['stats'][index()]['totalTime'] += Math.round(time * 100 / MIN_IN_MS) / 100;
  appSettings.setString('phone', JSON.stringify(phoneInfo));
};

/* export: getTotalTime
 * --------------------
 * Returns total time on phone so far today (in minutes).
 */
exports.getTotalTime = function() {
  return Math.ceil(JSON.parse(appSettings.getString('phone')).stats[index()]['totalTime']);
};


/************************************
 *           INTERVENTIONS          *
 ************************************/

 exports.getInterventionsForApp = function(pkg) {
  return JSON.parse(appSettings.getString(pkg)).enabled || false;
 };

/* export: enableForAll
 * --------------------
 * Completely enables the given intervention (by id).
 */
exports.enableForAll = function(id) {
  // enable overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = true;
  appSettings.setString('enabled', JSON.stringify(enabled));

  if (ID.interventionDetails[id].target === 'phone') {
    return;
  }

  // go through and set individual toggles
  var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
  pkgs.forEach(function (item) {
    var appInfo = JSON.parse(appSettings.getString(item));
    if (!appInfo.enabled[id]) {
      appInfo.enabled[id] = true;
      appSettings.setString(item, JSON.stringify(appInfo));
    }
  });
};

/* export: disableForAll
 * ---------------------
 * Completely disables the given intervention (by id).
 */
exports.disableForAll = function(id) {
  // disable overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = false;
  appSettings.setString('enabled', JSON.stringify(enabled));

  if (ID.interventionDetails[id].target === 'phone') {
    return;
  }

  // go through and set individual toggles
  var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
  pkgs.forEach(function (item) {
    var appInfo = JSON.parse(appSettings.getString(item));
    if (appInfo.enabled[id]) {
      appInfo.enabled[id] = false;
      appSettings.setString(item, JSON.stringify(appInfo));
    }
  });
};

/* export: toggleForAll
 * --------------------
 * Completely disables/enables the given intervention (by id).
 */
exports.toggleForAll = function(id) {
  // toggle overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  enabled[id] = !enabled[id];
  appSettings.setString('enabled', JSON.stringify(enabled));

  if (ID.interventionDetails[id].target === 'phone') {
    return;
  }

  // go through and set individual toggles
  var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
  pkgs.forEach(function (item) {
    var appInfo = JSON.parse(appSettings.getString(item));
    if (appInfo.enabled[id] && !enabled[id] || !appInfo.enabled[id] && enabled[id]) {
      appInfo.enabled[id] = enabled[id];
      appSettings.setString(item, JSON.stringify(appInfo));
    }
  });
};

/* export: enableForApp
 * --------------------
 * Enables the given intervention for a specific package (by id).
 */
exports.enableForApp = function(id, packageName) {
  // enable individually
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = true;
  appSettings.setString(packageName, JSON.stringify(appInfo));

  // make sure enabled is true overall
  var enabled = JSON.parse(appSettings.getString('enabled'));
  if (!enabled[id]) {
    enabled[id] = true;
    appSettings.setString('enabled', JSON.stringify(enabled));
  }
};

/* export: disableForApp
 * ---------------------
 * Disables the given intervention for a specific package (by id).
 */
exports.disableForApp = function(id, packageName) {
  // disable individually
  var appInfo = JSON.parse(appSettings.getString(packageName));
  if (appInfo.enabled[id]) {
    appInfo.enabled[id] = false;
    appSettings.setString(packageName, JSON.stringify(appInfo));

    // check if overall disable is necessary
    var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
    var mustDisable = true;
    for (var item in pkgs) {
      if (item === packageName) {
        continue;
      }

      appInfo = JSON.parse(appSettings.getString(item));
      if (enabled[id]) {
        mustDisable = false;
        break;
      }
    }

    if (mustDisable) {
      var enabled = JSON.parse(appSettings.getString('enabled'));
      enabled[id] = false;
      appSettings.setString('enabled', JSON.stringify(enabled));
    } 
  }
};

/* export: toggleForApp
 * --------------------
 * Toggles the given intervention for a specific package (by id).
 */
exports.toggleForApp = function(id, packageName) {
  var appInfo = JSON.parse(appSettings.getString(packageName));
  appInfo.enabled[id] = !appInfo.enabled[id];
  appSettings.setString(packageName, JSON.stringify(appInfo));

  // if intervention just enabled for app
  if (appInfo.enabled[id]) {
    // make sure enabled is true overall
    var enabled1 = JSON.parse(appSettings.getString('enabled'));
    if (!enabled1[id]) {
      enabled1[id] = true;
      appSettings.setString('enabled', JSON.stringify(enabled1));
    }
  } else { // intervention just disabled for app
    // check if overall disable is necessary
    var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
    var foundEnabled = false;
    pkgs.forEach(function (item) {
      if (item === packageName || foundEnabled) {
        return;
      }
      var currInfo = JSON.parse(appSettings.getString(item));
      foundEnabled = currInfo.enabled[id];
    });

    if (!foundEnabled) {
      var enabled2 = JSON.parse(appSettings.getString('enabled'));
      enabled2[id] = false;
      appSettings.setString('enabled', JSON.stringify(enabled2));
    } 
  }
};

/* export: isEnabledForApp
 * -----------------------
 * Returns whether the given intervention is enabled for package specific interventions.
 */
exports.isEnabledForApp = function(id, packageName) {
  return JSON.parse(appSettings.getString(packageName)).enabled[id] || false;
};

/* export: isEnabledForAll
 * -----------------------
 * Returns whether the given intervention is enabled generally.
 */
exports.isEnabledForAll = function(id) {
  return JSON.parse(appSettings.getString('enabled'))[id] || false;
};

/* export: setLockdown
 * -------------------
 * Sets the lockdown mode for 'duration' minutes. Lockdown is implemented by setting the UTC time in
 * milliseconds when HabitLab can send inteverventions again.
 */
exports.setLockdown = function(duration) {
  appSettings.setString('lockdownEnd', JSON.stringify(Date.now() + duration * 60000));
  appSettings.setNumber('lockdownDuration', duration);
};


/* export: getLockdownGoal
 * -------------------
 * Returns the amount of time (in minutes) that the lockdown was set for
 */
exports.getLockdownDuration = function() {
  return appSettings.getNumber('lockdownDuration');
}


/* export: getLockdownProgress
 * -------------------
 * Returns the time in milliseconds (UTC) when the lockdown will end.
 */
exports.getLockdownEnd = function() {
  return Number(appSettings.getString('lockdownEnd'));
};

/* export: inLockdownMode
 * ----------------------
 * Returns whether HabitLab is currently in lockdown
 */
exports.inLockdownMode = function() {
  return  Date.now() - Number(appSettings.getString('lockdownEnd')) < 0;
};

/* export: removeLockdown
 * ----------------------
 * Removes the lockdown from the watchlist
 */
exports.removeLockdown = function() {
  appSettings.setString('lockdownEnd', "" + Date.now());
};

/* export: setSnooze
 * -----------------
 * Sets the snooze for 'duration' minutes. Snooze is implemented by setting the UTC time in
 * milliseconds when HabitLab can send inteverventions again.
 */
exports.setSnooze = function(duration) {
  appSettings.setString('snoozeEnd', JSON.stringify(Date.now() + duration * 60000));
};

/* export: getSnooze
 * -----------------
 * Returns the time in milliseconds (UTC) when the snooze will end.
 */
exports.getSnooze = function() {
  return Number(appSettings.getString('snoozeEnd'));
};

/* export: inSnoozeMode
 * --------------------
 * Returns whether HabitLab is currently snoozed
 */
exports.inSnoozeMode = function() {
  return  Date.now() - Number(appSettings.getString('snoozeEnd')) < 0;
};

/* export: removeSnooze
 * --------------------
 * Removes the snooze from HabitLab
 */
exports.removeSnooze = function() {
  appSettings.setString('snoozeEnd', "" + Date.now());
};

/* export: withinActiveHours
 * -------------------------
 * Returns whether the current time is within the user's active hours settings.
 */
var withinActiveHours = function() {
  var hours = JSON.parse(appSettings.getString('activeHours'));
  var now = new Date();
  if (!hours.days[now.getDay()]) {
    return false;
  }

  var start = hours.start;
  var end = hours.end;

  if (start.h === end.h && start.m === end.m) {
    return true;
  }

  var h = now.getHours();
  var m = now.getMinutes();

  // first check if end < start (wraps through a midnight)
  if (start.h > end.h || (start.h === end.h && start.m > end.m)) {
    if (!(h > start.h || h === start.h && m >= start.m || h < end.h || h === end.h && m < end.m)) return false;
  } else { // then check normal
    if (h < start.h || h === start.h && m < start.m || h > end.h || h === end.h && m >= end.m) return false;
  }

  return true;
};

/* export: setActiveHours
 * ----------------------
 * Updates the user's active hours settings.
 */
exports.setActiveHours = function(activeHours) {
  appSettings.setString('activeHours', JSON.stringify(activeHours));
};

/* export: getActiveHours
 * ----------------------
 * Returns the user's active hours settings.
 */
exports.getActiveHours = function() {
  return JSON.parse(appSettings.getString('activeHours'));
};

/* export: canIntervene
 * --------------------
 * Returns whether the given intervention is should run. Based on active hours, snooze,
 * intervention target, and package name / intervention id.
 */
exports.canIntervene = function(id, packageName) {
  if (!withinActiveHours() || exports.inSnoozeMode() || !appSettings.getBoolean('tutorialComplete')) {
    return false;
  }

  if (ID.interventionDetails[id].target === 'phone') {
    return JSON.parse(appSettings.getString('enabled'))[id] || false;
  } else  { // target === 'app'
    var specified = ID.interventionDetails[id].apps;
    return (!specified || specified.includes(packageName)) && JSON.parse(appSettings.getString(packageName)).enabled[id] || false;
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

/* export: getProgressViewInfo
 * ---------------------------
 * Gets all the details for progress view (to minimize the number of database reads).
 * 
 * returns: {
 *   phoneStats: [] // array of 28 objects --> {glances, unlocks, time, totalTime}
 *   appStats: [[]] // array of arrays
 *              ^^ the inner array corresponds to a single app and contains 28 objects --> {time, visits}
 * }
 */
exports.getProgressViewInfo = function() {
  var retObj = {}
  retObj.phoneStats = arrangeData(JSON.parse(appSettings.getString('phone')).stats);
  retObj.phoneStats.forEach(function (phoneStat) {
    phoneStat.totalTime = Math.ceil(phoneStat.totalTime);
  });
  
  var list = JSON.parse(appSettings.getString('selectedPackages'));
  retObj.appStats = [];
  var targetTime = 0;
  list.forEach(function (pkg, pkgIndex) {
    var appStat = arrangeData(JSON.parse(appSettings.getString(pkg, pkgIndex)).stats);

    // total the target times
    appStat.forEach(function (item, index) {
      if (pkgIndex === 0) {
        retObj.phoneStats[index].time = 0;
      }

      item.time = Math.ceil(item.time);
      retObj.phoneStats[index].time += item.time;
    });

    appStat.packageName = pkg;
    retObj.appStats.push(appStat);
  });
  return retObj;
};

/* export: getAppStats
 * -------------------
 * For the app detail view. Gets all the appstats of an object at once.
 */
exports.getAppStats = function(packageName) {
  var obj = JSON.parse(appSettings.getString(packageName));
  var arr = arrangeData(obj.stats);
  arr.goals = obj.goals;
  return arr;
};

/*******************************
 *           LOGGING           *
 *******************************/

/* exports: getErrorQueue
 * ----------------------
 * Returns the current error queue (an array).
 */
exports.getErrorQueue = function() {
  var queue = appSettings.getString('errorQueue');
  return queue && JSON.parse(queue) || [];
};

/* exports: addError
 * -----------------
 * Adds an error to the queue.
 */
exports.addError = function(error) {
  var queue = appSettings.getString('errorQueue');
  queue = queue && JSON.parse(queue) || [];
  queue.push(error);
  appSettings.setString('errorQueue', JSON.stringify(queue));
};

/* exports: clearErrorQueue
 * ------------------------
 * Removes all errors from the queue.
 */
exports.clearErrorQueue = function() {
  appSettings.setString('errorQueue', JSON.stringify([]));
};

/* exports: addLogEvent
 * --------------------
 * Adds one to a log event by category and index (object within an object).
 * Pass an array of events to add (to limit database read and writes).
 */
exports.addLogEvents = function(events) {
  var log = JSON.parse(appSettings.getString('log'));
  events.forEach(function (e) {
    if (e.setValue) {
      log[e.category][e.index] = e.setValue;
    } else {
      if (log[e.category][e.index]) {
        log[e.category][e.index]++;
      } else {
        log[e.category][e.index] = 1;
      }
    }
  });
  appSettings.setString('log', JSON.stringify(log));
};

/* exports: sendLog
 * ----------------
 * Sends the log to habitlab-mobile-website whenever the day is changed
 */
 var sendLog = function() {
  if (!appSettings.getString('deviceID')) {
    var application = require("application");
    var deviceId = android.provider.Settings.Secure.getString(application.android.context.getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
    appSettings.setString('deviceID', '' + deviceId);
  }

  var log = JSON.parse(appSettings.getString('log'));
  log['userID'] = appSettings.getString('userID');
  log['deviceID'] = appSettings.getString('deviceID');
  log['localTime'] = new Date().toLocaleString();
  log['index'] = index();

  var data = {};
  data['lastActive'] = appSettings.getString('lastActive');

  var list = JSON.parse(appSettings.getString('selectedPackages'));
  list.push('phone');
  list.push('enabled');
  list.push('activeHours');
  list.forEach(function (pkg) {
    data[pkg] = JSON.parse(appSettings.getString(pkg));
    //This whole "send past 28 days of visits" seems redundant, so let's make stats just for today
    if (data[pkg]['stats'] != null) {
      data[pkg]['stats'] = data[pkg]['stats'][index()]
    }
    //Also, a list of 'true' doesn't  really give much information about which interventions are enabled.
    if (data[pkg]['enabled'] != null) {
      enabled_list = data[pkg]['enabled']
      data[pkg]['enabled'] = []
      for (var i = 0; i < enabled_list.length; i++) {
        if (enabled_list[i]) {
          data[pkg]['enabled'].push(ID.interventionDetails[i]['shortname'])
        }
      }
    }
  });
  //Same thing with nudge counts:
  if (log['nudges']) {
    for (var i = 0; i < ID.interventionDetails.length;  i++) { 
      log['nudges'][i] = {name: ID.interventionDetails[i]['shortname'], count: log['nudges'][i]}
    }
  }
  log.data = data
  //finally, send the log!
  http.request({
    url: "https://habitlab-mobile-website.herokuapp.com/addtolog?logname=stats&userid=" + exports.getUserID(),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    content: JSON.stringify(log)
  })
};

exports.getUserID = function() {
  return appSettings.getString('userID') || 'noIDFound';
};


exports.checkVersionName = function() {
  return appSettings.getString('versionName') || 'none';
};

exports.setVersionName = function(versionName) {
  appSettings.setString('versionName', versionName);
};

exports.updateDB = function() {
  var mainEnabled = JSON.parse(appSettings.getString('enabled'));
  var diff = ID.interventionDetails.length - mainEnabled.length;
  if (diff) {
    appSettings.setString('enabled', JSON.stringify(mainEnabled.concat(Array(diff).fill(true))));
    var pkgs = JSON.parse(appSettings.getString('selectedPackages'));
    pkgs.forEach(function(pkg) {
      var pkgInfo = JSON.parse(appSettings.getString(pkg));
      pkgInfo.enabled = pkgInfo.enabled.concat(Array(diff).fill(true));
      appSettings.setString(pkg, JSON.stringify(pkgInfo));
    });
  }
};

exports.updateTargetDB = function() {
  if (!appSettings.getString('targetPackages')) {
    appSettings.setString('targetPackages', JSON.stringify([]));
  }
}

exports.setTargetPresets = function() {
    var selectedPackages = JSON.parse(appSettings.getString('selectedPackages'));
    var targetPreset = require("~/util/UsageInformationUtil").getInstalledPresets().targets.filter(function (pkg) {
      return !selectedPackages.includes(pkg);
    });
    appSettings.setString('targetPackages', JSON.stringify(targetPreset));
    targetPreset.forEach(function (item) {
        createPackageData(item);
    });
}

/**
 * This registers the user under their google account so we can associate different devices
 * with the same account
 * @param {string} token the Google Id token to pass to the server.
 */
exports.registerUser = function(token) {
  object = {userid: userid = exports.getUserID(), token: token, from: "android", type: exports.getExperiment}
  http.request({
    url: "https://habitlab-mobile-website.herokuapp.com/register_user_with_email" ,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    content: JSON.stringify(object) 
  })
}

/**
 * This function checks if the user is signed into their Google Account.
 * If so, the function calls an HTTP POST to account_external_stats
 */
tryToLogExternalStats = async function(session_object) {
  idToken = await askForEmail.getIdToken()
  object_to_return = {userid: exports.getUserID(), timestamp: session_object.timestamp, domains_time: {}}
  object_to_return.domains_time["" + session_object.domain] = session_object.duration
  if (idToken != null) {
    http.request({
      url: "https://habitlab-mobile-website.herokuapp.com/addsessiontototal" ,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      content: JSON.stringify(object_to_return)
    })
  }
}

/**
 * Saves the session on the server.
 * @param session_object: {domain: "", 
 *                        timestamp: Number (ms since epoch), duration: Number (sec),
 *                        interventions: [{intervention: "", timestamp: Number}]}
 */
logSession = function(session_object) {
  //Let's also send this off to the server.
  http.request({
    url: "https://habitlab-mobile-website.herokuapp.com/addtolog?logname=sessions&userid=" + exports.getUserID(),
    method: "POST",
    headers: { "Content-Type": "application/json" },
    content: JSON.stringify(session_object)
  })
  tryToLogExternalStats(session_object)
}

let experiments = {
  "conservation": ["random_enabled"]
}

/**
 * At install, the user is assigned to an experiment group. 
 * @param {String} experiment_name 
 */
exports.assignExperiment = function(experiment_name) {
  
  appSettings.setString("experiment", experiment_name)
  var num_groups = experiments[experiment_name].length
  appSettings.setString("experiment_group", experiments[experiment_name][Math.floor(Math.random() * num_groups)])
}

exports.getExperiment = function() {
  return appSettings.getString("experiment", "null") + "-" + appSettings.getString("experiment_group", "null")
}
exports.sendLog = sendLog