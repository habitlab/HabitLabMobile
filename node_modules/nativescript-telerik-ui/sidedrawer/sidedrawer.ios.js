Object.defineProperty(exports, "__esModule", { value: true });
var commonModule = require("./sidedrawer-common");
var view_1 = require("tns-core-modules/ui/core/view");
var contentView = require("tns-core-modules/ui/content-view");
var utils = require("tns-core-modules/utils/utils");
require("utils/module-merge").merge(commonModule, exports);
////////////////////////////////////////////////
var RadSideDrawer = (function (_super) {
    __extends(RadSideDrawer, _super);
    function RadSideDrawer() {
        var _this = _super.call(this) || this;
        _this._mainContentHost = new contentView.ContentView();
        _this._drawerContentHost = new contentView.ContentView();
        var screen = utils.ios.getter(UIScreen, UIScreen.mainScreen);
        _this._ios = TKSideDrawerView.alloc().initWithFrameMainView(screen.bounds, _this._mainContentHost.ios);
        _this._ios.defaultSideDrawer.content = _this._drawerContentHost.ios;
        _this._nativeDelegate = TKSideDrawerDelegateImpl.new().initWithOwner(_this);
        _this._ios.defaultSideDrawer.width = _this.drawerContentSize;
        _this._ios.defaultSideDrawer.style.blurType = 0;
        _this._ios.defaultSideDrawer.headerView = null;
        _this._ios.defaultSideDrawer.footerView = null;
        _this._addView(_this._mainContentHost);
        _this._addView(_this._drawerContentHost);
        _this._ios.defaultSideDrawer.delegate = _this._nativeDelegate;
        return _this;
    }
    Object.defineProperty(RadSideDrawer.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    RadSideDrawer.prototype.createNativeView = function () {
        this.page.on("navigatingFrom", this.onNavigatingFrom, this);
        return this.ios;
    };
    RadSideDrawer.prototype.disposeNativeView = function () {
        this.page.off("navigatingFrom", this.onNavigatingFrom, this);
    };
    RadSideDrawer.prototype.onNavigatingFrom = function (args) {
        if (this.getIsOpen() && !args.isBackNavigation) {
            this.closeDrawer();
        }
    };
    RadSideDrawer.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        if (this.showOverNavigation) {
            this._ios.attachDrawerToWindow();
        }
    };
    RadSideDrawer.prototype.onUnloaded = function () {
        _super.prototype.onUnloaded.call(this);
        if (this.showOverNavigation) {
            this._ios.detachDrawerFromWindow();
        }
    };
    //data changed event handlers
    RadSideDrawer.prototype._onDrawerLocationChanged = function (oldValue, newValue) {
        if (!newValue) {
            return;
        }
        this.setDrawerLocation(newValue);
    };
    RadSideDrawer.prototype._onGesturesEnabledChanged = function (oldValue, newValue) {
        var newValue = newValue;
        this.ios.defaultSideDrawer.allowGestures = newValue;
    };
    RadSideDrawer.prototype.setDefaultTransition = function () {
        this.drawerTransition = new SlideInOnTopTransition();
    };
    ;
    RadSideDrawer.prototype.setDrawerLocation = function (newLocation) {
        var newLocationToLower = newLocation.toLocaleLowerCase();
        switch (newLocationToLower) {
            case commonModule.SideDrawerLocation.Left.toLocaleLowerCase():
                this._ios.defaultSideDrawer.position = 0 /* Left */;
                break;
            case commonModule.SideDrawerLocation.Right.toLocaleLowerCase():
                this._ios.defaultSideDrawer.position = 1 /* Right */;
                break;
            case commonModule.SideDrawerLocation.Top.toLocaleLowerCase():
                this._ios.defaultSideDrawer.position = 2 /* Top */;
                break;
            case commonModule.SideDrawerLocation.Bottom.toLocaleLowerCase():
                this._ios.defaultSideDrawer.position = 3 /* Bottom */;
                break;
        }
        this.requestLayout();
    };
    RadSideDrawer.prototype._onDrawerContentSizeChanged = function (oldValue, newValue) {
        var value = newValue;
        this._ios.defaultSideDrawer.width = value;
    };
    RadSideDrawer.prototype._onDrawerTransitionChanged = function (oldValue, newValue) {
        var value = newValue;
        var finalVal;
        if (typeof value == "string") {
            switch (value.toLowerCase()) {
                case commonModule.FadeTransitionString: {
                    finalVal = new FadeTransition();
                    break;
                }
                case commonModule.PushTransitionString: {
                    finalVal = new PushTransition();
                    break;
                }
                case commonModule.RevealTransitionString: {
                    finalVal = new RevealTransition();
                    break;
                }
                case commonModule.ReverseSlideOutTransitionString: {
                    finalVal = new ReverseSlideOutTransition();
                    break;
                }
                case commonModule.ScaleDownPusherTransitionString: {
                    finalVal = new ScaleDownPusherTransition();
                    break;
                }
                case commonModule.ScaleUpTransitionString: {
                    finalVal = new ScaleUpTransition();
                    break;
                }
                case commonModule.SlideAlongTransitionString: {
                    finalVal = new SlideAlongTransition();
                    break;
                }
                case commonModule.SlideInOnTopTransitionString: {
                    finalVal = new SlideInOnTopTransition();
                    break;
                }
                default: {
                    console.log("Error: Not supported value (" + value + ") set to 'drawerTransition'");
                    finalVal = new SlideInOnTopTransition();
                    break;
                }
            }
            if (this.drawerTransition !== finalVal) {
                this.drawerTransition = finalVal;
                return;
            }
        }
        else {
            finalVal = value;
        }
        this._ios.defaultSideDrawer.transition = finalVal.getNativeContent();
    };
    RadSideDrawer.prototype._onMainContentChanged = function (oldValue, newValue) {
        if (newValue instanceof view_1.View) {
            this._removeView(this._mainContentHost);
            this._mainContentHost.content = newValue;
            this._addView(this._mainContentHost);
        }
    };
    RadSideDrawer.prototype._onDrawerContentChanged = function (oldValue, newValue) {
        if (newValue instanceof view_1.View) {
            this._removeView(this._drawerContentHost);
            this._drawerContentHost.content = newValue;
            this._addView(this._drawerContentHost);
        }
    };
    Object.defineProperty(RadSideDrawer.prototype, "_nativeView", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    RadSideDrawer.prototype.closeDrawer = function () {
        if (this._ios) {
            this._ios.defaultSideDrawer.dismiss();
            _super.prototype.closeDrawer.call(this);
        }
    };
    RadSideDrawer.prototype.showDrawer = function () {
        if (this._ios) {
            this._ios.defaultSideDrawer.show();
            _super.prototype.showDrawer.call(this);
        }
    };
    RadSideDrawer.prototype.eachChildView = function (callback) {
        if (this._mainContentHost) {
            callback(this._mainContentHost);
        }
        if (this._drawerContentHost) {
            callback(this._drawerContentHost);
        }
    };
    RadSideDrawer.prototype.onLayout = function (left, top, right, bottom) {
        var width = right - left;
        var height = bottom - top;
        var screenWidth = width;
        var screenHeight = height;
        var screen = utils.ios.getter(UIScreen, UIScreen.mainScreen);
        if (this.showOverNavigation) {
            screenWidth = utils.layout.toDevicePixels(screen.bounds.size.width);
            screenHeight = utils.layout.toDevicePixels(screen.bounds.size.height);
        }
        var drawerSize = utils.layout.toDevicePixels(this.drawerContentSize);
        var pos = this._ios.defaultSideDrawer.position;
        if (pos === 2 /* Top */ || pos === 3 /* Bottom */) {
            this._drawerContentHost.layout(0, 0, screenWidth, screenHeight);
        }
        else {
            this._drawerContentHost.layout(0, 0, drawerSize, screenHeight);
        }
        this._mainContentHost.layout(0, 0, width, height);
    };
    RadSideDrawer.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        var pos = this._ios.defaultSideDrawer.position;
        var drawerWidth = widthMeasureSpec;
        var drawerHeight = heightMeasureSpec;
        if (this.showOverNavigation) {
            var screen = utils.ios.getter(UIScreen, UIScreen.mainScreen);
            drawerWidth = utils.layout.makeMeasureSpec(utils.layout.toDevicePixels(screen.bounds.size.width), utils.layout.EXACTLY);
            drawerHeight = utils.layout.makeMeasureSpec(utils.layout.toDevicePixels(screen.bounds.size.height), utils.layout.EXACTLY);
        }
        var drawerSize = utils.layout.toDevicePixels(this.drawerContentSize);
        if (pos == 2 /* Top */ || pos == 3 /* Bottom */) {
            view_1.View.measureChild(this, this._drawerContentHost, drawerWidth, utils.layout.makeMeasureSpec(drawerSize, utils.layout.EXACTLY));
        }
        else {
            view_1.View.measureChild(this, this._drawerContentHost, utils.layout.makeMeasureSpec(drawerSize, utils.layout.EXACTLY), drawerHeight);
        }
        var result = view_1.View.measureChild(this, this._mainContentHost, widthMeasureSpec, heightMeasureSpec);
        var width = utils.layout.getMeasureSpecSize(widthMeasureSpec);
        var widthMode = utils.layout.getMeasureSpecMode(widthMeasureSpec);
        var height = utils.layout.getMeasureSpecSize(heightMeasureSpec);
        var heightMode = utils.layout.getMeasureSpecMode(heightMeasureSpec);
        var widthAndState = view_1.View.resolveSizeAndState(result.measuredWidth, width, widthMode, 0);
        var heightAndState = view_1.View.resolveSizeAndState(result.measuredHeight, height, heightMode, 0);
        this.setMeasuredDimension(widthAndState, heightAndState);
    };
    return RadSideDrawer;
}(commonModule.RadSideDrawer));
exports.RadSideDrawer = RadSideDrawer;
////////////////////////////////////////////////
//              TRANSITIONS
////////////////////////////////////////////////
var FadeTransition = (function (_super) {
    __extends(FadeTransition, _super);
    function FadeTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FadeTransition.prototype.getNativeContent = function () {
        return 6 /* FadeIn */;
    };
    return FadeTransition;
}(commonModule.DrawerTransitionBase));
exports.FadeTransition = FadeTransition;
var PushTransition = (function (_super) {
    __extends(PushTransition, _super);
    function PushTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PushTransition.prototype.getNativeContent = function () {
        return 2 /* Push */;
    };
    return PushTransition;
}(commonModule.DrawerTransitionBase));
exports.PushTransition = PushTransition;
var RevealTransition = (function (_super) {
    __extends(RevealTransition, _super);
    function RevealTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RevealTransition.prototype.getNativeContent = function () {
        return 1 /* Reveal */;
    };
    return RevealTransition;
}(commonModule.DrawerTransitionBase));
exports.RevealTransition = RevealTransition;
var ReverseSlideOutTransition = (function (_super) {
    __extends(ReverseSlideOutTransition, _super);
    function ReverseSlideOutTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ReverseSlideOutTransition.prototype.getNativeContent = function () {
        return 4 /* ReverseSlideOut */;
    };
    return ReverseSlideOutTransition;
}(commonModule.DrawerTransitionBase));
exports.ReverseSlideOutTransition = ReverseSlideOutTransition;
var ScaleDownPusherTransition = (function (_super) {
    __extends(ScaleDownPusherTransition, _super);
    function ScaleDownPusherTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScaleDownPusherTransition.prototype.getNativeContent = function () {
        return 7 /* ScaleDownPusher */;
    };
    return ScaleDownPusherTransition;
}(commonModule.DrawerTransitionBase));
exports.ScaleDownPusherTransition = ScaleDownPusherTransition;
var ScaleUpTransition = (function (_super) {
    __extends(ScaleUpTransition, _super);
    function ScaleUpTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScaleUpTransition.prototype.getNativeContent = function () {
        return 5 /* ScaleUp */;
    };
    return ScaleUpTransition;
}(commonModule.DrawerTransitionBase));
exports.ScaleUpTransition = ScaleUpTransition;
var SlideAlongTransition = (function (_super) {
    __extends(SlideAlongTransition, _super);
    function SlideAlongTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SlideAlongTransition.prototype.getNativeContent = function () {
        return 3 /* SlideAlong */;
    };
    return SlideAlongTransition;
}(commonModule.DrawerTransitionBase));
exports.SlideAlongTransition = SlideAlongTransition;
var SlideInOnTopTransition = (function (_super) {
    __extends(SlideInOnTopTransition, _super);
    function SlideInOnTopTransition() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SlideInOnTopTransition.prototype.getNativeContent = function () {
        return 0 /* SlideInOnTop */;
    };
    return SlideInOnTopTransition;
}(commonModule.DrawerTransitionBase));
exports.SlideInOnTopTransition = SlideInOnTopTransition;
////////////////////////////////////////////////
//      Delegate implementation
////////////////////////////////////////////////
var TKSideDrawerDelegateImpl = (function (_super) {
    __extends(TKSideDrawerDelegateImpl, _super);
    function TKSideDrawerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TKSideDrawerDelegateImpl.new = function () {
        return _super.new.call(this);
    };
    TKSideDrawerDelegateImpl.prototype.initWithOwner = function (owner) {
        this._owner = owner;
        return this;
    };
    TKSideDrawerDelegateImpl.prototype.willShowSideDrawer = function (sideDrawer) {
        if (this._owner.hasListeners(commonModule.RadSideDrawer.drawerOpeningEvent)) {
            var args = {
                eventName: commonModule.RadSideDrawer.drawerOpeningEvent,
                object: this._owner,
                returnValue: false
            };
            this._owner.notify(args);
        }
    };
    ;
    TKSideDrawerDelegateImpl.prototype.didShowSideDrawer = function (sideDrawer) {
        if (this._owner.hasListeners(commonModule.RadSideDrawer.drawerOpenedEvent)) {
            var args = {
                eventName: commonModule.RadSideDrawer.drawerOpenedEvent,
                object: this._owner,
            };
            this._owner.notify(args);
        }
    };
    ;
    TKSideDrawerDelegateImpl.prototype.willDismissSideDrawer = function (sideDrawer) {
        if (this._owner.hasListeners(commonModule.RadSideDrawer.drawerClosingEvent)) {
            var args = {
                eventName: commonModule.RadSideDrawer.drawerClosingEvent,
                object: this._owner,
                returnValue: false
            };
            this._owner.notify(args);
        }
    };
    ;
    TKSideDrawerDelegateImpl.prototype.didDismissSideDrawer = function (sideDrawer) {
        if (this._owner.hasListeners(commonModule.RadSideDrawer.drawerClosedEvent)) {
            var args = {
                eventName: commonModule.RadSideDrawer.drawerClosedEvent,
                object: this._owner,
            };
            this._owner.notify(args);
        }
    };
    ;
    return TKSideDrawerDelegateImpl;
}(NSObject));
TKSideDrawerDelegateImpl.ObjCProtocols = [TKSideDrawerDelegate];
