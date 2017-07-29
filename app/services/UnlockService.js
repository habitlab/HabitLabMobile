var application = require("application");
var context = application.android.context.getApplicationContext();

// utils
const ServiceManager = require("./ServiceManager");
const StorageUtil = require('~/util/StorageUtil');
const InterventionManager = require('~/interventions/InterventionManager');
const ID = require('~/interventions/InterventionData');
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
    
// variable to store time spent on phone
var timePhoneTurnedOn = System.currentTimeMillis();

// extend BroadcastReceiver class to track screen on/off/unlock
var UnlockReceiver = android.content.BroadcastReceiver.extend({
    onReceive: function(context, intent) {
        var action = intent.getAction();

        if (action === Intent.ACTION_SCREEN_ON) {
            timePhoneTurnedOn = System.currentTimeMillis();
            StorageUtil.glanced();
            InterventionManager.interventions[ID.interventionIDs.GLANCE_NOTIFICATION](true);
            // InterventionManager.interventions[ID.interventionIDs.GLANCE_TOAST](true);
        } else if (action === Intent.ACTION_USER_PRESENT) {
            TrackingService.alertScreenOn();
            StorageUtil.unlocked();
            InterventionManager.interventions[ID.interventionIDs.UNLOCK_NOTIFICATION](true);
            InterventionManager.interventions[ID.interventionIDs.UNLOCK_TOAST](true);
        } else if (action === Intent.ACTION_SCREEN_OFF) {
            TrackingService.alertScreenOff();

            var timeSpentOnPhone = System.currentTimeMillis() - timePhoneTurnedOn;
            StorageUtil.updateTotalTime(timeSpentOnPhone);
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
        return android.app.Service.START_STICKY; 
    }, 

    onDestroy: function() {
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


