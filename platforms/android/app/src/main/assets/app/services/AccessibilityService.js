var application = require("application");
var context = application.android.context;
var toast = require("nativescript-toast");
var timer = require("timer");
var {VersionNumber} = require("nativescript-version-number");


// utils 
const usage = require("~/util/UsageInformationUtil");
const storage = require("~/util/StorageUtil");
const interventionManager = require("~/interventions/InterventionManager");
const ID = require("~/interventions/InterventionData");
const videoBlocker = require("~/overlays/VideoOverlay");
const lockdownOverlay = require("~/overlays/LockdownOverlay");
const CancelOverlay = require("~/overlays/CancelOverlay");

// native APIs
const AccessibilityEvent = android.view.accessibility.AccessibilityEvent;
const AccessibilityService = android.accessibilityservice.AccessibilityService;

// packages to ignore (might need to compile a list as time goes on)
const ignore = ["com.android.systemui", 
    "com.nuance.swype.trial", 
    "com.nuance.swype.dtc",
    "com.touchtype.swiftkey",
    "com.syntellia.fleksy.keyboard",
    "com.whirlscape.minuumkeyboard",
    "com.whirlscape.minuumfree",
    "android",
    "com.google.android.googlequicksearchbox",
    "com.android.vending",
    ""
];



/**************************************
 *       TRACKING FUNCTIONALITY       *
 **************************************/

// tracking metadata
var currentApplication = {
    packageName: "",
    isBlacklisted: false,
    visitStart: 0,
    interventions: []
};


/***************************************
 *           SCREEN RECEIVER           *
 ***************************************/

// logging vars
var screenOnTime = Date.now();
var lockdownSeen = 0;

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
            storage.glanced();
            logSessionIntervention(interventionManager.nextScreenOnIntervention())
        } else if (action === android.content.Intent.ACTION_USER_PRESENT) {
            screenOnTime = Date.now();
            storage.unlocked();
            logSessionIntervention(interventionManager.nextScreenUnlockIntervention())

            var versionName = new VersionNumber().get();
            if (versionName !== storage.checkVersionName()) {
                storage.updateDB();
                storage.setVersionName(versionName); // so it's a one-shot
            }


        } else if (action === android.content.Intent.ACTION_SCREEN_OFF) {
            var now = Date.now();
            closeRecentVisit(now);
            var timeSpentOnPhone = now - screenOnTime;
            
            if (screenOnTime) {
                storage.updateTotalTime(timeSpentOnPhone);
            }

            interventionManager.removeOverlays();
            interventionManager.resetDurationInterventions();
            currentApplication.packageName = "";
            currentApplication.isBlacklisted = false;
            currentApplication.visitStart = 0;
            screenOnTime = 0; // reset (otherwise glances cause inaccurate data)
        }  
    }
});


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
        var eventType = event.getEventType(); 

        if (!activePackage) {
            return;
        }
        
        // packages to ignore
        if (ignore.includes(activePackage) || activePackage.includes("inputmethod")) {
            return; // ignore certain pacakges
        }  

        // inside habitlab or habitlab intervention showing
        if (activePackage === "com.stanfordhci.habitlab") { 
            var now = Date.now();
            var timeSpentOnPhone = now - screenOnTime;

            if (screenOnTime) {
                storage.updateTotalTime(timeSpentOnPhone); // update time for progress view
            }

            screenOnTime = now;
            return; // skip over habitlab
        } 

        // Lockdown Mode
        if (storage.inLockdownMode() && storage.isPackageSelected(activePackage) && eventType === AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            this.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME); // exit app
            if (lockdownSeen % 3 === 0) {
                var goal = storage.getLockdownDuration();
                var progress = Math.round((Date.now() - (storage.getLockdownEnd() - goal*60000))/60000);
                var remaining = goal - progress;

                var msg = "You have " + remaining + " minutes remaining in Lockdown Mode. All apps on your watchlist are off-limits.";
                var closeMsg = "Got it";
                lockdownOverlay.showOverlay("You're in Lockdown Mode!", msg, closeMsg, progress, goal, null, lockdownCb);   
            }
            lockdownSeen++;
            return;
        } else if (lockdownSeen && !storage.inLockdownMode()) {
            lockdownSeen = 0;
        }
        // main blacklisted logic
        if (currentApplication.packageName !== activePackage && eventType === AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            interventionManager.removeOverlays();
            interventionManager.resetDurationInterventions();
            var now = Date.now();
            closeRecentVisit(now);
            openNewVisit(now, activePackage);
            if (currentApplication.isBlacklisted) {
                logSessionIntervention(interventionManager.nextOnLaunchIntervention(currentApplication.packageName))
            }
        } else if (currentApplication.isBlacklisted) {
            interventionManager.interventions[ID.interventionIDs.VIDEO_BLOCKER](true, event.getSource(), currentApplication.packageName); // youtube only
        }
    },

    onInterrupt: function() {
        // do nothing
    },

    onServiceConnected: function() {   
        this.super.onServiceConnected();
        setUpScreenReceiver(); // set up unlock receiver on startup

        if (!storage.isOnboardingComplete()) {
            storage.setOnboardingComplete();
            storage.addLogEvents([{setValue: new Date().toLocaleString(), category: 'navigation', index: 'finished_onboarding'}]);   
        }

        var count = 0;
        var serviceEnabledId = timer.setInterval(() => {
            if (count === 2) {
                timer.clearInterval(serviceEnabledId);
                return;
            }

            this.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK);
            count++;
        }, 300);
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
    var timeSpent = now - currentApplication.visitStart;
    if (currentApplication.packageName) {
        storage.updateAppTime(currentApplication, timeSpent);
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
    currentApplication.interventions = []

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


/**
 * markMidnight
 * ------------
 * Function to be called at midnight. Closes any visits that 
 * are active at midnight (so that they are part of that day).
 */
 exports.markMidnight = function () {
    closeRecentVisit(Date.now());
 };


function lockdownCb() {
    CancelOverlay.showCancelLockDialog("Unlock apps", "Are you sure you want to stop lockdown mode?", 
        "Yes", "Cancel", removeLockdown ,null);
}

function removeLockdown() {
    lockdownOverlay.removeOverlay();
    storage.removeLockdown();
    toast.makeText("Lockdown Mode disabled").show();
}

/**
 * appends assigned intervention to this session
 */
logSessionIntervention = function(shortName) {
    currentApplication.interventions.push({"intervention": shortName, "timestamp": Date.now()})

}


