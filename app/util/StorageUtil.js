var localStorage = require( "nativescript-localstorage" );

exports.getSelectedPackages = function() {
  return localStorage.getItem('selectedPackages');
};

exports.addPackage = function(packageName) {
  var updatedList = localStorage.getItem('selectedPackages');
  if (!pdatedList.contains(packageName)) {
  updatedList.push(packageName);
  }
  localStorage.setItem('selectedPackages', updatedList);
};

exports.removePackage = function(packageName) {
  var updatedList = localStorage.getItem('selectedPackages');
  if (updatedList.includes(packageName)) {
    updatedList.splice(updatedList.indexOf(packageName), 1);
  }
  localStorage.setItem('selectedPackages', updatedList);
};

exports.togglePackage = function(packageName) {
  var updatedList = localStorage.getItem('selectedPackages');
  var returnVal;
  if (updatedList.includes(packageName)) {
    updatedList.splice(updatedList.indexOf(packageName), 1);
    returnVal = false;
  } else {
    updatedList.push(packageName);
    returnVal = true;
  }
  localStorage.setItem('selectedPackages', updatedList);
  return returnVal;
};

exports.setUp = function() {
  localStorage.setItem('onboarded', true);
  localStorage.setItem('selectedPackages', ['com.facebook.katana', 'com.google.android.youtube', 'come.facebook.orca', 'com.snapchat.android', 'com.instagram.android']);
};

exports.isSetUp = function() {
  return localStorage.getItem('onboarded') && localStorage.getItem('selectedPackages');
};

exports.bootstrap = function() {
  localStorage.clear();
};

exports.isPackageSelected = function(packageName) {
  return exports.getSelectedPackages().includes(packageName);
};