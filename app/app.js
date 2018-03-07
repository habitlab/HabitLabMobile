var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");
var http = require("http");
var frame = require('ui/frame');
var viewFile = 'onboarding/nameView';
var view = 'nameView';

if (StorageUtil.isTutorialComplete()) {
  viewFile = "progressView";
  view = "progressView";
  data = {"userID": StorageUtil.getUserID(),message:"Tutorial Complete"};
  send_log(data)
  //send_log tutorial complete, timestamp, how long it took them to complete
} else if (StorageUtil.isOnboardingComplete()) {
  viewFile = "goalsView";
  view = 'goalsView';
  data = {"userID": StorageUtil.getUserID(), message:"Onboarding Complete"}
  send_log(data)
}

var getErrorDetails = function (args) {
	if (typeof args === 'string') {
    return args;
  }

  let error = args.android;

  return {
      userID: StorageUtil.getUserID(),
      name: error.name || 'Error',
      nativeException: error.nativeException,
      message: error.message || JSON.stringify(error),
      stackTrace: error.stackTrace || null,
      stack: error.stack || null
  };
}

function send_error(error) {
  var now = new Date();
  var time = now.toLocaleDateString() + " " + now.toLocaleTimeString();
  return send_log({error: error, time: time});
}

function send_log(data) {
  // if(Storage.StorageUtil.getUserID != null){
  //   data.userid = StorageUtil.getUserID()
  // }
  userID = "fakeUserID"

  return http.request({
    url: "http://habitlabmobile.herokuapp.com/addtolog",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    content: JSON.stringify(data)
  });
}

applicationModule.on(applicationModule.uncaughtErrorEvent, args => {
	let errordetails = getErrorDetails(args);
	let errordetails_stringified = JSON.stringify(errordetails);
  // console.warn(errordetails_stringified);
	StorageUtil.addError(errordetails_stringified);
});

// send any errors that have accumulated
applicationModule.on(applicationModule.launchEvent, function(args) {
  if (StorageUtil.isOnboardingComplete()) {
    StorageUtil.addLogEvents([{category: 'page_visits', index: 'total_visits'}]);
  }
	let logs_to_send = StorageUtil.getErrorQueue();
	for (let log_data of logs_to_send) {
	  send_error(log_data);
	}
	StorageUtil.clearErrorQueue();
});


//Global event handler to disable back button pressed on onboarding
if (applicationModule.android) {
    applicationModule.android.on(applicationModule.AndroidApplication.activityBackPressedEvent, backEvent);
}
function backEvent(args) {
    var currentPage = frame.topmost().currentPage;
    if (currentPage && currentPage.exports && typeof currentPage.exports.backEvent === "function") {
         currentPage.exports.backEvent(args);
   }   
}

applicationModule.start("views/" + viewFile + "/" + view);
applicationModule.setCssFileName("app.css");


