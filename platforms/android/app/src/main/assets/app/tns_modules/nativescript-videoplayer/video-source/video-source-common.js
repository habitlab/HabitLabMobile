"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("tns-core-modules/utils/utils");
var video_source_1 = require("./video-source");
function fromResource(name) {
    var video = new video_source_1.VideoSource();
    return video.loadFromResource(name) ? video : null;
}
exports.fromResource = fromResource;
function fromFile(path) {
    var video = new video_source_1.VideoSource();
    return video.loadFromFile(path) ? video : null;
}
exports.fromFile = fromFile;
function fromNativeSource(source) {
    var video = new video_source_1.VideoSource();
    return video.setNativeSource(source) ? video : null;
}
exports.fromNativeSource = fromNativeSource;
function fromUrl(url) {
    var video = new video_source_1.VideoSource();
    return video.loadFromUrl(url) ? video : null;
}
exports.fromUrl = fromUrl;
function fromFileOrResource(path) {
    if (!isFileOrResourcePath(path)) {
        throw new Error("Path: " + path + " is not a valid file or resource.");
    }
    if (path.indexOf(utils_1.RESOURCE_PREFIX) === 0) {
        return fromResource(path.substr(utils_1.RESOURCE_PREFIX.length));
    }
    return fromFile(path);
}
exports.fromFileOrResource = fromFileOrResource;
function isFileOrResourcePath(path) {
    return utils_1.isFileOrResourcePath(path);
}
exports.isFileOrResourcePath = isFileOrResourcePath;
//# sourceMappingURL=video-source-common.js.map