"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = require("color");
var font_1 = require("ui/styling/font");
var text_base_1 = require("ui/text-base");
var types = require("utils/types");
var utils = require("utils/utils");
var drop_down_common_1 = require("./drop-down-common");
__export(require("./drop-down-common"));
var TOOLBAR_HEIGHT = 44;
var HINT_COLOR = new color_1.Color("#3904041E");
var DropDown = (function (_super) {
    __extends(DropDown, _super);
    function DropDown() {
        var _this = _super.call(this) || this;
        var applicationFrame = utils.ios.getter(UIScreen, UIScreen.mainScreen).applicationFrame;
        _this.nativeView = TNSDropDownLabel.initWithOwner(new WeakRef(_this));
        _this.nativeView.userInteractionEnabled = true;
        _this._listPicker = UIPickerView.alloc().init();
        _this._dropDownDelegate = DropDownListPickerDelegateImpl.initWithOwner(new WeakRef(_this));
        _this._dropDownDataSource = DropDownListDataSource.initWithOwner(new WeakRef(_this));
        _this._flexToolbarSpace = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(5, null, null);
        _this._doneTapDelegate = TapHandler.initWithOwner(new WeakRef(_this));
        _this._doneButton = UIBarButtonItem.alloc().initWithBarButtonSystemItemTargetAction(0, _this._doneTapDelegate, "tap");
        _this._accessoryViewVisible = true;
        _this._toolbar = UIToolbar.alloc().initWithFrame(CGRectMake(0, 0, applicationFrame.size.width, TOOLBAR_HEIGHT));
        _this._toolbar.autoresizingMask = 2;
        var nsArray = NSMutableArray.alloc().init();
        nsArray.addObject(_this._flexToolbarSpace);
        nsArray.addObject(_this._doneButton);
        _this._toolbar.setItemsAnimated(nsArray, false);
        return _this;
    }
    DropDown.prototype.disposeNativeView = function () {
        this._doneTapDelegate = null;
        this._dropDownDelegate = null;
        this._dropDownDataSource = null;
    };
    Object.defineProperty(DropDown.prototype, "ios", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DropDown.prototype, "accessoryViewVisible", {
        get: function () {
            return this._accessoryViewVisible;
        },
        set: function (value) {
            this._accessoryViewVisible = value;
            this._showHideAccessoryView();
        },
        enumerable: true,
        configurable: true
    });
    DropDown.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._listPicker.delegate = this._dropDownDelegate;
        this._listPicker.dataSource = this._dropDownDataSource;
        this.ios.inputView = this._listPicker;
        this._showHideAccessoryView();
    };
    DropDown.prototype.onUnloaded = function () {
        this._listPicker.delegate = null;
        this._listPicker.dataSource = null;
        this.ios.inputView = null;
        this.ios.inputAccessoryView = null;
        _super.prototype.onUnloaded.call(this);
    };
    DropDown.prototype.open = function () {
        if (this.isEnabled) {
            this.ios.becomeFirstResponder();
        }
    };
    DropDown.prototype.close = function () {
        this.ios.resignFirstResponder();
    };
    DropDown.prototype[drop_down_common_1.selectedIndexProperty.getDefault] = function () {
        return null;
    };
    DropDown.prototype[drop_down_common_1.selectedIndexProperty.setNative] = function (value) {
        if (value >= 0) {
            this._listPicker.selectRowInComponentAnimated(value, 0, true);
        }
        this.ios.setText(this._getItemAsString(value));
    };
    DropDown.prototype[drop_down_common_1.itemsProperty.getDefault] = function () {
        return null;
    };
    DropDown.prototype[drop_down_common_1.itemsProperty.setNative] = function (value) {
        this._listPicker.reloadAllComponents();
        drop_down_common_1.selectedIndexProperty.coerce(this);
    };
    DropDown.prototype[drop_down_common_1.hintProperty.getDefault] = function () {
        return "";
    };
    DropDown.prototype[drop_down_common_1.hintProperty.setNative] = function (value) {
        this.ios.hint = value;
    };
    DropDown.prototype[drop_down_common_1.colorProperty.getDefault] = function () {
        return this.nativeView.color;
    };
    DropDown.prototype[drop_down_common_1.colorProperty.setNative] = function (value) {
        var color = value instanceof color_1.Color ? value.ios : value;
        this.nativeView.color = color;
        this._listPicker.tintColor = color;
        this._listPicker.reloadAllComponents();
    };
    DropDown.prototype[drop_down_common_1.backgroundColorProperty.getDefault] = function () {
        return this.nativeView.backgroundColor;
    };
    DropDown.prototype[drop_down_common_1.backgroundColorProperty.setNative] = function (value) {
        if (!value) {
            return;
        }
        var color = value instanceof color_1.Color ? value.ios : value;
        this.nativeView.backgroundColor = color;
        this._listPicker.backgroundColor = color;
        this._listPicker.reloadAllComponents();
    };
    DropDown.prototype[drop_down_common_1.backgroundInternalProperty.getDefault] = function () {
        return null;
    };
    DropDown.prototype[drop_down_common_1.backgroundInternalProperty.setNative] = function (value) {
    };
    DropDown.prototype[drop_down_common_1.fontInternalProperty.getDefault] = function () {
        return this.nativeView.font;
    };
    DropDown.prototype[drop_down_common_1.fontInternalProperty.setNative] = function (value) {
        var font = value instanceof font_1.Font ? value.getUIFont(this.nativeView.font) : value;
        this.nativeView.font = font;
    };
    DropDown.prototype[text_base_1.textAlignmentProperty.setNative] = function (value) {
        switch (value) {
            case "initial":
            case "left":
                this.nativeView.textAlignment = 0;
                break;
            case "center":
                this.nativeView.textAlignment = 1;
                break;
            case "right":
                this.nativeView.textAlignment = 2;
                break;
        }
    };
    DropDown.prototype[text_base_1.textDecorationProperty.setNative] = function (value) {
        _setTextAttributes(this.nativeView, this.style);
    };
    DropDown.prototype[text_base_1.textTransformProperty.setNative] = function (value) {
        _setTextAttributes(this.nativeView, this.style);
    };
    DropDown.prototype[text_base_1.letterSpacingProperty.setNative] = function (value) {
        _setTextAttributes(this.nativeView, this.style);
    };
    DropDown.prototype[drop_down_common_1.paddingTopProperty.setNative] = function (value) {
        this._setPadding({ top: drop_down_common_1.layout.toDeviceIndependentPixels(this.effectivePaddingTop) });
    };
    DropDown.prototype[drop_down_common_1.paddingRightProperty.setNative] = function (value) {
        this._setPadding({ right: drop_down_common_1.layout.toDeviceIndependentPixels(this.effectivePaddingRight) });
    };
    DropDown.prototype[drop_down_common_1.paddingBottomProperty.setNative] = function (value) {
        this._setPadding({ bottom: drop_down_common_1.layout.toDeviceIndependentPixels(this.effectivePaddingBottom) });
    };
    DropDown.prototype[drop_down_common_1.paddingLeftProperty.setNative] = function (value) {
        this._setPadding({ left: drop_down_common_1.layout.toDeviceIndependentPixels(this.effectivePaddingLeft) });
    };
    DropDown.prototype._setPadding = function (newPadding) {
        var nativeView = this.nativeView;
        var padding = nativeView.padding;
        nativeView.padding = Object.assign(padding, newPadding);
    };
    DropDown.prototype._showHideAccessoryView = function () {
        this.ios.inputAccessoryView = (this._accessoryViewVisible ? this._toolbar : null);
    };
    return DropDown;
}(drop_down_common_1.DropDownBase));
exports.DropDown = DropDown;
var TapHandler = TapHandler_1 = (function (_super) {
    __extends(TapHandler, _super);
    function TapHandler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TapHandler.initWithOwner = function (owner) {
        var tapHandler = TapHandler_1.new();
        tapHandler._owner = owner;
        return tapHandler;
    };
    TapHandler.prototype.tap = function () {
        this._owner.get().close();
    };
    return TapHandler;
}(NSObject));
__decorate([
    ObjCMethod()
], TapHandler.prototype, "tap", null);
TapHandler = TapHandler_1 = __decorate([
    ObjCClass()
], TapHandler);
var DropDownListDataSource = DropDownListDataSource_1 = (function (_super) {
    __extends(DropDownListDataSource, _super);
    function DropDownListDataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropDownListDataSource.initWithOwner = function (owner) {
        var dataSource = DropDownListDataSource_1.new();
        dataSource._owner = owner;
        return dataSource;
    };
    DropDownListDataSource.prototype.numberOfComponentsInPickerView = function (pickerView) {
        return 1;
    };
    DropDownListDataSource.prototype.pickerViewNumberOfRowsInComponent = function (pickerView, component) {
        var owner = this._owner.get();
        return (owner && owner.items) ? owner.items.length : 0;
    };
    return DropDownListDataSource;
}(NSObject));
DropDownListDataSource = DropDownListDataSource_1 = __decorate([
    ObjCClass(UIPickerViewDataSource)
], DropDownListDataSource);
var DropDownListPickerDelegateImpl = DropDownListPickerDelegateImpl_1 = (function (_super) {
    __extends(DropDownListPickerDelegateImpl, _super);
    function DropDownListPickerDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropDownListPickerDelegateImpl.initWithOwner = function (owner) {
        var delegate = DropDownListPickerDelegateImpl_1.new();
        delegate._owner = owner;
        return delegate;
    };
    DropDownListPickerDelegateImpl.prototype.pickerViewViewForRowForComponentReusingView = function (pickerView, row, component, view) {
        var owner = this._owner.get();
        var style = owner.style;
        var label = TNSLabel.alloc().init();
        label.text = owner._getItemAsString(row);
        if (style.color) {
            label.textColor = style.color.ios;
        }
        label.padding = {
            top: utils.layout.toDeviceIndependentPixels(owner.effectivePaddingTop),
            right: utils.layout.toDeviceIndependentPixels(owner.effectivePaddingRight),
            bottom: utils.layout.toDeviceIndependentPixels(owner.effectivePaddingBottom),
            left: utils.layout.toDeviceIndependentPixels(owner.effectivePaddingLeft)
        };
        label.font = style.fontInternal.getUIFont(label.font);
        switch (style.textAlignment) {
            case "initial":
            case "left":
                label.textAlignment = 0;
                break;
            case "center":
                label.textAlignment = 1;
                break;
            case "right":
                label.textAlignment = 2;
                break;
        }
        _setTextAttributes(label, style);
        return label;
    };
    DropDownListPickerDelegateImpl.prototype.pickerViewDidSelectRowInComponent = function (pickerView, row, component) {
        var owner = this._owner.get();
        if (owner) {
            var oldIndex = owner.selectedIndex;
            owner.selectedIndex = row;
            if (row !== oldIndex) {
                owner.notify({
                    eventName: drop_down_common_1.DropDownBase.selectedIndexChangedEvent,
                    object: owner,
                    oldIndex: oldIndex,
                    newIndex: row
                });
            }
        }
    };
    return DropDownListPickerDelegateImpl;
}(NSObject));
DropDownListPickerDelegateImpl = DropDownListPickerDelegateImpl_1 = __decorate([
    ObjCClass(UIPickerViewDelegate)
], DropDownListPickerDelegateImpl);
var TNSDropDownLabel = TNSDropDownLabel_1 = (function (_super) {
    __extends(TNSDropDownLabel, _super);
    function TNSDropDownLabel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TNSDropDownLabel.initWithOwner = function (owner) {
        var label = TNSDropDownLabel_1.new();
        label._owner = owner;
        label._isInputViewOpened = false;
        label.color = utils.ios.getter(UIColor, UIColor.blackColor);
        label.text = " ";
        label.addGestureRecognizer(UITapGestureRecognizer.alloc().initWithTargetAction(label, "tap"));
        return label;
    };
    Object.defineProperty(TNSDropDownLabel.prototype, "inputView", {
        get: function () {
            return this._inputView;
        },
        set: function (value) {
            this._inputView = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "inputAccessoryView", {
        get: function () {
            return this._inputAccessoryView;
        },
        set: function (value) {
            this._inputAccessoryView = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "canBecomeFirstResponder", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "canResignFirstResponder", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "hint", {
        get: function () {
            return this._hint;
        },
        set: function (value) {
            var owner = this._owner.get();
            this._hint = value;
            if (!this._hasText) {
                this.text = value;
                _setTextAttributes(owner.nativeView, owner.style);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TNSDropDownLabel.prototype, "color", {
        get: function () {
            return this._internalColor;
        },
        set: function (value) {
            this._internalColor = value;
            this._refreshColor();
        },
        enumerable: true,
        configurable: true
    });
    TNSDropDownLabel.prototype.setText = function (value) {
        var actualText = value || this._hint || "";
        var owner = this._owner.get();
        this._hasText = !types.isNullOrUndefined(value) && value !== "";
        this.text = (actualText === "" ? " " : actualText);
        this._refreshColor();
        _setTextAttributes(owner.nativeView, owner.style);
    };
    TNSDropDownLabel.prototype.becomeFirstResponder = function () {
        var result = _super.prototype.becomeFirstResponder.call(this);
        if (result) {
            if (!this._isInputViewOpened) {
                var owner = this._owner.get();
                owner.notify({
                    eventName: drop_down_common_1.DropDownBase.openedEvent,
                    object: owner
                });
            }
            this._isInputViewOpened = true;
        }
        return result;
    };
    TNSDropDownLabel.prototype.resignFirstResponder = function () {
        var result = _super.prototype.resignFirstResponder.call(this);
        var owner = this._owner.get();
        if (result) {
            this._isInputViewOpened = false;
            owner.notify({
                eventName: drop_down_common_1.DropDownBase.closedEvent,
                object: owner
            });
        }
        return result;
    };
    TNSDropDownLabel.prototype.tap = function (sender) {
        if (sender.state === 3) {
            var owner = this._owner.get();
            if (owner.isEnabled) {
                this.becomeFirstResponder();
            }
        }
    };
    TNSDropDownLabel.prototype._refreshColor = function () {
        this.textColor = (this._hasText && this._internalColor ? this._internalColor : HINT_COLOR.ios);
    };
    return TNSDropDownLabel;
}(TNSLabel));
__decorate([
    ObjCMethod(),
    __param(0, ObjCParam(UITapGestureRecognizer))
], TNSDropDownLabel.prototype, "tap", null);
TNSDropDownLabel = TNSDropDownLabel_1 = __decorate([
    ObjCClass()
], TNSDropDownLabel);
function _setTextAttributes(nativeView, style) {
    var attributes = new Map();
    switch (style.textDecoration) {
        case "none":
            break;
        case "underline":
            attributes.set(NSUnderlineStyleAttributeName, 1);
            break;
        case "line-through":
            attributes.set(NSStrikethroughStyleAttributeName, 1);
            break;
        case "underline line-through":
            attributes.set(NSUnderlineStyleAttributeName, 1);
            attributes.set(NSStrikethroughStyleAttributeName, 1);
            break;
    }
    if (style.letterSpacing !== 0) {
        attributes.set(NSKernAttributeName, style.letterSpacing * nativeView.font.pointSize);
    }
    if (nativeView.textColor && attributes.size > 0) {
        attributes.set(NSForegroundColorAttributeName, nativeView.textColor);
    }
    var text = types.isNullOrUndefined(nativeView.text) ? "" : nativeView.text.toString();
    var sourceString;
    switch (style.textTransform) {
        case "uppercase":
            sourceString = NSString.stringWithString(text).uppercaseString;
            break;
        case "lowercase":
            sourceString = NSString.stringWithString(text).lowercaseString;
            break;
        case "capitalize":
            sourceString = NSString.stringWithString(text).capitalizedString;
            break;
        default:
            sourceString = text;
    }
    if (attributes.size > 0) {
        var result = NSMutableAttributedString.alloc().initWithString(sourceString);
        result.setAttributesRange(attributes, { location: 0, length: sourceString.length });
        nativeView.attributedText = result;
    }
    else {
        nativeView.attributedText = undefined;
        nativeView.text = sourceString;
    }
}
var TapHandler_1, DropDownListDataSource_1, DropDownListPickerDelegateImpl_1, TNSDropDownLabel_1;
