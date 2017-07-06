Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var element_registry_1 = require("nativescript-angular/element-registry");
var _1 = require("./../");
var layout_base_1 = require("tns-core-modules/ui/layouts/layout-base");
var observable_array_1 = require("tns-core-modules/data/observable-array");
var ListItemContext = (function (_super) {
    __extends(ListItemContext, _super);
    function ListItemContext($implicit, item, index, even, odd) {
        var _this = _super.call(this, item) || this;
        _this.$implicit = $implicit;
        _this.item = item;
        _this.index = index;
        _this.even = even;
        _this.odd = odd;
        return _this;
    }
    return ListItemContext;
}(core_1.ElementRef));
exports.ListItemContext = ListItemContext;
var NG_VIEW = "ng_view";
var RadListViewComponent = (function () {
    function RadListViewComponent(_elementRef, _iterableDiffers, _cdr, loader) {
        var _this = this;
        this._elementRef = _elementRef;
        this._iterableDiffers = _iterableDiffers;
        this._cdr = _cdr;
        this.loader = loader;
        this._itemReordering = false;
        this.doCheckDelay = 5;
        this.setupItemView = new core_1.EventEmitter();
        this._listView = _elementRef.nativeElement;
        // We should consider setting this default value in the RadListView constructor.
        this._listView.listViewLayout = new _1.ListViewLinearLayout();
        var component = this;
        this._listView.itemViewLoader = function (viewType) {
            switch (viewType) {
                case _1.ListViewViewTypes.ItemView:
                    if (component._itemTemplate && _this.loader) {
                        var nativeItem = _this.loader.createEmbeddedView(component._itemTemplate, new ListItemContext(), 0);
                        var typedView = getItemViewRoot(nativeItem);
                        typedView[NG_VIEW] = nativeItem;
                        return typedView;
                    }
                    break;
                case _1.ListViewViewTypes.ItemSwipeView:
                    if (component._itemSwipeTemplate && _this.loader) {
                        var nativeItem = _this.loader.createEmbeddedView(component._itemSwipeTemplate, new ListItemContext(), 0);
                        var typedView = getItemViewRoot(nativeItem);
                        typedView[NG_VIEW] = nativeItem;
                        return typedView;
                    }
                    break;
                case _1.ListViewViewTypes.LoadOnDemandView:
                    if (component._loadOnDemandTemplate && _this.loader) {
                        var viewRef = _this.loader.createEmbeddedView(component._loadOnDemandTemplate, new ListItemContext(), 0);
                        _this.detectChangesOnChild(viewRef, -1);
                        var nativeView = getItemViewRoot(viewRef);
                        nativeView[NG_VIEW] = viewRef;
                        return nativeView;
                    }
                    break;
                case _1.ListViewViewTypes.HeaderView:
                    if (component._headerTemplate && _this.loader) {
                        var viewRef = _this.loader.createEmbeddedView(component._headerTemplate, new ListItemContext(), 0);
                        _this.detectChangesOnChild(viewRef, -1);
                        var nativeView = getItemViewRoot(viewRef);
                        nativeView[NG_VIEW] = viewRef;
                        return nativeView;
                    }
                    break;
                case _1.ListViewViewTypes.FooterView:
                    if (component._footerTemplate && _this.loader) {
                        var viewRef = _this.loader.createEmbeddedView(component._footerTemplate, new ListItemContext(), 0);
                        _this.detectChangesOnChild(viewRef, -1);
                        var nativeView = getItemViewRoot(viewRef);
                        nativeView[NG_VIEW] = viewRef;
                        return nativeView;
                    }
                    break;
            }
        };
    }
    RadListViewComponent.prototype.ngAfterContentInit = function () {
        this.setItemTemplates();
    };
    Object.defineProperty(RadListViewComponent.prototype, "nativeElement", {
        get: function () {
            return this._listView;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadListViewComponent.prototype, "listView", {
        get: function () {
            return this._listView;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadListViewComponent.prototype, "loadOnDemandTemplate", {
        set: function (value) {
            this._loadOnDemandTemplate = value;
            this._listView.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadListViewComponent.prototype, "headerTemplate", {
        set: function (value) {
            this._headerTemplate = value;
            if (this._listView.ios) {
                this._listView['_updateHeaderFooterAvailability']();
            }
            else if (this._listView.android) {
                this._listView['_updateHeaderFooter']();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadListViewComponent.prototype, "footerTemplate", {
        set: function (value) {
            this._footerTemplate = value;
            if (this._listView.ios) {
                this._listView['_updateHeaderFooterAvailability']();
            }
            else if (this._listView.android) {
                this._listView['_updateHeaderFooter']();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadListViewComponent.prototype, "itemTemplate", {
        set: function (value) {
            this._itemTemplate = value;
            this._listView.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadListViewComponent.prototype, "itemSwipeTemplate", {
        set: function (value) {
            this._itemSwipeTemplate = value;
            this._listView.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(RadListViewComponent.prototype, "items", {
        set: function (value) {
            this._items = value;
            var needDiffer = true;
            if (value instanceof observable_array_1.ObservableArray) {
                needDiffer = false;
            }
            if (needDiffer && !this._differ && CollectionUtils.isListLikeIterable(value)) {
                this._differ = this._iterableDiffers.find(this._items).create(this._cdr, function (index, item) { return item; });
            }
            this._listView.items = this._items;
        },
        enumerable: true,
        configurable: true
    });
    RadListViewComponent.prototype.ngDoCheck = function () {
        if (this._differ) {
            var changes = this._differ.diff(this._items);
            if (changes) {
                this._listView.refresh();
            }
        }
    };
    RadListViewComponent.prototype.onItemLoading = function (args) {
        var index = args.index;
        var currentItem = this.getDataItem(index);
        var ngView = args.view[NG_VIEW];
        if (ngView) {
            this.setupViewRef(ngView, currentItem, index);
            this.detectChangesOnChild(ngView, index);
        }
    };
    RadListViewComponent.prototype.setupViewRef = function (viewRef, data, index) {
        var context = viewRef.context;
        context.$implicit = data;
        context.item = data;
        context.index = index;
        context.even = (index % 2 == 0);
        context.odd = !context.even;
        this.setupItemView.next({ view: viewRef, data: data, index: index, context: context });
    };
    RadListViewComponent.prototype.setLayout = function (layout) {
        this._listView.listViewLayout = layout;
    };
    RadListViewComponent.prototype.getDataItem = function (index) {
        return typeof (this._items.getItem) === "function" ? this._items.getItem(index) : this._items[index];
    };
    RadListViewComponent.prototype.detectChangesOnChild = function (viewRef, index) {
        // Manually detect changes in child view ref
        // TODO: Is there a better way of getting viewRef's change detector
        var childChangeDetector = viewRef;
        childChangeDetector.markForCheck();
        childChangeDetector.detectChanges();
    };
    RadListViewComponent.prototype.setItemTemplates = function () {
        // The itemTemplateQuery may be changed after list items are added that contain <template> inside,
        // so cache and use only the original template to avoid errors.
        this.itemTemplate = this.itemTemplateQuery;
        if (this._templateMap) {
            var templates_1 = [];
            this._templateMap.forEach(function (value) {
                templates_1.push(value);
            });
            this.listView.itemTemplates = templates_1;
        }
    };
    RadListViewComponent.prototype.registerTemplate = function (key, template) {
        var _this = this;
        if (!this._templateMap) {
            this._templateMap = new Map();
        }
        var keyedTemplate = {
            key: key,
            createView: function () {
                var viewRef = _this.loader.createEmbeddedView(template, new ListItemContext(), 0);
                var resultView = getItemViewRoot(viewRef);
                resultView[NG_VIEW] = viewRef;
                return resultView;
            }
        };
        this._templateMap.set(key, keyedTemplate);
    };
    return RadListViewComponent;
}());
RadListViewComponent.decorators = [
    { type: core_1.Component, args: [{
                selector: "RadListView",
                template: ""
            },] },
];
/** @nocollapse */
RadListViewComponent.ctorParameters = function () { return [
    { type: core_1.ElementRef, decorators: [{ type: core_1.Inject, args: [core_1.ElementRef,] },] },
    { type: core_1.IterableDiffers, decorators: [{ type: core_1.Inject, args: [core_1.IterableDiffers,] },] },
    { type: core_1.ChangeDetectorRef, decorators: [{ type: core_1.Inject, args: [core_1.ChangeDetectorRef,] },] },
    { type: core_1.ViewContainerRef, decorators: [{ type: core_1.Inject, args: [core_1.ViewContainerRef,] },] },
]; };
RadListViewComponent.propDecorators = {
    'setupItemView': [{ type: core_1.Output },],
    'itemTemplateQuery': [{ type: core_1.ContentChild, args: [core_1.TemplateRef,] },],
    'items': [{ type: core_1.Input },],
    'onItemLoading': [{ type: core_1.HostListener, args: ["itemLoading", ['$event'],] },],
};
exports.RadListViewComponent = RadListViewComponent;
var ListViewLinearLayoutDirective = (function () {
    function ListViewLinearLayoutDirective() {
    }
    return ListViewLinearLayoutDirective;
}());
ListViewLinearLayoutDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "ListViewLinearLayout"
            },] },
];
/** @nocollapse */
ListViewLinearLayoutDirective.ctorParameters = function () { return []; };
exports.ListViewLinearLayoutDirective = ListViewLinearLayoutDirective;
var ListViewGridLayoutDirective = (function () {
    function ListViewGridLayoutDirective() {
    }
    return ListViewGridLayoutDirective;
}());
ListViewGridLayoutDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "ListViewGridLayout"
            },] },
];
/** @nocollapse */
ListViewGridLayoutDirective.ctorParameters = function () { return []; };
exports.ListViewGridLayoutDirective = ListViewGridLayoutDirective;
var ListViewStaggeredLayoutDirective = (function () {
    function ListViewStaggeredLayoutDirective() {
    }
    return ListViewStaggeredLayoutDirective;
}());
ListViewStaggeredLayoutDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "ListViewStaggeredLayout"
            },] },
];
/** @nocollapse */
ListViewStaggeredLayoutDirective.ctorParameters = function () { return []; };
exports.ListViewStaggeredLayoutDirective = ListViewStaggeredLayoutDirective;
var ReorderHandleDirective = (function () {
    function ReorderHandleDirective() {
    }
    return ReorderHandleDirective;
}());
ReorderHandleDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "ReorderHandle"
            },] },
];
/** @nocollapse */
ReorderHandleDirective.ctorParameters = function () { return []; };
exports.ReorderHandleDirective = ReorderHandleDirective;
var TKListViewHeaderDirective = (function () {
    function TKListViewHeaderDirective(owner, template) {
        this.owner = owner;
        this.template = template;
    }
    TKListViewHeaderDirective.prototype.ngOnInit = function () {
        this.owner.headerTemplate = this.template;
    };
    return TKListViewHeaderDirective;
}());
TKListViewHeaderDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkListViewHeader]"
            },] },
];
/** @nocollapse */
TKListViewHeaderDirective.ctorParameters = function () { return [
    { type: RadListViewComponent, decorators: [{ type: core_1.Inject, args: [RadListViewComponent,] },] },
    { type: core_1.TemplateRef, decorators: [{ type: core_1.Inject, args: [core_1.TemplateRef,] },] },
]; };
exports.TKListViewHeaderDirective = TKListViewHeaderDirective;
var TKListViewFooterDirective = (function () {
    function TKListViewFooterDirective(owner, template) {
        this.owner = owner;
        this.template = template;
    }
    TKListViewFooterDirective.prototype.ngOnInit = function () {
        this.owner.footerTemplate = this.template;
    };
    return TKListViewFooterDirective;
}());
TKListViewFooterDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkListViewFooter]"
            },] },
];
/** @nocollapse */
TKListViewFooterDirective.ctorParameters = function () { return [
    { type: RadListViewComponent, decorators: [{ type: core_1.Inject, args: [RadListViewComponent,] },] },
    { type: core_1.TemplateRef, decorators: [{ type: core_1.Inject, args: [core_1.TemplateRef,] },] },
]; };
exports.TKListViewFooterDirective = TKListViewFooterDirective;
var TKListViewItemSwipeDirective = (function () {
    function TKListViewItemSwipeDirective(owner, template) {
        this.owner = owner;
        this.template = template;
    }
    TKListViewItemSwipeDirective.prototype.ngOnInit = function () {
        this.owner.itemSwipeTemplate = this.template;
    };
    return TKListViewItemSwipeDirective;
}());
TKListViewItemSwipeDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkListItemSwipeTemplate]"
            },] },
];
/** @nocollapse */
TKListViewItemSwipeDirective.ctorParameters = function () { return [
    { type: RadListViewComponent, decorators: [{ type: core_1.Inject, args: [RadListViewComponent,] },] },
    { type: core_1.TemplateRef, decorators: [{ type: core_1.Inject, args: [core_1.TemplateRef,] },] },
]; };
exports.TKListViewItemSwipeDirective = TKListViewItemSwipeDirective;
var TKListViewItemDirective = (function () {
    function TKListViewItemDirective(owner, template) {
        this.owner = owner;
        this.template = template;
    }
    TKListViewItemDirective.prototype.ngOnInit = function () {
        this.owner.itemTemplate = this.template;
    };
    return TKListViewItemDirective;
}());
TKListViewItemDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkListItemTemplate]"
            },] },
];
/** @nocollapse */
TKListViewItemDirective.ctorParameters = function () { return [
    { type: RadListViewComponent, decorators: [{ type: core_1.Inject, args: [RadListViewComponent,] },] },
    { type: core_1.TemplateRef, decorators: [{ type: core_1.Inject, args: [core_1.TemplateRef,] },] },
]; };
exports.TKListViewItemDirective = TKListViewItemDirective;
var TKTemplateKeyDirective = (function () {
    function TKTemplateKeyDirective(templateRef, owner) {
        this.templateRef = templateRef;
        this.owner = owner;
    }
    Object.defineProperty(TKTemplateKeyDirective.prototype, "tkTemplateKey", {
        set: function (value) {
            if (this.owner && this.templateRef) {
                this.owner.registerTemplate(value, this.templateRef);
            }
        },
        enumerable: true,
        configurable: true
    });
    return TKTemplateKeyDirective;
}());
TKTemplateKeyDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkTemplateKey]"
            },] },
];
/** @nocollapse */
TKTemplateKeyDirective.ctorParameters = function () { return [
    { type: core_1.TemplateRef, },
    { type: RadListViewComponent, decorators: [{ type: core_1.Host },] },
]; };
TKTemplateKeyDirective.propDecorators = {
    'tkTemplateKey': [{ type: core_1.Input },],
};
exports.TKTemplateKeyDirective = TKTemplateKeyDirective;
var TKListViewLoadOnDemandDirective = (function () {
    function TKListViewLoadOnDemandDirective(owner, template) {
        this.owner = owner;
        this.template = template;
    }
    TKListViewLoadOnDemandDirective.prototype.ngOnInit = function () {
        this.owner.loadOnDemandTemplate = this.template;
    };
    return TKListViewLoadOnDemandDirective;
}());
TKListViewLoadOnDemandDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkListLoadOnDemandTemplate]"
            },] },
];
/** @nocollapse */
TKListViewLoadOnDemandDirective.ctorParameters = function () { return [
    { type: RadListViewComponent, decorators: [{ type: core_1.Inject, args: [RadListViewComponent,] },] },
    { type: core_1.TemplateRef, decorators: [{ type: core_1.Inject, args: [core_1.TemplateRef,] },] },
]; };
exports.TKListViewLoadOnDemandDirective = TKListViewLoadOnDemandDirective;
var TKListViewLayoutDirective = (function () {
    function TKListViewLayoutDirective(owner, _elementRef) {
        this.owner = owner;
        this._elementRef = _elementRef;
    }
    TKListViewLayoutDirective.prototype.ngOnInit = function () {
        var layout = this._elementRef.nativeElement;
        this.owner.setLayout(layout);
    };
    return TKListViewLayoutDirective;
}());
TKListViewLayoutDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: "[tkListViewLayout]"
            },] },
];
/** @nocollapse */
TKListViewLayoutDirective.ctorParameters = function () { return [
    { type: RadListViewComponent, decorators: [{ type: core_1.Inject, args: [RadListViewComponent,] },] },
    { type: core_1.ElementRef, decorators: [{ type: core_1.Inject, args: [core_1.ElementRef,] },] },
]; };
exports.TKListViewLayoutDirective = TKListViewLayoutDirective;
function getSingleViewRecursive(nodes, nestLevel) {
    var actualNodes = nodes.filter(function (node) { return !(node instanceof element_registry_1.CommentNode); });
    if (actualNodes.length === 0) {
        throw new Error("No suitable views found in list template! Nesting level: " + nestLevel);
    }
    else if (actualNodes.length > 1) {
        throw new Error("More than one view found in list template! Nesting level: " + nestLevel);
    }
    else {
        if (actualNodes[0]) {
            var parentLayout = actualNodes[0].parent;
            if (parentLayout instanceof layout_base_1.LayoutBase) {
                parentLayout.removeChild(actualNodes[0]);
            }
            return actualNodes[0];
        }
        else {
            return getSingleViewRecursive(actualNodes[0].children, nestLevel + 1);
        }
    }
}
function getItemViewRoot(viewRef, rootLocator) {
    if (rootLocator === void 0) { rootLocator = getSingleViewRecursive; }
    return rootLocator(viewRef.rootNodes, 0);
}
exports.getItemViewRoot = getItemViewRoot;
////////////////////
// Copied from angular 2 @angular/common/src/facade/collection
var CollectionUtils;
(function (CollectionUtils) {
    function isPresent(obj) {
        return obj !== undefined && obj !== null;
    }
    function isBlank(obj) {
        return obj === undefined || obj === null;
    }
    var _symbolIterator = null;
    var globalScope;
    function getSymbolIterator() {
        if (isBlank(_symbolIterator)) {
            if (isPresent(globalScope.Symbol) && isPresent(Symbol.iterator)) {
                _symbolIterator = Symbol.iterator;
            }
            else {
                // es6-shim specific logic
                var keys = Object.getOwnPropertyNames(Map.prototype);
                for (var i = 0; i < keys.length; ++i) {
                    var key = keys[i];
                    if (key !== 'entries' && key !== 'size' &&
                        Map.prototype[key] === Map.prototype['entries']) {
                        _symbolIterator = key;
                    }
                }
            }
        }
        return _symbolIterator;
    }
    function isJsObject(o) {
        return o !== null && (typeof o === 'function' || typeof o === 'object');
    }
    function isArray(obj) {
        return Array.isArray(obj);
    }
    function isListLikeIterable(obj) {
        if (!isJsObject(obj))
            return false;
        return isArray(obj) ||
            (!(obj instanceof Map) &&
                getSymbolIterator() in obj); // JS Iterable have a Symbol.iterator prop
    }
    CollectionUtils.isListLikeIterable = isListLikeIterable;
})(CollectionUtils || (CollectionUtils = {}));
////////////////////
exports.LISTVIEW_DIRECTIVES = [RadListViewComponent, TKListViewItemDirective, TKListViewItemSwipeDirective, TKListViewHeaderDirective, TKListViewFooterDirective, TKListViewLoadOnDemandDirective, TKListViewLayoutDirective, ListViewGridLayoutDirective, ListViewStaggeredLayoutDirective, ReorderHandleDirective, ListViewLinearLayoutDirective, TKTemplateKeyDirective];
element_registry_1.registerElement("RadListView", function () { return _1.RadListView; });
element_registry_1.registerElement("ListViewLinearLayout", function () { return _1.ListViewLinearLayout; });
element_registry_1.registerElement("ListViewGridLayout", function () { return _1.ListViewGridLayout; });
element_registry_1.registerElement("ListViewStaggeredLayout", function () { return _1.ListViewStaggeredLayout; });
element_registry_1.registerElement("ReorderHandle", function () { return _1.ReorderHandle; });
var NativeScriptUIListViewModule = (function () {
    function NativeScriptUIListViewModule() {
    }
    return NativeScriptUIListViewModule;
}());
NativeScriptUIListViewModule.decorators = [
    { type: core_1.NgModule, args: [{
                declarations: [exports.LISTVIEW_DIRECTIVES],
                exports: [exports.LISTVIEW_DIRECTIVES]
            },] },
];
/** @nocollapse */
NativeScriptUIListViewModule.ctorParameters = function () { return []; };
exports.NativeScriptUIListViewModule = NativeScriptUIListViewModule;
