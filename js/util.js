define(function() {
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

    return {
        createObject: createObject,
        extendClass: extendClass
    };

});
