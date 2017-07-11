var localStorage = require( "nativescript-localstorage" );

// Returns an array of the packageNames (strings)
exports.getSelectedPackages = function() {
  return localStorage.getItem('selectedPackages');
};

var createPackageData = function(packageName) {
  localStorage.setItem(packageName, {
      goals: {'minutes': 15}, 
      stats: [{'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}, {'visits': 0}]
    });
};

exports.addPackage = function(packageName) {
  var list = localStorage.getItem('selectedPackages');
  if (!list.contains(packageName)) {
    list.push(packageName);
    createPackageData(packageName);
  }
};

exports.removePackage = function(packageName) {
  localStorage.getItem('selectedPackages').filter(function (item) {
    return item !== packageName;
  });
  localStorage.removeItem(packageName);
};

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

exports.setUp = function() {
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
  
  // localStorage.setItem('selectedPackages', ['com.android.chrome']);
};

exports.isSetUp = function() {
  return localStorage.getItem('onboarded');
};

exports.bootstrap = function() {
  localStorage.clear();
};

exports.isPackageSelected = function(packageName) {
  return exports.getSelectedPackages().includes(packageName);
};

exports.getVisits = function(packageName, index) {
  var packageData = localStorage.getItem(packageName).stats.map(function (item) { 
    return item['visits']; 
  });
  return (index && index < 7) ? packageData[index] : packageData;
};

exports.visited = function(packageName) {
  var packageData = localStorage.getItem(packageName);  
  var today = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);
  packageData.stats[today-1]['visits']++;
  console.log(exports.getVisits(packageName));
};

exports.getUnlocks = function(index) {
  var phoneData = localStorage.getItem('phone').stats.map(function (item) { 
    return item['unlocks']; 
  });
  return (index && index < 7) ? phoneData[index] : phoneData;
};

exports.unlocked = function() {
  var phoneData = localStorage.getItem('phone').stats;
  var today = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);
  phoneData[today-1]['unlocks']++;
  console.log(exports.getUnlocks());
};

exports.getGlances = function(index) {
  var phoneData = localStorage.getItem('phone').stats.map(function (item) { 
    return item['glances']; 
  });
  return (index && index < 7) ? phoneData[index] : phoneData;
};

exports.glanced = function() {
  var phoneData = localStorage.getItem('phone').stats;
  var today = java.util.Calendar.getInstance().get(java.util.Calendar.DAY_OF_WEEK);
  phoneData[today-1]['glances']++;
  console.log(exports.getGlances());
};