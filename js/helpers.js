function popup( url, prop )
{
    prop = prop || {};

    prop.name   = prop.name || "";
    prop.width  = prop.width || screen.availWidth / 2;
    prop.height = prop.height || screen.availHeight / 2;
    prop.left   = prop.left || (screen.availWidth - prop.width) / 2;
    prop.top    = prop.top || (screen.availHeight - prop.height) / 2;
    
    var features = [];

    for (var i in prop) {
        if ( prop[i] )
            features.push( i + "=" + prop[i] );
    }

    features = features.join(", ");

    var win = window.open( url, prop.name, features );

    return win && ! win.closed;
}

function createObject(proto)
{
    if ( Object.creates !== void 0 ) {
        return Object.create( proto );
    }

    function obj() {}
    obj.prototype = proto;
    return new obj();
}
