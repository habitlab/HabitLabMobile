"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var app = require('application');
__export(require('./common'));
var PromptDialog = cn.refactor.lib.colordialog.PromptDialog;
(function (SUPPORTED_TYPESI) {
    SUPPORTED_TYPESI[SUPPORTED_TYPESI["INFO"] = 0] = "INFO";
    SUPPORTED_TYPESI[SUPPORTED_TYPESI["HELP"] = 1] = "HELP";
    SUPPORTED_TYPESI[SUPPORTED_TYPESI["WRONG"] = 2] = "WRONG";
    SUPPORTED_TYPESI[SUPPORTED_TYPESI["SUCCESS"] = 3] = "SUCCESS";
    SUPPORTED_TYPESI[SUPPORTED_TYPESI["WARNING"] = 4] = "WARNING";
})(exports.SUPPORTED_TYPESI || (exports.SUPPORTED_TYPESI = {}));
var SUPPORTED_TYPESI = exports.SUPPORTED_TYPESI;
var TNSFancyAlert = (function () {
    function TNSFancyAlert() {
    }
    TNSFancyAlert.showSuccess = function (title, subTitle, closeBtnTitle) {
        var alert = new PromptDialog(app.android.currentContext);
        alert.setDialogType(SUPPORTED_TYPESI.SUCCESS);
        alert.setTitleText(title || 'Success!');
        alert.setContentText(subTitle || '');
        alert.setAnimationEnable(true);
        alert.setPositiveListener(closeBtnTitle || 'Okay', new PromptDialog.OnPositiveListener({
            onClick: (function (dialog) {
                dialog.dismiss();
            })
        }));
        alert.show();
    };
    TNSFancyAlert.showError = function (title, subTitle, closeBtnTitle) {
        var alert = new PromptDialog(app.android.currentContext);
        alert.setDialogType(SUPPORTED_TYPESI.WRONG);
        alert.setTitleText(title || 'Error!');
        alert.setContentText(subTitle || '');
        alert.setAnimationEnable(true);
        alert.setPositiveListener(closeBtnTitle || 'Okay', new PromptDialog.OnPositiveListener({
            onClick: (function (dialog) {
                dialog.dismiss();
            })
        }));
        alert.show();
    };
    TNSFancyAlert.showNotice = function (title, subTitle, closeBtnTitle) {
        var alert = new PromptDialog(app.android.currentContext);
        alert.setDialogType(SUPPORTED_TYPESI.HELP);
        alert.setTitleText(title || 'Notice');
        alert.setContentText(subTitle || '');
        alert.setAnimationEnable(true);
        alert.setPositiveListener(closeBtnTitle || 'Okay', new PromptDialog.OnPositiveListener({
            onClick: (function (dialog) {
                dialog.dismiss();
            })
        }));
        alert.show();
    };
    TNSFancyAlert.showWarning = function (title, subTitle, closeBtnTitle) {
        var alert = new PromptDialog(app.android.currentContext);
        alert.setDialogType(SUPPORTED_TYPESI.WARNING);
        alert.setTitleText(title || 'Warning!');
        alert.setContentText(subTitle || '');
        alert.setAnimationEnable(true);
        alert.setPositiveListener(closeBtnTitle || 'Okay', new PromptDialog.OnPositiveListener({
            onClick: (function (dialog) {
                dialog.dismiss();
            })
        }));
        alert.show();
    };
    TNSFancyAlert.showInfo = function (title, subTitle, closeBtnTitle) {
        var alert = new PromptDialog(app.android.currentContext);
        alert.setDialogType(SUPPORTED_TYPESI.INFO);
        alert.setTitleText(title || 'Info');
        alert.setContentText(subTitle || '');
        alert.setAnimationEnable(true);
        alert.setPositiveListener(closeBtnTitle || 'Okay', new PromptDialog.OnPositiveListener({
            onClick: (function (dialog) {
                dialog.dismiss();
            })
        }));
        alert.show();
    };
    return TNSFancyAlert;
}());
exports.TNSFancyAlert = TNSFancyAlert;
//# sourceMappingURL=fancyalert.js.map