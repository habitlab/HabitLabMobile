var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');

var view = 'onboardingView';
if (StorageUtil.isSetUp()) {
  view = 'navView';
}

applicationModule.start({ moduleName: "views/" + view + "/" + view});
applicationModule.setCssFileName("app.css");
