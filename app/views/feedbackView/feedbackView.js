var util = require('utils/utils');
var application = require('application');
var Intent = android.content.Intent;
var Uri = android.net.Uri;
var StorageUtil = require('~/util/StorageUtil');

var drawer;
var events;

exports.pageLoaded = function(args) {
  events = [{category: "page_visits", index: "settings_feedback"}];
  drawer = args.object.getViewById('sideDrawer');
};

exports.pageUnloaded = function(args) {
  StorageUtil.addLogEvents(events);
};

exports.toggleDrawer = function() {
  events.push({category: "navigation", index: "menu"});
  drawer.toggleDrawerState();
};

exports.goToSurvey = function() {
  events.push({category: "features", index: "feedback_survey"});
  util.openUrl('https://goo.gl/forms/94zsXsQQelKLyOVr2');
};

exports.composeEmail = function() {
  events.push({category: "features", index: "feedback_email"});
  var arr = Array.create(java.lang.String, 1);
  arr[0] = "habitlabmobile@gmail.com";

  var intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:"));
  intent.putExtra(Intent.EXTRA_EMAIL, arr);          
  intent.putExtra(Intent.EXTRA_SUBJECT, "HabitLab Mobile App Feedback");
  var foreground = application.android.foregroundActivity;
  if (foreground) {
    foreground.startActivity(Intent.createChooser(intent, "Send Email"));
  }
};

exports.goToChromeExtension = function() {
  events.push({category: "features", index: "feedback_extension"});
  util.openUrl('https://habitlab.stanford.edu');
};

exports.goToGitHubWiki = function() {
  events.push({category: "features", index: "feedback_wiki"});
  util.openUrl('https://github.com/habitlab/habitlab/wiki');
};