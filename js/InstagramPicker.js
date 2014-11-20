(function(factory) {
    "use strict";

    if (typeof define === "function" && define.amd) {
        define([ "jquery", "PhotoPicker", "Lightbox" ], factory);
    } else {
        factory( jQuery, PhotoPicker, Lightbox );
    }

}(function( $, PhotoPicker, Lightbox ) {
    "use strict";

    var InstagramPicker = function( templateSelector, clientID, redirectURI )
    {
        PhotoPicker.call(this, templateSelector);

        this.type        = "instgrampicker";
        this.batchSize   = 20;
        this.clientID    = clientID;
        this.redirectURI = redirectURI;
        this.accessToken = null;
    };

    extendClass( InstagramPicker, PhotoPicker );

    InstagramPicker.prototype.init = function()
    {
        PhotoPicker.prototype.init.call(this);
        this.bindEvents();
    };

    InstagramPicker.prototype.authorizePicker = function()
    {
        if ( ! this.clientID || ! this.redirectURI ) {
            console.log("Please provide clientID and redirectURI");
            return false;
        }

        var url = "https://api.instagram.com/oauth/authorize/?response_type=token&client_id=" + this.clientID + "&redirect_uri=" + this.redirectURI;

        var blocked = function( url, prop ) {
            var content = "<p>Unable to open Instagram in a new window.</p><p>You need to authorize this app to be able to select a photo.</p>";
                content+= "<p><a target='_blank' class='button lightbox-close-action' href='" + url + "' data-allow-default='true'>Authorize app</a></p>";

            var blocked_lightbox = new Lightbox(
                ".default-lightbox",
                new ContentProvider( content ),
                {
                    title: "Authorization required",
                    extraClass: "notice"
                }
            );

            blocked_lightbox.open();
        };

        popup( url, { name: "instagram", width: 650, height: 480 }, blocked );
    };

    InstagramPicker.prototype.setAccessToken = function( token )
    {
        this.accessToken = token;
        return this;
    };

    InstagramPicker.prototype.fetchData = function()
    {
        var endpoint = "https://api.instagram.com/v1/users/self/media/recent",
            data = {
                "count": this.batchSize,
                "access_token": this.accessToken
            };
        // console.log("Fetching instagram data");
        return this.fetch( endpoint, data );
    };

    InstagramPicker.prototype.processData = function(data, status, jqXHR)
    {
        this.nextURL = data.pagination.next_url || false;

        if ( this.loadMoreButton ) {
            this.loadMoreButton.prop("disabled", this.nextURL === false );
        }

        var data = data.data,
            i = 0,
            l = data.length;

        for ( ; i < l ; ) {
            this.append( data[ i++ ] );
        }
    };

    InstagramPicker.prototype.open = function()
    {
        if ( this.accessToken ) {

            if ( this.photos.length === 0 ) {
                this.fetchData().done( $.proxy( this.render, this ) );
            } else {
                this.render();
            }

        } else {

            this.authorizePicker();

        }
    };

    InstagramPicker.prototype.getSelectedPhotoURL = function()
    {
        var photo = this.getSelectedPhoto();

        if ( photo !== false && photo.images.standard_resolution.url ) {
            return photo.images.standard_resolution.url;
        }

        console.log("No photo selected");

        return "";
    };

    InstagramPicker.prototype.render = function()
    {
        if ( !this.lightbox ) {
            this.lightbox = new Lightbox(
                ".social-lightbox",
                this,
                {
                    title: "Choose Photo"
                }
            );
        }

        this.lightbox.open();
    };

    InstagramPicker.prototype.append = function( photo )
    {
        var photos_length = this.photos.push( photo );

        var img  = new Image(),
            item = document.createElement("div");

        item.appendChild( img );

        img.onload = function() {
            this.parentNode.className = "photo";
            this.onload = null;
        };
        
        img.src = photo.images.thumbnail.url.replace("http://", "//");

        item.setAttribute("data-photo-index", photos_length - 1 );
        item.className = "photo loading";

        this.photoContainer.append( item );
    };

    return InstagramPicker;

}));
