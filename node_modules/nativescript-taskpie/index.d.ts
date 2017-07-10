import Color = require('color');
import Grid = require('ui/layouts/grid-layout');
import { Image } from 'ui/image';
import { Label } from 'ui/label';
import Observable = require('data/observable');
import { ObservableArray } from 'data/observable-array';
import { Property } from "ui/core/dependency-observable";
import Stack = require('ui/layouts/stack-layout');
import { View } from 'ui/core/view';
import { VirtualArray } from 'data/virtual-array';
/**
 * Name of the field that determines if TaskPie is in edit mode or not.
 */
export declare const TASKPIE_FIELD_ISEDITING: string;
/**
 * Describes a bitmap.
 */
export interface IBitmap {
    /**
     * Applies that bitmap over an image view.
     *
     * @param {Image} view The target view.
     * @param {Boolean} [disposeOld] Dispose old bitmap of view or not.
     *
     * @return {Boolean} Operation was successful or not.
     */
    apply(view: Image, disposeOld?: boolean): boolean;
    /**
     * Frees memory.
     */
    dispose(): any;
    /**
     * Draw the specified arc, which will be scaled to fit inside the specified oval.
     *
     * @chainable
     *
     * @param {Number} left
     * @param {Number} top
     * @param {Number} right
     * @param {Number} bottom
     * @param {Number} startAngle Starting angle (in degrees) where the arc begins.
     * @param {Number} sweepAngle Sweep angle (in degrees) measured clockwise.
     * @param {IArgb} [color] The border color.
     * @param {IArgb} [fillColor] The fill color.
     */
    drawArc(left: number, top: number, right: number, bottom: number, startAngle: number, sweepAngle: number, color?: string | number | Color.Color, fillColor?: string | number | Color.Color): IBitmap;
    /**
     * Draws a circle.
     *
     * @chainable
     *
     * @param {Number} cx The x coordinate of the center of the circle.
     * @param {Number} cy The y coordinate of the center of the circle.
     * @param {IArgb} [color] The border color.
     * @param {IArgb} [fillColor] The fill color.
     */
    drawCircle(cx: number, cy: number, radius: number, color?: string | number | Color.Color, fillColor?: string | number | Color.Color): IBitmap;
    /**
     * Returns that bitmap as data url in PNG format.
     *
     * @return {String} The bitmap as data url.
     */
    toDataUrl(): string;
}
/**
 * Describes a task category.
 */
export interface ITaskCategory {
    /**
     * The color.
     */
    color?: string | number | Color.Color;
    /**
     * Number of tasks.
     */
    count?: number;
    /**
     * The name.
     */
    name: string;
    /**
     * The type.
     */
    type?: TaskCategoryType;
}
/**
 * A task pie view.
 */
