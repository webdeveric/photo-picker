define( function() {
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

    // Photo.prototype.getThumbnailImg = function()
    // {
    //     var self = this;
    //     return new Promise( function( resolve, reject ) {

    //         if ( !self.thumbnail ) {

    //             reject( new Error("No thumbnail found") );

    //         } else {

    //             var img = new Image(),
    //                 resetImg = function( img ) {
    //                     img.className = "";
    //                     img.onload = img.onerror = img.onabort = null;
    //                 };

    //             img.id = self.id;
    //             img.className = "image-loading";

    //             img.onload = function() {
    //                 resetImg( this );
    //             };

    //             img.onerror = img.onabort = function() {
    //                 resetImg( this );
    //                 this.parentNode.removeChild( this );
    //             };

    //             img.src = self.thumbnail;

    //             resolve( img );

    //         }

    //     });
    // };

    Photo.prototype.getThumbnailImg = function()
    {
        if ( !this.thumbnail ) {

            return false;

        } else {

            var img = new Image(),
                resetImg = function( img ) {
                    img.className = "";
                    img.onload = img.onerror = img.onabort = null;
                };

            img.id = this.id;
            img.className = "image-loading";

            img.onload = function() {
                resetImg( this );
            };

            img.onerror = img.onabort = function() {
                resetImg( this );
                this.parentNode.removeChild( this );
            };

            img.src = this.thumbnail;

            return img;

        }

    };

    Photo.prototype.getHTML = function()
    {
        var item      = document.createElement("div"),
            imgWraper = document.createElement("div"),
            img       = this.getThumbnailImg();

        item.className = "photo-box photo";
        imgWraper.className = "image-wrapper";
        imgWraper.appendChild( img );
        item.appendChild( imgWraper );

        item.setAttribute("data-photo-id", this.id );

        return item;
    };

    return Photo;

});
