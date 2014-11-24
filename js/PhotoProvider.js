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

        this.photos      = {}; // Photo.id => Photo object
        this.photosOrder = []; // index => Photo.id

        this.albums      = {}; // Album.id => Album object
        this.albumsOrder = []; // index => Album.id
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
        return this.albumsOrder.length;
    };

    PhotoProvider.prototype.numPhotos = function()
    {
        return this.photosOrder.length;
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
        return this._getDataArray( this.photosOrder, this.photos );
    };

    PhotoProvider.prototype.getAlbumsArray = function()
    {
        return this._getDataArray( this.albumsOrder, this.albums );
    };

    PhotoProvider.prototype._getDataArray = function( order, items )
    {
        var i = 0,
            l = order.length,
            data = [];

        for ( ; i < l ; ++i ) {
            var item = items[ order[ i ] ] || false;
            if ( item ) {
                data.push( item );
            }
        }

        return data;
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
            return Promise.resolve( this.getAlbumsArray() );
        }

        return this.apiScrape( this.albumsurl, { limit: 3 } ).then( $.proxy( this.processAlbumData, this ) );
    };

    PhotoProvider.prototype.apiGetPhoto = function( photo_id )
    {
        return this.api( this.apiGetPhotoURL( photo_id ), this.getParameters() );
    };

    PhotoProvider.prototype.apiGetAlbumURL = function( album_id )
    {
        return this.api( this.apiGetPhotoURL( album_id ), this.getParameters() );
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

    PhotoProvider.prototype.apiScrape = function( /* url, parameters */ )
    {
        return Promise.reject( new Error("PhotoProvider.apiScrape not implemented.") );
    };

    PhotoProvider.prototype.apiGetPhotoURL = function( photo_id )
    {
        return "/" + photo_id;
    };

    PhotoProvider.prototype.apiGetAlbumURL = function( album_id )
    {
        return "/" + album_id;
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

    PhotoProvider.prototype.processAlbumData = function( data )
    {
        console.log("PhotoProvider.processAlbumData: Called with data", data );
        return [].concat( data );
    };

    return PhotoProvider;

});
