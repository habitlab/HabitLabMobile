const NotificationUtil = require("~/util/NotificationUtil");
const UsageInformationUtil = require("~/util/UsageInformationUtil");
const StorageUtil = require("~/util/StorageUtil");
const Toast = require("nativescript-toast");

var visitedToast = function(pkg) {
	var applicationName = UsageInformationUtil.getAppName(pkg);
	var visits = StorageUtil.getVisits(pkg, StorageUtil.days.TODAY);
	Toast.makeText(applicationName + " visits today: " + visits).show();
}







module.exports = {
	visitedToast: visitedToast
};