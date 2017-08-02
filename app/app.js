var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");

var view = 'onboardingView';

//Set also in onnboarding.js
// if (StorageUtil.isOnboarded()) {
//   view = 'progressView';
// } else if (StorageUtil.isSetUp()) {
//   view = "appsView";
// }

applicationModule.start({ 
  moduleName: "views/" + view + "/" + view, 
  backstackVisible: view === 'progressView'
});
applicationModule.setCssFileName("app.css");