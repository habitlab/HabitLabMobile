import { ToolTipConfig } from "./tooltip.common";
export declare class ToolTip {
    private builder;
    private tip;
    constructor(view: any, config: ToolTipConfig);
    show(): void;
    hide(): void;
    static getResource(type: any, name: any): any;
}
