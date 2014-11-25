define( [], function() {
    "use strict";

    function Album( id, name, photosURL, cover_photo )
    {
        this.id          = id;
        this.name        = name;
        this.photosURL   = photosURL;
        this.photoIDs    = [];
        this.cover_photo = cover_photo;
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

    return Album;

});
