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

console.log("GoogleSignIn object: ")
console.log(GoogleSignIn);
console.log("GoogleSignInOptions object: ");
console.log(GoogleSignInOptions);

let RC_SIGN_IN = 1;
//TODO: Replace client with production-level client. Also, SHA fingerprint is in development mode.
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
            signInResult(task);
        }
        console.log('Now running onActiviyResult');
        this._callbacks.onActivityResult(this, requestCode, resultCode, data, superProto.onActivityResult);
    }
});


exports.getEmail = function () {
    // Configure sign-in to request the user's ID, email address, and basic
    // profile. ID and basic profile are included in DEFAULT_SIGN_IN.
    var gso = new GoogleSignInOptionsBuilder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestIdToken(credentials.clientId)
    .build();

    // Build a GoogleSignInClient with the options specified by gso.
    console.log(application.android.context.getApplicationContext().getPackageName())
    var mGoogleSignInClient = GoogleSignIn.getClient(application.android.context.getApplicationContext(), gso);
    var account = GoogleSignIn.getLastSignedInAccount(application.android.context.getApplicationContext());
    if (account == null) {
        var signInIntent = mGoogleSignInClient.getSignInIntent();
        application.android.foregroundActivity.startActivityForResult(signInIntent, RC_SIGN_IN);
    } else {
        console.log("Acct: ");
        console.log(account.getIdToken());
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
        console.log(data);
        console.log(JSON.stringify(data));
        console.log("resolve called");
        try {
            var account = data.getResult();
            // Signed in successfully, show authenticated UI.
            console.log(account);
            console.log(account.getEmail());
            FancyAlert.show(FancyAlert.type.SUCCESS, "Success!", "We found your email to be " + account.getEmail(), "Awesome!"); 
            console.log("What about here?");
            console.log("reject called");
        } catch (e) {
            // The ApiException status code indicates the detailed failure reason.
            // Please refer to the GoogleSignInStatusCodes class reference for more information.
            FancyAlert.show(FancyAlert.type.WARNING, "Oops!", "An error occurred.", "OK");
            console.log("signInResult:failed code=" + JSON.stringify(e));
        }
}