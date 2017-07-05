"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var nativescript_angular_1 = require("nativescript-angular");
nativescript_angular_1.registerElement("DropDown", function () { return require("../drop-down").DropDown; });
var SELECTED_INDEX_VALUE_ACCESSOR = { provide: forms_1.NG_VALUE_ACCESSOR,
    useExisting: core_1.forwardRef(function () { return SelectedIndexValueAccessor; }), multi: true };
var SelectedIndexValueAccessor = (function (_super) {
    __extends(SelectedIndexValueAccessor, _super);
    function SelectedIndexValueAccessor(elementRef) {
        var _this = _super.call(this, elementRef.nativeElement) || this;
        _this.onTouched = function () { };
        return _this;
    }
    SelectedIndexValueAccessor.prototype.selectedIndexChangeListener = function (event) {
        this.onChange(event.value);
    };
    SelectedIndexValueAccessor.prototype.writeValue = function (value) {
        if (value === undefined || value === null || value === "") {
            this._normalizedValue = null;
        }
        else {
            this._normalizedValue = value;
        }
        if (this.viewInitialized) {
            this.view.selectedIndex = this._normalizedValue;
        }
    };
    SelectedIndexValueAccessor.prototype.ngAfterViewInit = function () {
        this.viewInitialized = true;
        this.view.selectedIndex = this._normalizedValue;
    };
    SelectedIndexValueAccessor.prototype.registerOnTouched = function (fn) { this.onTouched = fn; };
    return SelectedIndexValueAccessor;
}(nativescript_angular_1.BaseValueAccessor));
__decorate([
    core_1.HostListener("selectedIndexChange", ["$event"])
], SelectedIndexValueAccessor.prototype, "selectedIndexChangeListener", null);
SelectedIndexValueAccessor = __decorate([
    core_1.Directive({
        selector: "DropDown[ngModel], DropDown[formControlName], dropDown[ngModel], dropDown[formControlName], drop-down[ngModel], drop-down[formControlName]",
        providers: [SELECTED_INDEX_VALUE_ACCESSOR]
    }),
    __param(0, core_1.Inject(core_1.ElementRef))
], SelectedIndexValueAccessor);
exports.SelectedIndexValueAccessor = SelectedIndexValueAccessor;
var DropDownModule = (function () {
    function DropDownModule() {
    }
    return DropDownModule;
}());
DropDownModule = __decorate([
    core_1.NgModule({
        declarations: [SelectedIndexValueAccessor],
        providers: [],
        imports: [
            forms_1.FormsModule
        ],
        exports: [
            forms_1.FormsModule,
            SelectedIndexValueAccessor
        ]
    })
], DropDownModule);
exports.DropDownModule = DropDownModule;
