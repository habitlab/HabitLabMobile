var frame = require('ui/frame');
var permissionUtil = require('~/util/PermissionUtil');
var FancyAlert = require("~/util/FancyAlert");

exports.getEmail = function () {
    console.log("In get email");
    permissionUtil.promptUserForEmail().then(function(result) {
        console.log("resolve called");
        FancyAlert.show(FancyAlert.type.SUCCESS, "Success!", "We found your email to be " + result, "Awesome!", exports.moveOn); 
        console.log("What about here?");
    }, function(error){
        console.log("reject called");
        FancyAlert.show(FancyAlert.type.WARNING, "Oops!", error, "OK", function(){});
    });
};

exports.moveOn = function () {
    frame.topmost().navigate('views/onboarding/watchlistOnboardingView/watchlistOnboardingView');
};