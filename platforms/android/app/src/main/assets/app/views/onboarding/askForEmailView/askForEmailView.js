var frame = require('ui/frame');
var permissionUtil = require('~/util/PermissionUtil');
var FancyAlert = require("nativescript-fancyalert");
var application = require('application');
var credentials = require('~/credentials');

var GoogleSignInOptions = com.google.android.gms.auth.api.signin.GoogleSignInOptions;
var GoogleSignInOptionsBuilder = com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder;
var GoogleSignIn = com.google.android.gms.auth.api.signin.GoogleSignIn;
var GoogleSignInAccount = com.google.android.gms.auth.api.signin.GoogleSignInAccount;
var ApiException = com.google.android.gms.common.api.ApiException;

let RC_SIGN_IN = 1;
// TODO: Replace client with production-level client. Also, SHA fingerprint is in development mode.
// See https://developers.google.com/android/guides/client-auth
// https://developers.google.com/identity/sign-in/android/start-integrating

//To override startActivityForResult, we need to extend the activity:


const superProto = android.app.Activity.prototype;
android.app.Activity.extend("com.tns.NativeScriptActivity", {
    onCreate: function(savedInstanceState) {
        console.log('Now running onCreate');
        if(!this._callbacks) {
            frame.setActivityCallbacks(this);
        }
        // Modules will take care of calling super.onCreate, do not call it here
        this._callbacks.onCreate(this, savedInstanceState, superProto.onCreate);

        // Add custom initialization logic here
    },
    onSaveInstanceState: function(outState) {
        this._callbacks.onSaveInstanceState(this, outState, superProto.onSaveInstanceState);
    },
    onStart: function() {
        this._callbacks.onStart(this, superProto.onStart);
    },
    onStop: function() {
        this._callbacks.onStop(this, superProto.onStop);
    },
    onDestroy: function() {
        this._callbacks.onDestroy(this, superProto.onDestroy);
    },
    onBackPressed: function() {
        this._callbacks.onBackPressed(this, superProto.onBackPressed);
    },
    onRequestPermissionsResult: function (requestCode, permissions, grantResults) {
        this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined);
    },
    onActivityResult: function (requestCode, resultCode, data) {
        this._callbacks.onActivityResult(this, requestCode, resultCode, data, superProto.onActivityResult);
        if (requestCode == RC_SIGN_IN) {
            //They signed in! Or at least tried to.
            var task = GoogleSignIn.getSignedInAccountFromIntent(data);
            console.log("Calling signInResult");
            return signInResult(task);
        }
        console.log('Now running onActiviyResult');
        
    }
});

exports.getIdToken = async function(nextFunction) {
    console.log('getidtokentapped')
    // Configure sign-in to request the user's ID, email address, and basic
    // profile. ID and basic profile are included in DEFAULT_SIGN_IN.
    var gso = new GoogleSignInOptionsBuilder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestIdToken(credentials.clientId)
    .requestEmail()
    .build()

    // Build a GoogleSignInClient with the options specified by gso.
    var mGoogleSignInClient = GoogleSignIn.getClient(application.android.context.getApplicationContext(), gso)
    var task = await mGoogleSignInClient.silentSignIn()
    if (task.isSuccessful()) {
        //Cool! We can just get the id.
        if (nextFunction == null || "view" in nextFunction) {
            exports.moveOn()
        } else {
            nextFunction()
        }
        return task.getResult().getIdToken()
    } else {
        // We need to have the user sign in.
        var signInIntent = mGoogleSignInClient.getSignInIntent()
        return await application.android.foregroundActivity.startActivityForResult(signInIntent, RC_SIGN_IN)
    }
}

exports.moveOn = function () {
    frame.topmost().navigate('views/onboarding/watchlistOnboardingView/watchlistOnboardingView');
};

/**
 * Saves sign in data, notifies user of result.
 * @param data: Task<GoogleSignInAccount> from GoogleSignIn.getSignedInAccountFromIntent()
 */
signInResult = async function(data) {
        try {
            var account = data.getResult()
            var token = account.getIdToken()
            // Signed in successfully, show authenticated UI.
            FancyAlert.TNSFancyAlert.showSuccess("Success!", "Now your data will be synced for a future release!", "Awesome!")
            exports.moveOn()
            return token
        } catch (e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            FancyAlert.TNSFancyAlert.showError("Oops!", "An error occurred.", "OK")
            return undefined
        }
}