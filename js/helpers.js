function popup( url, prop )
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

    return false;
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
