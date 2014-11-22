define( [
    "jquery",
    "util",
    "ContentProvider",
    "Photo"
], function( $, util, ContentProvider, Photo ) {
    "use strict";

    function PhotoPicker( templateSelector )
    {
        ContentProvider.call(this);

        this.type           = "photopicker";
        this.template       = templateSelector;
        this.albums         = [];
        this.photos         = {};
        this.supportsAlbums = true;
        this.currentAlbum   = 0;
        this.lastPhoto      = 0;
        this.batchSize      = 40;
        this.currentTab     = "photo"; // "albumb"
        this.nextURL        = null;
        this.currentURL     = null;
        this.selectedPhoto  = null;
        this.lightbox       = null;
        this.photoContainer = null;
        this.loadMoreButton = null;
        this.cancelButton   = null;
        this.submitButton   = null;
    }

    util.extendClass( PhotoPicker, ContentProvider );

    PhotoPicker.prototype.init = function()
    {
        this.setupTemplate();
        var def = $.Deferred();
        def.resolve(true);
        return def.promise();
    };

    PhotoPicker.prototype.handleKeyup = function( event )
    {
        if ( event.keyCode == 13 ) {
            this.handleSubmit();
        }
    };

    PhotoPicker.prototype.bindEvents = function()
    {
        var self = this;

        $(document.documentElement).on("keyup.photopicker", $.proxy( this.handleKeyup, this ) );

        if ( this.photoContainer ) {
            this.photoContainer.on("click.photopicker", ".photo", $.proxy( this.handlePhotoClick, this ) );
        }

        if ( this.loadMoreButton ) {
            this.loadMoreButton.on("click.photopicker", function() {
                self.loadMore();
            });
        }

        if ( this.cancelButton ) {
            this.cancelButton.on("click.photopicker", function() {
                self.clearSelected();
                self.close();
            });
        }

        if ( this.submitButton ) {
            this.submitButton.on("click.photopicker", function() {
                self.handleSubmit();
            });
        }

        return this;
    };

    PhotoPicker.prototype.unbindEvents = function()
    {
        $(document.documentElement).off("keyup.photopicker");

        if ( this.photoContainer ) {
            this.photoContainer.off("click.photopicker", ".photo");
        }

        if ( this.loadMoreButton ) {
            this.loadMoreButton.off("click.photopicker");
        }

        if ( this.cancelButton ) {
            this.cancelButton.off("click.photopicker");
        }

        if ( this.submitButton ) {
            this.submitButton.off("click.photopicker");
        }

        return this;
    };

    PhotoPicker.prototype.open = function()
    {
    };

    PhotoPicker.prototype.close = function()
    {
        if ( this.lightbox ) {
            this.lightbox.close();
        }
        console.log("PhotoPicker closed");
    };

    PhotoPicker.prototype.render = function()
    {
        console.log("Rendering data");
    };

    PhotoPicker.prototype.addPhoto = function( img )
    {
        this.photos[ img.id ] = img;
        return this;
    };

    PhotoPicker.prototype.append = function( img )
    {
        if ( img instanceof Photo ) {
            this.photos.push( img );
            // console.log( img );
        }
        return this;
    };

    PhotoPicker.prototype.fetchData = function()
    {
        console.log("Fetching data");
    };

    PhotoPicker.prototype.getPhotos = function()
    {
        return this.photos;
    };

    PhotoPicker.prototype.hasAlbums = function() {
        return this.supportsAlbums && this.albums.length > 0;
    };

    PhotoPicker.prototype.getAlbums = function()
    {
        var def = $.Deferred();

        if ( this.supportsAlbums ) {

            if ( !this.albums.length ) {
                return this.loadAlbums();
            }

            def.resolve( this.albums );
        }
        def.resolve( false );
        return def.promise();
    };

    PhotoPicker.prototype.loadAlbums = function()
    {
        return $.when( this.supportsAlbums ? [] : false );
    };

    PhotoPicker.prototype.loadMore = function()
    {
        console.log("PhotoPicker loadMore");
        this.loadMoreButton.prop("disabled", 1 );
        if ( this.nextURL ) {
            this.fetch( this.nextURL );
        }
    };

    PhotoPicker.prototype.processData = function(data, status, jqXHR)
    {
        console.log(data, status, jqXHR);
    };

    PhotoPicker.prototype.fetch = function( url, data )
    {
        console.log("PhotoPicker fetch");
        this.currentURL = url;
        data = data || "";

        var do_fetch = this.beforeFetch( url, data );

        if ( do_fetch === false ) {
            return;
        }

        return $.ajax({
            url: url,
            data: data,
            dataType: "jsonp"
        }).done(
            $.proxy( this.processData, this )
        ).fail(
            $.proxy( this.fetchFailed, this )
        ).always(
            $.proxy( this.afterFetch, this )
        );
    };

    PhotoPicker.prototype.beforeFetch = function()
    {
        this.content.addClass("fetching");
    };

    PhotoPicker.prototype.afterFetch = function()
    {
        this.content.removeClass("fetching");
    };

    PhotoPicker.prototype.fetchFailed = function()
    {
        console.log("Fetch failed");
    };

    PhotoPicker.prototype.clearSelected = function()
    {
        this.selectedPhoto = null;
        this.content.find(".selected").removeClass("selected");
        this.submitButton.prop("disabled", 1 );
    };

    PhotoPicker.prototype.handlePhotoClick = function( event )
    {
        var photo = $(event.currentTarget),
            photo_index = parseInt( photo.data("photo-index"), 10 );

        if ( photo_index === this.selectedPhoto ) {

            this.clearSelected();

        } else {

            this.clearSelected();
            photo.addClass("selected");
            this.selectedPhoto = photo_index;
            this.submitButton.prop("disabled", 0 );

        }
    };

    PhotoPicker.prototype.getSelectedPhotoURL = function()
    {
        return "";
    };

    PhotoPicker.prototype.getSelectedPhoto = function()
    {
        if ( this.hasSelectedPhoto() ) {
            return this.photos[ this.selectedPhoto ];
        }
        return false;
    };

    PhotoPicker.prototype.hasSelectedPhoto = function()
    {
        return this.selectedPhoto !== null && this.photos[ this.selectedPhoto ] != void 0;
    };

    PhotoPicker.prototype.handleSubmit = function()
    {
        if ( this.hasSelectedPhoto() ) {
            $(document.documentElement).trigger("selected.photopicker", [ this.getSelectedPhotoURL(), this.type ] );
            this.close();
        }
    };

    PhotoPicker.prototype.setupTemplate = function()
    {
        // this.template       = Hogan.compile( $(this.template).html() );
        this.template       = $(this.template).html();
        this.content        = $(this.template);
        this.photoContainer = $(".photo-container", this.content );
        this.loadMoreButton = $(".button-load-more", this.content );
        this.cancelButton   = $(".button-cancel", this.content );
        this.submitButton   = $(".button-submit", this.content );
        return this;
    };

    PhotoPicker.prototype.trigger = function( event_name, parameters ) {
        $(document.documentElement).trigger( event_name, parameters );
    };

    return PhotoPicker;

});
