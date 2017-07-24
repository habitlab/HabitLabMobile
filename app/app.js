var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");

var view = 'onboardingView';
if (StorageUtil.isSetUp()) {
  view = 'navView';
}
applicationModule.start({ 
  moduleName: "views/" + view + "/" + view, 
  backstackVisible: view === 'navView'
});
applicationModule.setCssFileName("app.css");