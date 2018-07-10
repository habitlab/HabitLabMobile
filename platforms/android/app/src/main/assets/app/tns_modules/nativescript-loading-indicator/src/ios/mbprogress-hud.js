"use strict";
var color_1 = require("color");
var utils = require("utils/utils");
var LoadingIndicator = (function () {
    function LoadingIndicator() {
    }
    LoadingIndicator.prototype.show = function (options) {
        if (typeof options === 'undefined')
            options = {};
        var ios = options.ios;
        if (typeof this._hud === 'undefined') {
            // use specific target, fallback to entire window
            this._targetView = ios && ios.view ? ios.view : this._getRootWindow();
            this._hud = MBProgressHUD.showHUDAddedToAnimated(this._targetView, true);
        }
        // options
        if (options.message)
            this._hud.labelText = options.message;
        if (options.progress)
            this._hud.progress = options.progress;
        // ios specific
        if (ios) {
            if (ios.details)
                this._hud.detailsLabelText = ios.details;
            if (ios.square)
                this._hud.square = true;
            if (ios.margin)
                this._hud.margin = ios.margin;
            if (ios.dimBackground)
                this._hud.dimBackground = true;
            if (ios.color) {
                // make activity and main label same color
                this._hud.activityIndicatorColor = new color_1.Color(ios.color).ios;
                this._hud.labelColor = new color_1.Color(ios.color).ios;
                if (ios.details) {
                    // detail label same color with 80% opacity of that color
                    // TODO: allow specific control
                    this._hud.detailsLabelColor = new color_1.Color(ios.color).ios;
                    this._hud.detailsLabel.opacity = .8;
                }
            }
            if (ios.backgroundColor) {
                this._hud.color = new color_1.Color(ios.backgroundColor).ios;
            }
            if (ios.hideBezel) {
                this._hud.backgroundColor = UIColor.clearColor;
                this._hud.bezelView.style = 0 /* SolidColor */;
                this._hud.bezelView.backgroundColor = UIColor.clearColor;
            }
            if (ios.mode) {
                this._hud.mode = ios.mode;
                if (ios.mode === MBProgressHUDModeCustomView && ios.customView) {
                    this._hud.customView = UIImageView.alloc().initWithImage(UIImage.imageNamed(ios.customView));
                }
            }
        }
        return this._hud;
    };
    LoadingIndicator.prototype.hide = function (targetView) {
        targetView = targetView || this._targetView || this._getRootWindow();
        MBProgressHUD.hideHUDForViewAnimated(targetView, true);
        this._hud = undefined;
    };
    LoadingIndicator.prototype._getRootWindow = function () {
        return utils.ios.getter(UIApplication, UIApplication.sharedApplication).windows[0];
    };
    return LoadingIndicator;
}());
exports.LoadingIndicator = LoadingIndicator;
