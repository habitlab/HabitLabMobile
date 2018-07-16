var frame = require('ui/frame');
var permissionUtil = require('~/util/PermissionUtil');
var FancyAlert = require("~/util/FancyAlert");
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
        if (requestCode == RC_SIGN_IN) {
            //They signed in! Or at least tried to.
            var task = GoogleSignIn.getSignedInAccountFromIntent(data);
            console.log("Calling signInResult");
            signInResult(task);
        }
        console.log('Now running onActiviyResult');
        this._callbacks.onActivityResult(this, requestCode, resultCode, data, superProto.onActivityResult);
    }
});


exports.getEmail = async function () {
    console.log('Do we get here?')
    // Configure sign-in to request the user's ID, email address, and basic
    // profile. ID and basic profile are included in DEFAULT_SIGN_IN.
    var gso = new GoogleSignInOptionsBuilder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestIdToken(credentials.clientId)
    .requestEmail()
    .build();

    // Build a GoogleSignInClient with the options specified by gso.
    var mGoogleSignInClient = GoogleSignIn.getClient(application.android.context.getApplicationContext(), gso)
    var task = await mGoogleSignInClient.silentSignIn()
    console.log(task)
    console.log('Do we get past here?')
    console.log("we got pas there..")
    if (task.isSuccessful()) {
        //Cool! We can just get the id.
        console.log("Here's the token, that we didn't need to sign in for.")
        console.log(task.getResult().getIdToken())
    } else {
        console.log("We need to manually make user sign in.")
        // We need to have the user sign in.
        var signInIntent = mGoogleSignInClient.getSignInIntent()
        application.android.foregroundActivity.startActivityForResult(signInIntent, RC_SIGN_IN)
    }
};



exports.moveOn = function () {
    frame.topmost().navigate('views/onboarding/watchlistOnboardingView/watchlistOnboardingView');
};

/**
 * Saves sign in data, notifies user of result.
 * @param data: Task<GoogleSignInAccount> from GoogleSignIn.getSignedInAccountFromIntent()
 */
signInResult = function(data) {
        try {
            console.log(data);
            console.log("About to try getting account.");
            var account = data.getResult();
            console.log(JSON.stringify(account))
            console.log("Acct: ")
            var token = account.getIdToken()
            for (var i = 0; i < token.length; i += 200) {
                console.log(token.substring(i,i + 200))
            }
            console.log(token.substring(i - 200))
            // Signed in successfully, show authenticated UI.
            FancyAlert.show(FancyAlert.type.SUCCESS, "Success!", "Now your data will be synced for a future feature!", "Awesome!", exports.moveOn); 
        } catch (e) {
            console.log(e);
            console.log(JSON.stringify(e));
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            FancyAlert.show(FancyAlert.type.WARNING, "Oops!", "An error occurred.", "OK");
        }
}