define( [], function() {
    "use strict";

    function Album( id, name, url, cover_photo )
    {
        this.id          = id;
        this.name        = name;
        this.url         = url;
        this.photos      = [];
        this.cover_photo = cover_photo;
    }

    Album.prototype.addPhoto = function( photo_id ) {
        this.photos.push( photo_id );
        return this;
    };

    Album.prototype.getPhotoIDs = function()
    {
        return this.photos || [];
    };

    return Album;

});
