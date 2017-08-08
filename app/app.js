var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");
var http = require("http");

var view = 'nameView';
if (StorageUtil.isTutorialComplete()) {
  view = "progressView";
} else if (StorageUtil.isOnboardingComplete()) {
  view = 'goalsView';
}

var getErrorDetails = function (args) {
	if (typeof args === 'string') {
        return args;
    }

    let error = args.android;

    return {
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
  return http.request({
    url: "http://logs-01.loggly.com/inputs/d453baa2-3722-4855-afca-1298682eb290/tag/http/",
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    content: JSON.stringify(data)
  });
}

applicationModule.on(applicationModule.uncaughtErrorEvent, args => {
	let errordetails = getErrorDetails(args);
	let errordetails_stringified = JSON.stringify(errordetails);
  console.warn(errordetails_stringified);
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

applicationModule.start({ 
  moduleName: "views/" + view + "/" + view, 
  backstackVisible: view === 'progressView'
});
applicationModule.setCssFileName("app.css");


