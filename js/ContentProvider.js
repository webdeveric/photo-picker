(function(factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define( factory );
    } else {
        factory();
    }

}(function() {
    "use strict";

    var ContentProvider = function( content, options )
    {
        this.content = content || "";
        this.options = $.extend({}, options );
    };

    ContentProvider.prototype.bindEvents = function()
    {
    };

    ContentProvider.prototype.unbindEvents = function()
    {
    };

    ContentProvider.prototype.getContent = function( callback )
    {
        if ( callback ) {
            return callback.call(callback, this.content, this );
        } else {
            return this.content;
        }
    };

    ContentProvider.prototype.setContent = function( content )
    {
        this.content = content;
        return this;
    };

    return ContentProvider;

}));