/*****************
 **CURRENTLY NOT**
 ******USED*******
 *****************/

var dialogs = require("ui/dialogs");

android.content.BroadcastReceiver.extend("com.habitlab.DialogRequestReceiver", {
	onReceive: function(context, intent) {
		dialogs.alert({
		    title: "Your title",
		    message: "Your message",
		    okButtonText: "Your button text"
		}).then(function () {
		    console.log("Dialog closed!");
		});

	}
});