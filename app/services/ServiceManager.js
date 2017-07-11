var application = require("application");

var Context = android.content.Context;
var Integer = java.lang.Integer;
var context = application.android.context.getApplicationContext();

/*
 * isRunning
 * ---------
 * Checks whether the supplied service is active on the device.
 */
var isRunning = function (serviceName) {
    var manager = context.getSystemService(Context.ACTIVITY_SERVICE);
    var services = manager.getRunningServices(Integer.MAX_VALUE);
    for (var i = 0; i < services.size(); i++) {
        var service = services.get(i);
        if (service.service.getClassName() === serviceName) {
            return true;
        }
    }
    return false;
};

/*
 * getRunningServices
 * ------------------
 * Prints out a list of services currently running on the device,
 * hightlighting the ones created by HabitLab
 */
var getRunningServices = function() {	
	console.log("---------------------------------------------");
	var manager = context.getSystemService(Context.ACTIVITY_SERVICE);
	var services = manager.getRunningServices(Integer.MAX_VALUE);
	for (var i = 0; i < services.size(); i++) {
		var service = services.get(i);
		var serviceName = service.service.getClassName();
		if (serviceName.startsWith("com.habitlab.")) {
			console.log("=====>", serviceName);
		} else {
			console.log("      ", serviceName);
		}	
	}
}

module.exports = {isRunning: isRunning, getRunningServices: getRunningServices};