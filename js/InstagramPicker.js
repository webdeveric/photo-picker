define( [
    "jquery",
    "util",
    "PhotoPicker",
    "Lightbox",
    "Popup",
    "ContentProvider",
    "Photo"
], function( $, util, PhotoPicker, Lightbox, Popup, ContentProvider, Photo ) {
    "use strict";

    alert(Photo);

    function InstagramPicker( templateSelector, clientID, redirectURI )
    {
        PhotoPicker.call(this, templateSelector);

        this.type           = "instgrampicker";
        this.clientID       = clientID;
        this.redirectURI    = redirectURI;
        this.accessToken    = null;
        this.supportsAlbums = false;
    }

    util.extendClass( InstagramPicker, PhotoPicker );

    InstagramPicker.prototype.init = function()
    {
        PhotoPicker.prototype.init.call(this);
        this.bindEvents();
        var def = $.Deferred();
        def.resolve(true);
        return def.promise();
    };

    InstagramPicker.prototype.handlePopupBlocked = function( popup ) {
        var content = "<p>Unable to open Instagram in a new window.</p><p>You need to authorize this app to be able to select a photo.</p><p><a target='_blank' class='button lightbox-close-action' href='" + popup.url + "' data-allow-default='true'>Authorize app</a></p>",
            blocked_lightbox = new Lightbox(
                ".default-lightbox",
                new ContentProvider( content ),
                {
                    title: "Authorization required",
                    extraClass: "notice"
                }
            );
        blocked_lightbox.open();
    };

    InstagramPicker.prototype.handlePopupClosed = function( /* popup */ ) {
        if ( !this.accessToken ) {
            var error = {
                message: "An active access token is required to query Instagram.",
                type: "OAuthException"
            };
            this.trigger("error.photopicker", [ error, this ] );
        }
    };

    InstagramPicker.prototype.authorizePicker = function()
    {
        if ( !this.clientID || !this.redirectURI ) {
            console.log("Please provide clientID and redirectURI");
            return false;
        }

        var url = "https://api.instagram.com/oauth/authorize/?response_type=token&client_id=" + this.clientID + "&redirect_uri=" + this.redirectURI;

        new Popup( url, "instagram", { width: 650, height: 480 } ).blocked(
            $.proxy( this.handlePopupBlocked, this )
        ).closed(
            $.proxy( this.handlePopupClosed, this )
        ).open();

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

    InstagramPicker.prototype.processData = function( data /* , status, jqXHR */ )
    {
        this.nextURL = data.pagination.next_url || false;

        if ( this.loadMoreButton ) {
            this.loadMoreButton.prop("disabled", this.nextURL === false );
        }

        var imgs = data.data,
            i = 0,
            l = imgs.length;

        for ( ; i < l ; ) {
            this.append( imgs[ i++ ] );
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
        // var photos_length = this.photos.length,
        //     item = document.createElement("div"),
        //     imgObj = img.getThumbnailImg( function( /* event */ ) {
        //         this.parentNode.className = "photo";
        //     });

        // item.appendChild( imgObj );
        // item.setAttribute("data-photo-index", photos_length - 1 );
        // item.className = "photo loading";

        // this.photoContainer.append( item );

        if ( !this.lightbox ) {
            this.lightbox = new Lightbox(
                "#photo-picker-lightbox",
                this,
                {
                    title: "Instagram Photos",
                    titleSelector: ".lightbox-title-text",
                    extraClass: "instagram-picker-lightbox"
                }
            );
        }

        this.lightbox.open();
    };

    InstagramPicker.prototype.append = function( photo )
    {
        var img = new Photo(
            "",
            photo.images.standard_resolution.url.replace("http://", "//"),
            photo.images.thumbnail.url.replace("http://", "//"),
            photo.likes.count,
            photo.tags
        );

        if ( photo.caption && photo.caption.text ) {
            img.setDescription( photo.caption.text );
        }

        return PhotoPicker.prototype.append.call( this, img );
    };

    return InstagramPicker;

});
