var Observable = require("data/observable").Observable;
var LocalNotifications = require("nativescript-local-notifications");
var dialogs = require("ui/dialogs");
 
var doAddOnMessageReceivedCallback = function() {
    LocalNotifications.addOnMessageReceivedCallback(
        function(notificationData) {
            dialogs.alert({
                title: "Notification received",
                message: "ID: " + notificationData.id +
                "\nTitle: " + notificationData.title +
                "\nBody: " + notificationData.body,
                okButtonText: "Excellent!"
            });
        }
    );
};
 
exports.createViewModel = function() {
    var viewModel = new Observable();
 
    viewModel.id = 0;
    viewModel.title = "Test Title";
    viewModel.body = "Test Body";
    viewModel.ticker = "Test Ticker";
 
    doAddOnMessageReceivedCallback();
 
    viewModel.schedule = function() {
        LocalNotifications.schedule([{
            id: this.id,
            title: this.title,
            body: this.body,
            ticker: this.ticker,
            at: new Date(new Date().getTime())
        }]).then(() => {
            console.log("Notification scheduled");
        }, (error) => {
            console.log("ERROR", error);
        });
    }
 
    return viewModel;
};