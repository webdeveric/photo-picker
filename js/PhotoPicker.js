define( [
    "jquery",
    "util",
    "ContentProvider",
    "Photo",
    "Album",
    "Lightbox",
    "PhotoProvider"
], function( $, util, ContentProvider, Photo, Album, Lightbox, PhotoProvider ) {
    "use strict";

    function PhotoPicker( templateSelector, photoProvider, options )
    {
        ContentProvider.call(this);

        // extend deep
        this.options = $.extend( true, {
            lightboxSelector: "#photo-picker-lightbox",
            lightbox: {
                title: "Select a photo",
                titleSelector: ".lightbox-title",
                extraClass: "photo-picker-lightbox"
            }
        }, options );

        this.template       = templateSelector;
        this.photoProvider  = photoProvider;

        this.loadingClass   = "loading-picker";
        this.currentPanel   = "photos"; // "albums"
        this.albumsRendered = false;

        this.selectedPhoto  = null;
        this.lightbox       = null;

        // This holds the thumbnails.
        this.photosPanel    = null;
        this.albumsPanel    = null;

        // Buttons above the thumbnails.
        this.photosButton   = null;
        this.albumsButton   = null;

        // Buttons below the thumbnails.
        this.loadMoreButton = null;
        this.cancelButton   = null;
        this.submitButton   = null;

        // Promises
        this.setupLightbox  = null;
        this.initialized    = null;
    }

    util.extendClass( PhotoPicker, ContentProvider );

    PhotoPicker.prototype.init = function()
    {
        if ( !this.setupLightbox ) {
            var self = this;
            this.setupLightbox = new Promise( function( resolve /* , reject */ ) {
                self.setupTemplate().initLightbox();
                resolve( self );
            });
        }

        if ( !this.initialized ) {
            this.initialized = Promise.all( [ this.setupLightbox, this.photoProvider.init() ] );
        }

        return this.initialized;
    };

    PhotoPicker.prototype.numAlbums = function()
    {
        return this.photoProvider.numAlbums();
    };

    PhotoPicker.prototype.numPhotos = function()
    {
        return this.photoProvider.numPhotos();
    };

    PhotoPicker.prototype.handleKeyup = function( event )
    {
        if ( event.keyCode == 13 ) {
            this.handleSubmit( event );
        }
    };

    PhotoPicker.prototype.bindEvents = function()
    {
        $(document.documentElement).on("keyup.photopicker", $.proxy( this.handleKeyup, this ) );

        if ( this.photosPanel ) {
            this.photosPanel.on("click.photopicker", ".photo", $.proxy( this.handlePhotoClick, this ) );
        }

        if ( this.albumsPanel ) {
            this.albumsPanel.on("click.photopicker", ".album", $.proxy( this.handleAlbumClick, this ) );
        }

        if ( this.photosButton ) {
            this.photosButton.on("click.photopicker", $.proxy( this.handlePhotosButtonClick, this ) );
        }

        if ( this.albumsButton ) {
            this.albumsButton.on("click.photopicker", $.proxy( this.handleAlbumsButtonClick, this ) );
        }

        if ( this.loadMoreButton ) {
            this.loadMoreButton.on("click.photopicker", $.proxy( this.handleLoadMoreButtonClick, this ) );
        }

        if ( this.cancelButton ) {
            this.cancelButton.on("click.photopicker", $.proxy( this.handleCancelButtonClick, this ) );
        }

        if ( this.submitButton ) {
            this.submitButton.on("click.photopicker", $.proxy( this.handleSubmitButtonClick, this ) );
        }

        return this;
    };

    PhotoPicker.prototype.unbindEvents = function()
    {
        $(document.documentElement).off("keyup.photopicker");

        if ( this.photosPanel ) {
            this.photosPanel.off("click.photopicker", ".photo");
        }

        if ( this.albumsPanel ) {
            this.albumsPanel.off("click.photopicker", ".photo");
        }

        if ( this.photosButton ) {
            this.photosButton.off("click.photopicker");
        }

        if ( this.albumsButton ) {
            this.albumsButton.off("click.photopicker");
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

    PhotoPicker.prototype.initLightbox = function()
    {
        if ( !this.lightbox ) {
            this.lightbox = new Lightbox(
                this.options.lightboxSelector,
                this,
                this.options.lightbox
            );
        }
        return this;
    };

    PhotoPicker.prototype.open = function()
    {
        var self = this;
        this.init().then( function( initResults ) {

            var picker = initResults[0],
                provider = initResults[1];

            if ( picker instanceof PhotoPicker && provider instanceof PhotoProvider ) {

                picker.lightbox.open();

                if ( picker.photoProvider.numAlbumPhotos() === 0 ) {
                    picker.loadPhotos();
                }

            } else {
                console.error("PhotoPicker and PhotoProvider not initialized properly");
            }

        }, function( error ) {
            console.error( error.message );
            self.initialized = null; // reset the Promise so that you don't get stuck in a rejected state.
        });

        console.log("PhotoPicker.open");

        return this;
    };

    PhotoPicker.prototype.close = function()
    {
        if ( this.lightbox ) {
            this.lightbox.close();
        }

        console.log("PhotoPicker.close");

        return this;
    };

    PhotoPicker.prototype.clearPhotosPanel = function()
    {
        if ( this.photosPanel ) {
            this.photosPanel.empty();
        }
        return this;
    };

    PhotoPicker.prototype.renderPhotos = function( photos )
    {
        // Photos is an object, not array.
        console.log("PhotoPicker.renderPhotos: photos", photos );

        for ( var i in photos ) {
            this.photosPanel.append( photos[ i ].getHTML() );
        }

        // var self = this,
        //     thumbnailPromises = util.objectToArray( photos, function( photo ) {
        //         return photo.getThumbnailImg();
        //     });

        // return Promise.all( thumbnailPromises ).then( function( photos ) {

        //     var i = 0,
        //         l = photos.length;

        //     for ( ; i < l ; ++i ) {
        //         self.photosPanel.append( photos[ i ].getHTML() );
        //     }

        // });

    };

    PhotoPicker.prototype.renderAlbums = function( albums ) {

        if ( !this.albumsRendered ) {

            var self = this,
                albumPromises = util.objectToArray( albums, function( album ) {

                    if ( album.cover_photo ) {
                        return self.photoProvider.apiGetPhoto( album.cover_photo ).then( function( photo ) {
                            album.photo = photo;
                            return album;
                        });
                    }

                    return Promise.resolve( album );
                });

            return Promise.all( albumPromises ).then( function( albums ) {

                var i = 0,
                    l = albums.length;

                for ( ; i < l ; ++i ) {
                    self.albumsPanel.append( albums[ i ].getHTML() );
                }

                self.albumsRendered = true;
            });

        }

        return albums;
    };

    PhotoPicker.prototype.getPhotos = function()
    {
        console.log("PhotoPicker.getPhotos: Getting photos from provider");
        return this.photoProvider.getPhotos();
    };

    PhotoPicker.prototype.hasAlbums = function()
    {
        return this.photoProvider.hasAlbums();
    };

    PhotoPicker.prototype.toggleLoadingClass = function( state )
    {
        this.lightbox.toggleClass( this.loadingClass, state );
    };

    // Override this in your own class.
    PhotoPicker.prototype.loadPhotos = function()
    {
        var self = this;

        this.toggleLoadingClass( true );

        function removeLoadingClass() {
            self.toggleLoadingClass( false );
        }

        return this.photoProvider.loadPhotos().then(
            $.proxy( this.renderPhotos, this )
        ).then(
            $.proxy( this.toggleLoadMoreDisabled, this )
        ).then( removeLoadingClass, removeLoadingClass );
    };

    PhotoPicker.prototype.toggleLoadMoreDisabled = function( disabled )
    {
        if ( disabled === void 0 ) {
            disabled = this.photoProvider.getCurrentAlbum().getURL() === false;
        } else {
            disabled = !!disabled;
        }

        console.info("PhotoPicker.toggleLoadMoreDisabled: disabled", disabled );

        this.loadMoreButton.prop("disabled", disabled );
    };

    PhotoPicker.prototype.loadMore = function()
    {
        console.log("PhotoPicker loadMore");

        this.toggleLoadMoreDisabled( true );

        this.loadMoreButton.prop("disabled", true );
        var self = this;
        this.loadPhotos().then( function() {
            self.toggleLoadMoreDisabled();
        }, function( error ) {
            console.error( error );
            self.toggleLoadMoreDisabled();
        });
    };

    PhotoPicker.prototype.clearSelected = function( selector )
    {
        this.selectedPhoto = null;
        var panel = selector ? $( selector, this.content ) : this.content;
        panel.find(".selected").removeClass("selected");
        this.submitButton.prop("disabled", 1 );
    };

    PhotoPicker.prototype.switchToPanel = function( panel )
    {
        if ( this.currentPanel === panel ) {
            console.info("You're already on " + panel );
            return this;
        }

        console.info("Trying to switch to " + panel );

        if ( panel === "photos" ) {

            this.albumsButton.removeClass("active");
            this.albumsPanel.removeClass("active");

            this.photosButton.addClass("active");
            this.photosPanel.addClass("active");

        } else if ( panel === "albums" ) {

            this.albumsButton.addClass("active");
            this.albumsPanel.addClass("active");

            this.photosButton.removeClass("active");
            this.photosPanel.removeClass("active");

        }

        this.currentPanel = panel;

        return this;
    };

    PhotoPicker.prototype.switchToAlbum = function( album_id )
    {
        if ( album_id !== this.photoProvider.currentAlbumID ) {
            var self = this;
            this.toggleLoadingClass( true );
            this.photoProvider.switchToAlbum( album_id );
            this.clearPhotosPanel().getPhotos().then( function() {
                self.renderPhotos( self.photoProvider.getCurrentAlbumPhotos() );
                self.loadMoreButton.prop("disabled", self.photoProvider.getCurrentAlbum().getURL() === false );
                self.toggleLoadingClass( false );
            });
        }

        return this.switchToPanel("photos");
    };

    PhotoPicker.prototype.handlePhotosButtonClick = function()
    {
        this.switchToPanel("photos");
    };

    PhotoPicker.prototype.handleAlbumsButtonClick = function()
    {
        var self = this;

        this.switchToPanel("albums");
        this.toggleLoadingClass( true );
        this.loadMoreButton.prop("disabled", true );
        this.photoProvider.getAlbums().then( $.proxy( this.renderAlbums, this ) ).then( function() {
            self.toggleLoadingClass( false );
        });
    };

    PhotoPicker.prototype.handleAlbumClick = function( event )
    {
        var album_tn = $(event.currentTarget),
            album_id = album_tn.data("album-id");

        if ( album_id === this.photoProvider.currentAlbumID ) {

            // You clicked the album you already have loaded in the photos panel so just go back to it.
            this.switchToPanel("photos");

        } else {

            this.clearSelected( this.albumsPanel );
            album_tn.addClass("selected");
            this.switchToAlbum( album_id );

        }

        console.log("PhotoPicker.handleAlbumClick: album ID", album_id );
    };

    PhotoPicker.prototype.handlePhotoClick = function( event )
    {
        event.preventDefault();

        var photo = $(event.currentTarget),
            photo_id = photo.data("photo-id");

        this.clearSelected( this.photosPanel );

        if ( photo_id !== this.selectedPhoto ) {

            photo.addClass("selected");
            this.selectedPhoto = photo_id;
            this.submitButton.prop("disabled", 0 );

        }

        console.log("PhotoPicker.handlePhotoClick: Selected photo", this.selectedPhoto );
    };

    PhotoPicker.prototype.handleLoadMoreButtonClick = function( event )
    {
        event.preventDefault();
        this.loadMore();
    };

    PhotoPicker.prototype.handleCancelButtonClick = function( event )
    {
        event.preventDefault();
        this.clearSelected( this.photosPanel );
        this.close();
    };

    PhotoPicker.prototype.handleSubmitButtonClick = function( event )
    {
        this.handleSubmit( event );
    };

    PhotoPicker.prototype.getSelectedPhotoURL = function()
    {
        return "";
    };

    PhotoPicker.prototype.getSelectedPhoto = function()
    {
        if ( this.hasSelectedPhoto() ) {
            return this.photoProvider.getPhoto( this.selectedPhoto );
        }
        return false;
    };

    PhotoPicker.prototype.hasSelectedPhoto = function()
    {
        return this.selectedPhoto !== null && this.photoProvider.hasPhoto( this.selectedPhoto );
    };

    PhotoPicker.prototype.handleSubmit = function( event )
    {
        event.preventDefault();

        var photo = this.getSelectedPhoto();

        if ( photo !== false ) {
            $(document.documentElement).trigger("selected.photopicker", [ photo.getSrc() ] );
            this.close();
        }
    };

    PhotoPicker.prototype.setupTemplate = function()
    {
        this.template       = $(this.template).html();
        this.content        = $(this.template);

        this.photosPanel    = $(".photos-panel", this.content );
        this.albumsPanel   = $(".albums-panel", this.content );

        this.photosButton   = $(".button-photos", this.content );
        this.albumsButton   = $(".button-albums", this.content );

        if ( !this.photoProvider.supportsAlbums() ) {

            this.photosButton.remove();
            this.albumsButton.remove();

            this.photosButton = null;
            this.albumsButton = null;

            $(".button-container", this.content ).remove();
        }

        this.loadMoreButton = $(".button-load-more", this.content );
        this.cancelButton   = $(".button-cancel", this.content );
        this.submitButton   = $(".button-submit", this.content );

        return this;
    };

    PhotoPicker.prototype.trigger = function( event_name, parameters )
    {
        $(document.documentElement).trigger( event_name, parameters );
    };

    return PhotoPicker;

});
