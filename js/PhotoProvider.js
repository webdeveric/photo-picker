define( [
    "jquery",
    "Photo"
], function( $, Photo ) {
    "use strict";

    function PhotoProvider()
    {
        this.url    = null;
        this.photos = {};
        this.limit  = 40;
    }

    PhotoProvider.prototype.init = function()
    {
        return Promise.resolve( true );
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
        return Object.keys( this.photos ).length;
    };

    PhotoProvider.prototype.addPhoto = function( photo_obj )
    {
        if ( photo_obj instanceof Photo ) {
            this.photos[ photo_obj.id ] = photo_obj;
        }
        return this;
    };

    PhotoProvider.prototype.getPhotos = function()
    {
        var self = this,
            promise = new Promise( function( resolve, reject ) {
                if ( self.numPhotos() === 0 ) {

                    return self.loadPhotos().then( function( photos ) {
                        resolve( photos );
                    }, function( error ) {
                        reject( error );
                    });

                } else {

                    resolve( self.photos );

                }

            });

        return promise;
    };

    PhotoProvider.prototype.loadPhotos = function()
    {
        if ( this.getURL() !== false ) {
            return this.api( this.url, this.getParameters() ).then(
                $.proxy( this.processResults, this ),
                function( error ) {
                    throw error;
                    // return new Error("Unable to load photos.");
                }
            );
        }

        return Promise.resolve( this.photos );
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
        // This is where you set the URL for the next page, if there is one.
        this.url = results.paging && results.paging.next ? results.paging.next : false;

        var i    = 0,
            data = results.data,
            l    = data.length;

        for ( ; i < l ; ++i ) {
            this.addPhoto( new Photo() );
        }

        return this.photos;
    };

    return PhotoProvider;

});
