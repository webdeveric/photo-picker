(function(factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define([ "jquery", "PhotoPicker", "Lightbox" ], factory);
    } else {
        factory( jQuery, PhotoPicker, Lightbox );
    }

}(function( $, PhotoPicker, Lightbox ) {
    "use strict";

    var FacebookPicker = function( templateSelector )
    {
        PhotoPicker.call(this, templateSelector);

        this.type        = "facebookpicker";
        this.batchSize   = 20;
    };

    extendClass( FacebookPicker, PhotoPicker );

    FacebookPicker.prototype.fetch = function( url, data, callback )
    {
        this.currentURL = url;

        var self = this;

        FB.api(
            this.currentURL,
            {
                limit: this.batchSize
            },
            function(response) {

                self.processData( response );

                if ( typeof callback === "function" ) {
                    callback.call();
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
        this.bindEvents();
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
                ".social-lightbox",
                this,
                {
                    title: "Choose photo from facebook"
                }
            );
        }
        this.lightbox.open();
    };

    FacebookPicker.prototype.append = function( photo )
    {
        var photos_length = this.photos.push( photo );

        var img  = new Image(),
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

}));
