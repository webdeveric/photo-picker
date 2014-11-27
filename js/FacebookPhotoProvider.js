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
        PhotoProvider.call( this, "/me/photos/uploaded", "/me/albums" );
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

    FacebookPhotoProvider.prototype.apiGetPhotoURL = function( photo_id )
    {
        return "/" + photo_id;
    };

    FacebookPhotoProvider.prototype.apiGetAlbumURL = function( album_id )
    {
        return "/" + album_id;
    };

    FacebookPhotoProvider.prototype.apiGetAlbumPhotosURL = function( album_id )
    {
        return "/" + album_id + "/photos";
    };

    FacebookPhotoProvider.prototype.getNextUrl = function( results )
    {
        return results.paging && results.paging.next ? results.paging.next : false;
    };

    FacebookPhotoProvider.prototype.buildPhoto = function( data )
    {
        var source,
            thumbnail;

        if ( data.images.length > 1 ) {

            source = data.images.shift().source;
            thumbnail = data.images.pop().source;

        } else {

            source = data.source;
            thumbnail = data.picture;

        }

        return new Photo( data.id, source, thumbnail );
    };

    FacebookPhotoProvider.prototype.buildAlbum = function( data )
    {
        return new Album(
            data.id,
            data.name,
            this.apiGetAlbumPhotosURL( data.id ),
            data.cover_photo
        );
    };

    return FacebookPhotoProvider;

});
