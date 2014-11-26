if ( !Object.keys ) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill
    Object.keys = (function() {
        "use strict";

        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({ toString: null }).propertyIsEnumerable("toString"),
            dontEnums = [
                "toString",
                "toLocaleString",
                "valueOf",
                "hasOwnProperty",
                "isPrototypeOf",
                "propertyIsEnumerable",
                "constructor"
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj) {
            if (typeof obj !== "object" && (typeof obj !== "function" || obj === null)) {
                throw new TypeError("Object.keys called on non-object");
            }

            var result = [],
                prop,
                i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for ( i = 0 ; i < dontEnumsLength ; ++i ) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }

            return result;
        };
    }() );
}

// Production steps of ECMA-262, Edition 5, 15.4.4.18
// Reference: http://es5.github.io/#x15.4.4.18
if ( !Array.prototype.forEach ) {

    Array.prototype.forEach = function( callback, thisArg )
    {
        "use strict";

        var T, k;

        if (this == null) {
            throw new TypeError("this is null or not defined");
        }

        var O = Object(this),
            len = O.length >>> 0;

        if ( typeof callback !== "function" ) {
            throw new TypeError(callback + " is not a function");
        }

        if ( arguments.length > 1 ) {
            T = thisArg;
        }

        k = 0;

        while (k < len) {
            var kValue;
            if ( k in O ) {
                kValue = O[k];
                callback.call(T, kValue, k, O);
            }
            k++;
        }
    };

}

// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {

    Array.prototype.map = function(callback, thisArg)
    {
        "use strict";

        var T, A, k;

        if ( this == null ) {
            throw new TypeError("this is null or not defined");
        }

        var O = Object( this ),
            len = O.length >>> 0;

        if ( typeof callback !== "function" ) {
            throw new TypeError(callback + " is not a function");
        }

        if ( arguments.length > 1 ) {
            T = thisArg;
        }

        A = new Array(len);
        k = 0;

        while (k < len) {

            var kValue, mappedValue;

            if (k in O) {
                kValue = O[k];
                mappedValue = callback.call(T, kValue, k, O);
                A[k] = mappedValue;
            }

            k++;

        }

        return A;
    };

}

/*
    For browsers that don't have a console.
    IE8 has one, but dev tools has to be open for the console object to exist.
*/
if ( window.console === void 0 ) {

    (function() {
        "use strict";

        var debugConsole = document.createElement("ul"),
            printObject = function( obj, depth ) {
                depth = depth || 0;

                if ( typeof obj === "string" ) {
                    return document.createTextNode( obj );
                }

                var dl = document.createElement("dl");

                dl.className = "object-details depth-" + depth;
                dl.className += depth % 2 === 0 ? " depth-even" : " depth-odd";

                for ( var i in obj ) {
                    if ( obj.hasOwnProperty(i) ) {
                        var dt = document.createElement("dt"),
                            dd = document.createElement("dd");
                        dt.appendChild( document.createTextNode( i ) );
                        dd.appendChild( printObject( obj[ i ], depth + 1 ) );
                        dl.appendChild( dt );
                        dl.appendChild( dd );
                    }
                }

                return dl;
            },
            msg = function( level ) {
                return function( /* msg1, ..., msgN */ ) {

                    var i = 0,
                        l = arguments.length;

                    for ( ; i < l ; ++i ) {

                        var arg = arguments[ i ],
                            li = document.createElement("li");

                        li.className = "msg " + level;
                        li.appendChild( printObject( arg ) );

                        debugConsole.appendChild( li );
                    }

                };
            };

        debugConsole.className = "debug-console";

        document.body.appendChild( debugConsole );

        window.console = {
            log:   msg("log"),
            info:  msg("info"),
            warn:  msg("warn"),
            error: msg("error"),
            debug: msg("debug")
        };

    })();

}

define( [ "promise" ], function( promise ) {
    "use strict";
    promise.polyfill();
});
