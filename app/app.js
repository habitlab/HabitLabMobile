var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");

var view = 'onboardingView';
if (StorageUtil.isSetUp()) {
  view = 'progressView';
}

applicationModule.start({ 
  moduleName: "views/" + view + "/" + view, 
  backstackVisible: view === 'progressView'
});
applicationModule.setCssFileName("app.css");