var application = require("application");
var context = application.android.context.getApplicationContext();

// expose native APIs
var IntentFilter = android.content.IntentFilter;
var Intent = android.content.Intent;
var Context = android.content.Context;
var Integer = java.lang.Integer;

// intent filters for the BroadcastReceiver
var filterOn = new IntentFilter(Intent.ACTION_SCREEN_ON);
var filterUnlocked = new IntentFilter(Intent.ACTION_USER_PRESENT);

// extend BroadcastReceiver class to track screen on/off/unlock
var UnlockReceiver = android.content.BroadcastReceiver.extend({
    onReceive: function(context, intent) {
        var action = intent.getAction();

        if (action === Intent.ACTION_SCREEN_ON) {
            console.log("RECEIVER: Screen On!");
        } else if (action === Intent.ACTION_USER_PRESENT) {
            console.log("RECEIVER: Unlocked!");
        }        
    }
});

// create new receiver object
var receiver = new UnlockReceiver();


/*
 * com.habitlab.UnlockService
 * --------------------------
 * Extension of Android Service class. Overrides onStartCommand
 * of Service class to start receiver.
 */
android.app.Service.extend("com.habitlab.UnlockService", {
    onStartCommand: function(intent, flags, startId) {
        this.super.onStartCommand(intent, flags, startId);
        setUpReceiver();
        console.log("UNLOCK SERVICE CREATED");
        this.startForeground(123, getNotification());
        return android.app.Service.START_STICKY; 
    }, 

    onDestroy: function() {
        console.log("UNLOCK SERVICE DESTROYED");
    },

    onCreate: function() {
        // do nothing
    },

    onBind: function(intent) {
        // do nothing 
    }
});


/*
 * setUpreceiver
 * -------------
 * Registers receivers on the device to detect screen
 * glances and screen unlocks.
 */
function setUpReceiver() {
    context.registerReceiver(receiver, filterOn);
    context.registerReceiver(receiver, filterUnlocked);   
}

var NotificationCompat = android.support.v4.app.NotificationCompat
var notificationColor = [34, 0.81, 1];

var getNotification = function() {
    var notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE);
    var notificationBuilder = new NotificationCompat.Builder(context);
    var icon_id = context.getResources().getIdentifier("logo_bubbles", "drawable", context.getPackageName());
    notificationBuilder.setSmallIcon(icon_id);
    notificationBuilder.setContentTitle("HabitLab");
    notificationBuilder.setContentText("Helping change your habits!");
    notificationBuilder.setColor(android.graphics.Color.HSVToColor(notificationColor));
    notificationBuilder.setVisibility(android.app.Notification.VISIBILITY_SECRET);
    return notificationBuilder.build();
};

module.exports = {};


