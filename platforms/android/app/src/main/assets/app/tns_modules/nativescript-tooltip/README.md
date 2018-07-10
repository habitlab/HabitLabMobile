[![npm](https://img.shields.io/npm/v/nativescript-tooltip.svg)](https://www.npmjs.com/package/nativescript-tooltip)
[![npm](https://img.shields.io/npm/dt/nativescript-tooltip.svg?label=npm%20downloads)](https://www.npmjs.com/package/nativescript-tooltip)

#NativeScript ToolTip

##Install
`tns plugin add nativescript-tooltip`

##Usage
TypeScript
```ts
import {ToolTip} from "nativescript-tooltip";
const tip = new ToolTip(view,{text:"Some Text"});
tip.show();  //.hide()
```
JavaScript
```js
const ToolTip = require("nativescript-tooltip").ToolTip;
const tip = new ToolTip(view,{text:"Some Text"});
tip.show();  //.hide()
```
##Styling

###Android

Add the following to your styles.xml in `app/App_Resources/Android/values`
```xml
<!-- Custom ToolTip -->

    <style name="CustomToolTipLayoutStyle" parent="ToolTipLayoutDefaultStyle">
        <item name="ttlm_backgroundColor">#FFFF00</item>
        <item name="android:textColor">#000000</item>
    </style>
```

###IOS
TypeScript
```ts
import {ToolTip} from "nativescript-tooltip";
const tip = new ToolTip(view,{text:"Some Text",backgroundColor:"pink",textColor:"black"});
tip.show();  //.hide()
```
JavaScript
```js
const ToolTip = require("nativescript-tooltip").ToolTip;
const tip = new ToolTip(view,{text:"Some Text",backgroundColor:"pink",textColor:"black"});
tip.show();  //.hide()
```
###Config
```ts
const config = {
  position?: "left" | "up" | "right" | "down" | "top" | "bottom";;
  text: string;
  viewType?: "native";
  duration?: number;
  fadeDuration?: number,
  width?: number;
  delay?: number;
  hideArrow?: boolean;
  backgroundColor?: string;
  textColor?: string;
  style?:string;
}
```

#ScreenShots
Android | IOS
--------- | ----------
![ss](ss/tooltip_android.png?raw=true) | ![splash](ss/tooltip_ios.png?raw=true)