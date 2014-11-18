function popup( url, prop, blocked_callback )
{
    prop = prop || {};

    var winName  = prop.name || "",
        features = [];

    prop.name       = null;
    prop.width      = prop.width || screen.availWidth / 2;
    prop.height     = prop.height || screen.availHeight / 2;
    prop.left       = prop.left || (screen.availWidth - prop.width) / 2;
    prop.top        = prop.top || (screen.availHeight - prop.height) / 2;
    prop.resizable  = prop.resizable || 1;
    prop.scrollbars = prop.scrollbars || 1;
    prop.status     = prop.status || 1;

    for (var i in prop) {
        if ( prop[i] )
            features.push( i + "=" + prop[i] );
    }

    features = features.join(",");

    var win = window.open( url, winName, features );

    if ( win && ! win.closed ) {
        win.focus();
        return true;
    }

    if ( typeof blocked_callback === "function" ) {
        blocked_callback.call(blocked_callback, url, prop);
    }

    return false;
}

function createObject(proto)
{
    if ( Object.create !== void 0 ) {
        return Object.create( proto );
    }

    function obj() {}
    obj.prototype = proto;
    return new obj();
}

function extendClass( Class, ParentClass )
{
    Class.prototype = createObject( ParentClass.prototype );
    Class.prototype.constructor = Class;
    return Class;
}

/*
function makeClass( properties, parentClass )
{
    var Class = function()
    {
        if ( parentClass ) {
            parentClass.call(this, arguments);
        }

        if( properties ) {
            for( var prop in properties ) {
                this[ prop ] = properties[ prop ];
            }
        }

        if( "function" == typeof this.construct)
            this.construct.apply(this, arguments);      
    }

    if( parentClass ) {
        Class.prototype = createObject( parentClass.prototype );
    }

    Class.prototype.constructor = Class;

    return Class;
}
*/
