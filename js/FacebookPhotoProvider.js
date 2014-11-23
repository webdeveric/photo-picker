define( [
    "jquery",
    "util",
    "Photo",
    "PhotoProvider",
    "facebook"
], function( $, util, Photo, PhotoProvider, FB ) {
    "use strict";

    function FacebookPhotoProvider()
    {
        PhotoProvider.call(this);
        this.url = "/me/photos/uploaded";
    }

    util.extendClass( FacebookPhotoProvider, PhotoProvider );

    FacebookPhotoProvider.prototype.init = function()
    {
        return new Promise( function( resolve, reject ) {

            FB.getLoginStatus( function(response) {

                if ( response.status === "connected" ) {

                    resolve( true );

                } else {

                    FB.login( function(response) {

                        if ( response.authResponse ) {
                            resolve( true );
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
        console.log("Calling FB.api");

        parameters = $.extend( this.getParameters(), parameters );

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

    FacebookPhotoProvider.prototype.processResults = function( results )
    {
        this.url = results.paging && results.paging.next ? results.paging.next : false;

        var i    = 0,
            data = results.data,
            l    = data.length;

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

            this.addPhoto(
                new Photo( data[i].id, source, thumbnail )
            );

        }

        return this.photos;

    };

    return FacebookPhotoProvider;

});
