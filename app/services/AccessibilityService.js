var application = require("application");
var context = application.android.context;

// utils 
const storage = require("~/util/StorageUtil");
const interventionManager = require("~/interventions/InterventionManager");



/***************************************
 *           SCREEN RECEIVER           *
 ***************************************/

// logging vars
var screenOnTime = Date.now();

/*
 * ScreenReceiver
 * --------------
 * Receiver that listens to screen on, off, and 
 * unlocked events.
 */
var ScreenReceiver = android.content.BroadcastReceiver.extend({
    onReceive: function(context, intent) {
        var action = intent.getAction();

        if (action === android.content.Intent.ACTION_SCREEN_ON) {
            console.warn("Screen On");
            storage.glanced();
        } else if (action === android.content.Intent.ACTION_USER_PRESENT) {
            console.warn("Screen Unlocked");
            storage.unlocked();
        } else if (action === android.content.Intent.ACTION_SCREEN_OFF) {
            console.warn("Screen Off");
        }  
    }
});


/**************************************
 *       TRACKING FUNCTIONALITY       *
 **************************************/

// tracking metadata
var currentApplication = {
    packageName: "",
    isBlacklisted: false,
    visitStart: 0
};

/*
 * AccessibilityService
 * --------------------
 * Service that tracks phone application usage
 * and presents users with series of interventions
 * on blacklisted applications.
 */
android.accessibilityservice.AccessibilityService.extend("com.habitlab.AccessibilityService", {
    onAccessibilityEvent: function(event) {
        var activePackage = event.getPackageName();
        if (currentApplication.packageName !== activePackage) {
            var now = Date.now();
            closeRecentVisit(now);
            openNewVisit(now, activePackage);
        }
    },

    onInterrupt: function() {
        // do nothing
    },

    onServiceConnected: function() {   
        // actions on service start-up     
        this.super.onServiceConnected();
        setUpScreenReceiver();
    }
});


/*
 * closeRecentVisit
 * ----------------
 * Close the most recent visit to a blacklisted
 * application (if there was one). Send visit 
 * length information to StorageUtil.
 */
function closeRecentVisit(now) {
    if (currentApplication.isBlacklisted) {
        var timeSpent = now - currentApplication.visitStart;
        storage.updateAppTime(currentApplication.packageName, timeSpent);
    }
}

/*
 * openNewVisit
 * ------------
 * Populate tracking metadata with name of new
 * active package and mark blacklisted applications.
 * Mark the visit start time.
 */
function openNewVisit(now, pkg) {
    currentApplication.packageName = pkg;
    currentApplication.visitStart = now;

    if (storage.isPackageSelected(pkg)) {
        currentApplication.isBlacklisted = true;
        storage.visited(pkg);
    } else {
        currentApplication.isBlacklisted = false;
    }
}


/*
 * setUpScreenReceiver
 * -------------------
 * Register ScreenReceiver object to listen for 
 * screen on, off, and unlock events.
 */
function setUpScreenReceiver() {
    var receiver = new ScreenReceiver();

    var filterOn = new android.content.IntentFilter(android.content.Intent.ACTION_SCREEN_ON);
    var filterOff = new android.content.IntentFilter(android.content.Intent.ACTION_SCREEN_OFF);
    var filterUnlocked = new android.content.IntentFilter(android.content.Intent.ACTION_USER_PRESENT);
    
    context.registerReceiver(receiver, filterOn);
    context.registerReceiver(receiver, filterOff);
    context.registerReceiver(receiver, filterUnlocked);
}


