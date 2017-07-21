var util = require('utils/utils');
var application = require('application');
var Intent = android.content.Intent;
var Uri = android.net.Uri;

var drawer;

exports.pageLoaded = function(args) {
  drawer = args.object.getViewById('sideDrawer');
};

exports.toggleDrawer = function() {
  drawer.toggleDrawerState();
};

exports.goToSurvey = function() {
  util.openUrl('https://goo.gl/forms/94zsXsQQelKLyOVr2');
};

exports.composeEmail = function() {
  var arr = Array.create(java.lang.String, 1);
  arr[0] = "habitlabmobile@gmail.com";

  var intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:"));
  intent.putExtra(Intent.EXTRA_EMAIL, arr);          
  intent.putExtra(Intent.EXTRA_SUBJECT, "HabitLab Mobile App Feedback");
  application.android.foregroundActivity.startActivity(Intent.createChooser(intent, "Send Email"));
};

exports.goToChromeExtension = function() {
  util.openUrl('https://habitlab.stanford.edu');
};

exports.goToGitHubWiki = function() {
  util.openUrl('https://github.com/habitlab/habitlab/wiki');
};