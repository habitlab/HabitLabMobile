var application = require("application");
var StorageUtil = require("~/util/StorageUtil");

var Context = android.content.Context;
var System = java.lang.System;
var UsageEvents = android.app.usage.UsageEvents;
var Integer = java.lang.Integer;

var context = application.android.context.getApplicationContext();

android.app.Service.extend("com.habitlab.DateChangeService", {
    onStartCommand: function(intent, flags, startId) {
        this.super.onStartCommand(intent, flags, startId);
        setUpService();
        return android.app.Service.START_STICKY; 
    }, 

    onDestroy: function() {
        // do nothing
    },

    onCreate: function() {
        // do nothing
    },

    onBind: function(intent) {
        // do nothing 
    }
});

var setUpService = function () {
    application.android.registerBroadcastReceiver(android.content.Intent.ACTION_DATE_CHANGED,
        function onReceiveCallback(context, intent) {
            StorageUtil.wipeTodaysData();
        });
}

module.exports = {};