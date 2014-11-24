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
        // this.albumbProvider = albumbProvider;
        this.supportsAlbums = true;
        this.currentAlbum   = 0;
        this.lastPhoto      = 0;
        this.currentPanel   = "photo"; // "albumb"

        this.selectedPhoto  = null;
        this.lightbox       = null;

        // This holds the thumbnails.
        this.photoContainer = null;

        // Buttons above the thumbnails.
        this.photosButton   = null;
        this.albumsButton   = null;

        // Buttons below the thumbnails.
        this.loadMoreButton = null;
        this.cancelButton   = null;
        this.submitButton   = null;

        // Promise
        this.initialized    = null;
    }

    util.extendClass( PhotoPicker, ContentProvider );

    PhotoPicker.prototype.init = function()
    {
        if ( !this.initialized ) {

            var self = this,
                setupLightbox = new Promise( function( resolve /* , reject */ ) {
                    self.setupTemplate().initLightbox();
                    resolve( self );
                });

            this.initialized = Promise.all( [ setupLightbox, this.photoProvider.init() ] );

        }

        return this.initialized;
    };

    PhotoPicker.prototype.numAlbums = function()
    {
        return Object.keys( this.albums ).length;
    };

    PhotoPicker.prototype.numPhotos = function()
    {
        return this.photoProvider.numPhotos();
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

        if ( this.photosButton ) {
            this.photosButton.on("click.photopicker", $.proxy( this.handlePhotosButtonClick, this ) );
        }

        if ( this.albumsButton ) {
            this.albumsButton.on("click.photopicker", $.proxy( this.handleAlbumsButtonClick, this ) );
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
        this.init().then( function( initResults ) {

            var picker = initResults[0],
                provider = initResults[1];

            if ( picker instanceof PhotoPicker && provider instanceof PhotoProvider ) {

                picker.lightbox.open();

                if ( picker.photoProvider.numPhotos() === 0 ) {
                    picker.loadPhotos();
                }

            } else {
                console.error("PhotoPicker and PhotoProvider not initialized properly");
            }

        });

        console.log("PhotoPicker.open");
    };

    PhotoPicker.prototype.close = function()
    {
        if ( this.lightbox ) {
            this.lightbox.close();
        }
        console.log("PhotoPicker.close");
    };

    PhotoPicker.prototype.clearContainer = function()
    {
        this.photoContainer.empty();
    };

    PhotoPicker.prototype.renderImage = function( img )
    {
        if ( !img ) {
            return;
        }

        var item = document.createElement("div");
        item.className = "photo";
        item.appendChild( img );
        item.setAttribute("data-photo-id", img.id );
        this.photoContainer.append( item );
    };

    PhotoPicker.prototype.render = function( photos )
    {
        console.log("PhotoPicker.render: Rendering photos", photos );

        var self = this,
            thumbnailPromises = photos.map( function(photo) {
                return photo.getThumbnailImg();
            });

        return Promise.all( thumbnailPromises ).then( function( images ) {
            var i = 0,
                l = images.length;
            for ( ; i < l ; ++i ) {
                self.renderImage( images[ i ] );
            }
        });

        // var self = this;
        // photos.reduce(function( sequence, photo ) {
        //     console.log( photo );
        //     return sequence.then( function() {

        //         return photo.getThumbnailImg();

        //     }).then(function( img ) {

        //         var item = document.createElement("div");
        //         item.className = "photo";
        //         item.appendChild( img );
        //         item.setAttribute("data-photo-id", photo.id );

        //         self.photoContainer.append( item );

        //     });
        // }, Promise.resolve() );

    };

    PhotoPicker.prototype.maybeLoad = function()
    {
        console.info("maybeLoad");

        var self = this;
        return new Promise( function( resolve, reject ) {

            if ( self.photoProvider.numPhotos() === 0 ) {
                self.photoProvider.loadPhotos().then( function() {
                    resolve( self.photoProvider );
                }, function( error ) {
                    reject( error );
                });
            } else {
                resolve( self.photoProvider );
            }

        });
    };

    PhotoPicker.prototype.getPhotos = function()
    {
        console.log("PhotoPicker.getPhotos: Getting photos from provider");
        return this.photoProvider.getPhotos();
    };

    PhotoPicker.prototype.hasAlbums = function() {
        return this.supportsAlbums && this.numAlbums() > 0;
    };

    // Override this in your own class if it supports albums.
    // PhotoPicker.prototype.getAlbums = function()
    // {
    //     var def = $.Deferred();

    //     if ( this.supportsAlbums ) {

    //         if ( !this.albums.length ) {
    //             return this.loadAlbums();
    //         }

    //         def.resolve( this.albums );
    //     }
    //     def.resolve( false );
    //     return def.promise();
    // };

    // Override this in your own class.
    PhotoPicker.prototype.loadPhotos = function()
    {
        var self = this,
            loadingClass = "loading-picker";

        this.lightbox.toggleClass( loadingClass, true );

        function removeLoadingClass() {
            self.lightbox.toggleClass( loadingClass, false );
        }

        return this.photoProvider.loadPhotos().then(
            $.proxy( this.render, this )
        ).then(
            $.proxy( this.toggleLoadMoreDisabled, this )
        ).then( removeLoadingClass, removeLoadingClass );
    };

    // Override this in your own class.
    PhotoPicker.prototype.loadAlbums = function()
    {
        return $.when( this.supportsAlbums ? this.albums = {} : false );
    };

    PhotoPicker.prototype.loadAlbumPhotos = function()
    {
        return $.when( this.supportsAlbums ? {} : false );
    };

    PhotoPicker.prototype.toggleLoadMoreDisabled = function( state ) {
        state = state || this.photoProvider.getURL() === false;
        console.info("PhotoPicker.toggleLoadMoreDisabled: State", state );
        this.loadMoreButton.prop("disabled", state );
    };

    PhotoPicker.prototype.loadMore = function()
    {
        console.log("PhotoPicker loadMore");

        this.toggleLoadMoreDisabled( 1 );

        this.loadMoreButton.prop("disabled", 1 );
        var self = this;
        this.loadPhotos().then( function() {
            self.toggleLoadMoreDisabled();
        }, function( error ) {
            console.debug( error );
            self.toggleLoadMoreDisabled();
        });
    };

    PhotoPicker.prototype.clearSelected = function()
    {
        this.selectedPhoto = null;
        this.content.find(".selected").removeClass("selected");
        this.submitButton.prop("disabled", 1 );
    };

    PhotoPicker.prototype.handlePhotosButtonClick = function( event ) {
        alert("Show photos panel");
        console.log( event );
    };

    PhotoPicker.prototype.handleAlbumsButtonClick = function( event ) {
        alert("Show albums panel");
        console.log( event );
    };

    PhotoPicker.prototype.handlePhotoClick = function( event )
    {
        var photo = $(event.currentTarget),
            photo_id = photo.data("photo-id");

        if ( photo_id === this.selectedPhoto ) {

            this.clearSelected();

        } else {

            this.clearSelected();
            photo.addClass("selected");
            this.selectedPhoto = photo_id;
            this.submitButton.prop("disabled", 0 );

        }
        console.log("PhotoPicker.handlePhotoClick: Selected photo", this.selectedPhoto );
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

    PhotoPicker.prototype.handleSubmit = function()
    {
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

        this.photoContainer = $(".photo-container", this.content );

        this.photosButton   = $(".button-photos", this.content );
        this.albumsButton   = $(".button-albums", this.content );

        if ( !this.supportsAlbums ) {
            this.albumsButton.remove();
            this.albumsButton = null;
        }

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
