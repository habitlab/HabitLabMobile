var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");

var view = 'onboardingView';
if (StorageUtil.isSetUp()) {
  view = 'navView';
}

applicationModule.start({ moduleName: "views/" + view + "/" + view});
applicationModule.setCssFileName("app.css");

var context = applicationModule.android.context.getApplicationContext();
const DateChangeService = require("~/util/DateChangeService");

var dateChangeServiceIntent = new android.content.Intent(context, com.habitlab.DateChangeService.class);

if (!DateChangeService.isServiceRunning()) {
	context.startService(dateChangeServiceIntent);
}