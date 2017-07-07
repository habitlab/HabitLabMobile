var applicationModule = require("application");
var StorageUtil = require('~/util/StorageUtil');
var Toast = require("nativescript-toast");

var view = 'onboardingView';
if (StorageUtil.isSetUp()) {
  view = 'navView';
}

applicationModule.start({ moduleName: "views/" + view + "/" + view});
applicationModule.setCssFileName("app.css");


/** Set up receiver for phone unlocks/glances (somewhat of an inner class) **/
var BroadcastReceiver = android.content.BroadcastReceiver;
var IntentFilter = android.content.IntentFilter;
var Intent = android.content.Intent;

var PhoneUnlockReceiver = BroadcastReceiver.extend({
    onReceive: function(context, intent) {
        var action = intent.getAction();

        if (action === Intent.ACTION_SCREEN_ON) {
            console.log("RECEIVER: Screen On!");
        } else if (action === Intent.ACTION_SCREEN_OFF) {
            console.log("RECEIVER: Screen Off!");
        } else if (action === Intent.ACTION_USER_PRESENT) {
            console.log("RECEIVER: Unlocked!");
        }        
    }
});

var context = applicationModule.android.context.getApplicationContext();
var receiver = new PhoneUnlockReceiver();
var filterOn = new IntentFilter(Intent.ACTION_SCREEN_ON);
var filterOff = new IntentFilter(Intent.ACTION_SCREEN_OFF);
var filterUnlocked = new IntentFilter(Intent.ACTION_USER_PRESENT);
context.registerReceiver(receiver, filterOn);
context.registerReceiver(receiver, filterOff);
context.registerReceiver(receiver, filterUnlocked);




