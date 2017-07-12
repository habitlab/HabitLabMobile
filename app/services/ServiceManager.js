var application = require("application");

var Context = android.content.Context;
var Integer = java.lang.Integer;
var NotificationCompat = android.support.v4.app.NotificationCompat
var context = application.android.context.getApplicationContext();
var notificationColor = [34, 0.81, 1];
var FOREGROUND_NOTIFICATION_ID = 38764;

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


/*
 * getForegroundNotification
 * -------------------------
 * Returns a notification to be used as the notification 
 * for the foreground service. Use in calls to 
 * startForeground (within Service classes).
 */
var getForegroundNotification = function() {
    var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);
    var notificationBuilder = new NotificationCompat.Builder(context);
    var icon_id = context.getResources().getIdentifier("logo_bubbles", "drawable", context.getPackageName());
    notificationBuilder.setSmallIcon(icon_id);
    notificationBuilder.setContentTitle("HabitLab")
    notificationBuilder.setContentText("Helping change your habits!");
    notificationBuilder.setColor(android.graphics.Color.HSVToColor(notificationColor));
    notificationBuilder.setVisibility(android.app.Notification.VISIBILITY_SECRET);
    //notificationBuilder.setPriority(NotificationCompat.PRIORITY_MIN);
    return notificationBuilder.build();
};


/*
 * getForegroundID
 * ---------------
 * Returns the ID of the foreground notificaiton (an 
 * arbitrary number kept constant so that each service
 * edits the same notification)  Use in calls to 
 * startForeground (within Service classes).
 */
var getForegroundID = function () {
	return FOREGROUND_NOTIFICATION_ID;
}



module.exports = {
	isRunning: isRunning, 
	getRunningServices: getRunningServices,
	getForegroundNotification: getForegroundNotification,
	getForegroundID: getForegroundID
};





