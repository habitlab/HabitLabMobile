var util = require('utils/utils');
var application = require('application');
var Intent = android.content.Intent;
var Uri = android.net.Uri;
var StorageUtil = require('~/util/StorageUtil');
var http = require('http');


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
  var dialogs = require("ui/dialogs");
  // inputType property can be dialogs.inputType.password, dialogs.inputType.text, or dialogs.inputType.email.
  dialogs.prompt({
    title: "Submit Feedback.",
    message: "Help us make HabitLab better! What could we improve on?",
    okButtonText: "Submit",
    cancelButtonText: "Cancel",
    defaultText: "Feedback",
    inputType: dialogs.inputType.text
  }).then(function (r) {
    if (r.result) {
      http.request({
        url: "https://habitlab-mobile-website.herokuapp.com/givefeedback",
        method: "POST",
        headers: { "Content-Type": "application/json"},
        content: JSON.stringify({feedback: r.text, userid: StorageUtil.getUserID(),
                                timestamp: Date.now()})
      })
    }
  }).catch(function (r) {
    //TODO: Alert user with dialog about submission error.
  });

};

exports.composeEmail = function() {
  events.push({category: "features", index: "feedback_email"});
  var arr = Array.create(java.lang.String, 1);
  arr[0] = "habitlab-support@cs.stanford.edu";

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
