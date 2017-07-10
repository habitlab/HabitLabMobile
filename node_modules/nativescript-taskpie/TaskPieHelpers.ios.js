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
    var uii = new interop.Reference();

    UIGraphicsBeginImageContextWithOptions(CGSizeMake(width, height), false, 0.0);
    uii = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();

    return {
        __uiimage: uii,
        __cgimage: uii.CGImage,

        __onImageContext: function(action, tag) {
            var oldImg = this.__uiimage;
    
            UIGraphicsBeginImageContext(CGSizeMake(oldImg.size.width, oldImg.size.height));
            var newImage;
            var result;
            try {
                var context = UIGraphicsGetCurrentContext();

                oldImg.drawInRect(CGRectMake(0, 0,
                                            oldImg.size.width, oldImg.size.height));

                result = action(context, oldImg, tag);

                newImage = UIGraphicsGetImageFromCurrentImageContext();
            }
            finally {
                UIGraphicsEndImageContext();
            }

            CGImageRelease(oldImg.CGImage);
            this._nativeObject = newImage;

            return result;
        },

        apply: function(view, disposeOld) {
            if (arguments.length < 2) {
                disposeOld = true;
            }

            if (disposeOld) {
                var hasBeenRecycled = false;

                try {
                    if (!TypeUtils.isNullOrUndefined(view.ios)) {
                        var oldImg = view.ios.image;
                        if (!TypeUtils.isNullOrUndefined(oldImg)) {
                            CGImageRelease(oldImg.CGImage);
                            hasBeenRecycled = true;
                        }
                    }
                }
                catch (e) {
                    console.log("[ERROR] TaskPieHelpers.ios.apply(): " + e);
                }

                if (!hasBeenRecycled) {
                    try {
                        view.src = null;
                    }
                    catch (e) {
                        console.log("[ERROR] TaskPieHelpers.ios.apply(): " + e);
                    }
                }
            }

            var hasBeenApplied = false;
            try {
                if (!TypeUtils.isNullOrUndefined(view.ios)) {
                    view.ios.image = this.__uiimage;
                    hasBeenApplied = true;
                }
            }
            catch (e) {
                console.log("[ERROR] TaskPieHelpers.ios.apply(): " + e);
            }

            return hasBeenApplied;
        },

        dispose: function() {
            try {
                CGImageRelease(this.__cgimage);
            }
            finally {
                uii = null;
                this.__uiimage = null;
                this.__uiimage = null;
            }
        },

        drawArc: function (left, top, right, bottom, startAngle, sweepAngle, color, fillColor) {
            var startPoint = {
                x: left,
                y: top
            };

            var radius = Math.max(right - left,
                                  bottom - top);

            var centerPoint = {
                x: startPoint.x + (right - left),
                y: startPoint.y + (bottom - top)
            };

            var endAngle = startAngle + sweepAngle;

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

            this.__onImageContext(function(context, oldImg, tag) {
                var arc = CGPathCreateMutable();
   
                CGPathMoveToPoint(arc, null,
                                  startPoint.x, startPoint.y);

                CGPathAddArc(arc, null,
                             centerPoint.x, centerPoint.y,
                             radius,
                             startAngle, endAngle,
                             true);

                var strokedArc = CGPathCreateCopyByStrokingPath(arc, null,
                                                                1,  // line width
                                                                kCGLineCapButt,
                                                                kCGLineJoinMiter, // the default
                                                                10); // 10 is default miter limit

                CGContextAddPath(context, strokedArc);
                
                CGContextSetRGBStrokeColor(context,
                                           color.r, color.g, color.b, color.a);


                if (null !== fillColor) {
                    CGContextSetRGBFillColor(context,
                                             fillColor.r, fillColor.g, fillColor.b, fillColor.a);
                }

                CGContextDrawPath(context, kCGPathFillStroke);
            });

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

            var leftTop = {
                x: cx - radius,
                y: cy - radius
            };

            var size = { 
                width: radius * 2,
                height: radius * 2 
            };

            this.__onImageContext(function(context, oldImg, tag) {
                CGContextSetRGBStrokeColor(context,
                                           color.r, color.g, color.b, color.a);

                var rect = CGRectMake(leftTop.x, leftTop.y,
                                      size.width, size.height);

                if (null !== fillColor) {
                    CGContextSetRGBFillColor(context,
                                             fillColor.r, fillColor.g, fillColor.b, fillColor.a);

                    CGContextFillEllipseInRect(context, rect);
                }
                
                CGContextStrokeEllipseInRect(context, rect);
            });
            
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
            return {
                base64: UIImagePNGRepresentation(this.__uiimage).base64EncodedStringWithOptions(null),
                mime: 'image/png'
            };
        }
    };
}
exports.createBitmap = createBitmap;

function getDefaultPieSize() {
    return 300;
}
exports.getDefaultPieSize = getDefaultPieSize;
