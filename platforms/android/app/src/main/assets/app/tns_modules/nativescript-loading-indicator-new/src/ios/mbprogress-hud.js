"use strict";
var color_1 = require('color');
var LoadingIndicator = (function () {
    function LoadingIndicator() {
    }
    LoadingIndicator.prototype.show = function (options) {
        if (this._hud === undefined)
            this._hud = MBProgressHUD.showHUDAddedToAnimated(this._getRootWindow(), true);
        if (options === undefined)
            options = {};
        if (options.message)
            this._hud.labelText = options.message;
        if (options.progress)
            this._hud.progress = options.progress;
        if (options.ios) {
            if (options.ios.details)
                this._hud.detailsLabelText = options.ios.details;
            if (options.ios.square)
                this._hud.square = true;
            if (options.ios.margin)
                this._hud.margin = options.ios.margin;
            if (options.ios.dimBackground)
                this._hud.dimBackground = true;
            if (options.ios.color) {
                this._hud.color = new color_1.Color(options.ios.color).ios;
            }
            if (options.ios.mode) {
                this._hud.mode = options.ios.mode;
                if (options.ios.mode === MBProgressHUDModeCustomView && options.ios.customView) {
                    this._hud.customView = UIImageView.alloc().initWithImage(UIImage.imageNamed(options.ios.customView));
                }
            }
        }
        return this._hud;
    };
    LoadingIndicator.prototype.hide = function () {
        MBProgressHUD.hideHUDForViewAnimated(this._getRootWindow(), true);
        this._hud = undefined;
    };
    LoadingIndicator.prototype._getRootWindow = function () {
        return UIApplication.sharedApplication().windows[0];
    };
    return LoadingIndicator;
}());
exports.LoadingIndicator = LoadingIndicator;
//# sourceMappingURL=mbprogress-hud.js.map