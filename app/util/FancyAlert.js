var app = require("application");

 
var PromptDialog = cn.refactor.lib.colordialog.PromptDialog;



exports.type = {INFO: 0, HELP: 1, WRONG: 2, SUCCESS: 3, WARNING: 4};

exports.show = function(type, title, content, closeMsg, callback) {
    console.log("Trying to show alert");
    var alert = new PromptDialog(app.android.currentContext);
    alert.setDialogType(type);
    alert.setTitleText(title);
    alert.setContentText(content);
    alert.setAnimationEnable(true);
    alert.setCanceledOnTouchOutside(false);
    alert.setPositiveListener(closeMsg, new PromptDialog.OnPositiveListener({
        onClick: (function (dialog) {
            if (callback) {
                callback();
            }
            dialog.dismiss();
        })
    }));
    alert.show();
};