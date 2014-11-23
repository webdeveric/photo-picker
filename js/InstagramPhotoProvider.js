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
        PhotoProvider.call(this);
        this.url = "https://api.instagram.com/v1/users/self/media/recent";
        this.clientID = clientID;
        this.redirectURI = redirectURI;
        this.accessToken = null;
    }

    util.extendClass( InstagramPhotoProvider, PhotoProvider );

    InstagramPhotoProvider.prototype.init = function()
    {
        return this.authorizePicker();
    };

    InstagramPhotoProvider.prototype.getParameters = function()
    {
        return {
            count: this.limit,
            access_token: this.accessToken
        };
    };

    InstagramPhotoProvider.prototype.authorizePicker = function()
    {
        var self = this,
            promise = new Promise(function(resolve, reject) {

                if ( self.accessToken !== null ) {

                    console.log("Instagram access token already set");
                    resolve( true );

                } else {

                    console.log("Trying to get access token from Instagram");

                    if ( !self.clientID || !self.redirectURI ) {

                        reject( new Error("Please provide clientID and redirectURI") );

                    } else {

                        var url = "https://api.instagram.com/oauth/authorize/?response_type=token&client_id=" + self.clientID + "&redirect_uri=" + self.redirectURI,
                            popup = new Popup( url, "instagram", { width: 650, height: 480 } );

                        popup.opened( function() {

                            window.receiveInstagramToken = function( token )
                            {
                                console.log("Instagram access token received");
                                self.setAccessToken( token );
                                resolve( true );
                                window.receiveInstagramToken = null;
                            };

                        }).closed( function() {

                            window.receiveInstagramToken = null;

                            if ( self.accessToken !== null ) {
                                resolve( true );
                            } else {
                                reject( new Error("Authorization window was blocked or closed") );
                            }

                        }).blocked( popup.closedCallback ).open();

                    }

                }

            });

        return promise;
    };

    InstagramPhotoProvider.prototype.setAccessToken = function( token )
    {
        this.accessToken = token;
        console.log("Instagram access token set");
        return this;
    };

    InstagramPhotoProvider.prototype.api = function( url, parameters )
    {
        console.log("Calling Instagram api");

        parameters = $.extend( this.getParameters(), parameters );

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

    InstagramPhotoProvider.prototype.processResults = function( results )
    {
        console.info("Processing results", results );

        this.url = results.pagination && results.pagination.next_url ? results.pagination.next_url : false;

        var i    = 0,
            data = results.data,
            l    = data.length;

        for ( ; i < l ; ++i ) {

            var img = data[i],
                photo = new Photo(
                    img.id,
                    img.images.standard_resolution.url.replace("http://", "//"),
                    img.images.thumbnail.url.replace("http://", "//"),
                    img.likes.count,
                    img.tags
                );

            if ( img.caption && img.caption.text ) {
                photo.setDescription( img.caption.text );
            }

            this.addPhoto( photo );
        }

        return this.photos;

    };

    return InstagramPhotoProvider;

});
