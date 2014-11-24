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

define( [ "promise" ], function( promise ) {
    "use strict";
    promise.polyfill();
});
