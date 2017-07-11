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
 * isServiceRunning
 * ----------------
 * Checks whether UnlockService is active on the device. Called
 * from other modules. 
 */
var isServiceRunning = function () {
    var manager = context.getSystemService(Context.ACTIVITY_SERVICE);
    var services = manager.getRunningServices(Integer.MAX_VALUE);
    for (var i = 0; i < services.size(); i++) {
        var service = services.get(i);
        if (service.service.getClassName() === com.habitlab.UnlockService.class.getName()) {
            return true;
        }
    }
    return false;
};


function setUpReceiver() {
    context.registerReceiver(receiver, filterOn);
    context.registerReceiver(receiver, filterUnlocked);   
}

module.exports = {isServiceRunning: isServiceRunning};


