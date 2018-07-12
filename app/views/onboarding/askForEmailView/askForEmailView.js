var frame = require('ui/frame');
var permissionUtil = require('~/util/PermissionUtil');
var FancyAlert = require("~/util/FancyAlert");
var application = require('application');

var GoogleSignInOptions = com.google.android.gms.auth.api.signin.GoogleSignInOptions;
var GoogleSignInOptionsBuilder = com.google.android.gms.auth.api.signin.GoogleSignInOptions.Builder;
var GoogleSignIn = com.google.android.gms.auth.api.signin.GoogleSignIn;
var GoogleSignInAccount = com.google.android.gms.auth.api.signin.GoogleSignInAccount;

console.log("GoogleSignIn object: ")
console.log(GoogleSignIn);
console.log("GoogleSignInOptions object: ");
console.log(GoogleSignInOptions);

let RC_SIGN_IN = 1;


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
    .requestEmail()
    .build();

    // Build a GoogleSignInClient with the options specified by gso.
    var mGoogleSignInClient = GoogleSignIn.getClient(application.android.context.getApplicationContext(), gso);
    var account = GoogleSignIn.getLastSignedInAccount(application.android.context.getApplicationContext());
    if (account == null) {
        var signInIntent = mGoogleSignInClient.getSignInIntent();
        application.android.foregroundActivity.startActivityForResult(signInIntent, RC_SIGN_IN);
    }

    console.log("Acct: ");
    console.log(account);
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
        var account = completedTask.getResult(ApiException.class);
        
        // Signed in successfully, show authenticated UI.
        updateUI(account);
    } catch (e) {
        // The ApiException status code indicates the detailed failure reason.
        // Please refer to the GoogleSignInStatusCodes class reference for more information.
        console.log(TAG, "signInResult:failed code=" + e.getStatusCode());
        
    }
}