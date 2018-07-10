"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var application = require("application");
var VersionNumber = (function () {
    function VersionNumber() {
    }
    VersionNumber.prototype.get = function () {
        var PackageManager = android.content.pm.PackageManager;
        var pkg = application.android.context.getPackageManager().getPackageInfo(application.android.context.getPackageName(), PackageManager.GET_META_DATA);
        return pkg.versionName;
    };
    return VersionNumber;
}());
exports.VersionNumber = VersionNumber;
//# sourceMappingURL=version-number.js.map