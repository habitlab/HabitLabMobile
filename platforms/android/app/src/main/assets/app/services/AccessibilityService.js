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
const AccessibilityWindowInfo = android.view.accessibility.AccessibilityWindowInfo

// packages to ignore (might need to compile a list as time goes on)
const ignore = ["com.android.systemui",
    "com.nuance.swype.trial",
    "com.nuance.swype.dtc",
    "com.touchtype.swiftkey",
    "com.syntellia.fleksy.keyboard",
    "com.whirlscape.minuumkeyboard",
    "com.whirlscape.minuumfree",
    "com.android.vending",
    "com.android.systemui"
];

/**
 * This package buffer checks if we navigated to HabitLab for good. If a bunch of  events are fired in row
 * under HabitLab's name, then we must have actually navigated to the app as opposed to been given
 * an intervention.
 */
let packageBuffer = {
    packageName: "",
    count: 0,
    latestEvent: Date.now()
}

/**************************************
 *       TRACKING FUNCTIONALITY       *
 **************************************/

// tracking metadata
var currentApplication = {
    packageName: "android",
    isBlacklisted: false,
    visitStart: Date.now(),
    interventions: []
};
var interventionRequestCounter = 0


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
        // decide whether or not to run an on-launch intervention
        var action = intent.getAction();
        if (action === android.content.Intent.ACTION_SCREEN_ON) {
            storage.glanced();
            //TODO: enabled once we are more confident  that   this works.
            logSessionIntervention(interventionManager.nextScreenOnIntervention(context))
        } else if (action === android.content.Intent.ACTION_USER_PRESENT) {
            screenOnTime = Date.now();
            storage.unlocked();
            logSessionIntervention(interventionManager.nextScreenUnlockIntervention(context))

            var versionName = new VersionNumber().get();
            if (versionName !== storage.checkVersionName()) {
                storage.setVersionName(versionName); // so it's a one-shot
                storage.updateDB();
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
        //
        var activePackage = event.getPackageName();
        var eventType = event.getEventType();
        if (!activePackage) {
            return;
        }
        // packages to ignore
        if (ignore.includes(activePackage) || activePackage.includes("inputmethod")) {
            return; // ignore certain pacakges
        }
        //This buffer listens for ALL accessibility events.
        packageBuffer.latestEvent = Date.now()
        if (packageBuffer.currentApplication != activePackage) {
            packageBuffer.currentApplication = activePackage
            packageBuffer.count = 1
        } else  {
            packageBuffer.count++
        }
        
        //HABITLAB SECTION
        if (activePackage === "com.stanfordhci.habitlab" && activePackage != currentApplication.packageName) {
            // this is just a habitlab intervention showing. We don't want this  event to be interpreted as switching apps.
            if (event.getContentDescription() != "HabitLab" && packageBuffer.count < 5 && Date.now() - packageBuffer.latestEvent < 3000) {
                var now = Date.now();
                var timeSpentOnPhone = now - screenOnTime;

                if (screenOnTime) {
                    storage.updateTotalTime(timeSpentOnPhone); // update time for progress view
                }
                screenOnTime = now;
                return; // skip over the new session stuff.
            } else {
                //Either habitlab just started, or they've been using it. let's treat it as a closed session.
                interventionManager.removeOverlays();
                interventionManager.resetDurationInterventions();
                var now = Date.now();
                closeRecentVisit(now);
                openNewVisit(now, activePackage);
                return
            }
        }


        // Lockdown Mode
        if (storage.inLockdownMode() && storage.isPackageSelected(activePackage) && eventType === AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            logSessionIntervention("LOCKDOWN")
            closeRecentVisit(Date.now())
            this.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME); // exit app
            if (lockdownSeen % 3 === 0) {
                var goal = storage.getLockdownDuration();
                var progress = Math.round((Date.now() - (storage.getLockdownEnd() - goal*60000))/60000);
                var remaining = goal - progress;
                var msg = "You have " + remaining + " minutes remaining in Lockdown Mode. All apps on your watchlist are off-limits.";
                var closeMsg = "Got it";
                lockdownOverlay.showOverlay("You're in Lockdown Mode!", msg, closeMsg, progress, goal, null, lockdownCb);
            }
            lockdownSeen++
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
            
            // This logic is for the "conservation" experiment.
            var canRun = true
            if (storage.getExperiment().includes("conservation") &&
                !storage.isPackageFrequent(activePackage)) {
                  // If packages the conservation experiment is running and the packages
                  // is labeled as infrequent, interventions should be given out on
                  // average one out of every 5 times.
                  canRun = interventionRequestCounter % 5 == 4 ? true : false
                  interventionRequestCounter += 1
            }
            if (currentApplication.isBlacklisted && canRun) {
              logSessionIntervention(interventionManager.nextOnLaunchIntervention(currentApplication.packageName, this))
            }
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
    if (currentApplication.packageName != null && currentApplication.packageName != "android") {
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
    if (shortName != null) {
        currentApplication.interventions.push({"intervention": shortName, "timestamp": Date.now()})
    }
}
