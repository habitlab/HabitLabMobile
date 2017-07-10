// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.
"use strict";
var Border = require('ui/border');
var Color = require('color');
var Grid = require('ui/layouts/grid-layout');
var image_1 = require('ui/image');
var label_1 = require('ui/label');
var Observable = require('data/observable');
var observable_array_1 = require('data/observable-array');
var dependency_observable_1 = require("ui/core/dependency-observable");
var proxy_1 = require("ui/core/proxy");
var Stack = require('ui/layouts/stack-layout');
var TaskPieHelpers = require('./TaskPieHelpers');
var TypeUtils = require("utils/types");
var UIEnums = require('ui/enums');
var virtual_array_1 = require('data/virtual-array');
/**
 * Name of the field that determines if TaskPie is in edit mode or not.
 */
exports.TASKPIE_FIELD_ISEDITING = 'isEditing';
/**
 * A task pie view.
 */
var TaskPie = (function (_super) {
    __extends(TaskPie, _super);
    /**
     * Initializes a new instance of that class.
     */
    function TaskPie(json) {
        _super.call(this, json);
        this.init();
        this.refresh();
    }
    /**
     * Adds a task category.
     *
     * @chainable
     *
     * @param {String} name The name of the category.
     * @param {Color.Color} color The color.
     * @param {Number} [count] The name of the category.
     */
    TaskPie.prototype.addCategory = function (name, color, type, count) {
        if (count === void 0) { count = 0; }
        var cats = this._categories;
        cats.push(new TaskCategory(this, name, color, type, count));
        this.refresh();
        return this;
    };
    Object.defineProperty(TaskPie.prototype, "categories", {
        /**
         * Gets or sets the list of categories.
         */
        get: function () {
            return this._categories;
        },
        set: function (value) {
            var me = this;
            if (TypeUtils.isNullOrUndefined(value)) {
                value = new observable_array_1.ObservableArray();
            }
            this._categories = value;
            this.updateCategories();
            this.refresh();
            this.raiseCategoryProperties(true);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "categoryGrid", {
        /**
         * Gets the grid that stores the category views.
         */
        get: function () {
            return this._categoryGrid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "categoryStyle", {
        /**
         * Sets the style for the category grid.
         */
        set: function (style) {
            this._categoryStyle = style;
            this.updateCategoryStyle();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Clears all categories.
     */
    TaskPie.prototype.clearCategories = function () {
        this.categories = new observable_array_1.ObservableArray();
        return this;
    };
    Object.defineProperty(TaskPie.prototype, "counts", {
        /**
         * Gets or sets the 'count' values of the underlying task categories.
         *
         * @throws At least one new value is no valid number.
         */
        get: function () {
            var countList = new observable_array_1.ObservableArray();
            for (var i = 0; i < this._categoryLength(); i++) {
                var cnt = null;
                var cat = this._categoryGetter(i);
                if (!TypeUtils.isNullOrUndefined(cat)) {
                    cnt = cat.count;
                }
                countList.push(cnt);
            }
            return countList;
        },
        set: function (value) {
            if (isEmptyString(value)) {
                return;
            }
            var v = value;
            if (!(v instanceof observable_array_1.ObservableArray) && !(v instanceof virtual_array_1.VirtualArray)) {
                // handle as , separated string
                // and convert 'v' to an array of numbers
                var parts = ('' + v).trim().split(',');
                v = [];
                for (var i = 0; i < parts.length; i++) {
                    var p = parts[i].trim();
                    var cv = null;
                    if (!isEmptyString(p)) {
                        if (isNaN(p)) {
                            throw "'" + p + "' is NOT a number!";
                        }
                        cv = parseFloat(p);
                    }
                    v.push(cv);
                }
            }
            var itemGetter = function (itemIndex) { return v[itemIndex]; };
            if ((v instanceof observable_array_1.ObservableArray) || (v instanceof virtual_array_1.VirtualArray)) {
                itemGetter = function (itemIndex) { return v.getItem(itemIndex); };
            }
            for (var i = 0; i < v.length; i++) {
                if (i >= this._categoryLength()) {
                    break;
                }
                var nv = itemGetter(i);
                if (isEmptyString(nv)) {
                    continue;
                }
                var cat = this._categoryGetter(i);
                cat.count = nv;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Increases the count value of a category.
     *
     * @chainable
     *
     * @param {Number} index The zero based index of the category.
     * @param any [decreaseBy] The custom value to use or the function provides it.
     *
     * @throws Decrease value is NOT valid.
     */
    TaskPie.prototype.decrease = function (index, decreaseBy) {
        if (TypeUtils.isNullOrUndefined(decreaseBy)) {
            decreaseBy = 1;
        }
        var decreaseByFunc = decreaseBy;
        if (typeof decreaseByFunc !== "function") {
            decreaseByFunc = function () { return decreaseBy; };
        }
        var cat = this._categoryGetter(index);
        var decreaseVal = decreaseByFunc(cat.count, cat, index, this);
        if (!isEmptyString(decreaseVal)) {
            decreaseVal = ('' + decreaseVal).trim();
            if (isNaN(decreaseVal)) {
                throw "'" + decreaseVal + "' is NOT a valid number!";
            }
            decreaseVal = parseFloat(decreaseVal);
            var newValue = cat.count;
            if (isEmptyString(newValue)) {
                newValue = 0;
            }
            newValue -= decreaseVal;
            cat.count = newValue;
        }
        return this;
    };
    Object.defineProperty(TaskPie.prototype, "description", {
        /**
         * Gets or sets the description.
         */
        get: function () {
            return this._descriptionField.text;
        },
        set: function (value) {
            if (value === this._descriptionField.text) {
                return;
            }
            this._descriptionField.text = value;
            this.updateVisibilityOfViewByString(this._descriptionField.text, this._descriptionField);
            this.notifyPropertyChange("description", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "descriptionField", {
        /**
         * Gets the field with the description.
         */
        get: function () {
            return this._descriptionField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "descriptionStyle", {
        /**
         * Sets the style for the description field.
         */
        set: function (style) {
            this._descriptionField.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Switches the view in 'edit' mode what means that
     * 'refresh' method will be ignored until that view
     * leaves that mode.
     *
     * @chainable
     *
     * @param {Function} action The action to invoke.
     * @param {Boolean} [refresh] Call 'refresh' method after action was invoked or not.
     */
    TaskPie.prototype.edit = function (action, refresh) {
        if (refresh === void 0) { refresh = true; }
        try {
            this.set(exports.TASKPIE_FIELD_ISEDITING, true);
            action(this);
        }
        finally {
            this.set(exports.TASKPIE_FIELD_ISEDITING, false);
            if (refresh) {
                this.refresh();
            }
        }
        return this;
    };
    /**
     * Returns a category by index.
     *
     * @param {Number} index The zero based index.
     *
     * @return {ITaskCategory} The category.
     */
    TaskPie.prototype.getCategory = function (index) {
        return this._categoryGetter(index);
    };
    /**
     * Increases the count value of a category.
     *
     * @chainable
     *
     * @param {Number} index The zero based index of the category.
     * @param any [increaseBy] The custom value to use or the function provides it.
     *
     * @throws Increase value is NOT valid.
     */
    TaskPie.prototype.increase = function (index, increaseBy) {
        if (TypeUtils.isNullOrUndefined(increaseBy)) {
            increaseBy = 1;
        }
        var increaseByFunc = increaseBy;
        if (typeof increaseByFunc !== "function") {
            increaseByFunc = function () { return increaseBy; };
        }
        var cat = this._categoryGetter(index);
        var increaseVal = increaseByFunc(cat.count, cat, index, this);
        if (!isEmptyString(increaseVal)) {
            increaseVal = ('' + increaseVal).trim();
            if (isNaN(increaseVal)) {
                throw "'" + increaseVal + "' is NOT a valid number!";
            }
            increaseVal = parseFloat(increaseVal);
            var newValue = cat.count;
            if (isEmptyString(newValue)) {
                newValue = 0;
            }
            newValue += increaseVal;
            cat.count = newValue;
        }
        return this;
    };
    /**
     * Initializes that instance.
     */
    TaskPie.prototype.init = function () {
        var me = this;
        me.set(exports.TASKPIE_FIELD_ISEDITING, false);
        this.cssClass = 'nsTaskPie';
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addRow(new Grid.ItemSpec(1, "auto"));
        this.addColumn(new Grid.ItemSpec(1, "star"));
        // pie grid
        this._pieGrid = new Grid.GridLayout();
        this._pieGrid.cssClass = 'nsTaskPie-pieArea';
        this._pieGrid.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._pieGrid.verticalAlignment = UIEnums.VerticalAlignment.center;
        this._pieGrid.addRow(new Grid.ItemSpec(1, "auto"));
        this._pieGrid.addColumn(new Grid.ItemSpec(1, "star"));
        this._pieGrid.addColumn(new Grid.ItemSpec(4, "star"));
        this._pieGrid.addColumn(new Grid.ItemSpec(1, "star"));
        this.addChild(this._pieGrid);
        Grid.GridLayout.setRow(this._pieGrid, 0);
        Grid.GridLayout.setColumn(this._pieGrid, 0);
        // pie
        this._pieImage = new image_1.Image();
        this._pieImage.cssClass = 'nsTaskPie-pie';
        this._pieImage.stretch = UIEnums.Stretch.aspectFill;
        this._pieImage.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._pieImage.verticalAlignment = UIEnums.VerticalAlignment.center;
        this._pieGrid.addChild(this._pieImage);
        Grid.GridLayout.setRow(this._pieImage, 0);
        Grid.GridLayout.setColumn(this._pieImage, 1);
        this._pieTextArea = new Stack.StackLayout();
        this._pieTextArea.cssClass = 'nsTaskPie-textArea';
        this._pieTextArea.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._pieTextArea.verticalAlignment = UIEnums.VerticalAlignment.center;
        this._pieGrid.addChild(this._pieTextArea);
        Grid.GridLayout.setRow(this._pieTextArea, 0);
        Grid.GridLayout.setColumn(this._pieTextArea, 0);
        Grid.GridLayout.setColumnSpan(this._pieTextArea, 3);
        // pie text
        this._pieTextField = new label_1.Label();
        this._pieTextField.cssClass = 'nsTaskPie-text';
        this._pieTextField.textWrap = true;
        this._pieTextArea.addChild(this._pieTextField);
        // pie sub text
        this._pieSubTextField = new label_1.Label();
        this._pieSubTextField.cssClass = 'nsTaskPie-subText';
        this._pieSubTextField.textWrap = true;
        this._pieTextArea.addChild(this._pieSubTextField);
        // description
        this._descriptionField = new label_1.Label();
        this._descriptionField.cssClass = 'nsTaskPie-description';
        this._descriptionField.textWrap = true;
        this._descriptionField.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
        this._descriptionField.verticalAlignment = UIEnums.VerticalAlignment.center;
        this.addChild(this._descriptionField);
        Grid.GridLayout.setRow(this._descriptionField, 1);
        Grid.GridLayout.setColumn(this._descriptionField, 0);
        // initialize with defaults
        this.edit(function (pie) {
            pie.clearCategories();
            pie.addCategory('Not started', 'ffc90e', TaskCategoryType.NotStarted);
            pie.addCategory('Late', 'd54130', TaskCategoryType.NotStarted);
            pie.addCategory('In progress', '4cabe1', TaskCategoryType.InProgress);
            pie.addCategory('Completed', '88be39', TaskCategoryType.Completed);
        });
    };
    Object.defineProperty(TaskPie.prototype, "length", {
        /**
         * Gets the number of categories.
         */
        get: function () {
            return this._categoryLength();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieGrid", {
        /**
         * Gets the grid that contains the anything of the pie
         * like image and text fields.
         */
        get: function () {
            return this._pieGrid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieGridStyle", {
        /**
         * Sets the style for the pie grid.
         */
        set: function (style) {
            this._pieGrid.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieImage", {
        /**
         * Gets the image with the pie.
         */
        get: function () {
            return this._pieImage;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSize", {
        /**
         * Gets or sets the pie size.
         */
        get: function () {
            return this._pieSize;
        },
        set: function (value) {
            if (this._pieSize === value) {
                return;
            }
            this._pieSize = value;
            this.notifyPropertyChange("pieSize", value);
            this.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieStyle", {
        /**
         * Sets the style for the pie image.
         */
        set: function (style) {
            this._pieImage.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSubText", {
        /**
         * Gets or sets the pie sub text.
         */
        get: function () {
            return this._pieSubTextField.text;
        },
        set: function (value) {
            if (this._pieSubTextField.text === value) {
                return;
            }
            this._pieSubTextField.text = value;
            this.updateVisibilityOfViewByString(this._pieSubTextField.text, this._pieSubTextField);
            this.notifyPropertyChange("pieSubText", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSubTextField", {
        /**
         * Gets the text field with the pie sub text.
         */
        get: function () {
            return this._pieSubTextField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieSubTextStyle", {
        /**
         * Sets the style for the pie sub text field.
         */
        set: function (style) {
            this._pieSubTextField.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieText", {
        /**
         * Gets or sets the pie text.
         */
        get: function () {
            return this._pieTextField.text;
        },
        set: function (value) {
            if (this._pieTextField.text === value) {
                return;
            }
            this._pieTextField.text = value;
            this.updateVisibilityOfViewByString(this._pieTextField.text, this._pieTextField);
            this.notifyPropertyChange("pieSubText", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieTextArea", {
        /**
         * Gets the view that contains the pie texts.
         */
        get: function () {
            return this._pieTextArea;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieTextAreaStyle", {
        /**
         * Sets the style for the pie text area.
         */
        set: function (style) {
            this._pieTextArea.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieTextField", {
        /**
         * Gets the text field with the pie text.
         */
        get: function () {
            return this._pieTextField;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "pieTextStyle", {
        /**
         * Sets the style for the pie text field.
         */
        set: function (style) {
            this._pieTextField.setInlineStyle(style);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Raises all property changes that refer to the categories.
     *
     * @param {Boolean} [withCategories] Also raise property change for 'categories' or not.
     */
    TaskPie.prototype.raiseCategoryProperties = function (withCategories) {
        if (withCategories === void 0) { withCategories = false; }
        this.notifyPropertyChange('length', this.length);
        this.notifyPropertyChange('totalCompleted', this.totalCompleted);
        this.notifyPropertyChange('totalCount', this.totalCount);
        this.notifyPropertyChange('totalLeft', this.totalLeft);
        if (withCategories) {
            this.notifyPropertyChange("categories", this._categories);
        }
    };
    /**
     * Raises the 'count changed' event callback.
     */
    TaskPie.prototype.raiseCountChanged = function (category, oldValue) {
        var pie = this;
        var callback = this.countChanged;
        if (TypeUtils.isNullOrUndefined(callback)) {
            return;
        }
        var cb = callback;
        if (typeof cb !== "function") {
            // handle as function name
            var funcName = ('' + cb).trim();
            if ('' !== funcName) {
                cb = function () {
                    eval(funcName + '(category, category.count, oldValue, pie);');
                };
            }
        }
        cb(category, category.count, oldValue, this);
    };
    /**
     * Refreshs the view.
     */
    TaskPie.prototype.refresh = function () {
        if (this.get(exports.TASKPIE_FIELD_ISEDITING)) {
            return;
        }
        var categories = this._categories;
        var categoryLength = this._categoryLength;
        var categoryGetter = this._categoryGetter;
        // remove old category grid
        if (!TypeUtils.isNullOrUndefined(this._categoryGrid)) {
            this.removeChild(this._categoryGrid);
            while (this._categoryGrid.getChildrenCount() > 0) {
                var catView = this._categoryGrid.getChildAt(0);
                this._categoryGrid.removeChild(catView);
            }
        }
        var pieSize = 600.0;
        if (!isEmptyString(this._pieSize)) {
            pieSize = parseFloat(('' + this._pieSize).trim());
        }
        var ratio = pieSize / 300.0;
        var isPieVisible = false;
        var disposeBitmap = false;
        var pieBitmap = TaskPieHelpers.createBitmap(pieSize, pieSize);
        try {
            // draw pie
            var total = this.totalCount;
            if ((null !== total) && total > 0) {
                isPieVisible = true;
                var startAngel = 0;
                for (var i = 0; i < categoryLength(); i++) {
                    var cat = categoryGetter(i);
                    if (TypeUtils.isNullOrUndefined(cat.count) ||
                        cat.count <= 0) {
                        continue;
                    }
                    var sweetAngel;
                    if (i < (this._categories.length - 1)) {
                        sweetAngel = cat.count / total * 360;
                    }
                    else {
                        sweetAngel = 360 - startAngel;
                    }
                    pieBitmap.drawArc(16 * ratio, 16 * ratio, pieSize - 16 * ratio, pieSize - 16 * ratio, startAngel, sweetAngel, cat.color, cat.color);
                    startAngel += sweetAngel;
                }
                var innerColor = this._pieImage.backgroundColor;
                if (TypeUtils.isNullOrUndefined(innerColor)) {
                    innerColor = new Color.Color('white');
                }
                pieBitmap.drawCircle(pieSize / 2.0, pieSize / 2.0, pieSize / 2.0 - 56.0 * ratio, innerColor, innerColor);
            }
            if (!pieBitmap.apply(this._pieImage, true)) {
                disposeBitmap = true;
                this._pieImage.src = pieBitmap.toDataUrl();
            }
        }
        catch (e) {
            disposeBitmap = true;
            throw e;
        }
        finally {
            if (disposeBitmap) {
                pieBitmap.dispose();
            }
        }
        this._pieImage.visibility = isPieVisible ? UIEnums.Visibility.visible
            : UIEnums.Visibility.collapsed;
        // categories
        var newCatGrid = new Grid.GridLayout();
        newCatGrid = new Grid.GridLayout();
        newCatGrid.addRow(new Grid.ItemSpec(1, "star"));
        newCatGrid.cssClass = 'nsTaskPie-categories';
        if (categoryLength() > 0) {
            var catFactory = this.categoryFactory;
            if (TypeUtils.isNullOrUndefined(catFactory)) {
                // set default factory
                catFactory = function (c, ci, p) {
                    // category stack
                    var newCatView = new Stack.StackLayout();
                    newCatView.cssClass = 'nsTaskPie-category';
                    // border
                    var catViewBorder = new Border.Border();
                    catViewBorder.cssClass = 'nsTaskPie-border';
                    catViewBorder.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                    if (!isEmptyString(c.color)) {
                        catViewBorder.backgroundColor = new Color.Color('#' + c.color);
                    }
                    newCatView.addChild(catViewBorder);
                    // count
                    var catViewCountLabel = new label_1.Label();
                    catViewCountLabel.textWrap = true;
                    catViewCountLabel.cssClass = 'nsTaskPie-count';
                    catViewCountLabel.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                    if (!isEmptyString(c.count)) {
                        catViewCountLabel.text = ('' + c.count).trim();
                    }
                    p.updateVisibilityOfViewByString(catViewCountLabel.text, catViewCountLabel);
                    newCatView.addChild(catViewCountLabel);
                    // task name
                    var catViewNameLabel = new label_1.Label();
                    catViewNameLabel.textWrap = true;
                    catViewNameLabel.cssClass = 'nsTaskPie-name';
                    catViewNameLabel.horizontalAlignment = UIEnums.HorizontalAlignment.stretch;
                    if (!isEmptyString(c.name)) {
                        catViewNameLabel.text = ('' + c.name).trim();
                    }
                    p.updateVisibilityOfViewByString(catViewNameLabel.text, catViewNameLabel);
                    newCatView.addChild(catViewNameLabel);
                    return newCatView;
                };
            }
            for (var i = 0; i < this._categories.length; i++) {
                newCatGrid.addColumn(new Grid.ItemSpec(1, "star"));
                var catView = catFactory(categoryGetter(i), i, this);
                if (TypeUtils.isNullOrUndefined(catView)) {
                    continue;
                }
                newCatGrid.addChild(catView);
                Grid.GridLayout.setRow(catView, 0);
                Grid.GridLayout.setColumn(catView, i);
            }
        }
        this.addChild(newCatGrid);
        Grid.GridLayout.setRow(newCatGrid, 2);
        Grid.GridLayout.setColumn(newCatGrid, 0);
        this._categoryGrid = newCatGrid;
        this.updateCategoryStyle();
    };
    /**
     * Removes a category at a specific position.
     *
     * @chainable
     *
     * @param {Number} index The zero based index.
     */
    TaskPie.prototype.removeCategory = function (index) {
        var cats = this._categories;
        cats.splice(index, 1);
        return this;
    };
    /**
     * Returns the total number of tasks by type.
     *
     * @param {TaskType} type The type.
     *
     * @return {Number} The number of tasks.
     */
    TaskPie.prototype.total = function (type) {
        var total = null;
        for (var i = 0; i < this._categoryLength(); i++) {
            var cat = this._categoryGetter(i);
            if (!isNaN(cat.count)) {
                if (null === total) {
                    total = 0;
                }
                if (cat.type == type) {
                    total += cat.count;
                }
            }
        }
        return total;
    };
    Object.defineProperty(TaskPie.prototype, "totalCompleted", {
        /**
         * Gets the total number of completed tasks.
         */
        get: function () {
            var total = null;
            for (var i = 0; i < this._categoryLength(); i++) {
                var cat = this._categoryGetter(i);
                if (!isNaN(cat.count)) {
                    if (null === total) {
                        total = 0;
                    }
                    switch (cat.type) {
                        case TaskCategoryType.Completed:
                            total += cat.count;
                            break;
                    }
                }
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "totalCount", {
        /**
         * Gets the total count of all categories.
         */
        get: function () {
            var total = null;
            for (var i = 0; i < this._categoryLength(); i++) {
                var cat = this._categoryGetter(i);
                if (!isNaN(cat.count)) {
                    if (null === total) {
                        total = 0;
                    }
                    total += cat.count;
                }
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskPie.prototype, "totalLeft", {
        /**
         * Gets the total number of items that are not finished.
         */
        get: function () {
            var total = null;
            for (var i = 0; i < this._categoryLength(); i++) {
                var cat = this._categoryGetter(i);
                if (!isNaN(cat.count)) {
                    if (null === total) {
                        total = 0;
                    }
                    switch (cat.type) {
                        case TaskCategoryType.InProgress:
                        case TaskCategoryType.NotStarted:
                            total += cat.count;
                            break;
                    }
                }
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Updates anything for the category storage.
     */
    TaskPie.prototype.updateCategories = function () {
        this.updateCategoryGetters();
        this.updateCategoryListeners();
    };
    /**
     * Updates the getter callbacks for the current list of categories.
     */
    TaskPie.prototype.updateCategoryGetters = function () {
        var cats = this._categories;
        if (!TypeUtils.isNullOrUndefined(cats)) {
            this._categoryLength = function () { return cats.length; };
            if ((cats instanceof observable_array_1.ObservableArray) ||
                (cats instanceof virtual_array_1.VirtualArray)) {
                this._categoryGetter = function (itemIndex) { return cats.getItem(itemIndex); };
            }
            else {
                this._categoryGetter = function (itemIndex) { return cats[itemIndex]; };
            }
        }
        else {
            this._categoryGetter = null;
            this._categoryLength = null;
        }
    };
    /**
     * Updates the listeners for the category storage.
     */
    TaskPie.prototype.updateCategoryListeners = function () {
        var me = this;
        var cats = this._categories;
        if (!TypeUtils.isNullOrUndefined(this._categoryListener)) {
            this._categoryListener
                .object.off(Observable.Observable.propertyChangeEvent, this._categoryListener.callback);
        }
        this._categoryListener = null;
        if (cats instanceof Observable.Observable) {
            this._categoryListener = {
                object: cats,
                callback: function (e) {
                    switch (e.propertyName) {
                        case 'length':
                            me.refresh();
                            me.raiseCategoryProperties();
                            break;
                    }
                }
            };
            this._categoryListener
                .object.on(Observable.Observable.propertyChangeEvent, this._categoryListener.callback);
        }
    };
    /**
     * Updates the style of the current category grid.
     */
    TaskPie.prototype.updateCategoryStyle = function () {
        var catGrid = this._categoryGrid;
        if (TypeUtils.isNullOrUndefined(catGrid)) {
            return;
        }
        var style = this._categoryStyle;
        if (!isEmptyString(style)) {
            catGrid.setInlineStyle(style);
        }
    };
    /**
     * Updates the visibility of a view by a string.
     *
     * @param {String} str The string.
     * @param {View} view The view to update.
     * @param {String} [ifEmpty] The custom visibility value if 'str' is empty.
     * @param {String} [ifNotEmpty] The custom visibility value if 'str' is NOT empty.
     */
    TaskPie.prototype.updateVisibilityOfViewByString = function (str, view, ifEmpty, ifNotEmpty) {
        if (ifEmpty === void 0) { ifEmpty = UIEnums.Visibility.collapsed; }
        if (ifNotEmpty === void 0) { ifNotEmpty = UIEnums.Visibility.visible; }
        if (TypeUtils.isNullOrUndefined(view)) {
            return;
        }
        if (!isEmptyString(str)) {
            if (!isEmptyString(ifNotEmpty)) {
                view.visibility = ifNotEmpty;
            }
        }
        else {
            if (!isEmptyString(ifEmpty)) {
                view.visibility = ifEmpty;
            }
        }
    };
    /**
     * Dependency property for 'categories'
     */
    TaskPie.categoriesProperty = new dependency_observable_1.Property("categories", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function (value) { return TypeUtils.isNullOrUndefined(value) ||
        (value instanceof Array) ||
        (value instanceof observable_array_1.ObservableArray) ||
        (value instanceof virtual_array_1.VirtualArray); }, function (data) {
        var tp = data.object;
        tp.categories = data.newValue;
    }));
    /**
     * Dependency property for 'categoryStyle'
     */
    TaskPie.categoryStyleProperty = new dependency_observable_1.Property("categoryStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.categoryStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'countChanged'
     */
    TaskPie.countChangedProperty = new dependency_observable_1.Property("countChanged", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.countChanged = data.newValue;
    }));
    /**
     * Dependency property for 'counts'
     */
    TaskPie.countsProperty = new dependency_observable_1.Property("counts", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function (value) { return (value instanceof Array) ||
        (value instanceof observable_array_1.ObservableArray) ||
        (value instanceof virtual_array_1.VirtualArray) ||
        isEmptyString(value); }, function (data) {
        var tp = data.object;
        tp.counts = data.newValue;
    }));
    /**
     * Dependency property for 'description'
     */
    TaskPie.descriptionProperty = new dependency_observable_1.Property("description", "TaskPie", new proxy_1.PropertyMetadata('', dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.description = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'descriptionStyle'
     */
    TaskPie.descriptionStyleProperty = new dependency_observable_1.Property("descriptionStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.descriptionStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieGridStyle'
     */
    TaskPie.pieGridStyleProperty = new dependency_observable_1.Property("pieGridStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieGridStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieSize'
     */
    TaskPie.pieSizeProperty = new dependency_observable_1.Property("pieSize", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function (value) {
        return !isNaN(value) || TypeUtils.isNullOrUndefined(value);
    }, function (data) {
        var tp = data.object;
        var newValue = data.newValue;
        if (TypeUtils.isNullOrUndefined(newValue)) {
            newValue = TaskPieHelpers.getDefaultPieSize();
        }
        tp.pieSize = parseFloat(toStringSafe(data.newValue).trim());
    }));
    /**
     * Dependency property for 'pieStyle'
     */
    TaskPie.pieStyleProperty = new dependency_observable_1.Property("pieStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieSubText'
     */
    TaskPie.pieSubTextProperty = new dependency_observable_1.Property("pieSubText", "TaskPie", new proxy_1.PropertyMetadata('', dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieSubText = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieSubTextStyle'
     */
    TaskPie.pieSubTextStyleProperty = new dependency_observable_1.Property("pieSubTextStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieSubTextStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieText'
     */
    TaskPie.pieTextProperty = new dependency_observable_1.Property("pieText", "TaskPie", new proxy_1.PropertyMetadata('', dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieText = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieTextAreaStyle'
     */
    TaskPie.pieTextAreaStyleProperty = new dependency_observable_1.Property("pieTextAreaStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieTextAreaStyle = toStringSafe(data.newValue);
    }));
    /**
     * Dependency property for 'pieTextStyle'
     */
    TaskPie.pieTextStyleProperty = new dependency_observable_1.Property("pieTextStyle", "TaskPie", new proxy_1.PropertyMetadata(null, dependency_observable_1.PropertyMetadataSettings.Inheritable, null, function () { return true; }, function (data) {
        var tp = data.object;
        tp.pieTextStyle = toStringSafe(data.newValue);
    }));
    return TaskPie;
}(Grid.GridLayout));
exports.TaskPie = TaskPie;
/**
 * List of task category types.
 */
(function (TaskCategoryType) {
    /**
     * Pending
     */
    TaskCategoryType[TaskCategoryType["NotStarted"] = 1] = "NotStarted";
    /**
     * In progress
     */
    TaskCategoryType[TaskCategoryType["InProgress"] = 2] = "InProgress";
    /**
     * Completed
     */
    TaskCategoryType[TaskCategoryType["Completed"] = 3] = "Completed";
    /**
     * Skipped
     */
    TaskCategoryType[TaskCategoryType["Skipped"] = 4] = "Skipped";
    /**
     * Failed
     */
    TaskCategoryType[TaskCategoryType["Failed"] = 5] = "Failed";
})(exports.TaskCategoryType || (exports.TaskCategoryType = {}));
var TaskCategoryType = exports.TaskCategoryType;
/**
 * A notifiable task category.
 */
var TaskCategory = (function (_super) {
    __extends(TaskCategory, _super);
    /**
     * Initializes a new instance of that class.
     *
     * @param {TaskPie} parent The parent element.
     * @param {String} name The name.
     * @param {Color.Color} [color] The color.
     * @param {TaskType} [type] The type.
     * @param {Number} [count] The count.
     */
    function TaskCategory(parent, name, color, type, count) {
        if (count === void 0) { count = 0; }
        _super.call(this);
        this._count = 0;
        this._parent = parent;
        this._name = name;
        this._count = count;
        this._color = color;
        this._type = type;
    }
    Object.defineProperty(TaskCategory.prototype, "color", {
        /** @inheritdoc */
        get: function () {
            return this._color;
        },
        set: function (value) {
            if (this._color === value) {
                return;
            }
            this._color = value;
            this.notifyPropertyChange("color", value);
            this.parent.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskCategory.prototype, "count", {
        /** @inheritdoc */
        get: function () {
            return this._count;
        },
        set: function (value) {
            if (this._count === value) {
                return;
            }
            var oldValue = this._count;
            this._count = value;
            this.notifyPropertyChange("count", value);
            this.parent.refresh();
            this.parent.raiseCategoryProperties();
            this.parent.raiseCountChanged(this, oldValue);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskCategory.prototype, "name", {
        /** @inheritdoc */
        get: function () {
            return this._name;
        },
        set: function (value) {
            if (this._name === value) {
                return;
            }
            this._name = '' + value;
            this.notifyPropertyChange("name", value);
            this.parent.refresh();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskCategory.prototype, "parent", {
        /**
         * Gets the parent element.
         */
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TaskCategory.prototype, "type", {
        /** @inheritdoc */
        get: function () {
            return this._type;
        },
        set: function (value) {
            if (this._type === value) {
                return;
            }
            this._type = value;
            this.notifyPropertyChange("type", value);
            this.parent.refresh();
        },
        enumerable: true,
        configurable: true
    });
    return TaskCategory;
}(Observable.Observable));
exports.TaskCategory = TaskCategory;
function isEmptyString(str) {
    return TypeUtils.isNullOrUndefined(str) ||
        '' === ('' + str).trim();
}
function toStringSafe(v) {
    if (TypeUtils.isNullOrUndefined(v)) {
        return '';
    }
    return '' + v;
}
//# sourceMappingURL=index.js.map