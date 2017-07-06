var applicationModule = require("application");
var localStorage = require( "nativescript-localstorage" );

var view = 'onboardingView';
if (localStorage.getItem('onboarded')) {
  view = 'navView';
}

applicationModule.start({ moduleName: "views/" + view + "/" + view});
applicationModule.setCssFileName("app.css");
