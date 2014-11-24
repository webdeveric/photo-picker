define( [
    "jquery",
    "util",
    "facebook",
    "PhotoPicker",
    "Lightbox",
    "Photo",
    "Album"
], function( $, util, FB, PhotoPicker, Lightbox, Photo, Album ) {
    "use strict";

    function FacebookPicker( templateSelector )
    {
        PhotoPicker.call(this, templateSelector);
        this.type = "facebookpicker";
        this.albumURL = "/me/albums";
    }

    util.extendClass( FacebookPicker, PhotoPicker );

    FacebookPicker.prototype.api = function( url, parameters )
    {
        var def = $.Deferred();

        parameters = $.extend({
            limit: this.resultsLimit
        }, parameters );

        console.log("Calling FB.api");

        FB.api(
            url,
            parameters,
            function(response) {
                if (response && !response.error) {
                    def.resolve( response );
                } else {
                    def.reject( response );
                }
            }
        );

        return def.promise();
    };

    FacebookPicker.prototype.getAlbumImages = function( cover_photo_ids ) {

        var i = 0,
            l = cover_photo_ids.length,
            batch = [],
            self = this;

        for ( ; i < l ; ++i ) {
            batch.push( { method: "GET", relative_url: cover_photo_ids[ i ] } );
        }

        FB.api(
            "/",
            "POST",
            {
                batch: batch
            },
            function(responses) {
                var i = 0,
                    l = responses.length;
                for ( ; i < l ; ++i ) {
                    if ( responses[ i ].code == 200 ) {
                        var data = JSON.parse( responses[ i ].body );
                        self.addPhoto( data );
                    }
                }
            }
        );

    };

    FacebookPicker.prototype.addPhoto = function( data )
    {
        // console.log( data );

        var photo = new Photo(
            data.id,
            data.images.shift().source,
            data.images.pop().source
        );

        return PhotoPicker.prototype.addPhoto.call( this, photo );
    };

    FacebookPicker.prototype.getAlbums = function()
    {
        return this.api( this.albumURL ).pipe( $.proxy( this.processAlbumData, this ) );
    };

    FacebookPicker.prototype.processAlbumData = function( albums )
    {
        var data   = albums.data,
            paging = albums.paging,
            i      = 0,
            l      = data.length,
            cover_photo_ids = [];

        this.albumURL = paging.next || false;

        for ( ; i < l ; ++i ) {
            var album = data[ i ];
            if ( !this.photos[ album.cover_photo ] ) {
                cover_photo_ids.push( album.cover_photo );
            }

            this.albums[ album.id ] = new Album( album.id, album.name, album.cover_photo, this );
        }

        console.info( cover_photo_ids );

        this.getAlbumImages( cover_photo_ids );

        if ( this.albumURL !== false ) {
            return this.getAlbums();
        }

        return this.albums;

    };

    FacebookPicker.prototype.fetch = function( url, data, callback )
    {
        this.currentURL = url;

        var self = this;

        FB.api(
            this.currentURL,
            {
                limit: this.resultsLimit
            },
            function(response) {

                if ( response.error ) {
                    self.trigger("error.photopicker", [ response.error, self ] );
                } else {
                    self.processData( response );

                    if ( typeof callback === "function" ) {
                        callback.call();
                    }
                }

            }
        );

    };

    FacebookPicker.prototype.fetchData = function( callback )
    {
        var endpoint = "/me/photos/uploaded",
            data = {};
        return this.fetch( endpoint, data, callback );

    };

    FacebookPicker.prototype.init = function()
    {
        PhotoPicker.prototype.init.call(this);
        var def = $.Deferred();
        FB.getLoginStatus( function(response) {
            if ( response && !response.error) {
                def.resolve( response );
            } else {
                def.reject( response );
            }
        });
        this.bindEvents();
        return def.promise();
    };

    FacebookPicker.prototype.processData = function( response )
    {
        this.nextURL = response.paging.next || false;

        if ( this.loadMoreButton ) {
            this.loadMoreButton.prop("disabled", this.nextURL === false );
        }

        var data = response.data,
            i = 0,
            l = data.length;

        for ( ; i < l ; ) {
            this.append( data[ i++ ] );
        }
    };

    FacebookPicker.prototype.fetchAndOpen = function() {
        if ( this.photos.length === 0 ) {
            this.fetchData( $.proxy( this.render, this ) );
        } else {
            this.render();
        }
    };

    FacebookPicker.prototype.open = function()
    {
        var self = this;

        FB.getLoginStatus( function(response) {

            if ( response.status === "connected" ) {

                self.fetchAndOpen();

            } else {

                FB.login(
                    function() {
                        self.fetchAndOpen();
                    },
                    {
                        scope: "public_profile,email,user_photos"
                    }
                );

            }

        });
    };

    FacebookPicker.prototype.getSelectedPhotoURL = function()
    {
        var photo = this.getSelectedPhoto();

        if ( photo !== false && photo.source ) {
            return photo.source;
        }

        console.log("No photo selected");

        return "";
    };

    FacebookPicker.prototype.render = function()
    {
        if ( !this.lightbox ) {
            this.lightbox = new Lightbox(
                "#photo-picker-lightbox",
                this,
                {
                    title: "Facebook Photos",
                    titleSelector: ".lightbox-title-text",
                    extraClass: "facebook-picker-lightbox"
                }
            );
        }
        this.lightbox.open();
    };

    FacebookPicker.prototype.append = function( photo )
    {
        console.log( photo );
        var photos_length = this.photos.push( photo ),
            img  = new Image(),
            item = document.createElement("div");

        item.appendChild( img );

        img.onload = function() {
            this.parentNode.className = "photo";
            this.onload = null;
        };

        img.src = photo.picture;

        item.setAttribute("data-photo-index", photos_length - 1 );
        item.className = "photo loading";

        this.photoContainer.append( item );
    };

    return FacebookPicker;

});
