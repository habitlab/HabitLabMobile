"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var observable_array_1 = require("data/observable-array");
var view_1 = require("ui/core/view");
var types = require("utils/types");
__export(require("ui/core/view"));
var DropDownBase = (function (_super) {
    __extends(DropDownBase, _super);
    function DropDownBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DropDownBase.prototype._getItemAsString = function (index) {
        var items = this.items;
        if (!items) {
            return " ";
        }
        if (types.isNullOrUndefined(index)) {
            return null;
        }
        if (this.isValueListIn) {
            return items.getDisplay(index);
        }
        var item = this.isItemsSourceIn ? this.items.getItem(index) : this.items[index];
        return (item === undefined || item === null) ? index + "" : item + "";
    };
    return DropDownBase;
}(view_1.View));
DropDownBase.openedEvent = "opened";
DropDownBase.closedEvent = "closed";
DropDownBase.selectedIndexChangedEvent = "selectedIndexChanged";
exports.DropDownBase = DropDownBase;
var ValueList = (function (_super) {
    __extends(ValueList, _super);
    function ValueList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ValueList.prototype.getDisplay = function (index) {
        if (types.isNullOrUndefined(index)) {
            return null;
        }
        if (index < 0 || index >= this.length) {
            return "";
        }
        return this._array[index].display;
    };
    ValueList.prototype.getValue = function (index) {
        if (types.isNullOrUndefined(index) || index < 0 || index >= this.length) {
            return null;
        }
        return this._array[index].value;
    };
    ValueList.prototype.getIndex = function (value) {
        var loop;
        for (loop = 0; loop < this.length; loop++) {
            if (this.getValue(loop) === value) {
                return loop;
            }
        }
        return null;
    };
    return ValueList;
}(observable_array_1.ObservableArray));
exports.ValueList = ValueList;
exports.selectedIndexProperty = new view_1.CoercibleProperty({
    name: "selectedIndex",
    defaultValue: null,
    valueConverter: function (v) {
        if (v === undefined || v === null) {
            return null;
        }
        return parseInt(v, 10);
    },
    coerceValue: function (target, value) {
        var items = target.items;
        if (items && items.length !== 0) {
            var max = items.length - 1;
            if (value < 0) {
                value = 0;
            }
            if (value > max) {
                value = max;
            }
        }
        else {
            value = null;
        }
        return value;
    }
});
exports.selectedIndexProperty.register(DropDownBase);
exports.itemsProperty = new view_1.Property({
    name: "items",
    valueChanged: function (target, oldValue, newValue) {
        var getItem = newValue && newValue.getItem;
        var getDisplay = newValue && newValue.getDisplay;
        target.isItemsSourceIn = typeof getItem === "function";
        target.isValueListIn = typeof getDisplay === "function";
    }
});
exports.itemsProperty.register(DropDownBase);
exports.hintProperty = new view_1.Property({
    name: "hint",
    defaultValue: ""
});
exports.hintProperty.register(DropDownBase);
