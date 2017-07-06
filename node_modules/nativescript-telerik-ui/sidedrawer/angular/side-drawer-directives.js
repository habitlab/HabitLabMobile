Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var __1 = require("./..");
var page_1 = require("tns-core-modules/ui/page");
var element_registry_1 = require("nativescript-angular/element-registry");
var TKDRAWERCONTENT = "TKDrawerContent";
var TKMAINCONTENT = "TKMainContent";
var RadSideDrawerComponent = (function () {
    function RadSideDrawerComponent(elementRef, page, viewContainer) {
        this.elementRef = elementRef;
        this.page = page;
        this.viewContainer = viewContainer;
        this.sideDrawerMovedToPage = false;
        this.drawerOpening = new core_1.EventEmitter();
        this.drawerOpen = new core_1.EventEmitter();
        this.drawerClosing = new core_1.EventEmitter();
        this.drawerClosed = new core_1.EventEmitter();
        this.sideDrawer = this.elementRef.nativeElement;
    }
    Object.defineProperty(RadSideDrawerComponent.prototype, "transition", {
        set: function (transition) {
            this.sideDrawer.drawerTransition = transition;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadSideDrawerComponent.prototype, "nativeElement", {
        get: function () {
            return this.sideDrawer;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadSideDrawerComponent.prototype, "drawerContentSize", {
        set: function (value) {
            this._drawerContentSize = value;
            this.updateContentSize();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadSideDrawerComponent.prototype, "showOverNavigation", {
        set: function (value) {
            this._showOverNavigation = value;
            this.updateShowOverNavigation();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadSideDrawerComponent.prototype, "gesturesEnabled", {
        set: function (value) {
            this._gesturesEnabled = value;
            this.updateGesturesEnabled();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadSideDrawerComponent.prototype, "drawerTransition", {
        set: function (value) {
            this._drawerTransition = value;
            this.updateDrawerTransition();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadSideDrawerComponent.prototype, "drawerLocation", {
        set: function (value) {
            this._drawerLocation = value;
            this.updateDrawerLocation();
        },
        enumerable: true,
        configurable: true
    });
    RadSideDrawerComponent.prototype.updateDrawerLocation = function () {
        this.sideDrawer.drawerLocation = this._drawerLocation;
    };
    RadSideDrawerComponent.prototype.updateDrawerTransition = function () {
        this.sideDrawer.drawerTransition = this._drawerTransition;
    };
    RadSideDrawerComponent.prototype.updateGesturesEnabled = function () {
        this.sideDrawer.gesturesEnabled = this._gesturesEnabled;
    };
    RadSideDrawerComponent.prototype.updateShowOverNavigation = function () {
        this.sideDrawer.showOverNavigation = this._showOverNavigation;
    };
    RadSideDrawerComponent.prototype.updateContentSize = function () {
        this.sideDrawer.drawerContentSize = this._drawerContentSize;
    };
    return RadSideDrawerComponent;
}());
RadSideDrawerComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: 'RadSideDrawer',
                template: "<ng-content></ng-content>"
            },] },
];
/** @nocollapse */
RadSideDrawerComponent.ctorParameters = function () { return [
    { type: core_1.ElementRef, decorators: [{ type: core_1.Inject, args: [core_1.ElementRef,] },] },
    { type: page_1.Page, decorators: [{ type: core_1.Inject, args: [page_1.Page,] },] },
    { type: core_1.ViewContainerRef, decorators: [{ type: core_1.Inject, args: [core_1.ViewContainerRef,] },] },
]; };
RadSideDrawerComponent.propDecorators = {
    'drawerOpening': [{ type: core_1.Output },],
    'drawerOpen': [{ type: core_1.Output },],
    'drawerClosing': [{ type: core_1.Output },],
    'drawerClosed': [{ type: core_1.Output },],
    'transition': [{ type: core_1.Input },],
};
exports.RadSideDrawerComponent = RadSideDrawerComponent;
var TKDrawerContentDirective = (function () {
    function TKDrawerContentDirective(_elementRef) {
        this._elementRef = _elementRef;
        this._elementRef.nativeElement.id = TKDRAWERCONTENT;
    }
    return TKDrawerContentDirective;
}());
TKDrawerContentDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkDrawerContent]"
            },] },
];
/** @nocollapse */
TKDrawerContentDirective.ctorParameters = function () { return [
    { type: core_1.ElementRef, decorators: [{ type: core_1.Inject, args: [core_1.ElementRef,] },] },
]; };
exports.TKDrawerContentDirective = TKDrawerContentDirective;
var TKMainContentDirective = (function () {
    function TKMainContentDirective(_elementRef) {
        this._elementRef = _elementRef;
        this._elementRef.nativeElement.id = TKMAINCONTENT;
    }
    return TKMainContentDirective;
}());
TKMainContentDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkMainContent]"
            },] },
];
/** @nocollapse */
TKMainContentDirective.ctorParameters = function () { return [
    { type: core_1.ElementRef, decorators: [{ type: core_1.Inject, args: [core_1.ElementRef,] },] },
]; };
exports.TKMainContentDirective = TKMainContentDirective;
var sideDrawerMeta = {
    insertChild: function (parent, child, atIndex) {
        var drawer = parent;
        var childView = child;
        if (childView.id == TKMAINCONTENT) {
            drawer.mainContent = childView;
        }
        if (childView.id == TKDRAWERCONTENT) {
            drawer.drawerContent = childView;
        }
    },
    removeChild: function (parent, child) {
        var drawer = parent;
        var childView = child;
        if (childView.id == TKMAINCONTENT) {
            drawer.mainContent = null;
        }
        if (childView.id == TKDRAWERCONTENT) {
            drawer.drawerContent = null;
        }
    },
};
exports.SIDEDRAWER_DIRECTIVES = [RadSideDrawerComponent, TKDrawerContentDirective, TKMainContentDirective];
element_registry_1.registerElement("RadSideDrawer", function () { return __1.RadSideDrawer; }, sideDrawerMeta);
var NativeScriptUISideDrawerModule = (function () {
    function NativeScriptUISideDrawerModule() {
    }
    return NativeScriptUISideDrawerModule;
}());
NativeScriptUISideDrawerModule.decorators = [
    { type: core_1.NgModule, args: [{
                declarations: [exports.SIDEDRAWER_DIRECTIVES],
                exports: [exports.SIDEDRAWER_DIRECTIVES]
            },] },
];
/** @nocollapse */
NativeScriptUISideDrawerModule.ctorParameters = function () { return []; };
exports.NativeScriptUISideDrawerModule = NativeScriptUISideDrawerModule;
