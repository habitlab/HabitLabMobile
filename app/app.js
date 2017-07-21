var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");

var view = 'onboardingView';
if (StorageUtil.isSetUp()) {
  view = 'navView';
}
applicationModule.start({ moduleName: "views/" + view + "/" + view});
applicationModule.setCssFileName("app.css");


/** SERVICE STARTER **/
const ServiceManager = require("~/services/ServiceManager");
const Intent = android.content.Intent;

var context = applicationModule.android.context;
var trackingServiceIntent = new Intent(context, com.habitlab.TrackingService.class);
var unlockServiceIntent = new Intent(context, com.habitlab.UnlockService.class);
var dummyServiceIntent = new Intent(context, com.habitlab.DummyService.class);


if (!ServiceManager.isRunning(com.habitlab.TrackingService.class.getName())) {
	context.startService(trackingServiceIntent);
}

if (!ServiceManager.isRunning(com.habitlab.UnlockService.class.getName())) {
	context.startService(unlockServiceIntent);
}

if (!ServiceManager.isRunning(com.habitlab.DummyService.class.getName())) {
	context.startService(dummyServiceIntent);
}



