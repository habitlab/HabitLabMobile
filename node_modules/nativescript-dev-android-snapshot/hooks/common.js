var path = require("path");
var fs = require("fs");
var shelljs = require("shelljs");

exports.environmentVariableToggleKey = "TNS_ANDROID_SNAPSHOT";

exports.prepareDeletedModules = function(platformAppDirectory, projectDir) {
    if (!shelljs.test("-e", path.join(platformAppDirectory, "tns_modules/application")) &&
        !shelljs.test("-e", path.join(platformAppDirectory, "tns_modules/tns-core-modules/application"))) {
        shelljs.touch("-c", path.join(projectDir, "node_modules/nativescript-angular/package.json"));
        shelljs.touch("-c", path.join(projectDir, "node_modules/tns-core-modules/package.json"));
    }
};

exports.isSnapshotEnabled = function(projectData, hookArgs) {
    var isAndroidPlatform = hookArgs && hookArgs.platform && hookArgs.platform.toLowerCase() === "android";
    if (!isAndroidPlatform) {
        return false;
    }

    var isReleaseBuild = hookArgs && hookArgs.appFilesUpdaterOptions ? hookArgs.appFilesUpdaterOptions.release : projectData.$options.release;
    var shouldBundle = hookArgs && hookArgs.appFilesUpdaterOptions ? hookArgs.appFilesUpdaterOptions.bundle : projectData.$options.bundle;

    if (process.env[exports.environmentVariableToggleKey] === "0") {
        return false;
    }

    if (shouldBundle) {
        return false;
    }

    if (isReleaseBuild || process.env[exports.environmentVariableToggleKey]) {
        return true;
    }

    return false;
};

exports.isAngularInstalled = function(projectData) {
    return shelljs.test("-e", path.join(projectData.projectDir, "node_modules/nativescript-angular"));
};

function getV8Version(androidPlatformData) {
    var nativescriptLibraryPath = path.join(androidPlatformData.projectRoot, "libs/runtime-libs/nativescript-regular.aar");

    if (!shelljs.test("-e", nativescriptLibraryPath)) {
        nativescriptLibraryPath = path.join(androidPlatformData.projectRoot, "libs/runtime-libs/nativescript.aar")
    }

    var zip = new require("adm-zip")(nativescriptLibraryPath);

    var config = zip.readAsText("config.json");
    if (!config) {
        return "4.7.80";
    }

    var version = JSON.parse(config)["v8-version"];
    return version;
}

exports.getAndroidRuntimeVersion = function(projectData, androidPlatformData) {
    if (!shelljs.test("-e", androidPlatformData.projectRoot)) {
        return null;
    }

    try {
        var appPackageJSON = JSON.parse(fs.readFileSync(projectData.projectFilePath, "utf8"));
        var version = appPackageJSON["nativescript"]["tns-android"]["version"];
        return version.replace(/\-.*/, "");
    } catch(e) {
        return null;
    }
};

exports.getSnapshotPackage = function(projectData, androidPlatformData, isAngularApp) {
    var packageName = isAngularApp ? "nativescript-angular" : "tns-core-modules";
    var packageJSON = JSON.parse(fs.readFileSync(path.join(projectData.projectDir, "node_modules", packageName, "package.json"), "utf8"));

    return {
        originalName: packageJSON.name,
        name: packageJSON.name + "-snapshot",
        version: "latest-" + packageJSON.version + "-" + getV8Version(androidPlatformData),
    };
};

function getSnapshotPackageTags(packageName) {
    var proc = shelljs.exec("npm view --json " + packageName + " dist-tags", { silent: true });
    if (proc.code !== 0) {
        return false;
    }

    var result = JSON.parse(proc.stdout.toString("utf8"));
    return result;
}

exports.isPackageInstalled = function(packageInfo) {
    var coreVersion = packageInfo.version.replace(/^latest-/, '');

    var packageJsonPath = "./node_modules/" + packageInfo.name + "/package.json";
    if (fs.existsSync(packageJsonPath)) {
        var packageJsonContent = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        if (packageJsonContent.version == coreVersion) {
            return true;
        }

        var publishedSnapshotPackageVersions = getSnapshotPackageTags(packageInfo.name);
        var latestTagVersion = publishedSnapshotPackageVersions[packageInfo.version];

        if (!latestTagVersion) {
            return false;
        }

        if (packageJsonContent.version == latestTagVersion) {
            return true;
        }
    }

    return false;
};

exports.isPackagePublished = function(packageInfo) {
    var publishedSnapshotPackageVersions = getSnapshotPackageTags(packageInfo.name);
    return !!publishedSnapshotPackageVersions[packageInfo.version];
};

exports.installPublishedPackage = function(logger, packageInfo) {
    var proc = shelljs.exec("npm install " + packageInfo.name + "@" + packageInfo.version + " --save --save-exact", { silent: true });
    if (proc.code !== 0) {
        throw new Error("Failed to install package \"" + packageInfo.name + "@" + packageInfo.version + "\".");
    }
};

exports.uninstallPackage = function(packageInfo) {
    shelljs.exec("npm uninstall " + packageInfo.name + " --save", { silent: true });
};

// This is required to ensure that all npm operations are executed in the project directory.
exports.executeInProjectDir = function(projectDir, action) {
    var currentDir = shelljs.pwd();
    shelljs.cd(projectDir);
    try {
        action();
    } finally {
        shelljs.cd(currentDir);
    }
}
