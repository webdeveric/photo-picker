define(function() {
    "use strict";

    var $ = require("jquery"),
        ContentProvider = function( title, content, options )
        {
            this.title   = title || "";
            this.content = content || "";
            this.options = $.extend({}, options );
        };

    ContentProvider.prototype.bindEvents = function()
    {
        return this;
    };

    ContentProvider.prototype.unbindEvents = function()
    {
        return this;
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

});
