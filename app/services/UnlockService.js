var application = require("application");
var context = application.android.context.getApplicationContext();

// utils
const ServiceManager = require("./ServiceManager");
const StorageUtil = require('~/util/StorageUtil');
const InterventionManager = require('~/interventions/InterventionManager');
const TrackingService = require("./TrackingService");

// expose native APIs
var IntentFilter = android.content.IntentFilter;
var Intent = android.content.Intent;
var Context = android.content.Context;
var Integer = java.lang.Integer;
var AlarmManager = android.app.AlarmManager;
var PendingIntent = android.app.PendingIntent;
var System = java.lang.System;

// intent filters for the BroadcastReceiver
var filterOn = new IntentFilter(Intent.ACTION_SCREEN_ON);
var filterOff = new IntentFilter(Intent.ACTION_SCREEN_OFF);
var filterUnlocked = new IntentFilter(Intent.ACTION_USER_PRESENT);

// extend BroadcastReceiver class to track screen on/off/unlock
var UnlockReceiver = android.content.BroadcastReceiver.extend({
    onReceive: function(context, intent) {
        var action = intent.getAction();

        if (action === Intent.ACTION_SCREEN_ON) {
            StorageUtil.glanced();
            InterventionManager.interventions[StorageUtil.interventions.GLANCE_NOTIFICATION]();
            // InterventionManager.interventions[StorageUtil.interventions.GLANCE_TOAST]();
        } else if (action === Intent.ACTION_USER_PRESENT) {
            TrackingService.alertScreenOn();
            StorageUtil.unlocked();
            InterventionManager.interventions[StorageUtil.interventions.UNLOCK_NOTIFICATION]();
            // InterventionManager.interventions[StorageUtil.interventions.UNLOCK_TOAST]();
        } else if (action === Intent.ACTION_SCREEN_OFF) {
            TrackingService.alertScreenOff();
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
        this.startForeground(ServiceManager.getForegroundID(), ServiceManager.getForegroundNotification());
        console.log("UNLOCK SERVICE CREATED");
        return android.app.Service.START_STICKY; 
    }, 

    onDestroy: function() {
        console.log("UNLOCK SERVICE DESTROYED");
    },

    onTaskRemoved: function(intent) {
        // this.super.onTaskRemoved(intent);
        // this.stopSelf();
        // var alarm = context.getSystemService(Context.ALARM_SERVICE);
        // var serviceToRestart = PendingIntent.getService(context, 3, new Intent(context, com.habitlab.UnlockService.class), 0);
        // alarm.set(AlarmManager.RTC, System.currentTimeMillis() + 500, serviceToRestart);
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
    context.registerReceiver(receiver, filterOff);
    context.registerReceiver(receiver, filterUnlocked); 
}


module.exports = {};


