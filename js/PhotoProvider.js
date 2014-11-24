define( [
    "jquery",
    "Photo"
], function( $, Photo ) {
    "use strict";

    function PhotoProvider()
    {
        this.url   = null;
        this.limit = 40;

        /*
            This is an index array containing photo IDs for this.photos so I know the order.
            The lower the index, the more recent the photo.
        */
        this.photos = {};
        this.photosOrder = [];
    }

    PhotoProvider.prototype.init = function()
    {
        return Promise.resolve( this );
    };

    PhotoProvider.prototype.getURL = function()
    {
        return this.url;
    };

    PhotoProvider.prototype.setURL = function( url )
    {
        this.url = url;
        return this;
    };

    PhotoProvider.prototype.getParameters = function()
    {
        return {
            limit: this.limit
        };
    };

    PhotoProvider.prototype.numPhotos = function()
    {
        return this.photosOrder.length;
        // return Object.keys( this.photos ).length;
    };

    PhotoProvider.prototype.addPhoto = function( photo_obj )
    {
        if ( photo_obj instanceof Photo ) {
            this.photos[ photo_obj.id ] = photo_obj;
            this.photosOrder.push( photo_obj.id );
        }
        return this;
    };

    PhotoProvider.prototype.getPhotosArray = function()
    {
        var i = 0,
            l = this.photosOrder.length,
            photos = [];

        for ( ; i < l ; ++i ) {

            var photo_id = this.photosOrder[ i ],
                photo = this.photos[ photo_id ] || false;

            if ( photo ) {
                photos.push( photo );
            }

        }

        return photos;
    };

    PhotoProvider.prototype.hasPhoto = function( photo_id )
    {
        return this.photos[ photo_id ] && this.photos[ photo_id ] instanceof Photo;
    };

    PhotoProvider.prototype.getPhoto = function( photo_id )
    {
        return this.hasPhoto( photo_id ) ? this.photos[ photo_id ] : false;
    };

    PhotoProvider.prototype.getPhotos = function()
    {
        console.log("PhotoProvider.getPhotos: Called");
        var self = this,
            promise = new Promise( function( resolve, reject ) {
                if ( self.numPhotos() === 0 ) {

                    return self.loadPhotos().then( function( photos ) {
                        console.log("PhotoProvider.getPhotos < Promise: Photos loaded", photos );
                        resolve( photos );
                    }, function( error ) {
                        console.error("PhotoProvider.getPhotos < Promise: Error", error );
                        reject( error );
                    });

                } else {

                    var photos = self.getPhotosArray();
                    console.info("PhotoProvider.getPhotos < Promise: Photos already loaded", photos );
                    resolve( photos );

                }

            });

        return promise;
    };

    PhotoProvider.prototype.loadPhotos = function()
    {
        console.log("PhotoProvider.loadPhotos: loading photos");
        var self = this;
        if ( this.getURL() !== false ) {
            console.log("PhotoProvider.loadPhotos: URL is not false");
            return this.api( this.url, this.getParameters() ).then( function( results ) {
                    return self.processResults( results );
                }, function( error ) {
                    throw error;
                    // return new Error("Unable to load photos.");
                }
            );
        }

        console.error("PhotoProvider.loadPhotos: URL is false");
        return Promise.reject( new Error("No more photos to load") );
    };

    /*
        Please override the following functions when you subclass PhotoProvider.
    */

    PhotoProvider.prototype.api = function( /* url, parameters */ )
    {
        return Promise.resolve( {
            data: [],
            paging: {}
        } );
    };

    PhotoProvider.prototype.processResults = function( results )
    {
        console.log("PhotoProvider.processResults: Called with results", results );
        // This is where you set the URL for the next page, if there is one.
        this.url = results.paging && results.paging.next ? results.paging.next : false;

        var i    = 0,
            data = results.data,
            l    = data.length,
            photos = [];

        for ( ; i < l ; ++i ) {
            var photo = new Photo();
            this.addPhoto( photo );
            photos.push( photo );
        }
        console.log("processResults returning", photos );
        return photos;
    };

    return PhotoProvider;

});
