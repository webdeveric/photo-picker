define( [ "Photo" ], function( Photo ) {
    "use strict";

    function Album( id, name, photosURL, cover_photo )
    {
        this.id          = id;
        this.name        = name;
        this.photosURL   = photosURL;
        this.photoIDs    = [];
        this.cover_photo = cover_photo;
        this.photo       = null; // This should hold a Photo object for the cover photo;
    }

    Album.prototype.addPhotoID = function( photo_id ) {
        this.photoIDs.push( photo_id );
        return this;
    };

    Album.prototype.getPhotoIDs = function()
    {
        return this.photoIDs || [];
    };

    Album.prototype.getURL = function()
    {
        return this.photosURL || false;
    };

    Album.prototype.setURL = function( url )
    {
        this.photosURL = url;
        return this;
    };

    Album.prototype.getHTML = function()
    {
        var item      = document.createElement("div"),
            imgWraper = document.createElement("div"),
            caption   = document.createElement("div"),
            img       = null;

        if ( this.photo instanceof Photo ) {
            img = this.photo.getThumbnailImg();
        } else {
            img = document.createElement("div");
            img.className = "image-placeholder";
        }

        item.className      = "photo-box album";
        imgWraper.className = "image-wrapper";
        caption.className   = "caption";

        caption.appendChild( document.createTextNode( this.name ) );

        imgWraper.appendChild( img );
        item.appendChild( imgWraper );
        item.appendChild( caption );

        item.setAttribute("data-album-id", this.id );

        return item;
    };

    return Album;
});
