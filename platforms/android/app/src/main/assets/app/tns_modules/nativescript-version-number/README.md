# NativeScript Version Number Plugin

A dead-simple plugin for retrieving the version number of your NativeScript app.

## Installation

```
tns plugin add nativescript-version-number
```

## Usage 

The version number plugin exposes a simple `VersionNumber()` class with a single instance method named `get()`. To get the version number of your app, instantiate an instance of `VersionNumber` and call its `get()` method.

``` TypeScript
import { VersionNumber } from "nativescript-version-number";

new VersionNumber().get();
```

The plugin is currently set up to return the `CFBundleShortVersionString` value from your app’s `Info.plist` file on iOS, and the `android:versionName` value from your app’s `AndroidManifest.xml` file on Android.

## License

MIT
