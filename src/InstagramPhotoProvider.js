define( [
    "jquery",
    "util",
    "Photo",
    "PhotoProvider",
    "Popup"
], function( $, util, Photo, PhotoProvider, Popup ) {
    "use strict";

    function InstagramPhotoProvider( clientID, redirectURI )
    {
        PhotoProvider.call( this, "https://api.instagram.com/v1/users/self/media/recent", null );

        this.clientID = clientID;
        this.redirectURI = redirectURI;
        this.accessToken = null;
    }

    util.extendClass( InstagramPhotoProvider, PhotoProvider );

    InstagramPhotoProvider.prototype.init = function()
    {
        var self = this;
        return new Promise(function(resolve, reject) {

            if ( self.accessToken !== null ) {

                // console.info("Instagram access token already set");
                resolve( self );

            } else {

                // console.info("Trying to get access token from Instagram");

                if ( !self.clientID || !self.redirectURI ) {

                    reject( new Error("Please provide clientID and redirectURI") );

                } else {

                    var url = "https://api.instagram.com/oauth/authorize/?response_type=token&client_id=" + self.clientID + "&redirect_uri=" + self.redirectURI,
                        popup = new Popup( url, "instagram", { width: 650, height: 480 } );

                    popup.opened( function() {

                        window.receiveInstagramToken = function( token )
                        {
                            // console.info("Instagram access token received");
                            self.setAccessToken( token );
                            resolve( self );
                            window.receiveInstagramToken = null;
                        };

                    }).closed( function() {

                        window.receiveInstagramToken = null;

                        if ( self.accessToken !== null ) {
                            resolve( self );
                        } else {
                            reject( new Error("Authorization window was blocked or closed") );
                        }

                    }).blocked( popup.closedCallback ).open();

                }

            }

        });
    };

    InstagramPhotoProvider.prototype.getParameters = function()
    {
        return {
            count: this.limit,
            access_token: this.accessToken
        };
    };

    InstagramPhotoProvider.prototype.setAccessToken = function( token )
    {
        this.accessToken = token;
        // console.info("Instagram access token set");
        return this;
    };

    InstagramPhotoProvider.prototype.api = function( url, parameters )
    {
        parameters = $.extend( this.getParameters(), parameters );

        // console.log("Calling Instagram api", url, parameters );

        return new Promise( function( resolve, reject ) {

            $.ajax({
                url: url,
                data: parameters,
                dataType: "jsonp"
            }).then( function(response) {

                if ( response.meta.code && parseInt( response.meta.code, 10 ) === 200 ) {

                    resolve( response );

                } else {

                    if ( response.meta.error_message ) {
                        reject( new Error( response.meta.error_message ) );
                    } else {
                        reject( new Error( "Instagram error " + response.meta.code ) );
                    }

                }

            });

        });
    };

    InstagramPhotoProvider.prototype.apiGetPhotoURL = function( photo_id )
    {
        return "/media/" + photo_id;
    };

    InstagramPhotoProvider.prototype.apiGetAlbumURL = function()
    {
        return false;
    };

    InstagramPhotoProvider.prototype.getNextUrl = function( results )
    {
        return results.pagination && results.pagination.next_url ? results.pagination.next_url : false;
    };

    InstagramPhotoProvider.prototype.buildPhoto = function( data )
    {
        var photo = new Photo(
            data.id,
            data.images.standard_resolution.url.replace("http://", "//"),
            data.images.thumbnail.url.replace("http://", "//"),
            data.likes.count,
            data.tags
        );

        if ( data.caption && data.caption.text ) {
            photo.setDescription( data.caption.text );
        }

        return photo;
    };

    return InstagramPhotoProvider;

});
