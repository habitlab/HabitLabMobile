// The MIT License (MIT)
// 
// Copyright (c) Marcel Joachim Kloubert <marcel.kloubert@gmx.net>
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
// DEALINGS IN THE SOFTWARE.

var TaskPieCommons = require('./TaskPieCommons');
var TypeUtils = require("utils/types");

function normalizeAngel(v) {
    if (TypeUtils.isNullOrUndefined(v)) {
        return null;
    }

    v += 270;

    if (v >= 360) {
        v = v - 360;
    }

    return v;
}

function createBitmap(width, height) {
    var androidBMP = android.graphics.Bitmap.createBitmap(width, height,
                                                          android.graphics.Bitmap.Config.ARGB_8888);
    
    return {
        __bitmap: androidBMP,
        __canvas: new android.graphics.Canvas(androidBMP),

        apply: function(view, disposeOld) {
            if (arguments.length < 2) {
                disposeOld = true;
            }

            if (disposeOld) {
                // try to recyle old bitmap

                var hasBeenRecycled = false;
                try {
                    if (!TypeUtils.isNullOrUndefined(view.android)) {
                        var drawable = view.android.getDrawable();
                        if (!TypeUtils.isNullOrUndefined(drawable)) {
                            if (!TypeUtils.isNullOrUndefined(drawable.getBitmap)) {
                                drawable.getBitmap().recycle();
                                hasBeenRecycled = true;
                            }
                        }
                    }
                }
                catch (e) {
                    console.log("[ERROR] TaskPieHelpers.android.apply(): " + e);
                }

                if (!hasBeenRecycled) {
                    try {
                        view.src = null;
                    }
                    catch (e) {
                        console.log("[ERROR] TaskPieHelpers.android.apply(): " + e);
                    }
                }
            }

            var hasApplied = false;
            try {
                if (!TypeUtils.isNullOrUndefined(view.android)) {
                    view.android.setImageBitmap(this.__bitmap);
                    hasApplied = true;
                }
            }
            catch (e) {
                console.log("[ERROR] TaskPieHelpers.android.apply(): " + e);
            }
            
            return hasApplied;
        },

        dispose: function() {
            try {
                this.__bitmap.recycle();
            }
            finally {
                androidBMP = null;
                this.__bitmap = null;
                this.__canvas = null;
            }
        },

        drawArc: function (left, top, right, bottom, startAngle, sweepAngle, color, fillColor) {
            color = TaskPieCommons.toARGB(color);
            if (null === color) {
                color = {
                    a: 255,
                    r: 0,
                    g: 0,
                    b: 0
                };
            }

            fillColor = TaskPieCommons.toARGB(fillColor);
            startAngle = normalizeAngel(startAngle);

            var rect = new android.graphics.RectF(left, top, right, bottom);

            if (null !== fillColor) {
                var p = new android.graphics.Paint();
                p.setStyle(android.graphics.Paint.Style.FILL);
                p.setARGB(fillColor.a, fillColor.r, fillColor.g, fillColor.b);

                this.__canvas.drawArc(rect,
                                      startAngle, sweepAngle,
                                      true,
                                      p);
            }

            if (null !== color) {
                var p = new android.graphics.Paint();
                p.setStyle(android.graphics.Paint.Style.STROKE);
                p.setARGB(color.a, color.r, color.g, color.b);

                this.__canvas.drawArc(rect,
                                      startAngle, sweepAngle,
                                      true,
                                      p);
            }

            return this;
        },

        drawCircle: function (cx, cy, radius, color, fillColor) {
            color = TaskPieCommons.toARGB(color);
            if (null === color) {
                color = {
                    a: 255,
                    r: 0,
                    g: 0,
                    b: 0
                };
            }

            fillColor = TaskPieCommons.toARGB(fillColor);

            if (null !== fillColor) {
                var p = new android.graphics.Paint();
                p.setStyle(android.graphics.Paint.Style.FILL);
                p.setARGB(fillColor.a, fillColor.r, fillColor.g, fillColor.b);

                this.__canvas.drawCircle(cx, cy,
                                         radius,
                                         p);
            }
            
            if (null !== color) {
                var p = new android.graphics.Paint();
                p.setStyle(android.graphics.Paint.Style.STROKE);
                p.setARGB(color.a, color.r, color.g, color.b);

                this.__canvas.drawCircle(cx, cy,
                                         radius,
                                         p);
            }

            return this;
        },

        toBase64: function() {
            return this.toObject()
                       .base64;
        },

        toDataUrl: function() {
            var bd = this.toObject();
            return 'data:' + bd.mime + ';base64,' + bd.base64;
        },

        toObject: function() {
            var bmpFormat = android.graphics.Bitmap.CompressFormat.PNG;
            var mime = 'image/png';
            var quality = 100;

            var stream = new java.io.ByteArrayOutputStream();
            try {
                this.__bitmap
                    .compress(bmpFormat, quality, stream);

                var base64 = android.util.Base64.encodeToString(stream.toByteArray(), 
                                                                android.util.Base64.NO_WRAP);

                return {
                    base64: base64,
                    mime: mime
                };
            }
            finally {
                stream.close();
            }
        }
    };
}
exports.createBitmap = createBitmap;

function getDefaultPieSize() {
    return 300;
}
exports.getDefaultPieSize = getDefaultPieSize;