export declare class TaskPie extends Grid.GridLayout {
    /**
     * Dependency property for 'categories'
     */
    static categoriesProperty: Property;
    /**
     * Dependency property for 'categoryStyle'
     */
    static categoryStyleProperty: Property;
    /**
     * Dependency property for 'countChanged'
     */
    static countChangedProperty: Property;
    /**
     * Dependency property for 'counts'
     */
    static countsProperty: Property;
    /**
     * Dependency property for 'description'
     */
    static descriptionProperty: Property;
    /**
     * Dependency property for 'descriptionStyle'
     */
    static descriptionStyleProperty: Property;
    /**
     * Dependency property for 'pieGridStyle'
     */
    static pieGridStyleProperty: Property;
    /**
     * Dependency property for 'pieSize'
     */
    static pieSizeProperty: Property;
    /**
     * Dependency property for 'pieStyle'
     */
    static pieStyleProperty: Property;
    /**
     * Dependency property for 'pieSubText'
     */
    static pieSubTextProperty: Property;
    /**
     * Dependency property for 'pieSubTextStyle'
     */
    static pieSubTextStyleProperty: Property;
    /**
     * Dependency property for 'pieText'
     */
    static pieTextProperty: Property;
    /**
     * Dependency property for 'pieTextAreaStyle'
     */
    static pieTextAreaStyleProperty: Property;
    /**
     * Dependency property for 'pieTextStyle'
     */
    static pieTextStyleProperty: Property;
    private _categories;
    private _categoryGetter;
    private _categoryLength;
    private _categoryListener;
    private _categoryGrid;
    private _categoryStyle;
    private _descriptionField;
    private _pieGrid;
    private _pieImage;
    private _pieSize;
    private _pieSubTextField;
    private _pieTextArea;
    private _pieTextField;
    /**
     * Initializes a new instance of that class.
     */
    constructor(json?: any);
    /**
     * Adds a task category.
     *
     * @chainable
     *
     * @param {String} name The name of the category.
     * @param {Color.Color} color The color.
     * @param {Number} [count] The name of the category.
     */
    addCategory(name: string, color: string | Color.Color | number, type?: TaskCategoryType, count?: number): TaskPie;
    /**
     * Gets or sets the list of categories.
     */
    categories: ITaskCategory[] | ObservableArray<ITaskCategory> | VirtualArray<ITaskCategory>;
    /**
     * Sets a custom function that creates a view from a task category.
     */
    categoryFactory: (category: ITaskCategory, index: number, pie: TaskPie) => View;
    /**
     * Gets the grid that stores the category views.
     */
    categoryGrid: Grid.GridLayout;
    /**
     * Sets the style for the category grid.
     */
    categoryStyle: string;
    /**
     * Clears all categories.
     */
    clearCategories(): TaskPie;
    /**
     * Gets or sets the callback that is invoked when the count value of a task category has been changed.
     */
    countChanged: (cat: ITaskCategory, newValue: number, oldValue: number, pie: TaskPie) => void | string;
    /**
     * Gets or sets the 'count' values of the underlying task categories.
     *
     * @throws At least one new value is no valid number.
     */
    counts: string | number[] | ObservableArray<number> | VirtualArray<number>;
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
    decrease(index: number, decreaseBy?: (curVal: number, category: ITaskCategory, index: number, pie: TaskPie) => number | number): TaskPie;
    /**
     * Gets or sets the description.
     */
    description: string;
    /**
     * Gets the field with the description.
     */
    descriptionField: Label;
    /**
     * Sets the style for the description field.
     */
    descriptionStyle: string;
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
    edit(action: (pie: TaskPie) => void, refresh?: boolean): TaskPie;
    /**
     * Returns a category by index.
     *
     * @param {Number} index The zero based index.
     *
     * @return {ITaskCategory} The category.
     */
    getCategory(index: number): ITaskCategory;
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
    increase(index: number, increaseBy?: (curVal: number, category: ITaskCategory, index: number, pie: TaskPie) => number | number): TaskPie;
    /**
     * Initializes that instance.
     */
    protected init(): void;
    /**
     * Gets the number of categories.
     */
    length: number;
    /**
     * Gets the grid that contains the anything of the pie
     * like image and text fields.
     */
    pieGrid: Grid.GridLayout;
    /**
     * Sets the style for the pie grid.
     */
    pieGridStyle: string;
    /**
     * Gets the image with the pie.
     */
    pieImage: Image;
    /**
     * Gets or sets the pie size.
     */
    pieSize: number;
    /**
     * Sets the style for the pie image.
     */
    pieStyle: string;
    /**
     * Gets or sets the pie sub text.
     */
    pieSubText: string;
    /**
     * Gets the text field with the pie sub text.
     */
    pieSubTextField: Label;
    /**
     * Sets the style for the pie sub text field.
     */
    pieSubTextStyle: string;
    /**
     * Gets or sets the pie text.
     */
    pieText: string;
    /**
     * Gets the view that contains the pie texts.
     */
    pieTextArea: Stack.StackLayout;
    /**
     * Sets the style for the pie text area.
     */
    pieTextAreaStyle: string;
    /**
     * Gets the text field with the pie text.
     */
    pieTextField: Label;
    /**
     * Sets the style for the pie text field.
     */
    pieTextStyle: string;
    /**
     * Raises all property changes that refer to the categories.
     *
     * @param {Boolean} [withCategories] Also raise property change for 'categories' or not.
     */
    raiseCategoryProperties(withCategories?: boolean): void;
    /**
     * Raises the 'count changed' event callback.
     */
    raiseCountChanged(category: ITaskCategory, oldValue: number): void;
    /**
     * Refreshs the view.
     */
    refresh(): void;
    /**
     * Removes a category at a specific position.
     *
     * @chainable
     *
     * @param {Number} index The zero based index.
     */
    removeCategory(index: number): TaskPie;
    /**
     * Returns the total number of tasks by type.
     *
     * @param {TaskType} type The type.
     *
     * @return {Number} The number of tasks.
     */
    total(type: TaskCategoryType): number;
    /**
     * Gets the total number of completed tasks.
     */
    totalCompleted: number;
    /**
     * Gets the total count of all categories.
     */
    totalCount: number;
    /**
     * Gets the total number of items that are not finished.
     */
    totalLeft: number;
    /**
     * Updates anything for the category storage.
     */
    protected updateCategories(): void;
    /**
     * Updates the getter callbacks for the current list of categories.
     */
    protected updateCategoryGetters(): void;
    /**
     * Updates the listeners for the category storage.
     */
    protected updateCategoryListeners(): void;
    /**
     * Updates the style of the current category grid.
     */
    protected updateCategoryStyle(): void;
    /**
     * Updates the visibility of a view by a string.
     *
     * @param {String} str The string.
     * @param {View} view The view to update.
     * @param {String} [ifEmpty] The custom visibility value if 'str' is empty.
     * @param {String} [ifNotEmpty] The custom visibility value if 'str' is NOT empty.
     */
    updateVisibilityOfViewByString(str: string, view: View, ifEmpty?: string, ifNotEmpty?: string): void;
}
/**
 * List of task category types.
 */
export declare enum TaskCategoryType {
    /**
     * Pending
     */
    NotStarted = 1,
    /**
     * In progress
     */
    InProgress = 2,
    /**
     * Completed
     */
    Completed = 3,
    /**
     * Skipped
     */
    Skipped = 4,
    /**
     * Failed
     */
    Failed = 5,
}
/**
 * A notifiable task category.
 */
export declare class TaskCategory extends Observable.Observable implements ITaskCategory {
    private _color;
    private _count;
    private _name;
    private _parent;
    private _type;
    /**
     * Initializes a new instance of that class.
     *
     * @param {TaskPie} parent The parent element.
     * @param {String} name The name.
     * @param {Color.Color} [color] The color.
     * @param {TaskType} [type] The type.
     * @param {Number} [count] The count.
     */
    constructor(parent: TaskPie, name: string, color?: string | number | Color.Color, type?: TaskCategoryType, count?: number);
    /** @inheritdoc */
    color: string | number | Color.Color;
    /** @inheritdoc */
    count: number;
    /** @inheritdoc */
    name: string;
    /**
     * Gets the parent element.
     */
    parent: TaskPie;
    /** @inheritdoc */
    type: TaskCategoryType;
}
