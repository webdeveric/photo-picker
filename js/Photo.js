define( [
    "jquery"
], function( $ ) {
    "use strict";

    function Photo( id, src, thumbnail, likes, tags, description )
    {
        this.id          = id;
        this.src         = src;
        this.thumbnail   = thumbnail;
        this.likes       = likes || 0;
        this.tags        = tags || [];
        this.description = description || "";
    }

    Photo.prototype.addTag = function( tag ) {
        this.tags.push( tag );
        return this;
    };

    Photo.prototype.setDescription = function( description ) {
        if ( description ) {
            this.description = description;
        }
        return this;
    };

    Photo.prototype.setTags = function( tags ) {
        if ( tags ) {
            this.tags = [];

            var i = 0,
                l = tags.length;

            for ( ; i < l ; ) {
                this.tags.push( tags[ i ] );
            }
        }
        return this;
    };

    Photo.prototype.incrementLikes = function() {
        ++this.likes;
        return this;
    };

    Photo.prototype.getSrc = function() {
        return this.src;
    };

    Photo.prototype.getThumbnail = function() {
        return this.thumbnail;
    };

    Photo.prototype.getThumbnailImg = function()
    {
        var self = this;

        function loadImage( deferred ) {

            if ( !self.thumbnail ) {

                deferred.resolve( false );

            } else {

                var img = new Image(),
                    resetEvents = function( img ) {
                        img.onload = img.onerror = img.onabort = null;
                    };

                img.onload = function() {
                    resetEvents( this );
                    deferred.resolve( this );
                };

                img.onerror = img.onabort = function() {
                    resetEvents( this );
                    deferred.reject( this );
                };

                img.src = self.thumbnail;

            }

        }

        return $.Deferred( loadImage ).promise();
    };

    return Photo;

});
