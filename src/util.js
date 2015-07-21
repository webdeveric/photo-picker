define( [ "polyfills" ], function() {
    "use strict";

    function createObject(proto)
    {
        if ( Object.create !== void 0 ) {
            return Object.create( proto );
        }

        function Obj() {}
        Obj.prototype = proto;
        return new Obj();
    }

    function extendClass( Class, ParentClass )
    {
        Class.prototype = createObject( ParentClass.prototype );
        Class.prototype.constructor = Class;
        return Class;
    }

    function objectToArray( obj, callback )
    {
        var data = [];

        for ( var i in obj ) {
            if ( obj.hasOwnProperty(i) ) {
                data.push( typeof callback === "function" ? callback( obj[ i ] ) : obj[ i ] );
            }
        }

        return data;
    }

    return {
        createObject: createObject,
        extendClass: extendClass,
        objectToArray: objectToArray
    };

});
