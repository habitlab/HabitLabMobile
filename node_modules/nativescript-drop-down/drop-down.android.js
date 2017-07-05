"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = require("color");
var label_1 = require("ui/label");
var stack_layout_1 = require("ui/layouts/stack-layout");
var text_base_1 = require("ui/text-base");
var types = require("utils/types");
var drop_down_common_1 = require("./drop-down-common");
__export(require("./drop-down-common"));
var LABELVIEWID = "spinner-label";
var DropDown = (function (_super) {
    __extends(DropDown, _super);
    function DropDown() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._realizedItems = [
            new Map(),
            new Map()
        ];
        return _this;
    }
    DropDown.prototype.createNativeView = function () {
        var spinner = new TNSSpinner(new WeakRef(this));
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        spinner.setId(this._androidViewId);
        var adapter = new DropDownAdapter(new WeakRef(this));
        spinner.setAdapter(adapter);
        spinner.adapter = adapter;
        var itemSelectedListener = new DropDownItemSelectedListener(new WeakRef(this));
        spinner.setOnItemSelectedListener(itemSelectedListener);
        spinner.itemSelectedListener = itemSelectedListener;
        return spinner;
    };
    DropDown.prototype.initNativeView = function () {
        _super.prototype.initNativeView.call(this);
        var nativeView = this.nativeView;
        nativeView.adapter.owner = new WeakRef(this);
        nativeView.itemSelectedListener.owner = new WeakRef(this);
        if (!types.isNullOrUndefined(this.selectedIndex)) {
            this.android.setSelection(this.selectedIndex + 1);
        }
    };
    DropDown.prototype.disposeNativeView = function () {
        var nativeView = this.nativeView;
        nativeView.adapter.owner = null;
        nativeView.itemSelectedListener.owner = null;
        this._clearCache(1);
        this._clearCache(0);
        _super.prototype.disposeNativeView.call(this);
    };
    Object.defineProperty(DropDown.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    DropDown.prototype.open = function () {
        if (this.isEnabled) {
            this.nativeView.performClick();
        }
    };
    DropDown.prototype.close = function () {
        this.nativeView.onDetachedFromWindow();
    };
    DropDown.prototype[drop_down_common_1.selectedIndexProperty.getDefault] = function () {
        return null;
    };
    DropDown.prototype[drop_down_common_1.selectedIndexProperty.setNative] = function (value) {
        this._clearCache(1);
        var actualIndex = (types.isNullOrUndefined(value) ? 0 : value + 1);
        this.nativeView.setSelection(actualIndex);
    };
    DropDown.prototype[drop_down_common_1.itemsProperty.getDefault] = function () {
        return null;
    };
    DropDown.prototype[drop_down_common_1.itemsProperty.setNative] = function (value) {
        this._updateSelectedIndexOnItemsPropertyChanged(value);
        this.android.getAdapter().notifyDataSetChanged();
        drop_down_common_1.selectedIndexProperty.coerce(this);
    };
    DropDown.prototype[drop_down_common_1.hintProperty.getDefault] = function () {
        return "";
    };
    DropDown.prototype[drop_down_common_1.hintProperty.setNative] = function (value) {
        this.android.getAdapter().notifyDataSetChanged();
    };
    DropDown.prototype[text_base_1.textDecorationProperty.getDefault] = function () {
        return "none";
    };
    DropDown.prototype[text_base_1.textDecorationProperty.setNative] = function (value) {
        this._propagateStylePropertyToRealizedViews("textDecoration", value, true);
    };
    DropDown.prototype[text_base_1.textAlignmentProperty.getDefault] = function () {
        return "left";
    };
    DropDown.prototype[text_base_1.textAlignmentProperty.setNative] = function (value) {
        this._propagateStylePropertyToRealizedViews("textAlignment", value, true);
    };
    DropDown.prototype[text_base_1.fontInternalProperty.setNative] = function (value) {
        this._propagateStylePropertyToRealizedViews("fontInternal", value, true);
    };
    DropDown.prototype[text_base_1.fontSizeProperty.setNative] = function (value) {
        if (!types.isNullOrUndefined(value)) {
            this._propagateStylePropertyToRealizedViews("fontSize", value, true);
        }
    };
    DropDown.prototype[drop_down_common_1.backgroundColorProperty.setNative] = function (value) {
        this._propagateStylePropertyToRealizedViews("backgroundColor", value, true);
    };
    DropDown.prototype[drop_down_common_1.colorProperty.setNative] = function (value) {
        if (!types.isNullOrUndefined(value)) {
            this._propagateStylePropertyToRealizedViews("color", value, false);
        }
    };
    DropDown.prototype._getRealizedView = function (convertView, realizedViewType) {
        if (!convertView) {
            var view = new label_1.Label();
            var layout = new stack_layout_1.StackLayout();
            layout.style.horizontalAlignment = "stretch";
            view.id = LABELVIEWID;
            layout.addChild(view);
            return layout;
        }
        return this._realizedItems[realizedViewType].get(convertView);
    };
    DropDown.prototype._propagateStylePropertyToRealizedViews = function (property, value, isIncludeHintIn) {
        if (isIncludeHintIn === void 0) { isIncludeHintIn = true; }
        var realizedItems = this._realizedItems;
        for (var _i = 0, realizedItems_1 = realizedItems; _i < realizedItems_1.length; _i++) {
            var item = realizedItems_1[_i];
            item.forEach(function (view) {
                if (isIncludeHintIn || !view.isHintViewIn) {
                    if (property === "textAlignment" || property === "textDecoration"
                        || property === "fontInternal" || property === "fontSize"
                        || property === "color") {
                        var label = view.getViewById(LABELVIEWID);
                        label.style[property] = value;
                    }
                    else {
                        view.style[property] = value;
                    }
                }
            });
        }
    };
    DropDown.prototype._updateSelectedIndexOnItemsPropertyChanged = function (newItems) {
        var newItemsCount = 0;
        if (newItems && newItems.length) {
            newItemsCount = newItems.length;
        }
        if (newItemsCount === 0 || this.selectedIndex >= newItemsCount) {
            this.selectedIndex = null;
        }
    };
    DropDown.prototype._clearCache = function (realizedViewType) {
        var realizedItems = this._realizedItems[realizedViewType];
        realizedItems.forEach(function (view) {
            if (view.parent) {
                view.parent._removeView(view);
            }
        });
        realizedItems.clear();
    };
    return DropDown;
}(drop_down_common_1.DropDownBase));
exports.DropDown = DropDown;
var TNSSpinner = (function (_super) {
    __extends(TNSSpinner, _super);
    function TNSSpinner(owner) {
        var _this = _super.call(this, owner.get()._context) || this;
        _this.owner = owner;
        _this._isOpenedIn = false;
        return global.__native(_this);
    }
    TNSSpinner.prototype.performClick = function () {
        var owner = this.owner.get();
        this._isOpenedIn = true;
        owner.notify({
            eventName: drop_down_common_1.DropDownBase.openedEvent,
            object: owner
        });
        return _super.prototype.performClick.call(this);
    };
    TNSSpinner.prototype.onWindowFocusChanged = function (hasWindowFocus) {
        _super.prototype.onWindowFocusChanged.call(this, hasWindowFocus);
        if (this._isOpenedIn && hasWindowFocus) {
            var owner = this.owner.get();
            owner.notify({
                eventName: drop_down_common_1.DropDownBase.closedEvent,
                object: owner
            });
        }
    };
    TNSSpinner.prototype.onDetachedFromWindow = function () {
        _super.prototype.onDetachedFromWindow.call(this);
    };
    return TNSSpinner;
}(android.widget.Spinner));
var DropDownAdapter = (function (_super) {
    __extends(DropDownAdapter, _super);
    function DropDownAdapter(owner) {
        var _this = _super.call(this) || this;
        _this.owner = owner;
        return global.__native(_this);
    }
    DropDownAdapter.prototype.isEnabled = function (i) {
        return i !== 0;
    };
    DropDownAdapter.prototype.getCount = function () {
        var owner = this.owner.get();
        return (owner && owner.items ? owner.items.length : 0) + 1;
    };
    DropDownAdapter.prototype.getItem = function (i) {
        var owner = this.owner.get();
        if (i === 0) {
            return owner.hint;
        }
        var realIndex = i - 1;
        return owner._getItemAsString(realIndex);
    };
    DropDownAdapter.prototype.getItemId = function (i) {
        return long(i);
    };
    DropDownAdapter.prototype.hasStableIds = function () {
        return true;
    };
    DropDownAdapter.prototype.getView = function (index, convertView, parent) {
        return this._generateView(index, convertView, parent, 0);
    };
    DropDownAdapter.prototype.getDropDownView = function (index, convertView, parent) {
        return this._generateView(index, convertView, parent, 1);
    };
    DropDownAdapter.prototype._generateView = function (index, convertView, parent, realizedViewType) {
        var owner = this.owner.get();
        if (!owner) {
            return null;
        }
        var view = owner._getRealizedView(convertView, realizedViewType);
        if (view) {
            if (!view.parent) {
                owner._addView(view);
                convertView = view.android;
            }
            var label = view.getViewById(LABELVIEWID);
            label.text = this.getItem(index);
            label.style.color = owner.style.color;
            label.style.textDecoration = owner.style.textDecoration;
            label.style.textAlignment = owner.style.textAlignment;
            label.style.fontInternal = owner.style.fontInternal;
            if (owner.style.fontSize) {
                label.style.fontSize = owner.style.fontSize;
            }
            view.style.backgroundColor = owner.style.backgroundColor;
            view.style.padding = owner.style.padding;
            view.style.height = owner.style.height;
            if (realizedViewType === 1) {
                view.style.opacity = owner.style.opacity;
            }
            view.isHintViewIn = false;
            if (index === 0) {
                view.color = new color_1.Color(255, 148, 150, 148);
                view.isHintViewIn = true;
                if (realizedViewType === 1
                    && (types.isNullOrUndefined(owner.hint) || owner.hint === "")) {
                    view.height = 1;
                }
            }
            owner._realizedItems[realizedViewType].set(convertView, view);
        }
        return convertView;
    };
    return DropDownAdapter;
}(android.widget.BaseAdapter));
var DropDownItemSelectedListener = (function (_super) {
    __extends(DropDownItemSelectedListener, _super);
    function DropDownItemSelectedListener(owner) {
        var _this = _super.call(this) || this;
        _this.owner = owner;
        return global.__native(_this);
    }
    DropDownItemSelectedListener.prototype.onItemSelected = function (parent, convertView, index, id) {
        var owner = this.owner.get();
        var oldIndex = owner.selectedIndex;
        var newIndex = (index === 0 ? null : index - 1);
        owner.selectedIndex = newIndex;
        if (newIndex !== oldIndex) {
            owner.notify({
                eventName: drop_down_common_1.DropDownBase.selectedIndexChangedEvent,
                object: owner,
                oldIndex: oldIndex,
                newIndex: newIndex
            });
        }
    };
    DropDownItemSelectedListener.prototype.onNothingSelected = function () {
    };
    return DropDownItemSelectedListener;
}(java.lang.Object));
DropDownItemSelectedListener = __decorate([
    Interfaces([android.widget.AdapterView.OnItemSelectedListener])
], DropDownItemSelectedListener);
