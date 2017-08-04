var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");
var {Sentry} = require("nativescript-sentry");

var view = 'onboardingView';

if (StorageUtil.isOnboarded()) {
  view = 'progressView';
} else if (StorageUtil.isSetUp()) {
  view = "appsView";
}

// ATTEMPT AT LOGGING STUFF

// var getErrorDetails = function (args) {
// 	if (typeof args === 'string') {
//         return args;
//     }

//     let error = args.android;

//     return {
//         name: error.name || 'Error',
//         nativeException: error.nativeException,
//         message: error.message || JSON.stringify(error),
//         stackTrace: error.stackTrace || null,
//         stack: error.stack || null
//     };
// }
// 
// var sentry;
// applicationModule.on(applicationModule.launchEvent, function (args) {
// 	let sentryDsn = "https://c9945730aba341e9b66d522ddffe8f4c:b076bf39d2444a939324a7b0fae8d765@sentry.io/199451";
// 	Sentry.init(sentryDsn);
// });

// applicationModule.on(applicationModule.uncaughtErrorEvent, args => {
// 	if (sentry) {
// 	    let event = new io.sentry.event.EventBuilder();
// 	    let errordetails = getErrorDetails(args)
// 	    let errordetails_stringified = JSON.stringify(errordetails)
// 	    errordetails_stringified = errordetails_stringified.replace('NativeScriptException', 'NativeScriptException' + Math.floor(Math.random() * 99999999))
// 	    event.withMessage(errordetails_stringified)
// 	    event.withLevel(io.sentry.event.Event.Level.ERROR);
// 	    io.sentry.Sentry.capture(event);	   
// 	}
// });

// setTimeout(function() {
// 	try {
// 		new java.util.ArrayList().get(2);
// 	} catch (error) {
// 		Sentry.capture(error);
// 	}
// }, 5000)

applicationModule.start({ 
  moduleName: "views/" + view + "/" + view, 
  backstackVisible: view === 'progressView'
});
applicationModule.setCssFileName("app.css");