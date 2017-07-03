Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
exports.FadeTransitionString = "fadetransition";
exports.PushTransitionString = "pushtransition";
exports.RevealTransitionString = "revealtransition";
exports.ReverseSlideOutTransitionString = "reverseslideouttransition";
exports.ScaleDownPusherTransitionString = "scaledownpushertransition";
exports.ScaleUpTransitionString = "scaleuptransition";
exports.SlideAlongTransitionString = "slidealongtransition";
exports.SlideInOnTopTransitionString = "slideinontoptransition";
var SideDrawerLocation;
(function (SideDrawerLocation) {
    SideDrawerLocation.Left = "Left";
    SideDrawerLocation.Right = "Right";
    SideDrawerLocation.Top = "Top";
    SideDrawerLocation.Bottom = "Bottom";
})(SideDrawerLocation = exports.SideDrawerLocation || (exports.SideDrawerLocation = {}));
var DrawerTransitionBase = (function () {
    function DrawerTransitionBase() {
    }
    DrawerTransitionBase.prototype.getNativeContent = function () {
        return undefined;
    };
    ;
    return DrawerTransitionBase;
}());
exports.DrawerTransitionBase = DrawerTransitionBase;
var DrawerStateChangingEventArgs = (function () {
    function DrawerStateChangingEventArgs() {
    }
    return DrawerStateChangingEventArgs;
}());
exports.DrawerStateChangingEventArgs = DrawerStateChangingEventArgs;
var DrawerStateChangedEventArgs = (function () {
    function DrawerStateChangedEventArgs() {
    }
    return DrawerStateChangedEventArgs;
}());
exports.DrawerStateChangedEventArgs = DrawerStateChangedEventArgs;
var RadSideDrawer = (function (_super) {
    __extends(RadSideDrawer, _super);
    function RadSideDrawer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RadSideDrawer.prototype.onShowOverNavigationPropertyChanged = function (oldValue, newValue) {
        // this.checkTransitionCompatibility(); // When issue #851 is implemented, uncomment this
        this._onShowOverNavigationChanged(oldValue, newValue);
    };
    RadSideDrawer.prototype.onGesturesEnabledPropertyChanged = function (oldValue, newValue) {
        this._onGesturesEnabledChanged(oldValue, newValue);
    };
    RadSideDrawer.prototype.onDrawerTransitionChanged = function (oldValue, newValue) {
        this._onDrawerTransitionChanged(oldValue, newValue);
        this.checkTransitionCompatibility();
    };
    RadSideDrawer.prototype.onDrawerContentSizeChanged = function (oldValue, newValue) {
        this._onDrawerContentSizeChanged(oldValue, newValue);
    };
    RadSideDrawer.prototype.onDrawerLocationPropertyChanged = function (oldValue, newValue) {
        this._onDrawerLocationChanged(oldValue, newValue);
    };
    RadSideDrawer.prototype._onMainContentPropertyChanged = function (oldValue, newValue) {
        this._onMainContentChanged(oldValue, newValue);
    };
    RadSideDrawer.prototype._onDrawerContentPropertyChanged = function (oldValue, newValue) {
        this._onDrawerContentChanged(oldValue, newValue);
    };
    RadSideDrawer.prototype._onMainContentChanged = function (oldValue, newValue) {
        if (oldValue) {
            this._removeView(oldValue);
        }
        if (newValue) {
            this._addView(newValue);
        }
    };
    ;
    RadSideDrawer.prototype._onDrawerContentChanged = function (oldValue, newValue) {
        if (oldValue) {
            this._removeView(oldValue);
        }
        if (newValue) {
            this._addView(newValue);
        }
    };
    ;
    RadSideDrawer.prototype._onDrawerLocationChanged = function (oldValue, newValue) { };
    ;
    RadSideDrawer.prototype._onDrawerTransitionChanged = function (oldValue, newValue) { };
    ;
    RadSideDrawer.prototype._onDrawerContentSizeChanged = function (oldValue, newValue) { };
    ;
    RadSideDrawer.prototype._onGesturesEnabledChanged = function (oldValue, newValue) { };
    ;
    RadSideDrawer.prototype._onShowOverNavigationChanged = function (oldValue, newValue) { };
    ;
    RadSideDrawer.prototype.setDefaultTransition = function () { };
    ;
    RadSideDrawer.prototype.showDrawer = function () {
    };
    RadSideDrawer.prototype.closeDrawer = function () {
    };
    RadSideDrawer.prototype.getIsOpen = function () {
        var androidIsOpen = false;
        var iosIsOpen = false;
        if (this.android) {
            androidIsOpen = this.android.getIsOpen();
        }
        if (this.ios) {
            iosIsOpen = this.ios.defaultSideDrawer.isVisible;
        }
        var result = androidIsOpen || iosIsOpen;
        if (result) {
            return result;
        }
        return false;
    };
    RadSideDrawer.prototype.toggleDrawerState = function () {
        if (this.getIsOpen()) {
            this.closeDrawer();
        }
        else {
            this.showDrawer();
        }
    };
    RadSideDrawer.prototype.checkTransitionCompatibility = function () {
        if (this.showOverNavigation && this.drawerTransition) {
            var className = this.drawerTransition.constructor.name.toLowerCase();
            if (className != exports.PushTransitionString && className != exports.FadeTransitionString && className != exports.SlideInOnTopTransitionString) {
                console.log("Warning: '" + this.drawerTransition.constructor.name + "' is not supported when 'showOverNavigation' is set to 'true'.");
                this.setDefaultTransition();
            }
        }
    };
    Object.defineProperty(RadSideDrawer.prototype, "_childrenCount", {
        get: function () {
            var count = 0;
            if (this.drawerContent) {
                count++;
            }
            if (this.mainContent) {
                count++;
            }
            return count;
        },
        enumerable: true,
        configurable: true
    });
    RadSideDrawer.prototype.eachChildView = function (callback) {
        var mainContent = this.mainContent;
        if (mainContent) {
            callback(mainContent);
        }
        var drawerContent = this.drawerContent;
        if (drawerContent) {
            callback(drawerContent);
        }
    };
    return RadSideDrawer;
}(view_1.View));
RadSideDrawer.drawerOpeningEvent = "drawerOpening";
RadSideDrawer.drawerOpenedEvent = "drawerOpened";
RadSideDrawer.drawerClosingEvent = "drawerClosing";
RadSideDrawer.drawerClosedEvent = "drawerClosed";
RadSideDrawer.showOverNavigationProperty = new view_1.Property({
    name: "showOverNavigation",
    defaultValue: false,
    valueConverter: view_1.booleanConverter,
    valueChanged: function (target, oldValue, newValue) {
        target.onShowOverNavigationPropertyChanged(oldValue, newValue);
    },
});
RadSideDrawer.gesturesEnabledProperty = new view_1.Property({
    name: "gesturesEnabled",
    defaultValue: true,
    valueConverter: view_1.booleanConverter,
    valueChanged: function (target, oldValue, newValue) {
        target.onGesturesEnabledPropertyChanged(oldValue, newValue);
    },
});
RadSideDrawer.drawerTransitionProperty = new view_1.Property({
    name: "drawerTransition",
    defaultValue: undefined,
    valueChanged: function (target, oldValue, newValue) {
        target.onDrawerTransitionChanged(oldValue, newValue);
    },
});
RadSideDrawer.drawerContentSizeProperty = new view_1.Property({
    name: "drawerContentSize",
    defaultValue: 280,
    valueConverter: parseInt,
    valueChanged: function (target, oldValue, newValue) {
        target.onDrawerContentSizeChanged(oldValue, newValue);
    },
});
RadSideDrawer.drawerLocationProperty = new view_1.Property({
    name: "drawerLocation",
    defaultValue: SideDrawerLocation.Left,
    valueChanged: function (target, oldValue, newValue) {
        target.onDrawerLocationPropertyChanged(oldValue, newValue);
    },
});
RadSideDrawer.mainContentProperty = new view_1.Property({
    name: "mainContent",
    defaultValue: undefined,
    valueChanged: function (target, oldValue, newValue) {
        target._onMainContentPropertyChanged(oldValue, newValue);
    },
});
RadSideDrawer.drawerContentProperty = new view_1.Property({
    name: "drawerContent",
    defaultValue: undefined,
    valueChanged: function (target, oldValue, newValue) {
        target._onDrawerContentPropertyChanged(oldValue, newValue);
    },
});
exports.RadSideDrawer = RadSideDrawer;
RadSideDrawer.showOverNavigationProperty.register(RadSideDrawer);
RadSideDrawer.gesturesEnabledProperty.register(RadSideDrawer);
RadSideDrawer.drawerTransitionProperty.register(RadSideDrawer);
RadSideDrawer.drawerContentSizeProperty.register(RadSideDrawer);
RadSideDrawer.drawerLocationProperty.register(RadSideDrawer);
RadSideDrawer.mainContentProperty.register(RadSideDrawer);
RadSideDrawer.drawerContentProperty.register(RadSideDrawer);
