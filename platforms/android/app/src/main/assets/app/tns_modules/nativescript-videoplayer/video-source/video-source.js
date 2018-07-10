"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var fs = require("tns-core-modules/file-system");
var app = require("tns-core-modules/application");
var types_1 = require("tns-core-modules/utils/types");
var videoplayer_common_1 = require("../videoplayer-common");
__export(require("./video-source-common"));
var VideoSource = (function () {
    function VideoSource() {
    }
    VideoSource.prototype.loadFromResource = function (name) {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.loadFromResource ---", "name: " + name);
        this.android = null;
        var res = utils.ad.getApplicationContext().getResources();
        if (res) {
            var packageName = app.android.context.getPackageName();
            var UrlPath = "android.resource://" + packageName + "/R.raw." + name;
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.loadFromResource ---", "UrlPath: " + UrlPath);
            this.android = UrlPath;
        }
        return this.android != null;
    };
    VideoSource.prototype.loadFromUrl = function (url) {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.loadFromUrl ---", "url: " + url);
        this.android = null;
        this.android = url;
        return this.android != null;
    };
    VideoSource.prototype.loadFromFile = function (path) {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.loadFromFile ---", "path: " + path);
        var fileName = types_1.isString(path) ? path.trim() : '';
        if (fileName.indexOf('~/') === 0) {
            fileName = fs.path.join(fs.knownFolders.currentApp().path, fileName.replace('~/', ''));
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.loadFromFile ---", "fileName: " + fileName);
        }
        this.android = fileName;
        return this.android != null;
    };
    VideoSource.prototype.setNativeSource = function (source) {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.setNativeSource ---", "source: " + source);
        this.android = source;
        return source != null;
    };
    Object.defineProperty(VideoSource.prototype, "height", {
        get: function () {
            if (this.android) {
                var h = this.android.getHeight();
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.height --- returning " + h);
                return h;
            }
            return NaN;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VideoSource.prototype, "width", {
        get: function () {
            if (this.android) {
                var w = this.android.getWidth();
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "VideoSource.width --- returning " + w);
                return w;
            }
            return NaN;
        },
        enumerable: true,
        configurable: true
    });
    return VideoSource;
}());
exports.VideoSource = VideoSource;
//# sourceMappingURL=video-source.js.map