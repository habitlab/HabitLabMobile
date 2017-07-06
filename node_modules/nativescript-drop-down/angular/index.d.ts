import { AfterViewInit, ElementRef } from "@angular/core";
import { BaseValueAccessor } from "nativescript-angular";
import { View } from "tns-core-modules/ui/core/view";
export declare type SelectableView = {
    selectedIndex: number;
} & View;
export declare class SelectedIndexValueAccessor extends BaseValueAccessor<SelectableView> implements AfterViewInit {
    private _normalizedValue;
    private viewInitialized;
    constructor(elementRef: ElementRef);
    selectedIndexChangeListener(event: any): void;
    onTouched: () => void;
    writeValue(value: any): void;
    ngAfterViewInit(): void;
    registerOnTouched(fn: () => void): void;
}
export declare class DropDownModule {
}
