define( [
    "jquery",
    "Photo",
    "Album"
], function( $, Photo, Album ) {
    "use strict";

    function PhotoProvider( url, albumsurl )
    {
        this.url       = url;
        this.albumsurl = albumsurl;
        this.limit     = 32;

        this.photos    = {}; // Photo.id => Photo object
        this.albums    = {}; // Album.id => Album object

        this.currentAlbumID = "default";
        this.albumsLoaded   = false;

        this.addAlbum(
            new Album( "default", "All Photos", this.url )
        );

    }

    PhotoProvider.prototype.init = function()
    {
        return Promise.resolve( this );
    };

    PhotoProvider.prototype.getURL = function()
    {
        var album = this.getCurrentAlbum();
        return album !== false ? album.getURL() : false;
        // return this.url;
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

    PhotoProvider.prototype.numAlbumPhotos = function()
    {
        return this.getCurrentAlbum().getPhotoIDs().length;
    };

    PhotoProvider.prototype.addPhoto = function( photo_obj )
    {
        if ( photo_obj instanceof Photo ) {
            this.photos[ photo_obj.id ] = photo_obj;
        }
        return this;
    };

    PhotoProvider.prototype.addAlbum = function( album_obj )
    {
        if ( album_obj instanceof Album ) {
            this.albums[ album_obj.id ] = album_obj;
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

    PhotoProvider.prototype.getCurrentAlbumPhotos = function()
    {
        var photo_ids = this.getCurrentAlbum().getPhotoIDs(),
            photos    = {},
            i         = 0,
            l         = photo_ids.length;

        for ( ; i < l ; ++i ) {
            var photo = this.photos[ photo_ids[ i ] ] || false;
            if ( photo !== false ) {
                photos[ photo.id ] = photo;
            }
        }

        // console.log("PhotoProvider.getCurrentAlbumPhotos: Photos", photos );

        return photos;
    };

    PhotoProvider.prototype.getPhotos = function()
    {
        // console.info("PhotoProvider.getPhotos: Called");
        var self = this,
            promise = new Promise( function( resolve, reject ) {
                if ( self.getCurrentAlbum().getPhotoIDs().length === 0 ) {

                    return self.loadPhotos().then( function( photos ) {
                        // console.log("PhotoProvider.getPhotos < Promise: Photos loaded", photos );
                        resolve( photos );
                    }, function( error ) {
                        // console.warn("PhotoProvider.getPhotos < Promise: Error", error );
                        reject( error );
                    });

                } else {

                    // console.info("PhotoProvider.getPhotos < Promise: Photos already loaded");
                    resolve( self.getCurrentAlbumPhotos() );

                }

            });

        return promise;
    };

    PhotoProvider.prototype.loadPhotos = function( url )
    {
        // console.info("PhotoProvider.loadPhotos: loading photos");

        var self = this,
            apiURL = url || this.getURL();

        if ( apiURL !== false ) {

            // console.log("PhotoProvider.loadPhotos: API URL", apiURL );

            return this.api( apiURL, this.getParameters() ).then( function( results ) {
                    return self.processResults( results );
                }, function( error ) {
                    throw error;
                    // return new Error("Unable to load photos.");
                }
            );

        }

        // console.warn("PhotoProvider.loadPhotos: URL is false");

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

    PhotoProvider.prototype.getAlbum = function( album_id )
    {
        return this.albums[ album_id ] || false;
    };

    PhotoProvider.prototype.getCurrentAlbum = function()
    {
        return this.getAlbum( this.currentAlbumID );
    };

    PhotoProvider.prototype.switchToAlbum = function( album_id )
    {
        if ( this.hasAlbum( album_id ) ) {
            this.currentAlbumID = album_id;
        } else {
            this.currentAlbumID = "default";
        }

        return this;
    };

    PhotoProvider.prototype.hasAlbum = function( album_id )
    {
        return this.albums[ album_id ] && this.albums[ album_id ] instanceof Album;
    };

    /*
        This method is a little different from loadPhotos.
        Albums should be loaded all at once since there are normally many more photos than albums.
    */
    PhotoProvider.prototype.loadAlbums = function()
    {
        if ( !this.supportsAlbums() ) {
            return Promise.reject( new Error("This photo provider does not support albums") );
        }

        if ( this.albumsLoaded ) {
            return Promise.resolve( this.albums );
        }

        return this.apiScrape( this.albumsurl, this.getParameters() ).then( $.proxy( this.processAlbumData, this ) );
    };

    PhotoProvider.prototype.apiGetPhoto = function( photo_id )
    {
        var photo = this.getPhoto( photo_id );

        if ( photo !== false ) {
            return Promise.resolve( photo );
        }

        var self = this;
        return this.api( this.apiGetPhotoURL( photo_id ), this.getParameters() ).then( function( data ) {
            photo = self.buildPhoto( data );
            self.addPhoto( photo );
            return photo;
        });
    };

    PhotoProvider.prototype.apiGetAlbum = function( album_id )
    {
        return this.api( this.apiGetAlbumURL( album_id ), this.getParameters() );
    };

    PhotoProvider.prototype.processResults = function( results )
    {
        // console.log("PhotoProvider.processResults: Called with results", results );

        var album = this.getCurrentAlbum();

        album.setURL( this.getNextUrl( results ) );

        var i      = 0,
            data   = results.data,
            l      = data.length,
            photos = {}; // This current batch of photos will be returned.

        for ( ; i < l ; ++i ) {
            var photo = this.buildPhoto( data[ i ] );
            this.addPhoto( photo );
            album.addPhotoID( photo.id );
            photos[ photo.id ] = photo;
        }

        // console.log("PhotoProvider.processResults: photos ", photos );
        return photos;
    };

    /*
        data is an array.
        The apiScrape method returns an array containing the results from each call to the API.
        In this case, it is an array of objects representing albums from the API.
    */
    PhotoProvider.prototype.processAlbumData = function( data )
    {
        // console.group();
        // console.log("PhotoProvider.processAlbumData: Called with data", data );

        if ( !this.albumsLoaded ) {
            var i = 0,
                l = data.length;

            for ( ; i < l ; ++i ) {
                this.addAlbum( this.buildAlbum( data[ i ] ) );
            }

            this.albumsLoaded = true;
        }

        // console.groupEnd();

        return this.albums;
    };

    /*
        Please override the following methods when you subclass PhotoProvider.
    */

    PhotoProvider.prototype.api = function( /* url, parameters */ )
    {
        // console.info("PhotoProvider.api: Please override this method in your subclasses");
        return Promise.resolve( {
            data: [],
            paging: {}
        } );
    };

    PhotoProvider.prototype.apiScrape = function( url, parameters, data )
    {
        if ( data === void 0 ) {
            data = [];
        }
        var self = this;
        return this.api( url, parameters ).then( function( results ) {
            var nextURL = self.getNextUrl( results );
            data = data.concat( results.data );
            if ( nextURL ) {
                return self.apiScrape( nextURL, parameters, data );
            }
            return data;
        } );
    };

    PhotoProvider.prototype.apiGetPhotoURL = function( photo_id )
    {
        // console.info("PhotoProvider.apiGetPhotoURL: Please override this method in your subclasses");
        return "/" + photo_id;
    };

    PhotoProvider.prototype.apiGetAlbumURL = function( album_id )
    {
        // console.info("PhotoProvider.apiGetAlbumURL: Please override this method in your subclasses");
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

    PhotoProvider.prototype.buildAlbum = function( /* data */ )
    {
        return new Album();
    };

    return PhotoProvider;

});
