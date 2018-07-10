"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var view_1 = require("tns-core-modules/ui/core/view");
var types_1 = require("tns-core-modules/utils/types");
var utils_1 = require("tns-core-modules/utils/utils");
var video_source_1 = require("./video-source/video-source");
var VideoPlayerUtil = (function () {
    function VideoPlayerUtil() {
    }
    VideoPlayerUtil.debug = false;
    return VideoPlayerUtil;
}());
exports.VideoPlayerUtil = VideoPlayerUtil;
var CLogTypes;
(function (CLogTypes) {
    CLogTypes[CLogTypes["info"] = 0] = "info";
    CLogTypes[CLogTypes["warning"] = 1] = "warning";
    CLogTypes[CLogTypes["error"] = 2] = "error";
})(CLogTypes = exports.CLogTypes || (exports.CLogTypes = {}));
exports.CLog = function (type) {
    if (type === void 0) { type = 0; }
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (VideoPlayerUtil.debug) {
        if (type === 0) {
            console.log('NativeScript-VideoPlayer: INFO', args);
        }
        else if (type === 1) {
            console.log('NativeScript-VideoPlayer: WARNING', args);
        }
        else if (type === 2) {
            console.log('NativeScript-VideoPlayer: ERROR', args);
        }
    }
};
var VideoCommon = (function (_super) {
    __extends(VideoCommon, _super);
    function VideoCommon() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.autoplay = false;
        _this.controls = true;
        _this.loop = false;
        _this.muted = false;
        _this.fill = false;
        return _this;
    }
    Object.defineProperty(VideoCommon.prototype, "debug", {
        set: function (value) {
            VideoPlayerUtil.debug = value;
        },
        enumerable: true,
        configurable: true
    });
    VideoCommon.prototype.sendEvent = function (eventName, data, msg) {
        this.notify({
            eventName: eventName,
            object: this,
            data: data,
            message: msg
        });
    };
    VideoCommon.errorEvent = 'errorEvent';
    VideoCommon.playbackReadyEvent = 'playbackReady';
    VideoCommon.playbackStartEvent = 'playbackStart';
    VideoCommon.seekToTimeCompleteEvent = 'seekToTimeComplete';
    VideoCommon.currentTimeUpdatedEvent = 'currentTimeUpdated';
    VideoCommon.finishedEvent = 'finishedEvent';
    VideoCommon.mutedEvent = 'mutedEvent';
    VideoCommon.unmutedEvent = 'unmutedEvent';
    VideoCommon.pausedEvent = 'pausedEvent';
    VideoCommon.volumeSetEvent = 'volumeSetEvent';
    return VideoCommon;
}(view_1.View));
exports.VideoCommon = VideoCommon;
exports.srcProperty = new view_1.Property({
    name: 'src',
    valueChanged: onSrcPropertyChanged
});
exports.srcProperty.register(VideoCommon);
exports.headersProperty = new view_1.Property({
    name: 'headers',
    valueChanged: onHeadersPropertyChanged
});
exports.headersProperty.register(VideoCommon);
exports.videoSourceProperty = new view_1.Property({
    name: 'videoSource'
});
exports.videoSourceProperty.register(VideoCommon);
exports.isLoadingProperty = new view_1.Property({
    name: 'isLoading',
    valueConverter: view_1.booleanConverter
});
exports.isLoadingProperty.register(VideoCommon);
exports.observeCurrentTimeProperty = new view_1.Property({
    name: 'observeCurrentTime',
    valueConverter: view_1.booleanConverter
});
exports.observeCurrentTimeProperty.register(VideoCommon);
exports.autoplayProperty = new view_1.Property({
    name: 'autoplay',
    valueConverter: view_1.booleanConverter
});
exports.autoplayProperty.register(VideoCommon);
exports.controlsProperty = new view_1.Property({
    name: 'controls',
    valueConverter: view_1.booleanConverter
});
exports.controlsProperty.register(VideoCommon);
exports.loopProperty = new view_1.Property({
    name: 'loop',
    valueConverter: view_1.booleanConverter
});
exports.loopProperty.register(VideoCommon);
exports.mutedProperty = new view_1.Property({
    name: 'muted',
    valueConverter: view_1.booleanConverter
});
exports.mutedProperty.register(VideoCommon);
exports.fillProperty = new view_1.Property({
    name: 'fill',
    valueConverter: view_1.booleanConverter
});
exports.fillProperty.register(VideoCommon);
function onSrcPropertyChanged(view, oldValue, newValue) {
    exports.CLog(CLogTypes.info, 'VideoCommon.onSrcPropertyChanged ---', "view: " + view + ", oldValue: " + oldValue + ", newValue: " + newValue);
    var video = view;
    var value = newValue;
    if (types_1.isString(value)) {
        value = value.trim();
        video.videoSource = null;
        video['_url'] = value;
        video.isLoadingProperty = true;
        if (utils_1.isFileOrResourcePath(value)) {
            video.videoSource = video_source_1.fromFileOrResource(value);
            video.isLoadingProperty = false;
        }
        else {
            if (video['_url'] === value) {
                video.videoSource = video_source_1.fromUrl(value);
                video.isLoadingProperty = false;
            }
        }
    }
    else if (value instanceof video_source_1.VideoSource) {
        video.videoSource = value;
    }
    else {
        video.videoSource = video_source_1.fromNativeSource(value);
    }
}
function onHeadersPropertyChanged(view, oldValue, newValue) {
    exports.CLog(CLogTypes.info, 'VideoCommon.onHeadersPropertyChanged ---', "view: " + view + ", oldValue: " + oldValue + ", newValue: " + newValue);
    var video = view;
    if (oldValue !== newValue) {
        if (video.src) {
            var src = video.src;
            onSrcPropertyChanged(view, null, null);
            onSrcPropertyChanged(view, null, src);
        }
    }
}
//# sourceMappingURL=videoplayer-common.js.map