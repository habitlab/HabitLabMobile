"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("tns-core-modules/utils/utils");
var timer_1 = require("tns-core-modules/timer");
var videoplayer_common_1 = require("./videoplayer-common");
var STATE_IDLE = 0;
var STATE_PLAYING = 1;
var STATE_PAUSED = 2;
var SURFACE_WAITING = 0;
var SURFACE_READY = 1;
var Video = (function (_super) {
    __extends(Video, _super);
    function Video() {
        var _this = _super.call(this) || this;
        _this.nativeView = null;
        _this.player = null;
        _this._src = '';
        _this._owner = new WeakRef(_this);
        _this.textureSurface = null;
        _this.mediaController = null;
        _this.videoWidth = 0;
        _this.videoHeight = 0;
        _this._headers = null;
        _this.playState = STATE_IDLE;
        _this.mediaState = SURFACE_WAITING;
        _this.audioSession = -1;
        _this.preSeekTime = -1;
        _this.currentBufferPercentage = 0;
        _this._playbackTimeObserver = null;
        _this._playbackTimeObserverActive = false;
        return _this;
    }
    Object.defineProperty(Video.prototype, "android", {
        get: function () {
            return this.nativeView;
        },
        enumerable: true,
        configurable: true
    });
    Video.prototype[videoplayer_common_1.headersProperty.setNative] = function (value) {
        this._setHeader(value ? value : null);
    };
    Video.prototype[videoplayer_common_1.videoSourceProperty.setNative] = function (value) {
        this._setNativeVideo(value ? value.android : null);
    };
    Video.prototype.createNativeView = function () {
        var _this = this;
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.createNativeView');
        this.nativeView = new android.view.TextureView(this._context);
        this.nativeView.setFocusable(true);
        this.nativeView.setFocusableInTouchMode(true);
        this.nativeView.requestFocus();
        this.nativeView.setOnTouchListener(new android.view.View.OnTouchListener({
            onTouch: function (view, event) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'OnTouchListener --- onTouch', "view: " + view + ", event: " + event);
                _this._owner.get().toggleMediaControllerVisibility();
                return false;
            }
        }));
        this.nativeView.setSurfaceTextureListener(new android.view.TextureView.SurfaceTextureListener({
            onSurfaceTextureSizeChanged: function (surface, width, height) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'SurfaceTextureListener.onSurfaceTextureSizeChanged ---', "surface: " + surface + ", width: " + width + ", height: " + height);
            },
            onSurfaceTextureAvailable: function (surface, width, height) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'SurfaceTextureListener.onSurfaceTextureAvailable ---', "surface: " + surface);
                _this._owner.get().textureSurface = new android.view.Surface(surface);
                _this._owner.get().mediaState = SURFACE_WAITING;
                _this._owner.get()._openVideo();
            },
            onSurfaceTextureDestroyed: function (surface) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'SurfaceTextureListener.onSurfaceTextureDestroyed ---', "surface: " + surface);
                if (_this._owner.get().textureSurface !== null) {
                    _this._owner.get().textureSurface.release();
                    _this._owner.get().textureSurface = null;
                }
                if (_this._owner.get().mediaController !== null) {
                    _this._owner.get().mediaController.hide();
                }
                _this._owner.get().release();
                return true;
            },
            onSurfaceTextureUpdated: function () {
            }
        }));
        return this.nativeView;
    };
    Video.prototype.toggleMediaControllerVisibility = function () {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.toggleMediaControllerVisibility');
        if (!this.mediaController) {
            return;
        }
        if (this.mediaController.isShowing()) {
            this.mediaController.hide();
        }
        else {
            this.mediaController.show();
        }
    };
    Video.prototype.play = function () {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.play');
        this.playState = STATE_PLAYING;
        if (this.mediaState === SURFACE_WAITING) {
            this._openVideo();
        }
        else {
            if (this.observeCurrentTime && !this._playbackTimeObserverActive) {
                this._addPlaybackTimeObserver();
            }
            this.player.start();
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.play ---  emitting playbackStartEvent');
            this.sendEvent(videoplayer_common_1.VideoCommon.playbackStartEvent);
        }
    };
    Video.prototype.pause = function () {
        this.playState = STATE_PAUSED;
        this.player.pause();
        this.sendEvent(videoplayer_common_1.VideoCommon.pausedEvent);
        this._removePlaybackTimeObserver();
    };
    Video.prototype.mute = function (mute) {
        if (this.player) {
            if (mute === true) {
                this.player.setVolume(0, 0);
                this.sendEvent(videoplayer_common_1.VideoCommon.mutedEvent);
            }
            else if (mute === false) {
                this.player.setVolume(1, 1);
                this.sendEvent(videoplayer_common_1.VideoCommon.unmutedEvent);
            }
        }
    };
    Video.prototype.stop = function () {
        this.player.stop();
        this._removePlaybackTimeObserver();
        this.playState = STATE_IDLE;
        this.release();
    };
    Video.prototype.seekToTime = function (ms) {
        if (!this.player) {
            this.preSeekTime = ms;
            return;
        }
        else {
            this.preSeekTime = -1;
        }
        this.player.seekTo(ms);
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.play ---  emitting seekToTimeCompleteEvent');
        this.sendEvent(videoplayer_common_1.VideoCommon.seekToTimeCompleteEvent, { time: ms });
    };
    Video.prototype.isPlaying = function () {
        if (!this.player) {
            return false;
        }
        return this.player.isPlaying();
    };
    Video.prototype.getDuration = function () {
        if (!this.player || this.mediaState === SURFACE_WAITING || this.playState === STATE_IDLE) {
            return 0;
        }
        return this.player.getDuration();
    };
    Video.prototype.getCurrentTime = function () {
        if (!this.player) {
            return 0;
        }
        return this.player.getCurrentPosition();
    };
    Video.prototype.setVolume = function (volume) {
        this.player.setVolume(volume, volume);
        this.sendEvent(videoplayer_common_1.VideoCommon.volumeSetEvent);
    };
    Video.prototype.destroy = function () {
        this.release();
        this.src = null;
        this.nativeView = null;
        this.player = null;
        this.mediaController = null;
    };
    Video.prototype.release = function () {
        if (this.player !== null) {
            this.mediaState = SURFACE_WAITING;
            this.player.reset();
            this.player.release();
            this.player = null;
            if (this._playbackTimeObserverActive) {
                this._removePlaybackTimeObserver();
            }
            var am = utils.ad.getApplicationContext().getSystemService(android.content.Context.AUDIO_SERVICE);
            am.abandonAudioFocus(null);
        }
    };
    Video.prototype.suspendEvent = function () {
        this.release();
    };
    Video.prototype.resumeEvent = function () {
        this._openVideo();
    };
    Video.prototype.setNativeSource = function (nativePlayerSrc) {
        this._src = nativePlayerSrc;
        this._openVideo();
    };
    Video.prototype._setupMediaPlayerListeners = function () {
        var _this = this;
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video._setupMediaPlayerListeners');
        this.player.setOnPreparedListener(new android.media.MediaPlayer.OnPreparedListener({
            onPrepared: function (mp) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'MediaPlayer.OnPreparedListener.onPrepared ---', "mp: " + mp);
                if (_this._owner.get()) {
                    if (_this._owner.get().muted === true) {
                        mp.setVolume(0, 0);
                    }
                    if (_this._owner.get().mediaController != null) {
                        _this._owner.get().mediaController.setEnabled(true);
                    }
                    if (_this._owner.get().preSeekTime > 0) {
                        mp.seekTo(_this._owner.get().preSeekTime);
                    }
                    _this._owner.get().preSeekTime = -1;
                    _this._owner.get().videoWidth = mp.getVideoWidth();
                    _this._owner.get().videoHeight = mp.getVideoHeight();
                    _this._owner.get().mediaState = SURFACE_READY;
                    if (_this._owner.get().fill !== true) {
                        _this._owner.get()._setupAspectRatio();
                    }
                    if (_this._owner.get().videoWidth !== 0 && _this._owner.get().videoHeight !== 0) {
                        _this._owner
                            .get()
                            .nativeView.getSurfaceTexture()
                            .setDefaultBufferSize(_this._owner.get().videoWidth, _this._owner.get().videoHeight);
                    }
                    if (_this._owner.get().autoplay === true || _this._owner.get().playState === STATE_PLAYING) {
                        _this._owner.get().play();
                    }
                    videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.play ---  emitting playbackReadyEvent');
                    _this._owner.get().sendEvent(videoplayer_common_1.VideoCommon.playbackReadyEvent);
                    if (_this._owner.get().loop === true) {
                        mp.setLooping(true);
                    }
                }
            }
        }));
        this.player.setOnSeekCompleteListener(new android.media.MediaPlayer.OnSeekCompleteListener({
            onSeekComplete: function (mp) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'MediaPlayer.OnSeekCompleteListener.onSeekComplete ---', "mp: " + mp);
                if (_this._owner.get()) {
                    videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.play ---  emitting seekToTimeCompleteEvent');
                    _this._owner.get().sendEvent(videoplayer_common_1.VideoCommon.seekToTimeCompleteEvent);
                }
            }
        }));
        this.player.setOnVideoSizeChangedListener(new android.media.MediaPlayer.OnVideoSizeChangedListener({
            onVideoSizeChanged: function (mp, width, height) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'MediaPlayer.setOnVideoSizeChangedListener.onVideoSizeChanged ---', "mp: " + mp + ", width: " + width + ", heigth: " + height);
                if (_this._owner.get()) {
                    _this._owner.get().videoWidth = mp.getVideoWidth();
                    _this._owner.get().videoHeight = mp.getVideoHeight();
                    if (_this._owner.get().videoWidth !== 0 && _this._owner.get().videoHeight !== 0) {
                        _this._owner
                            .get()
                            .nativeView.getSurfaceTexture()
                            .setDefaultBufferSize(_this._owner.get().videoWidth, _this._owner.get().videoHeight);
                        if (_this._owner.get().fill !== true) {
                            _this._owner.get()._setupAspectRatio();
                        }
                    }
                }
            }
        }));
        this.player.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener({
            onCompletion: function (mp) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'MediaPlayer.OnCompletionListener.onCompletion ---', "mp: " + mp);
                if (_this._owner.get()) {
                    _this._owner.get()._removePlaybackTimeObserver();
                    videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video.play ---  emitting finishedEvent');
                    _this._owner.get().sendEvent(videoplayer_common_1.VideoCommon.finishedEvent);
                }
            }
        }));
        this.player.setOnBufferingUpdateListener(new android.media.MediaPlayer.OnBufferingUpdateListener({
            onBufferingUpdate: function (mp, percent) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'MediaPlayer.OnBufferingUpdateListener.onBufferingUpdate ---', "mp: " + mp + ", percent: " + percent);
                _this._owner.get().currentBufferPercentage = percent;
            }
        }));
        this.currentBufferPercentage = 0;
    };
    Video.prototype._setupMediaController = function () {
        var _this = this;
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video._setupMediaController');
        if (this.controls !== false || this.controls === undefined) {
            if (this.mediaController == null) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video._setupMediaController ---', 'creating new MediaController');
                this.mediaController = new android.widget.MediaController(this._context);
            }
            else {
                return;
            }
            var mediaPlayerControl = new android.widget.MediaController.MediaPlayerControl({
                canPause: function () {
                    return true;
                },
                canSeekBackward: function () {
                    return true;
                },
                canSeekForward: function () {
                    return true;
                },
                getAudioSessionId: function () {
                    return _this._owner.get().audioSession;
                },
                getBufferPercentage: function () {
                    return _this._owner.get().currentBufferPercentage;
                },
                getCurrentPosition: function () {
                    return _this._owner.get().getCurrentTime();
                },
                getDuration: function () {
                    return _this._owner.get().getDuration();
                },
                isPlaying: function () {
                    return _this._owner.get().isPlaying();
                },
                pause: function () {
                    _this._owner.get().pause();
                },
                seekTo: function (v) {
                    _this._owner.get().seekToTime(v);
                },
                start: function () {
                    _this._owner.get().play();
                }
            });
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupMediaController ---", "mediaController.setMediaPlayer(" + mediaPlayerControl + ")");
            this.mediaController.setMediaPlayer(mediaPlayerControl);
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupMediaController ---", "mediaController.setAnchorView(" + this.nativeView + ")");
            this.mediaController.setAnchorView(this.nativeView);
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupMediaController ---", "mediaController.setEnabled(true)");
            this.mediaController.setEnabled(true);
        }
    };
    Video.prototype._setupAspectRatio = function () {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupAspectRatio");
        var viewWidth = this.nativeView.getWidth();
        var viewHeight = this.nativeView.getHeight();
        var aspectRatio = this.videoHeight / this.videoWidth;
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupAspectRatio ---", "viewHeight: " + viewHeight + ", viewWidth: " + viewWidth + ", aspectRatio: " + aspectRatio);
        var newWidth;
        var newHeight;
        if (viewHeight > viewWidth * aspectRatio) {
            newWidth = viewWidth;
            newHeight = viewWidth * aspectRatio;
        }
        else {
            newWidth = viewHeight / aspectRatio;
            newHeight = viewHeight;
        }
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupAspectRatio ---", "newWidth: " + newWidth + ", newHeight: " + newHeight);
        var xoff = (viewWidth - newWidth) / 2;
        var yoff = (viewHeight - newHeight) / 2;
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupAspectRatio ---", "xoff: " + xoff + ", yoff: " + yoff);
        var txform = new android.graphics.Matrix();
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._setupAspectRatio ---", "txform: " + txform + ", txform: " + txform);
        this.nativeView.getTransform(txform);
        txform.setScale(newWidth / viewWidth, newHeight / viewHeight);
        txform.postTranslate(xoff, yoff);
        this.nativeView.setTransform(txform);
    };
    Video.prototype._openVideo = function () {
        var _this = this;
        if (this._src === null ||
            this.textureSurface === null ||
            (this._src !== null && typeof this._src === 'string' && this._src.length === 0)) {
            return;
        }
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._openVideo");
        this.release();
        var am = utils.ad.getApplicationContext().getSystemService(android.content.Context.AUDIO_SERVICE);
        am.requestAudioFocus(null, android.media.AudioManager.STREAM_MUSIC, android.media.AudioManager.AUDIOFOCUS_GAIN);
        try {
            this.player = new android.media.MediaPlayer();
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._openVideo ---", "this.player: " + this.player);
            if (this.audioSession !== null) {
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._openVideo ---", "setting audio session Id: " + this.audioSession);
                this.player.setAudioSessionId(this.audioSession);
            }
            else {
                this.audioSession = this.player.getAudioSessionId();
            }
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, "Video._openVideo --- ", "setting up MediaPlayerListeners");
            this._setupMediaPlayerListeners();
            if (!this._headers || this._headers.size() === 0) {
                this.player.setDataSource(this._src);
            }
            else {
                var videoUri = android.net.Uri.parse(this._src);
                this.player.setDataSource(utils.ad.getApplicationContext(), videoUri, this._headers);
            }
            this.player.setSurface(this.textureSurface);
            this.player.setAudioStreamType(android.media.AudioManager.STREAM_MUSIC);
            this.player.setScreenOnWhilePlaying(true);
            this.player.prepareAsync();
            this.player.setOnErrorListener(new android.media.MediaPlayer.OnErrorListener({
                onError: function (mp, what, extra) {
                    _this._owner.get().sendEvent(videoplayer_common_1.VideoCommon.errorEvent, { error: { what: what, extra: extra } });
                    return true;
                }
            }));
            this._setupMediaController();
        }
        catch (ex) {
            videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.error, "Video._openVideo --- error: " + ex + ", stack: " + ex.stack);
            this._owner.get().sendEvent(videoplayer_common_1.VideoCommon.errorEvent, { error: ex, stack: ex.stack });
        }
    };
    Video.prototype._setNativeVideo = function (nativeVideo) {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.error, "Video._setNativeVideo");
        this._src = nativeVideo;
        this._openVideo();
    };
    Video.prototype._setHeader = function (headers) {
        var _this = this;
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.error, "Video._setHeader ---", "headers: " + headers);
        if (headers && headers.size > 0) {
            this._headers = new java.util.HashMap();
            headers.forEach(function (value, key) {
                _this._headers.put(key, value);
            });
        }
        if (this._src) {
            this._openVideo();
        }
    };
    Video.prototype._addPlaybackTimeObserver = function () {
        var _this = this;
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.error, "Video._addPlaybackTimeObserver");
        this._playbackTimeObserverActive = true;
        this._playbackTimeObserver = timer_1.setInterval(function () {
            if (_this.player.isPlaying) {
                var _milliseconds = _this.player.getCurrentPosition();
                _this.notify({
                    eventName: videoplayer_common_1.VideoCommon.currentTimeUpdatedEvent,
                    object: _this,
                    position: _milliseconds
                });
            }
        }, 500);
    };
    Video.prototype._removePlaybackTimeObserver = function () {
        videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.error, "Video._removePlaybackTimeObserver");
        if (this._playbackTimeObserverActive) {
            if (this.player !== null) {
                var _milliseconds = this.player.getCurrentPosition();
                videoplayer_common_1.CLog(videoplayer_common_1.CLogTypes.info, 'Video._removePlaybackTimeObserver', 'emitting currentTimeUpdatedEvent');
                this.sendEvent(videoplayer_common_1.VideoCommon.currentTimeUpdatedEvent, { currentPosition: _milliseconds });
            }
            timer_1.clearInterval(this._playbackTimeObserver);
            this._playbackTimeObserverActive = false;
        }
    };
    return Video;
}(videoplayer_common_1.VideoCommon));
exports.Video = Video;
//# sourceMappingURL=videoplayer.js.map