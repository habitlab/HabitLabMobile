Object.defineProperty(exports, "__esModule", { value: true });
var viewModule = require("tns-core-modules/ui/core/view");
var observableArray = require("tns-core-modules/data/observable-array");
var commonModule = require("./listview-common");
var utilsModule = require("tns-core-modules/utils/utils");
var colorModule = require("tns-core-modules/color");
var view_1 = require("tns-core-modules/ui/core/view");
var observable_1 = require("tns-core-modules/data/observable");
require("utils/module-merge").merge(commonModule, exports);
var knownTemplates;
(function (knownTemplates) {
    knownTemplates.itemTemplate = "itemTemplate";
    knownTemplates.itemSwipeTemplate = "itemSwipeTemplate";
    knownTemplates.loadOnDemandItemTemplate = "loadOnDemandItemTemplate";
    knownTemplates.headerItemTemplate = "headerItemTemplate";
    knownTemplates.footerItemTemplate = "footerItemTemplate";
})(knownTemplates = exports.knownTemplates || (exports.knownTemplates = {}));
var knownMultiTemplates;
(function (knownMultiTemplates) {
    knownMultiTemplates.itemTemplates = "itemTemplates";
})(knownMultiTemplates = exports.knownMultiTemplates || (exports.knownMultiTemplates = {}));
var ReorderHandle = (function (_super) {
    __extends(ReorderHandle, _super);
    function ReorderHandle() {
        return _super.call(this) || this;
    }
    return ReorderHandle;
}(commonModule.ReorderHandle));
exports.ReorderHandle = ReorderHandle;
var ListViewLayoutBase = (function (_super) {
    __extends(ListViewLayoutBase, _super);
    function ListViewLayoutBase() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ListViewLayoutBase.prototype, "ios", {
        get: function () {
            if (!this._ios) {
                this._ios = this.getNativeLayout();
                this._ios.dynamicItemSize = this.supportsDynamicSize();
            }
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    ListViewLayoutBase.prototype.supportsDynamicSize = function () {
        return true;
    };
    ListViewLayoutBase.prototype.init = function (owner) {
        this._owner = owner;
        this.syncOwnerScrollDirection(this.scrollDirection);
    };
    ListViewLayoutBase.prototype.reset = function () {
        this._owner = undefined;
    };
    ListViewLayoutBase.prototype.getNativeLayout = function () {
        return undefined;
    };
    ListViewLayoutBase.prototype.onScrollDirectionChanged = function (oldValue, newValue) {
        if (newValue) {
            this.ios.scrollDirection = (newValue === commonModule.ListViewScrollDirection.Horizontal) ?
                1 /* Horizontal */ :
                0 /* Vertical */;
            this.syncOwnerScrollDirection(newValue);
        }
    };
    ListViewLayoutBase.prototype.syncOwnerScrollDirection = function (newScrollDirection) {
        if (this._owner === undefined) {
            return;
        }
        var owner = this._owner.get();
        owner.ios.scrollDirection = (newScrollDirection === commonModule.ListViewScrollDirection.Horizontal) ?
            1 /* Horizontal */ :
            0 /* Vertical */;
    };
    ListViewLayoutBase.prototype.onItemInsertAnimationChanged = function (oldValue, newValue) {
        if (!newValue) {
            return;
        }
        this.ios.animationDuration = 0.5;
        switch (commonModule.ListViewItemAnimation[newValue]) {
            case commonModule.ListViewItemAnimation.Fade: {
                this.ios.itemInsertAnimation = 1 /* Fade */;
                break;
            }
            case commonModule.ListViewItemAnimation.Scale: {
                this.ios.itemInsertAnimation = 2 /* Scale */;
                break;
            }
            case commonModule.ListViewItemAnimation.Slide: {
                this.ios.itemInsertAnimation = 3 /* Slide */;
                break;
            }
            default:
                this.ios.itemInsertAnimation = 0 /* Default */;
        }
    };
    ListViewLayoutBase.prototype.onItemDeleteAnimationChanged = function (oldValue, newValue) {
        if (!newValue) {
            return;
        }
        this.ios.animationDuration = 0.5;
        switch (commonModule.ListViewItemAnimation[newValue]) {
            case commonModule.ListViewItemAnimation.Fade: {
                this.ios.itemDeleteAnimation = 1 /* Fade */;
                break;
            }
            case commonModule.ListViewItemAnimation.Scale: {
                this.ios.itemDeleteAnimation = 2 /* Scale */;
                break;
            }
            case commonModule.ListViewItemAnimation.Slide: {
                this.ios.itemDeleteAnimation = 3 /* Slide */;
                break;
            }
            default:
                this.ios.itemDeleteAnimation = 0 /* Default */;
        }
    };
    ListViewLayoutBase.prototype.onItemWidthChanged = function (oldValue, newValue) {
        if (!isNaN(+newValue)) {
            this.updateItemSize();
        }
    };
    ListViewLayoutBase.prototype.onItemHeightChanged = function (oldValue, newValue) {
        if (!isNaN(+newValue)) {
            this.updateItemSize();
        }
    };
    ListViewLayoutBase.prototype.updateItemSize = function () {
        this.ios.itemSize = CGSizeMake(this.itemWidth ? this.itemWidth : this.ios.itemSize.width, this.itemHeight ? this.itemHeight : this.ios.itemSize.height);
    };
    return ListViewLayoutBase;
}(commonModule.ListViewLayoutBase));
exports.ListViewLayoutBase = ListViewLayoutBase;
var ListViewLinearLayout = (function (_super) {
    __extends(ListViewLinearLayout, _super);
    function ListViewLinearLayout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListViewLinearLayout.prototype.getNativeLayout = function () {
        return TKListViewLinearLayout.new();
    };
    return ListViewLinearLayout;
}(ListViewLayoutBase));
exports.ListViewLinearLayout = ListViewLinearLayout;
var ListViewGridLayout = (function (_super) {
    __extends(ListViewGridLayout, _super);
    function ListViewGridLayout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ListViewGridLayout.prototype.getNativeLayout = function () {
        return TKListViewGridLayout.new();
    };
    ListViewGridLayout.prototype.supportsDynamicSize = function () {
        return false;
    };
    ListViewGridLayout.prototype.onSpanCountPropertyChanged = function (oldValue, newValue) {
        this.onSpanCountChanged(oldValue, newValue);
    };
    ListViewGridLayout.prototype.onSpanCountChanged = function (oldValue, newValue) {
        if (!isNaN(+newValue)) {
            this.ios.spanCount = newValue;
            if (this._owner) {
                this._owner.get().refresh();
            }
        }
    };
    ListViewGridLayout.prototype.onLineSpacingPropertyChanged = function (oldValue, newValue) {
        this.onLineSpacingChanged(oldValue, newValue);
    };
    ListViewGridLayout.prototype.onLineSpacingChanged = function (oldValue, newValue) {
        if (!isNaN(+newValue)) {
            this.ios.lineSpacing = newValue;
        }
    };
    return ListViewGridLayout;
}(ListViewLayoutBase));
//note: this property should be defined in common module, but inheritance will not be possible then
ListViewGridLayout.spanCountProperty = new view_1.Property({
    name: "spanCount",
    defaultValue: undefined,
    valueConverter: parseInt,
    valueChanged: function (target, oldValue, newValue) {
        target.onSpanCountPropertyChanged(oldValue, newValue);
    },
});
//note: this property should be defined in common module, but inheritance will not be possible then
ListViewGridLayout.lineSpacingProperty = new view_1.Property({
    name: "lineSpacing",
    defaultValue: undefined,
    valueConverter: parseInt,
    valueChanged: function (target, oldValue, newValue) {
        target.onLineSpacingPropertyChanged(oldValue, newValue);
    },
});
exports.ListViewGridLayout = ListViewGridLayout;
ListViewGridLayout.spanCountProperty.register(ListViewGridLayout);
ListViewGridLayout.lineSpacingProperty.register(ListViewGridLayout);
var ListViewStaggeredLayout = (function (_super) {
    __extends(ListViewStaggeredLayout, _super);
    function ListViewStaggeredLayout() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    //    private _localDelegate;
    ListViewStaggeredLayout.prototype.getNativeLayout = function () {
        var layout = TKListViewStaggeredLayout.new();
        return layout;
    };
    ListViewStaggeredLayout.prototype.supportsDynamicSize = function () {
        return true;
    };
    ListViewStaggeredLayout.prototype.updateItemSize = function () {
    };
    return ListViewStaggeredLayout;
}(ListViewGridLayout));
exports.ListViewStaggeredLayout = ListViewStaggeredLayout;
/////////////////////////////////////////////////////////////
// TKListViewDelegateImpl
var TKListViewDelegateImpl = (function (_super) {
    __extends(TKListViewDelegateImpl, _super);
    function TKListViewDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TKListViewDelegateImpl.initWithOwner = function (owner) {
        var instance = _super.new.call(this);
        instance._owner = owner;
        return instance;
    };
    Object.defineProperty(TKListViewDelegateImpl.prototype, "swipeLimits", {
        get: function () {
            if (!this._swipeLimits) {
                var owner = this._owner.get();
                this._swipeLimits = (owner.listViewLayout.scrollDirection === "Vertical") ?
                    { left: owner.getMeasuredWidth(), top: 0, right: owner.getMeasuredWidth(), bottom: 0, threshold: 0 } :
                    { left: 0, top: owner.getMeasuredHeight(), right: 0, bottom: owner.getMeasuredHeight(), threshold: 0 };
            }
            return this._swipeLimits;
        },
        enumerable: true,
        configurable: true
    });
    TKListViewDelegateImpl.prototype.listViewScrollViewDidScroll = function (listView, scrollView) {
        var owner = this._owner.get();
        var eventData = {
            eventName: commonModule.RadListView.scrolledEvent,
            object: owner,
            scrollOffset: owner.getScrollOffset()
        };
        owner.notify(eventData);
    };
    TKListViewDelegateImpl.prototype.listViewScrollViewWillBeginDragging = function (listView, scrollView) {
        var owner = this._owner.get();
        var eventData = {
            eventName: commonModule.RadListView.scrollStartedEvent,
            object: owner,
            scrollOffset: owner.getScrollOffset()
        };
        owner.notify(eventData);
    };
    TKListViewDelegateImpl.prototype.listViewScrollViewDidEndDraggingWillDecelerate = function (listView, scrollView, willDecelerate) {
        if (!willDecelerate) {
            var owner = this._owner.get();
            var eventData = {
                eventName: commonModule.RadListView.scrollEndedEvent,
                object: owner,
                scrollOffset: owner.getScrollOffset()
            };
            owner.notify(eventData);
        }
    };
    TKListViewDelegateImpl.prototype.listViewScrollViewDidEndDecelerating = function (listView, scrollView) {
        var owner = this._owner.get();
        var eventData = {
            eventName: commonModule.RadListView.scrollEndedEvent,
            object: owner,
            scrollOffset: owner.getScrollOffset()
        };
        owner.notify(eventData);
    };
    TKListViewDelegateImpl.prototype.listViewShouldHighlightItemAtIndexPath = function (listView, indexPath) {
        return true;
    };
    TKListViewDelegateImpl.prototype.listViewDidHighlightItemAtIndexPath = function (listView, indexPath) {
    };
    TKListViewDelegateImpl.prototype.listViewDidUnhighlightItemAtIndexPath = function (listView, indexPath) {
    };
    TKListViewDelegateImpl.prototype.listViewShouldSelectItemAtIndexPath = function (listView, indexPath) {
        if (!indexPath) {
            return;
        }
        var owner = this._owner.get();
        var args = { eventName: commonModule.RadListView.itemSelectingEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section, returnValue: true };
        owner.notify(args);
        return args.returnValue;
    };
    TKListViewDelegateImpl.prototype.listViewDidSelectItemAtIndexPath = function (listView, indexPath) {
        if (!indexPath) {
            return;
        }
        var owner = this._owner.get();
        var args = { eventName: commonModule.RadListView.itemSelectedEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section };
        owner.notify(args);
    };
    TKListViewDelegateImpl.prototype.listViewDidDeselectItemAtIndexPath = function (listView, indexPath) {
        if (!indexPath) {
            return;
        }
        var owner = this._owner.get();
        var args = { eventName: commonModule.RadListView.itemDeselectingEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section, returnValue: true };
        owner.notify(args);
        var argsDeselected = { eventName: commonModule.RadListView.itemDeselectedEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section };
        owner.notify(argsDeselected);
    };
    TKListViewDelegateImpl.prototype.listViewWillReorderItemAtIndexPath = function (listView, indexPath) {
        if (!listView || !indexPath) {
            return;
        }
        var owner = this._owner.get();
        var args = {
            eventName: commonModule.RadListView.itemReorderStartedEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section,
            data: undefined
        };
        owner.notify(args);
    };
    TKListViewDelegateImpl.prototype.listViewDidReorderItemFromIndexPathToIndexPath = function (listView, originalIndexPath, targetIndexPath) {
        if (!listView || !originalIndexPath || !targetIndexPath) {
            return;
        }
        var owner = this._owner.get();
        owner._reorderItemInSource(originalIndexPath.row, targetIndexPath.row);
        var args = {
            eventName: commonModule.RadListView.itemReorderedEvent, object: owner, index: originalIndexPath.row, groupIndex: originalIndexPath.section,
            data: { targetIndex: targetIndexPath.row, targetGroupIndex: targetIndexPath.section }
        };
        owner.notify(args);
    };
    TKListViewDelegateImpl.prototype.listViewShouldSwipeCellAtIndexPath = function (listView, cell, indexPath) {
        var shouldSwipe = true;
        var owner = this._owner.get();
        if (owner.hasListeners(commonModule.RadListView.itemSwipingEvent)) {
            var args = { eventName: commonModule.RadListView.itemSwipingEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section, returnValue: true };
            owner.notify(args);
            shouldSwipe = args.returnValue;
        }
        if (shouldSwipe) {
            var viewAtIndex = owner._realizedCells.get(cell.tag).view;
            var startArgs = {
                eventName: commonModule.RadListView.itemSwipeProgressStartedEvent,
                object: owner,
                swipeView: viewAtIndex.itemSwipeView,
                mainView: viewAtIndex.itemView,
                index: indexPath.row,
                groupIndex: indexPath.section,
                data: { swipeLimits: this.swipeLimits }
            };
            owner.notify(startArgs);
            var swipeLimits = startArgs.data.swipeLimits;
            if (swipeLimits) {
                owner.ios.cellSwipeLimits = UIEdgeInsetsFromString("{" + view_1.layout.toDeviceIndependentPixels(swipeLimits.top) + ", " + view_1.layout.toDeviceIndependentPixels(swipeLimits.left) + ", " + view_1.layout.toDeviceIndependentPixels(swipeLimits.bottom) + ", " + view_1.layout.toDeviceIndependentPixels(swipeLimits.right) + "}");
                owner.ios.cellSwipeTreshold = view_1.layout.toDeviceIndependentPixels(swipeLimits.threshold);
            }
        }
        return shouldSwipe;
    };
    TKListViewDelegateImpl.prototype.listViewDidSwipeCellAtIndexPathWithOffset = function (listView, cell, indexPath, offset) {
        if (!indexPath) {
            return;
        }
        var owner = this._owner.get();
        var viewAtIndex = owner._realizedCells.get(cell.tag).view;
        var swipeOffset = { x: view_1.layout.toDevicePixels(offset.x), y: view_1.layout.toDevicePixels(offset.y), swipeLimits: this.swipeLimits };
        var args = {
            eventName: commonModule.RadListView.itemSwipeProgressChangedEvent,
            object: owner,
            swipeView: viewAtIndex.itemSwipeView,
            mainView: viewAtIndex.itemView,
            index: indexPath.row,
            groupIndex: indexPath.section,
            data: swipeOffset
        };
        owner.notify(args);
    };
    TKListViewDelegateImpl.prototype.listViewDidFinishSwipeCellAtIndexPathWithOffset = function (listView, cell, indexPath, offset) {
        var owner = this._owner.get();
        if (!indexPath || !owner.hasListeners(commonModule.RadListView.itemSwipeProgressEndedEvent)) {
            return;
        }
        var viewAtIndex = owner._realizedCells.get(cell.tag).view;
        var swipeOffset = { x: offset.x, y: offset.y, swipeLimits: this.swipeLimits };
        var args = {
            eventName: commonModule.RadListView.itemSwipeProgressEndedEvent,
            object: owner,
            swipeView: viewAtIndex.itemSwipeView,
            mainView: viewAtIndex.itemView,
            index: indexPath.row,
            groupIndex: indexPath.section,
            data: swipeOffset
        };
        owner.notify(args);
    };
    TKListViewDelegateImpl.prototype.listViewDidPullWithOffset = function (listView, offset) {
    };
    TKListViewDelegateImpl.prototype.listViewDidLongPressCellAtIndexPath = function (listView, cell, indexPath) {
        if (!indexPath) {
            return;
        }
        var owner = this._owner.get();
        var args = { eventName: commonModule.RadListView.itemHoldEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section };
        owner.notify(args);
    };
    TKListViewDelegateImpl.prototype.listViewShouldLoadMoreDataAtIndexPath = function (listView, indexPath) {
        if (!indexPath) {
            return false;
        }
        var owner = this._owner.get();
        var args = { eventName: commonModule.RadListView.loadMoreDataRequestedEvent, object: owner, index: indexPath.row, groupIndex: indexPath.section, returnValue: true };
        owner.notify(args);
        return args.returnValue;
    };
    TKListViewDelegateImpl.prototype.listViewShouldRefreshOnPull = function (listView) {
        var owner = this._owner.get();
        var args = { eventName: commonModule.RadListView.pullToRefreshInitiatedEvent, object: owner, returnValue: true };
        owner.notify(args);
        return args.returnValue;
    };
    return TKListViewDelegateImpl;
}(NSObject));
TKListViewDelegateImpl.ObjCProtocols = [TKListViewDelegate];
/////////////////////////////////////////////////////////////
// TKListViewDataSourceImpl
var TKListViewDataSourceImpl = (function (_super) {
    __extends(TKListViewDataSourceImpl, _super);
    function TKListViewDataSourceImpl() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.i = 0;
        return _this;
    }
    TKListViewDataSourceImpl.initWithOwner = function (owner) {
        var instance = _super.new.call(this);
        instance._owner = owner;
        return instance;
    };
    TKListViewDataSourceImpl.prototype.listViewNumberOfItemsInSection = function (listView, section) {
        var owner = this._owner.get();
        return owner.items ? owner.items.length : 0; //todo: update to support custom DataSource object from owner
    };
    TKListViewDataSourceImpl.prototype.listViewCellForItemAtIndexPath = function (listView, indexPath) {
        var owner = this._owner.get();
        owner._preparingCell = true;
        var loadOnDemandCell = listView.dequeueLoadOnDemandCellForIndexPath(indexPath);
        if (loadOnDemandCell) {
            loadOnDemandCell.owner = owner;
            if (owner.loadOnDemandItemTemplate || owner.itemViewLoader) {
                owner.prepareLoadOnDemandCell(loadOnDemandCell, indexPath);
            }
            owner._preparingCell = false;
            return loadOnDemandCell;
        }
        var templateType = this._owner.get()._getItemTemplateType(indexPath.item);
        var cell = listView.dequeueReusableCellWithReuseIdentifierForIndexPath(templateType, indexPath);
        if (!cell.owner) {
            cell.backgroundView.stroke = null;
            cell.selectedBackgroundView.stroke = null;
            cell.offsetContentViewInMultipleSelection = false;
            cell.owner = owner;
        }
        owner.prepareCell(cell, indexPath, templateType);
        owner._preparingCell = false;
        return cell;
    };
    TKListViewDataSourceImpl.prototype.numberOfSectionsInListView = function (listView) {
        //todo: call event handler from public interface
        return 1; //todo: here we should get value from datasource
    };
    TKListViewDataSourceImpl.prototype.listViewViewForSupplementaryElementOfKindAtIndexPath = function (listView, kind, indexPath) {
        var owner = this._owner.get();
        var cell;
        if (kind === "header" && (owner.headerItemTemplate !== undefined || owner.itemViewLoader !== undefined)) {
            cell = listView.dequeueReusableSupplementaryViewOfKindWithReuseIdentifierForIndexPath(kind, NSString.stringWithCString("header"), indexPath);
            owner._preparingCell = true;
            owner.prepareHeaderCell(cell, indexPath);
            owner._preparingCell = false;
        }
        else if (kind === "footer" && (owner.footerItemTemplate !== undefined || owner.itemViewLoader !== undefined)) {
            cell = listView.dequeueReusableSupplementaryViewOfKindWithReuseIdentifierForIndexPath(kind, NSString.stringWithCString("footer"), indexPath);
            owner._preparingCell = true;
            owner.prepareFooterCell(cell, indexPath);
            owner._preparingCell = false;
        }
        return cell;
    };
    return TKListViewDataSourceImpl;
}(NSObject));
TKListViewDataSourceImpl.ObjCProtocols = [TKListViewDataSource];
var ExtendedHeaderCell = (function () {
    function ExtendedHeaderCell() {
    }
    ExtendedHeaderCell.new = function () {
        var instance = TKListViewHeaderCell.new();
        return instance;
    };
    ExtendedHeaderCell.class = function () {
        return TKListViewHeaderCell;
    };
    Object.defineProperty(ExtendedHeaderCell.prototype, "view", {
        get: function () {
            return this._view;
        },
        set: function (value) {
            this._view = value;
        },
        enumerable: true,
        configurable: true
    });
    return ExtendedHeaderCell;
}());
var ExtendedFooterCell = (function () {
    function ExtendedFooterCell() {
    }
    ExtendedFooterCell.new = function () {
        var instance = TKListViewFooterCell.new();
        return instance;
    };
    ExtendedFooterCell.class = function () {
        return TKListViewFooterCell;
    };
    Object.defineProperty(ExtendedFooterCell.prototype, "view", {
        get: function () {
            return this._view;
        },
        set: function (value) {
            this._view = value;
        },
        enumerable: true,
        configurable: true
    });
    return ExtendedFooterCell;
}());
var ExtendedLoadOnDemandCell = (function (_super) {
    __extends(ExtendedLoadOnDemandCell, _super);
    function ExtendedLoadOnDemandCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExtendedLoadOnDemandCell.new = function () {
        var instance = _super.new.call(this);
        return instance;
    };
    ExtendedLoadOnDemandCell.class = function () {
        return ExtendedLoadOnDemandCell;
    };
    ExtendedLoadOnDemandCell.prototype.systemLayoutSizeFittingSize = function (targetSize) {
        if (this._view) {
            return CGSizeMake(view_1.layout.toDeviceIndependentPixels(this._view.getMeasuredWidth()), view_1.layout.toDeviceIndependentPixels(this._view.getMeasuredHeight()));
        }
        var newSize = CGSizeMake(this.owner.ios.bounds.size.width, 100);
        return newSize;
    };
    ExtendedLoadOnDemandCell.prototype.willMoveToSuperview = function (newSuperview) {
        var parent = (this.view ? this.view.parent : null);
        // When inside ListView and there is no newSuperview this cell is 
        // removed from native visual tree so we remove it from our tree too.
        if (parent && !newSuperview) {
            parent._removeView(this.view);
        }
    };
    Object.defineProperty(ExtendedLoadOnDemandCell.prototype, "view", {
        get: function () {
            return this._view;
        },
        set: function (value) {
            this._view = value;
        },
        enumerable: true,
        configurable: true
    });
    return ExtendedLoadOnDemandCell;
}(TKListViewLoadOnDemandCell));
exports.ExtendedLoadOnDemandCell = ExtendedLoadOnDemandCell;
/////////////////////////////////////////////////////////////
// ExtendedListViewCell
var ExtendedListViewCell = (function (_super) {
    __extends(ExtendedListViewCell, _super);
    function ExtendedListViewCell() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.touchStarted = false;
        return _this;
    }
    ExtendedListViewCell.new = function () {
        var instance = _super.new.call(this);
        return instance;
    };
    ExtendedListViewCell.class = function () {
        return ExtendedListViewCell;
    };
    ExtendedListViewCell.prototype.willMoveToSuperview = function (newSuperview) {
        var parent = (this.view && this.view.itemView ? this.view.itemView.parent : null);
        // When inside ListView and there is no newSuperview this cell is 
        // removed from native visual tree so we remove it from our tree too.
        if (parent && !newSuperview) {
            parent._removeContainer(this);
        }
    };
    ExtendedListViewCell.prototype.systemLayoutSizeFittingSize = function (targetSize) {
        this.owner._preparingCell = true;
        var dimensions = this.owner.layoutCell(this, undefined);
        this.owner._preparingCell = false;
        return CGSizeMake(view_1.layout.toDeviceIndependentPixels(dimensions.measuredWidth), view_1.layout.toDeviceIndependentPixels(dimensions.measuredHeight));
    };
    // This shows in the profiling. Can it be avoided?
    ExtendedListViewCell.prototype.touchesBeganWithEvent = function (touches, event) {
        _super.prototype.touchesBeganWithEvent.call(this, touches, event);
        if (touches.count !== 1) {
            this.touchStarted = false;
            return;
        }
        this.touchStarted = true;
    };
    // This shows in the profiling. Can it be avoided?
    ExtendedListViewCell.prototype.touchesMovedWithEvent = function (touches, event) {
        _super.prototype.touchesMovedWithEvent.call(this, touches, event);
        this.touchStarted = false;
    };
    ExtendedListViewCell.prototype.touchesEndedWithEvent = function (touches, event) {
        _super.prototype.touchesEndedWithEvent.call(this, touches, event);
        if (touches.count !== 1 || this.touchStarted === false) {
            return;
        }
        var allObjects = touches.allObjects;
        var touchEvent = allObjects.objectAtIndex(0);
        var currentIndexPath = this.owner.ios.indexPathForCell(this);
        if (touchEvent.tapCount === 1) {
            if (this.owner.hasListeners(commonModule.RadListView.itemTapEvent)) {
                var args = {
                    ios: touches,
                    eventName: commonModule.RadListView.itemTapEvent,
                    object: this.owner,
                    view: this.myContentView,
                    index: currentIndexPath.row,
                    groupIndex: currentIndexPath.section
                };
                this.owner.notify(args);
            }
        }
    };
    ExtendedListViewCell.prototype.getCurrentIndexPath = function () {
        return this.owner.ios.indexPathForCell(this);
    };
    return ExtendedListViewCell;
}(TKListViewCell));
exports.ExtendedListViewCell = ExtendedListViewCell;
/////////////////////////////////////////////////////////////
// ListView
var RadListView = (function (_super) {
    __extends(RadListView, _super);
    function RadListView() {
        var _this = _super.call(this) || this;
        _this._realizedCells = new Map();
        _this._nextCellTag = 0;
        _this.on("bindingContextChange", _this.bindingContextChanged, _this);
        _this.listViewLayout = new ListViewLinearLayout();
        _this._heights = new Array();
        _this._ios = TKListView.new();
        _this._ios.autoresizingMask = 2 /* FlexibleWidth */ | 16 /* FlexibleHeight */;
        _this._ios.cellSwipeTreshold = 30; //the treshold after which the cell will auto swipe to the end and will not jump back to the center.
        _this._delegate = TKListViewDelegateImpl.initWithOwner(new WeakRef(_this));
        _this._dataSource = TKListViewDataSourceImpl.initWithOwner(new WeakRef(_this)); //weak ref
        _this._ios.dataSource = _this._dataSource;
        _this._ios.pullToRefreshView.backgroundColor = (new colorModule.Color("White")).ios;
        _this._ios.registerClassForCellWithReuseIdentifier(ExtendedListViewCell.class(), _this._defaultTemplate.key);
        _this._ios.registerClassForSupplementaryViewOfKindWithReuseIdentifier(ExtendedHeaderCell.class(), TKListViewElementKindSectionHeader, NSString.stringWithCString("header"));
        _this._ios.registerClassForSupplementaryViewOfKindWithReuseIdentifier(ExtendedFooterCell.class(), TKListViewElementKindSectionFooter, NSString.stringWithCString("footer"));
        _this._ios.registerLoadOnDemandCell(ExtendedLoadOnDemandCell.class());
        _this.synchCellReorder();
        _this.synchCellSwipe();
        _this.synchLoadOnDemandBufferSize();
        _this.synchLoadOnDemandMode();
        _this.synchPullToRefresh();
        _this.synchSelection();
        _this.synchSelectionBehavior();
        _this.synchReorderMode();
        _this.syncListViewLayout(_this.listViewLayout);
        return _this;
    }
    Object.defineProperty(RadListView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    RadListView.prototype.createNativeView = function () {
        return this.ios;
    };
    RadListView.prototype.disposeNativeView = function () {
    };
    RadListView.prototype.setHeightForCell = function (index, value) {
        this._heights[index] = value;
    };
    RadListView.prototype.selectAll = function () {
        _super.prototype.selectAll.call(this);
        for (var i = 0; i < this.items.length; i++) {
            var indexPathToSelect = NSIndexPath.indexPathForRowInSection(i, 0);
            this._ios.selectItemAtIndexPathAnimatedScrollPosition(indexPathToSelect, false, 0 /* None */);
        }
    };
    RadListView.prototype.deselectAll = function () {
        for (var i = 0; i < this.items.length; i++) {
            var indexPathToSelect = NSIndexPath.indexPathForRowInSection(i, 0);
            this._ios.deselectItemAtIndexPathAnimated(indexPathToSelect, false);
        }
    };
    RadListView.prototype.isItemSelected = function (item) {
        var indexOfTargetItem = this.items.indexOf(item);
        var selectedIndexPaths = this._ios.indexPathsForSelectedItems;
        for (var i = 0; i < selectedIndexPaths.count; i++) {
            var indexPath = selectedIndexPaths.objectAtIndex(i);
            if (indexOfTargetItem === indexPath.row) {
                return true;
            }
        }
        return false;
    };
    RadListView.prototype.selectItemAt = function (index) {
        var indexPathToSelect = NSIndexPath.indexPathForRowInSection(index, 0);
        this._ios.selectItemAtIndexPathAnimatedScrollPosition(indexPathToSelect, false, 0 /* None */);
    };
    RadListView.prototype.deselectItemAt = function (index) {
        var indexPathToSelect = NSIndexPath.indexPathForRowInSection(index, 0);
        this._ios.deselectItemAtIndexPathAnimated(indexPathToSelect, false);
    };
    RadListView.prototype.getViewForItem = function (item) {
        if (item === undefined) {
            throw new Error("Item must be an object from the currently assigned source.");
        }
        var result = undefined;
        this._realizedCells.forEach(function (value, key) {
            var cellItemView = value.view.itemView;
            if (cellItemView && cellItemView.bindingContext === item) {
                result = cellItemView;
            }
        }, this);
        return result;
    };
    RadListView.prototype.getSelectedItems = function () {
        var selectedIndexPaths = this._ios.indexPathsForSelectedItems;
        var result = new Array();
        for (var i = 0; i < selectedIndexPaths.count; i++) {
            var indexPath = selectedIndexPaths.objectAtIndex(i);
            result.push(this.getItemAtIndex(indexPath.row));
        }
        return result;
    };
    RadListView.prototype.bindingContextChanged = function (data) {
        // We need this to calculate the header-footer size based on bindings to the context.
        this._updateHeaderFooterAvailability();
    };
    RadListView.prototype._updateHeaderFooterAvailability = function () {
        if (this.ios.layout) {
            var tempView = this.getViewForViewType(commonModule.ListViewViewTypes.HeaderView);
            if (tempView) {
                this._addView(tempView);
                tempView.bindingContext = this.bindingContext;
                var measuredSize = this.measureCell(tempView);
                this.ios.layout.headerReferenceSize =
                    CGSizeMake(view_1.layout.toDeviceIndependentPixels(measuredSize.measuredWidth), view_1.layout.toDeviceIndependentPixels(measuredSize.measuredHeight));
                this._removeView(tempView);
            }
            else {
                this.ios.layout.headerReferenceSize = CGSizeMake(0, 0);
            }
            tempView = this.getViewForViewType(commonModule.ListViewViewTypes.FooterView);
            if (tempView) {
                this._addView(tempView);
                tempView.bindingContext = this.bindingContext;
                var measuredSize = this.measureCell(tempView);
                this.ios.layout.footerReferenceSize =
                    CGSizeMake(view_1.layout.toDeviceIndependentPixels(measuredSize.measuredWidth), view_1.layout.toDeviceIndependentPixels(measuredSize.measuredHeight));
                this._removeView(tempView);
            }
            else {
                this.ios.layout.footerReferenceSize = CGSizeMake(0, 0);
            }
            this.refresh();
        }
    };
    RadListView.prototype.onReorderModeChanged = function (oldValue, newValue) {
        this.synchReorderMode();
    };
    RadListView.prototype.onListViewLayoutChanged = function (oldValue, newValue) {
        if (oldValue) {
            oldValue.reset();
        }
        this.syncListViewLayout(newValue);
    };
    RadListView.prototype.onItemTemplateSelectorChanged = function (oldValue, newValue) {
        _super.prototype.onItemTemplateSelectorChanged.call(this, oldValue, newValue);
        this.refresh();
    };
    RadListView.prototype.syncListViewLayout = function (newValue) {
        var newLayout = newValue;
        if (newLayout && this.ios) {
            this.ios.layout = newValue.ios;
            this.refresh();
            newLayout.init(new WeakRef(this));
            this._updateHeaderFooterAvailability();
            this._ios.cellSwipeLimits = (newLayout.scrollDirection === "Horizontal") ? UIEdgeInsetsFromString("{60, 0, 60, 0}") : UIEdgeInsetsFromString("{0, 60, 0, 60}");
        }
    };
    RadListView.prototype.clearRealizedCells = function () {
        var that = new WeakRef(this);
        this._realizedCells.forEach(function (value, key) {
            that.get()._removeContainer(value);
            that.get()._clearCellViews(value);
        }, that);
        this._realizedCells.clear();
        this._nextCellTag = 0;
    };
    RadListView.prototype._clearCellViews = function (cell) {
        if (cell.view) {
            if (cell.view.itemView && cell.view.itemView.nativeView) {
                cell.view.itemView.nativeView.removeFromSuperview();
            }
            if (cell.view.itemSwipeView && cell.view.itemSwipeView.nativeView) {
                cell.view.itemView.nativeView.removeFromSuperview();
            }
            cell.view = undefined;
        }
    };
    RadListView.prototype.onItemTemplateChanged = function (oldValue, newValue) {
        if (!newValue) {
            return;
        }
        this.clearRealizedCells();
        this.refresh();
    };
    RadListView.prototype.onItemTemplatesChanged = function (oldValue, newValue) {
        _super.prototype.onItemTemplatesChanged.call(this, oldValue, newValue);
        for (var i = 0, length_1 = this._itemTemplatesInternal.length; i < length_1; i++) {
            this._ios.registerClassForCellWithReuseIdentifier(ExtendedListViewCell.class(), this._itemTemplatesInternal[i].key.toLowerCase());
        }
    };
    RadListView.prototype.onLoadOnDemandItemTemplateChanged = function (oldValue, newValue) {
        if (!newValue) {
            return;
        }
        if (this.loadOnDemandMode === commonModule.ListViewLoadOnDemandMode.Auto) {
            //this._ios.loadOnDemandView = builder.parse(this.loadOnDemandItemTemplate).ios;
            var loadOnDemandView = this.getViewForViewType(commonModule.ListViewViewTypes.LoadOnDemandView);
            if (loadOnDemandView) {
                this._ios.loadOnDemandView = loadOnDemandView.ios;
            }
        }
        this.clearRealizedCells();
        this.refresh();
    };
    RadListView.prototype.onItemSwipeTemplateChanged = function (oldValue, newValue) {
        if (!newValue) {
            return;
        }
        this.clearRealizedCells();
        this.refresh();
    };
    RadListView.prototype.onMultipleSelectionChanged = function (oldValue, newValue) {
        this.synchSelection();
    };
    RadListView.prototype.onHeaderItemTemplateChanged = function (oldValue, newValue) {
        _super.prototype.onHeaderItemTemplateChanged.call(this, oldValue, newValue);
        this.clearRealizedCells();
        this._updateHeaderFooterAvailability();
    };
    RadListView.prototype.onFooterItemTemplateChanged = function (oldValue, newValue) {
        _super.prototype.onFooterItemTemplateChanged.call(this, oldValue, newValue);
        this.clearRealizedCells();
        this._updateHeaderFooterAvailability();
    };
    RadListView.prototype._removeContainer = function (cell) {
        var view = cell.view.itemView;
        var swipeView = cell.view.itemSwipeView;
        // // This is to clear the StackLayout that is used to wrap ProxyViewContainer instances.
        // if (!(view.parent instanceof RadListView)) {
        //     this._removeView(view.parent);
        // }
        this._removeView(view);
        if (swipeView) {
            this._removeView(swipeView);
        }
        if (this._realizedCells.get(cell.tag)) {
            this._realizedCells.delete(cell.tag);
        }
    };
    RadListView.prototype.synchReorderMode = function () {
        if (this.reorderMode && this.reorderMode.toLowerCase() === commonModule.ListViewReorderMode.Drag) {
            this._ios.reorderMode = 0 /* WithHandle */;
        }
        else if (this.reorderMode && this.reorderMode.toLowerCase() === commonModule.ListViewReorderMode.HoldAndDrag) {
            this._ios.reorderMode = 1 /* WithLongPress */;
        }
        this.refresh();
    };
    RadListView.prototype.isSwipeEnabled = function () {
        return this.itemSwipe || this.swipeActions;
    };
    RadListView.prototype.synchSelection = function () {
        this.ios.allowsMultipleSelection = (this.multipleSelection ? true : false);
    };
    RadListView.prototype.onItemReorderChanged = function (oldValue, newValue) {
        this.synchCellReorder();
    };
    RadListView.prototype.synchCellReorder = function () {
        this.ios.allowsCellReorder = (this.itemReorder ? true : false);
    };
    RadListView.prototype.onItemSwipeChanged = function (oldValue, newValue) {
        _super.prototype.onItemSwipeChanged.call(this, oldValue, newValue);
        this.synchCellSwipe();
    };
    RadListView.prototype.onSwipeActionsChanged = function (oldValue, newValue) {
        _super.prototype.onSwipeActionsChanged.call(this, oldValue, newValue);
        this.synchCellSwipe();
    };
    RadListView.prototype.synchCellSwipe = function () {
        this.ios.allowsCellSwipe = this.isSwipeEnabled() ? true : false;
    };
    RadListView.prototype.onPullToRefreshChanged = function (oldValue, newValue) {
        this.synchPullToRefresh();
    };
    RadListView.prototype.synchPullToRefresh = function () {
        this.ios.allowsPullToRefresh = (this.pullToRefresh ? true : false);
        var style = this.pullToRefreshStyle;
        if (style) {
            if (style.indicatorColor) {
                this.ios.pullToRefreshView.activityIndicator.color = new colorModule.Color(style.indicatorColor).ios;
            }
            if (style.indicatorBackgroundColor) {
                this.ios.pullToRefreshView.activityIndicator.backgroundColor = new colorModule.Color(style.indicatorBackgroundColor).ios;
            }
        }
    };
    RadListView.prototype.onPullToRefreshStyleChanged = function (oldValue, newValue) {
        this.synchPullToRefresh();
    };
    RadListView.prototype.onLoadOnDemandModeChanged = function (oldValue, newValue) {
        this.synchLoadOnDemandMode();
    };
    RadListView.prototype.synchLoadOnDemandMode = function () {
        if (this.loadOnDemandMode) {
            if (commonModule.ListViewLoadOnDemandMode.Auto === this.loadOnDemandMode) {
                this.ios.loadOnDemandMode = 2 /* Auto */;
            }
            else if (commonModule.ListViewLoadOnDemandMode.Manual === this.loadOnDemandMode) {
                this.ios.loadOnDemandMode = 1 /* Manual */;
            }
            else
                this.ios.loadOnDemandMode = 0 /* None */;
        }
    };
    RadListView.prototype.onLoadOnDemandBufferSizeChanged = function (oldValue, newValue) {
        this.synchLoadOnDemandBufferSize();
    };
    RadListView.prototype.synchLoadOnDemandBufferSize = function () {
        if (this.loadOnDemandBufferSize !== undefined) {
            this.ios.loadOnDemandBufferSize = this.loadOnDemandBufferSize;
        }
    };
    RadListView.prototype.onSelectionBehaviorChanged = function (oldValue, newValue) {
        this.synchSelectionBehavior();
    };
    RadListView.prototype.synchSelectionBehavior = function () {
        if (this.selectionBehavior) {
            if (commonModule.ListViewSelectionBehavior.Press === this.selectionBehavior) {
                this.ios.selectionBehavior = 1 /* Press */;
            }
            else if (commonModule.ListViewSelectionBehavior.LongPress === this.selectionBehavior) {
                this.ios.selectionBehavior = 2 /* LongPress */;
            }
            else
                this.ios.selectionBehavior = 0 /* None */;
        }
    };
    RadListView.prototype.getDataItem = function (index) {
        var items = this.items;
        return items.getItem ? items.getItem(index) : items[index]; //todo: consider usage of DataSource instance here
    };
    RadListView.prototype.prepareItem = function (item, index) {
        if (item) {
            item.bindingContext = this.getDataItem(index);
        }
    };
    RadListView.prototype.requestLayout = function () {
        // When preparing cell don't call super - no need to invalidate our measure when cell desiredSize is changed.
        if (!this._preparingCell) {
            _super.prototype.requestLayout.call(this);
        }
    };
    RadListView.prototype.onMeasure = function (widthMeasureSpec, heightMeasureSpec) {
        _super.prototype.onMeasure.call(this, widthMeasureSpec, heightMeasureSpec);
        if (this._currentHeightSpec !== heightMeasureSpec || this._currentWidthSpec !== widthMeasureSpec) {
            this._currentWidthSpec = widthMeasureSpec;
            this._currentHeightSpec = heightMeasureSpec;
            this._updateHeaderFooterAvailability();
            this._ios.reloadData();
        }
    };
    Object.defineProperty(RadListView.prototype, "_childrenCount", {
        get: function () {
            var count = 0;
            if (this._realizedCells) {
                var currentSize = this._realizedCells.size;
                if (this.isSwipeEnabled() === true) {
                    return currentSize * 2;
                }
                return currentSize;
            }
            return count;
        },
        enumerable: true,
        configurable: true
    });
    RadListView.prototype.eachChildView = function (callback) {
        if (this._realizedCells) {
            this._realizedCells.forEach(function (value, key) {
                if (value.view.itemView) {
                    callback(value.view.itemView);
                }
                if (value.view.itemSwipeView) {
                    callback(value.view.itemSwipeView);
                }
                if (value instanceof ExtendedHeaderCell) {
                    callback(value.view);
                }
                if (value instanceof ExtendedFooterCell) {
                    callback(value.view);
                }
            }, this);
        }
    };
    RadListView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._ios.delegate = this._delegate;
        if (this._isDataDirty) {
            this.refresh();
        }
    };
    RadListView.prototype.onUnloaded = function () {
        _super.prototype.onUnloaded.call(this);
        this._ios.delegate = null;
    };
    RadListView.prototype.scrollWithAmount = function (amount, animate) {
        if (this._ios) {
            var layoutVertical = this.listViewLayout.scrollDirection === commonModule.ListViewScrollDirection.Vertical ? true : false;
            var currentOffset = this._ios.contentOffset;
            if (layoutVertical) {
                this._ios.setContentOffsetAnimated(new CGPoint({ x: currentOffset.x, y: amount + currentOffset.y }), animate);
            }
            else {
                this._ios.setContentOffsetAnimated(new CGPoint({ x: amount + currentOffset.x, y: currentOffset.y }), animate);
            }
        }
    };
    RadListView.prototype.getScrollOffset = function () {
        if (!this._ios) {
            return _super.prototype.getScrollOffset.call(this);
        }
        if (this.listViewLayout.scrollDirection === commonModule.ListViewScrollDirection.Vertical) {
            return this._ios.contentOffset.y;
        }
        else {
            return this._ios.contentOffset.x;
        }
    };
    RadListView.prototype.scrollToIndex = function (index, animate) {
        if (animate === void 0) { animate = false; }
        if (this._ios) {
            if (!this.scrollPosition) {
                if (this.listViewLayout.scrollDirection === commonModule.ListViewScrollDirection.Vertical) {
                    this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 1 /* Top */, animate);
                }
                else {
                    this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 8 /* Left */, animate);
                }
            }
            else {
                switch (this.scrollPosition) {
                    case commonModule.ListViewScrollPosition.Bottom:
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 4 /* Bottom */, animate);
                        break;
                    case commonModule.ListViewScrollPosition.CenteredHorizontally:
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 16 /* CenteredHorizontally */, animate);
                        break;
                    case commonModule.ListViewScrollPosition.CenteredVertically:
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 2 /* CenteredVertically */, animate);
                        break;
                    case commonModule.ListViewScrollPosition.Left:
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 8 /* Left */, animate);
                        break;
                    case commonModule.ListViewScrollPosition.None:
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 0 /* None */, animate);
                        break;
                    case commonModule.ListViewScrollPosition.Right:
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 32 /* Right */, animate);
                        break;
                    case commonModule.ListViewScrollPosition.Top:
                        this._ios.scrollToItemAtIndexPathAtScrollPositionAnimated(NSIndexPath.indexPathForItemInSection(index, 0), 1 /* Top */, animate);
                        break;
                }
            }
        }
    };
    RadListView.prototype.notifyPullToRefreshFinished = function () {
        this.ios.didRefreshOnPull();
    };
    RadListView.prototype.notifyLoadOnDemandFinished = function () {
        this.ios.didLoadDataOnDemand();
    };
    RadListView.prototype.notifySwipeToExecuteFinished = function () {
        this.ios.endSwipe(true);
    };
    RadListView.prototype.refresh = function () {
        this._realizedCells.forEach(function (cell, nativeView, map) {
            if (!(cell.view.bindingContext instanceof observable_1.Observable)) {
                cell.view.bindingContext = null;
            }
        });
        if (this.isLoaded) {
            this._ios.reloadData();
            this.requestLayout();
            this._isDataDirty = false;
        }
        else {
            this._isDataDirty = true;
        }
    };
    RadListView.prototype.onSourceCollectionChanged = function (data) {
        if (data.action === observableArray.ChangeType.Delete) {
            var nativeSource = NSMutableArray.new();
            nativeSource.addObject(NSIndexPath.indexPathForRowInSection(data.index, 0));
            this.unbindUnusedCells(data.removed);
            this.ios.deleteItemsAtIndexPaths(nativeSource);
        }
        else if (data.action === observableArray.ChangeType.Add) {
            var nativeSource = NSMutableArray.new();
            for (var i = 0; i < data.addedCount; i++) {
                nativeSource.addObject(NSIndexPath.indexPathForRowInSection(data.index + i, 0));
            }
            this.ios.insertItemsAtIndexPaths(nativeSource);
        }
        else if (data.action === observableArray.ChangeType.Splice) {
            if (data.removed && (data.removed.length > 0)) {
                var nativeSource = NSMutableArray.new();
                for (var i = 0; i < data.removed.length; i++) {
                    nativeSource.addObject(NSIndexPath.indexPathForRowInSection(data.index + i, 0));
                }
                this.unbindUnusedCells(data.removed);
                this.ios.deleteItemsAtIndexPaths(nativeSource);
            }
            else {
                var nativeSource = NSMutableArray.new();
                for (var i = 0; i < data.addedCount; i++) {
                    nativeSource.addObject(NSIndexPath.indexPathForRowInSection(data.index + i, 0));
                }
                this.ios.insertItemsAtIndexPaths(nativeSource);
            }
        }
        else if (data.action === observableArray.ChangeType.Update) {
            _super.prototype.onSourceCollectionChanged.call(this, data);
        }
    };
    RadListView.prototype.hasFixedItemSize = function () {
        var listViewLayout = this.listViewLayout;
        if (listViewLayout.scrollDirection === commonModule.ListViewScrollDirection.Vertical) {
            return !isNaN(listViewLayout.itemHeight);
        }
        if (listViewLayout.scrollDirection === commonModule.ListViewScrollDirection.Horizontal) {
            return !isNaN(listViewLayout.itemWidth);
        }
        return false;
    };
    RadListView.prototype.unbindUnusedCells = function (removedDataItems) {
        this._realizedCells.forEach(function (value, key) {
            if (removedDataItems.indexOf(value.view.itemView.bindingContext) !== -1) {
                value.view.itemView.bindingContext = undefined;
                if (value.view.itemSwipeView) {
                    value.view.itemSwipeView.bindingContext = undefined;
                }
            }
        }, this);
    };
    RadListView.prototype.getLoadOnDemandItemTemplateContent = function () {
        return this.getViewForViewType(commonModule.ListViewViewTypes.LoadOnDemandView);
    };
    RadListView.prototype._getItemTemplateType = function (index) {
        var selector = this.itemTemplateSelector;
        var type = this._defaultTemplate.key;
        if (selector) {
            type = selector(this.getItemAtIndex(index), index, this.items);
        }
        return type.toLowerCase();
    };
    RadListView.prototype.getItemTemplateContent = function (index, templateType) {
        var cellViews = new Object();
        cellViews.itemView = this.getViewForViewType(commonModule.ListViewViewTypes.ItemView, templateType);
        cellViews.itemSwipeView = this.getViewForViewType(commonModule.ListViewViewTypes.ItemSwipeView);
        return cellViews;
    };
    RadListView.prototype.layoutHeaderFooterCell = function (cell) {
        var scrollDirection = this.listViewLayout.scrollDirection;
        var sizeRestriction = {
            width: scrollDirection === commonModule.ListViewScrollDirection.Vertical ? this.getMeasuredWidth() : this.listViewLayout.itemWidth,
            height: scrollDirection === commonModule.ListViewScrollDirection.Vertical ? this.listViewLayout.itemHeight : this.getMeasuredHeight()
        };
        var itemViewDimensions = this.measureCell(cell.view, sizeRestriction);
        var cellView = cell.view;
        if (cellView) {
            viewModule.View.layoutChild(this, cellView, 0, 0, itemViewDimensions.measuredWidth, itemViewDimensions.measuredHeight);
        }
    };
    RadListView.prototype.layoutLoadOnDemandCell = function (cell) {
        var itemViewDimensions = this.measureCell(cell.view);
        var cellView = cell.view;
        if (cellView) {
            viewModule.View.layoutChild(this, cellView, 0, 0, itemViewDimensions.measuredWidth, itemViewDimensions.measuredHeight);
        }
    };
    RadListView.prototype.layoutCell = function (cell, indexPath) {
        var itemViewDimensions = this.measureCell(cell.view.itemView, indexPath);
        var cellView = cell.view.itemView;
        if (cellView && cellView['isLayoutRequired']) {
            viewModule.View.layoutChild(this, cellView, 0, 0, itemViewDimensions.measuredWidth, itemViewDimensions.measuredHeight);
        }
        var swipeViewDimensions = this.measureCell(cell.view.itemSwipeView, { width: itemViewDimensions.measuredWidth, height: itemViewDimensions.measuredHeight });
        var backgroundView = cell.view.itemSwipeView;
        if (backgroundView && backgroundView['isLayoutRequired']) {
            viewModule.View.layoutChild(this, backgroundView, 0, 0, swipeViewDimensions.measuredWidth, swipeViewDimensions.measuredHeight);
        }
        return itemViewDimensions;
    };
    RadListView.prototype.measureCell = function (cellView, sizeRestriction) {
        if (cellView) {
            var listViewLayout = this.listViewLayout;
            var itemWidth = isNaN(listViewLayout.itemWidth) ? undefined : view_1.layout.toDevicePixels(listViewLayout.itemWidth);
            var itemHeight = isNaN(listViewLayout.itemHeight) ? undefined : view_1.layout.toDevicePixels(listViewLayout.itemHeight);
            if (sizeRestriction !== undefined) {
                itemWidth = sizeRestriction.width;
                itemHeight = sizeRestriction.height;
            }
            var heightSpec, widthSpec;
            var spanCount = !isNaN(listViewLayout.spanCount) ? listViewLayout.spanCount : 1;
            if (listViewLayout.scrollDirection === "Vertical") {
                itemWidth = (itemWidth === undefined) ? this.getMeasuredWidth() / spanCount : itemWidth;
                if (itemHeight === undefined) {
                    heightSpec = utilsModule.layout.makeMeasureSpec(0, utilsModule.layout.UNSPECIFIED);
                }
                else {
                    heightSpec = utilsModule.layout.makeMeasureSpec(itemHeight, utilsModule.layout.EXACTLY);
                }
                widthSpec = utilsModule.layout.makeMeasureSpec(itemWidth, utilsModule.layout.EXACTLY);
            }
            else {
                itemHeight = (itemHeight === undefined) ? this.getMeasuredHeight() / spanCount : itemHeight;
                if (itemWidth === undefined) {
                    widthSpec = utilsModule.layout.makeMeasureSpec(0, utilsModule.layout.UNSPECIFIED);
                }
                else {
                    widthSpec = utilsModule.layout.makeMeasureSpec(itemWidth, utilsModule.layout.EXACTLY);
                }
                heightSpec = utilsModule.layout.makeMeasureSpec(itemHeight, utilsModule.layout.EXACTLY);
            }
            return viewModule.View.measureChild(this, cellView, widthSpec, heightSpec);
        }
        return undefined;
    };
    RadListView.prototype.prepareCellTag = function (cell) {
        if (cell.tag === 0) {
            cell.tag = this._nextCellTag + 1;
            this._nextCellTag++;
        }
        this._realizedCells.set(cell.tag, cell);
    };
    RadListView.prototype.prepareLoadOnDemandCell = function (cell, indexPath) {
        if (cell.view === undefined) {
            var loadOnDemandView = this.getLoadOnDemandItemTemplateContent();
            if (loadOnDemandView) {
                cell.view = loadOnDemandView;
                this.prepareCellTag(cell);
                cell.view.bindingContext = this.bindingContext;
                this._addView(cell.view);
                this.layoutLoadOnDemandCell(cell);
                cell.contentView.addSubview(cell.view.ios);
            }
        }
    };
    RadListView.prototype.prepareHeaderCell = function (headerCell, indexPath) {
        this.prepareHeaderFooterCell(headerCell, commonModule.ListViewViewTypes.HeaderView, indexPath);
    };
    RadListView.prototype.prepareFooterCell = function (footerCell, indexPath) {
        this.prepareHeaderFooterCell(footerCell, commonModule.ListViewViewTypes.FooterView, indexPath);
    };
    RadListView.prototype.prepareHeaderFooterCell = function (cell, viewType, indexPath) {
        if (cell.view === undefined || cell.view.parent === undefined) {
            if (cell.view !== undefined) {
                cell.view.ios.removeFromSuperview();
                cell.view = undefined;
            }
            cell.view = this.getViewForViewType(viewType);
            this.prepareCellTag(cell);
            if (cell.view) {
                cell.view.bindingContext = this.bindingContext;
                this._addView(cell.view);
                this.layoutHeaderFooterCell(cell);
                cell.contentView.addSubview(cell.view.ios);
            }
        }
    };
    RadListView.prototype.prepareCell = function (tableCell, indexPath, templateType) {
        var cell = tableCell;
        if (cell.view === undefined) {
            cell.view = this.getItemTemplateContent(indexPath.item, templateType);
            this.prepareCellTag(cell);
            if (this.reorderMode && this.reorderMode.toLowerCase() === commonModule.ListViewReorderMode.Drag) {
                var reorderHandle = undefined;
                cell.view.itemView.eachChildView(function (view) {
                    if (view instanceof ReorderHandle) {
                        reorderHandle = view;
                        return false;
                    }
                    return true;
                });
                if (reorderHandle) {
                    cell.reorderHandle = reorderHandle.ios;
                }
            }
        }
        if (cell.view.itemView && !cell.view.itemView.parent) {
            if (cell.myContentView && cell.myContentView.ios) {
                cell.myContentView.ios.removeFromSuperview();
                cell.myContentView = null;
            }
            cell.myContentView = cell.view.itemView;
            if (cell.contentView.subviews && cell.contentView.subviews.count > 0) {
                cell.contentView.insertSubviewBelowSubview(cell.view.itemView.ios, cell.contentView.subviews.objectAtIndex(0));
            }
            else {
                cell.contentView.addSubview(cell.view.itemView.ios);
            }
            this._addView(cell.view.itemView);
        }
        this.prepareItem(cell.view.itemView, indexPath.row);
        if (cell.view.itemSwipeView && !cell.view.itemSwipeView.parent) {
            if (cell.myBackgroundView && cell.myBackgroundView.ios) {
                cell.myBackgroundView.ios.removeFromSuperview();
                cell.myBackgroundView = null;
            }
            cell.myBackgroundView = cell.view.itemSwipeView;
            cell.swipeBackgroundView.addSubview(cell.view.itemSwipeView.ios);
            this._addView(cell.view.itemSwipeView);
        }
        this.prepareItem(cell.view.itemSwipeView, indexPath.row);
        var args = {
            eventName: commonModule.RadListView.itemLoadingEvent,
            object: this,
            index: indexPath.row,
            view: cell.view.itemView,
            ios: cell
        };
        this.notify(args);
    };
    return RadListView;
}(commonModule.RadListView));
exports.RadListView = RadListView;
