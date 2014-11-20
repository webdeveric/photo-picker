define(function(require) {
    "use strict";

    var $ = require("jquery"),
        util = require("util"),
        ContentProvider = require("ContentProvider"),
        AjaxContentProvider = function( url, options )
        {
            ContentProvider.call(this, null, options);
            this.url = url;
            this.options = $.extend(
                this.options,
                {
                    ajaxOptions: {},
                    processData: function( data /* , textStatus, jqXHR */ ) {
                        return data;
                    }
                },
                options
            );
        };

    util.extendClass( AjaxContentProvider, ContentProvider );

    AjaxContentProvider.prototype.fetchContent = function( callback )
    {
        var self = this;
        return $.ajax( this.url, this.options.ajaxOptions ).done( function(data, textStatus, jqXHR) {
            if ( self.options.processData ) {
                self.setContent( self.options.processData.call( self, data, textStatus, jqXHR ) );
            }
            if ( callback ) {
                callback.call(callback, self.content, self);
            }
        });
    };

    AjaxContentProvider.prototype.getContent = function( callback )
    {
        if ( !this.content ) {
            this.fetchContent( callback ).done( $.proxy( this.render, this ) );
            return;
        }

        if ( callback ) {
            return callback.call(callback, this.content, this);
        } else {
            return this.content;
        }
    };

    return AjaxContentProvider;

});
