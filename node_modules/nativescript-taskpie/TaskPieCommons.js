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

var Color = require('color');
var KnownColors = require("color/known-colors");
var TypeUtils = require("utils/types");

const REGEX_COLOR = /^(#)?([a-f0-9]{3,4}|[a-f0-9]{6}|[a-f0-9]{8})$/i;
exports.REGEX_COLOR = REGEX_COLOR;

function toARGB(v, throwException) {
    if (TypeUtils.isNullOrUndefined(v)) {
        return null;
    }

    var argb = {
        a: 255,
        r: 0,
        g: 0,
        b: 0
    };

    var isValid = true;

    if (arguments.length < 2) {
        throwException = true;
    }

    var throwOrReturn = function() {
        if (isValid) {
            if (TypeUtils.isNullOrUndefined(argb.a)) {
                argb.a = 255;
            }

            return argb;
        }

        if (throwException) {
            throw "NO valid color value!";
        }

        return false;
    };

    if (v instanceof Color.Color) {
        argb = v;
    }
    else if (typeof v === "string") {
        // string

        v = v.toLowerCase().trim();

        // known color?
        for (var kc in KnownColors) {
            var kcv = KnownColors[kc];
            if (typeof kcv !== "string") {
                continue;
            }

            if (kc.toLowerCase().trim() === v) {
                return toARGB(kcv);  // yes
            }
        }

        var match = REGEX_COLOR.exec(v);
        
        isValid = null !== match;
        if (isValid) {
            var colorVal = match[2];
            if (colorVal.length < 5) {
                // #(A)RGB

                var argbStartIndex = 3 === colorVal.length ? 0 : 1;

                if (4 === colorVal.length) {
                    argb.a = parseInt(colorVal[0] + colorVal[0], 16); 
                }
                argb.r = parseInt(colorVal[argbStartIndex] + colorVal[argbStartIndex], 16);
                argb.g = parseInt(colorVal[argbStartIndex + 1] + colorVal[argbStartIndex + 1], 16);
                argb.b = parseInt(colorVal[argbStartIndex + 2] + colorVal[argbStartIndex + 2], 16);
            }
            else {
                // #(AA)RRGGBB
                
                var argbStartIndex = 6 === colorVal.length ? 0 : 2;

                if (8 === colorVal.length) {
                    argb.a = parseInt(colorVal.substr(0, 2), 16);
                }
                argb.r = parseInt(colorVal.substr(argbStartIndex, 2), 16);
                argb.g = parseInt(colorVal.substr(argbStartIndex + 2, 2), 16);
                argb.b = parseInt(colorVal.substr(argbStartIndex + 4, 2), 16);
            }
        }
    }
    else if (!isNaN(v)) {
        // number
        v = parseInt('' + v);
        if (v < 0) {
            v += 4294967296;
        }

        isValid = (v >= 0) && (v <= 4294967295);
        if (isValid) {
            var hex = ('0000000' + v.toString(16)).substr(-8);
            return toARGB('#' + hex);
        }
    }
    else if (typeof v === "object") {
        // object
        
        isValid = (typeof v.r !== undefined) &&
                  (typeof v.g !== undefined) &&
                  (typeof v.b !== undefined);

        if (isValid) {
            argb = v;
        }
    }

    return throwOrReturn();
}
exports.toARGB = toARGB;
