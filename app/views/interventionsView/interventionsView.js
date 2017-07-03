var appsList = [];
var LocalNotifications = require("nativescript-local-notifications");
var createViewModel = require("~/util/NotificationUtil.js").createViewModel;
var page;

exports.onSelectApp = function(index) {

};

exports.onNavigate = function(args) {
  page = args.object;
    LocalNotifications.requestPermission().then((granted) => {
        if(granted) {
            console.log("GRANTED");
            page.bindingContext = createViewModel();
        }
    })
};

exports.onNotify = function() {
  page.bindingContext.schedule();
};