var path = require('path');
var shelljs = require('shelljs');
var hook = require('nativescript-hook')(__dirname);
var common = require('./hooks/common');

var projectDir = hook.findProjectDir();
var platformAppDirectory = path.join(projectDir, "platforms/android/src/main/assets/app");

common.prepareDeletedModules(platformAppDirectory, projectDir);

common.executeInProjectDir(projectDir, function() {
    common.uninstallPackage({ name: "tns-core-modules-snapshot" });
    common.uninstallPackage({ name: "nativescript-angular-snapshot" });
});

shelljs.rm("-rf", path.join(platformAppDirectory, "app/tns-java-classes.js"));
shelljs.rm("-rf", path.join(platformAppDirectory, "app/_embedded_script_.js"));
shelljs.rm("-rf", path.join(platformAppDirectory, "../snapshots"));

hook.preuninstall();
