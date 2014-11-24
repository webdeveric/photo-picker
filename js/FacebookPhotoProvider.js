define( [
    "jquery",
    "util",
    "Photo",
    "Album",
    "PhotoProvider",
    "facebook"
], function( $, util, Photo, Album, PhotoProvider, FB ) {
    "use strict";

    function FacebookPhotoProvider()
    {
        PhotoProvider.call(this);
        this.url       = "/me/photos/uploaded";
        this.albumsurl = "/me/albums";
    }

    util.extendClass( FacebookPhotoProvider, PhotoProvider );

    FacebookPhotoProvider.prototype.init = function()
    {
        var self = this;
        return new Promise( function( resolve, reject ) {

            FB.getLoginStatus( function(response) {

                if ( response.status === "connected" ) {

                    resolve( self );

                } else {

                    FB.login( function(response) {

                        if ( response.authResponse ) {
                            resolve( self );
                        } else {
                            reject( new Error("User cancelled login or did not fully authorize.") );
                        }

                    }, {
                        scope: "public_profile,email,user_photos"
                    });

                }
            });

        });
    };

    FacebookPhotoProvider.prototype.api = function( url, parameters )
    {
        console.log("FacebookPhotoProvider.api", url, parameters );

        parameters = $.extend( this.getParameters(), parameters );

        if ( url === void 0 ) {
            return Promise.reject( new Error("FacebookPhotoProvider.api: URL is undefined") );
        }

        return new Promise( function( resolve, reject ) {

            FB.api(
                url,
                parameters,
                function(response) {

                    if (response && !response.error) {

                        resolve( response );

                    } else {

                        if ( response.error.message ) {
                            reject( new Error( response.error.message ) );
                        } else {
                            reject( new Error("FB.api failed") );
                        }

                    }
                }
            );

        });

    };

    FacebookPhotoProvider.prototype.apiScrape = function( url, parameters, data )
    {
        if ( data === void 0 ) {
            data = [];
        }
        var self = this;
        return this.api( url, parameters ).then( function( results ) {
            var nextURL = results.paging && results.paging.next ? results.paging.next : false;
            data = data.concat( results.data );
            if ( nextURL ) {
                return self.apiScrape( nextURL, parameters, data );
            }
            return data;
        } );
    };

    FacebookPhotoProvider.prototype.processAlbumData = function( data )
    {
        console.log("FacebookPhotoProvider.processAlbumData: Called with data", data );

        var i = 0,
            l = data.length,
            albums = [];

        for ( ; i < l ; ++i ) {
            var album = new Album( data[i].id, data[i].name, "/" + data[i].id + "/photos", data[i].cover_photo );
            this.albums[ album.id ] = album;
            this.albumsOrder.push( album.id );
            albums.push( album );
        }

        return albums;
    };

    FacebookPhotoProvider.prototype.processResults = function( results )
    {
        console.log("FacebookPhotoProvider.processResults: Called with results", results );
        this.url = results.paging && results.paging.next ? results.paging.next : false;

        var i      = 0,
            data   = results.data,
            l      = data.length,
            photos = [];

        for ( ; i < l ; ++i ) {

            var source,
                thumbnail;

            if ( data[i].images.length > 1 ) {

                source = data[i].images.shift().source;
                thumbnail = data[i].images.pop().source;

            } else {

                source = data[i].source;
                thumbnail = data[i].picture;

            }

            var photo = new Photo( data[i].id, source, thumbnail );
            this.addPhoto( photo );
            photos.push( photo );

        }

        return photos;
    };

    return FacebookPhotoProvider;

});
