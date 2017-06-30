var path = require("path");
var fs = require("fs");
var shelljs = require("shelljs");
var common = require("./common");

function addSnapshotKeyInPackageJSON(appPackageJSONPath) {
    var appPackageJSON;
    if (!shelljs.test("-e", appPackageJSONPath)) {
        appPackageJSON = {};
    } else {
        appPackageJSON = JSON.parse(fs.readFileSync(appPackageJSONPath, 'utf8'));
    }

    appPackageJSON["android"] = appPackageJSON["android"] || {};
    appPackageJSON["android"]["heapSnapshotBlob"] = "../snapshots";

    fs.writeFileSync(appPackageJSONPath, JSON.stringify(appPackageJSON, null, 2));
}

function deleteNativeScriptCoreModules(projectData, platformAppDirectory) {
    var tnsModulesFolders = shelljs.ls(path.join(projectData.projectDir, "node_modules", "tns-core-modules"));
    for (var i = 0; i < tnsModulesFolders.length; i++) {
        shelljs.rm("-rf", path.join(platformAppDirectory, "tns_modules", tnsModulesFolders[i]));
        shelljs.rm("-rf", path.join(platformAppDirectory, "tns_modules/tns-core-modules", tnsModulesFolders[i]));
    }
}

function deleteAngularModules(projectData, platformAppDirectory) {
    var nativeScriptAngularPackageJson = JSON.parse(fs.readFileSync(path.join(projectData.projectDir, "node_modules", "nativescript-angular/package.json"), "utf8"));
    var dependencies = nativeScriptAngularPackageJson["dependencies"];
    if (nativeScriptAngularPackageJson["peerDependencies"]) {
        for (var peerDep in nativeScriptAngularPackageJson["peerDependencies"]) { 
            dependencies[peerDep] = nativeScriptAngularPackageJson["peerDependencies"][peerDep]; 
        }
    }
    var angularDependencies = Object.keys(dependencies);
    for (var i = 0; i < angularDependencies.length; i++) {
        if (/^@angular\//.test(angularDependencies[i])) {
            shelljs.rm("-rf", path.join(platformAppDirectory, "tns_modules", angularDependencies[i]));
            shelljs.rm("-rf", path.join(platformAppDirectory, "tns_modules/nativescript-angular/node_modules", angularDependencies[i]));
        }
    }

    shelljs.rm("-rf", path.join(platformAppDirectory, "tns_modules", "nativescript-angular"));
}

function deleteBundledFiles(pluginDirectory, platformAppDirectory) {
    var modulesInSnapshot = Object.keys(JSON.parse(fs.readFileSync(path.join(pluginDirectory, "platforms/android-snapshot-files/bundle.records.json"), "utf8"))["modules"]["byIdentifier"]);
    for (var i = 0; i < modulesInSnapshot.length; i++) {
        if (/^\.\.\//.test(modulesInSnapshot[i]) || modulesInSnapshot[i].indexOf("^") !== -1) {
            continue;
        }

        shelljs.rm("-f", path.join(platformAppDirectory, "tns_modules", modulesInSnapshot[i]));
        shelljs.rm("-f", path.join(platformAppDirectory, "tns_modules", modulesInSnapshot[i].replace(/\.js$/, ".ts")));
        shelljs.rm("-f", path.join(platformAppDirectory, "tns_modules", modulesInSnapshot[i].replace(/\.js$/, ".d.ts")));
        shelljs.rm("-f", path.join(platformAppDirectory, "tns_modules", modulesInSnapshot[i] + ".map"));
    }
}

function prepareSnapshotPluginFiles(pluginDirectory, platformAppDirectory) {
    shelljs.cp(path.join(pluginDirectory, "platforms/android-snapshot-files/_embedded_script_.js"), platformAppDirectory);
    shelljs.cp(path.join(pluginDirectory, "platforms/android-snapshot-files/tns-java-classes.js"), platformAppDirectory);

    shelljs.rm("-rf", path.join(platformAppDirectory, "../snapshots"));
    var snapshotBlobs = path.join(pluginDirectory, "platforms/android-snapshot-files/snapshots")
    if (shelljs.test("-e", snapshotBlobs)) {
        shelljs.cp("-r", snapshotBlobs, path.join(platformAppDirectory, ".."));
        addSnapshotKeyInPackageJSON(path.join(platformAppDirectory, "package.json"));
    }
}

module.exports = function(logger, platformsData, projectData, hookArgs) {
    var platformName = hookArgs.platform.toLowerCase();

    if (platformName !== "android") {
        return;
    }

    common.executeInProjectDir(projectData.projectDir, function() {
        var platformAppDirectory = path.join(platformsData.getPlatformData(platformName).appDestinationDirectoryPath, "app");

        if (!common.isSnapshotEnabled(projectData, hookArgs)) {
            var bundle = hookArgs && hookArgs.appFilesUpdaterOptions ? hookArgs.appFilesUpdaterOptions.bundle : projectData.$options.bundle;
            if (platformName === "android" && !bundle) {
                // TODO: Fix this in the CLI if possible
                if (shelljs.test("-e", path.join(projectData.projectDir, "node_modules", "@angular/core")) &&
                    !shelljs.test("-e", path.join(platformAppDirectory, "tns_modules", "@angular/core"))) {
                    shelljs.cp("-r", path.join(projectData.projectDir, "node_modules", "@angular"), path.join(platformAppDirectory, "tns_modules"));
                }
            }
            return;
        }

        var isAngularApp = common.isAngularInstalled(projectData);
        var snapshotPackage = common.getSnapshotPackage(projectData, platformsData.getPlatformData(platformName), isAngularApp);

        // Installation has failed for some reason.
        if (!common.isPackageInstalled(snapshotPackage)) {
            return;
        }

        var pluginDirectory = path.join(projectData.projectDir, "node_modules", snapshotPackage.name);

        deleteNativeScriptCoreModules(projectData, platformAppDirectory);
        if (isAngularApp) {
            deleteAngularModules(projectData, platformAppDirectory);
        }

        deleteBundledFiles(pluginDirectory, platformAppDirectory);

        shelljs.rm("-rf", path.join(platformAppDirectory, "tns_modules", "shelljs"));

        prepareSnapshotPluginFiles(pluginDirectory, platformAppDirectory);

        if (isAngularApp) {
            logger.warn("The \"nativescript-angular\" and \"tns-core-modules\" packages and their dependencies have been deleted from the final assets.");
        } else {
            logger.warn("The \"tns-core-modules\" package and its dependencies have been deleted from the final assets.");
        }
        logger.warn("Application will now use package \"" + snapshotPackage.name + "@" + snapshotPackage.version + "\" which includes these packages in precompiled form instead.");
    });
};
