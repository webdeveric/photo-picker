define( [], function() {
    "use strict";

    function Album( id, name, cover_photo, picker )
    {
        this.id          = id;
        this.name        = name;
        this.cover_photo = cover_photo;
        this.photos      = [];
        this.picker      = picker || null;
    }

    Album.prototype.addPhoto = function( photo_id ) {
        this.photos.push( photo_id );
        return this;
    };

    return Album;

});
