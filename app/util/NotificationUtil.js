var application = require("application");
var NotificationCompat = android.support.v4.app.NotificationCompat
var Context = android.content.Context;
var notificationColor = [34, 0.81, 1];

var PendingIntent = android.app.PendingIntent;
var Intent = android.content.Intent;
var context = application.android.context.getApplicationContext();

var sendNotification = function(context, title, msg, id) {
	var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);
    var notificationBuilder = new NotificationCompat.Builder(context);
    var icon_id = context.getResources().getIdentifier("logo_bubbles", "drawable", context.getPackageName());
    notificationBuilder.setDefaults(NotificationCompat.DEFAULT_ALL);
    notificationBuilder.setSmallIcon(icon_id);
    notificationBuilder.setContentTitle(title)
    notificationBuilder.setContentText(msg);
    notificationBuilder.setColor(android.graphics.Color.HSVToColor(notificationColor));
    notificationBuilder.setPriority(NotificationCompat.PRIORITY_MAX);
    notificationManager.notify(id, notificationBuilder.build());
};

var sendNotificationWithOptions = function(context, title, msg, id) {
    var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);
    var notificationBuilder = new NotificationCompat.Builder(context);
    var icon_id = context.getResources().getIdentifier("logo_bubbles", "drawable", context.getPackageName());
    notificationBuilder.setDefaults(NotificationCompat.DEFAULT_ALL);
    notificationBuilder.setSmallIcon(icon_id);
    notificationBuilder.setContentTitle(title)
    notificationBuilder.setContentText(msg);
    notificationBuilder.setColor(android.graphics.Color.HSVToColor(notificationColor));
    notificationBuilder.setPriority(NotificationCompat.PRIORITY_MAX);

    var posIntent = new Intent("action.habitlab.NotificationPositive");
    var negIntent = new Intent("action.habitlab.NotificationNegative");

    var posPendingIntent = PendingIntent.getBroadcast(context, 0, posIntent, 0);
    var negPendingIntent = PendingIntent.getBroadcast(context, 0, negIntent, 0);

    var icon = context.getResources().getIdentifier("icon", "drawable", context.getPackageName());
    notificationBuilder.addAction(icon, "Yes", posPendingIntent);
    notificationBuilder.addAction(icon, "No", negPendingIntent);

    notificationManager.notify(id, notificationBuilder.build());
}



module.exports = {
    sendNotification, 
    sendNotificationWithOptions
};
            