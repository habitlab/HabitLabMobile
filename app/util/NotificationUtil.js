var NotificationCompat = android.support.v4.app.NotificationCompat
var Context = android.content.Context;
var notificationColor = [34, 0.81, 1];

var sendNotification = function(context, title, msg, id) {
	var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);
    var notificationBuilder = new NotificationCompat.Builder(context);
    var icon_id = context.getResources().getIdentifier("logo_bubbles_black", "drawable", context.getPackageName());
    notificationBuilder.setDefaults(NotificationCompat.DEFAULT_ALL);
    notificationBuilder.setSmallIcon(icon_id);
    notificationBuilder.setContentTitle(title)
    notificationBuilder.setContentText(msg);
    notificationBuilder.setColor(android.graphics.Color.HSVToColor(notificationColor));
    notificationBuilder.setPriority(NotificationCompat.PRIORITY_MAX);

    notificationManager.notify(id, notificationBuilder.build());
};

module.exports = {sendNotification: sendNotification};
            