define( [
    "jquery",
    "Photo"
], function( $, Photo ) {
    "use strict";

    function PhotoProvider()
    {
        this.url       = null;
        this.albumsurl = null;
        this.limit     = 40;

        this.photos    = {}; // Photo.id => Photo object
        this.albums    = {}; // Album.id => Album object
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

    PhotoProvider.prototype.numAlbums = function()
    {
        return Object.keys( this.albums ).length;
    };

    PhotoProvider.prototype.numPhotos = function()
    {
        return Object.keys( this.photos ).length;
    };

    PhotoProvider.prototype.addPhoto = function( photo_obj )
    {
        if ( photo_obj instanceof Photo ) {
            this.photos[ photo_obj.id ] = photo_obj;
        }
        return this;
    };

    PhotoProvider.prototype.hasPhoto = function( photo_id )
    {
        return this.photos[ photo_id ] && this.photos[ photo_id ] instanceof Photo;
    };

    // Updated this to return a Promise.
    // If the Photo exists, resolve it, otherwise, call the api to get it.
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

                    console.info("PhotoProvider.getPhotos < Promise: Photos already loaded", self.photos );
                    resolve( self.photos );

                }

            });

        return promise;
    };

    PhotoProvider.prototype.loadPhotos = function( url )
    {
        console.log("PhotoProvider.loadPhotos: loading photos");
        var self = this;
        if ( this.getURL() !== false ) {
            console.log("PhotoProvider.loadPhotos: URL is not false");
            return this.api( url || this.url, this.getParameters() ).then( function( results ) {
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

    PhotoProvider.prototype.supportsAlbums = function()
    {
        return this.albumsurl !== null;
    };

    PhotoProvider.prototype.getAlbums = function()
    {
        return this.loadAlbums();
    };

    PhotoProvider.prototype.loadAlbums = function()
    {
        /*
            This method is a little different from loadPhotos.
            Albums should be loaded all at once since there are normally many more photos than albums.
        */
        if ( !this.supportsAlbums() ) {
            return Promise.reject( new Error("This photo provider does not support albums") );
        }

        if ( this.numAlbums() > 0 ) {
            return Promise.resolve( this.albums );
        }

        return this.apiScrape( this.albumsurl, this.getParameters() ).then( $.proxy( this.processAlbumData, this ) );
    };

    PhotoProvider.prototype.apiGetPhoto = function( photo_id )
    {
        return this.api( this.apiGetPhotoURL( photo_id ), this.getParameters() );
    };

    PhotoProvider.prototype.apiGetAlbum = function( album_id )
    {
        return this.api( this.apiGetAlbumURL( album_id ), this.getParameters() );
    };

    PhotoProvider.prototype.processResults = function( results )
    {
        console.log("PhotoProvider.processResults: Called with results", results );

        this.url = this.getNextUrl( results );

        var i      = 0,
            data   = results.data,
            l      = data.length,
            photos = {}; // This current batch of photos will be returned.

        for ( ; i < l ; ++i ) {
            var photo = this.buildPhoto( data[ i ] );
            this.addPhoto( photo );
            photos[ photo.id ] = photo;
        }

        console.log("PhotoProvider.processResults: photos ", photos );
        return photos;
    };

    PhotoProvider.prototype.processAlbumData = function( data )
    {
        console.log("PhotoProvider.processAlbumData: Called with data", data );
        return [].concat( data );
    };

    /*
        Please override the following methods when you subclass PhotoProvider.
    */

    PhotoProvider.prototype.api = function( /* url, parameters */ )
    {
        console.log("PhotoProvider.api: Please override this method in your subclasses");
        return Promise.resolve( {
            data: [],
            paging: {}
        } );
    };

    PhotoProvider.prototype.apiScrape = function( /* url, parameters */ )
    {
        console.log("PhotoProvider.apiScrape: Please override this method in your subclasses");
        return Promise.reject( new Error("PhotoProvider.apiScrape not implemented.") );
    };

    PhotoProvider.prototype.apiGetPhotoURL = function( photo_id )
    {
        console.log("PhotoProvider.apiGetPhotoURL: Please override this method in your subclasses");
        return "/" + photo_id;
    };

    PhotoProvider.prototype.apiGetAlbumURL = function( album_id )
    {
        console.log("PhotoProvider.apiGetAlbumURL: Please override this method in your subclasses");
        return "/" + album_id;
    };

    PhotoProvider.prototype.getNextUrl = function( /* results */ )
    {
        return false;
    };

    PhotoProvider.prototype.buildPhoto = function( /* data */ )
    {
        return new Photo();
    };

    return PhotoProvider;

});
