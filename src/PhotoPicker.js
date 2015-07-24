import $ from 'jquery';
import { objectToArray, debug } from './util';
import ContentProvider from './ContentProvider';
import Lightbox from './Lightbox';
import PhotoProvider from './PhotoProvider';

class PhotoPicker extends ContentProvider
{
  constructor( templateSelector, photoProvider, options = {} )
  {
    // extend deep
    options = $.extend( true, {
      lightboxSelector: '#photo-picker-lightbox',
      lightbox: {
        title: 'Select a photo',
        titleSelector: '.lightbox-title',
        extraClass: 'photo-picker-lightbox'
      }
    }, options );

    super( '', options );

    this.template       = templateSelector;
    this.photoProvider  = photoProvider;

    this.loadingClass   = 'loading-picker';
    this.currentPanel   = 'photos'; // 'albums'
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

  init()
  {
    if ( ! this.setupLightbox ) {
      this.setupLightbox = new Promise( ( resolve ) => {
        this.setupTemplate().initLightbox();
        resolve( this );
      });
    }

    if ( ! this.initialized ) {
      this.initialized = Promise.all( [ this.setupLightbox, this.photoProvider.init() ] );
    }

    return this.initialized;
  }

  numAlbums()
  {
    return this.photoProvider.numAlbums();
  }

  numPhotos()
  {
    return this.photoProvider.numPhotos();
  }

  handleKeyup( e )
  {
    if ( e.keyCode === 13 ) {
      this.handleSubmit( e );
    }
  }

  bindEvents()
  {
    $(document.documentElement).on('keyup.photopicker', this.handleKeyup.bind( this ) );

    if ( this.photosPanel ) {
      this.photosPanel.on('click.photopicker', '.photo', this.handlePhotoClick.bind( this ) );
      this.photosPanel.on('dblclick.photopicker', '.photo', this.handlePhotoDoubleClick.bind( this ) );
    }

    if ( this.albumsPanel ) {
      this.albumsPanel.on('click.photopicker', '.album', this.handleAlbumClick.bind( this ) );
    }

    if ( this.photosButton ) {
      this.photosButton.on('click.photopicker', this.handlePhotosButtonClick.bind( this ) );
    }

    if ( this.albumsButton ) {
      this.albumsButton.on('click.photopicker', this.handleAlbumsButtonClick.bind( this ) );
    }

    if ( this.loadMoreButton ) {
      this.loadMoreButton.on('click.photopicker', this.handleLoadMoreButtonClick.bind( this ) );
    }

    if ( this.cancelButton ) {
      this.cancelButton.on('click.photopicker', this.handleCancelButtonClick.bind( this ) );
    }

    if ( this.submitButton ) {
      this.submitButton.on('click.photopicker', this.handleSubmitButtonClick.bind( this ) );
    }

    return this;
  }

  unbindEvents()
  {
    $(document.documentElement).off('keyup.photopicker');

    if ( this.photosPanel ) {
      this.photosPanel.off('click.photopicker', '.photo');
      this.photosPanel.off('dblclick.photopicker', '.photo');
    }

    if ( this.albumsPanel ) {
      this.albumsPanel.off('click.photopicker', '.photo');
    }

    if ( this.photosButton ) {
      this.photosButton.off('click.photopicker');
    }

    if ( this.albumsButton ) {
      this.albumsButton.off('click.photopicker');
    }

    if ( this.loadMoreButton ) {
      this.loadMoreButton.off('click.photopicker');
    }

    if ( this.cancelButton ) {
      this.cancelButton.off('click.photopicker');
    }

    if ( this.submitButton ) {
      this.submitButton.off('click.photopicker');
    }

    return this;
  }

  initLightbox()
  {
    if ( ! this.lightbox ) {
      this.lightbox = new Lightbox(
        this.options.lightboxSelector,
        this,
        this.options.lightbox
      );
    }

    return this;
  }

  open()
  {
    this.init().then(
      ( initResults ) => {
        const [ picker, provider ] = initResults;

        if ( picker instanceof PhotoPicker && provider instanceof PhotoProvider ) {

          picker.lightbox.open();

          if ( picker.photoProvider.numAlbumPhotos() === 0 ) {
            picker.loadPhotos();
          }

        } else {
          debug.error('PhotoPicker and PhotoProvider not initialized properly');
        }

      },
      ( error ) => {
        this.initialized = null; // clear out the Promise so that you don't get stuck in a rejected state.
        this.trigger('error.photopicker', [ this, error ] );
      }
    );

    return this;
  }

  close()
  {
    if ( this.lightbox ) {
      this.lightbox.close();
    }

    return this;
  }

  clearPhotosPanel()
  {
    if ( this.photosPanel ) {
      this.photosPanel.empty();
    }

    return this;
  }

  renderPhotos( photos = {} )
  {
    // Photos is an object, not array.
    for ( let i in photos ) {
      this.photosPanel.append( photos[ i ].getHTML() );
    }
  }

  renderAlbums( albums )
  {
    if ( ! this.albumsRendered ) {

      debug.log( albums );

      objectToArray( albums ).forEach( ( album ) => {
        this.albumsPanel.append( album.getHTML() );
      });

      this.albumsRendered = true;
    }

    return albums;
  }

  getPhotos()
  {
    return this.photoProvider.getPhotos();
  }

  hasAlbums()
  {
    return this.photoProvider.hasAlbums();
  }

  toggleLoadingClass( state )
  {
    this.lightbox.toggleClass( this.loadingClass, state );
  }

  // Override this in your own class.
  loadPhotos()
  {
    this.toggleLoadingClass( true );

    const cleanUp = () => {
      this.toggleLoadingClass( false );
      this.toggleLoadMoreDisabled();
    };

    return this.photoProvider.loadPhotos().then(
      this.renderPhotos.bind( this )
    ).then( cleanUp, cleanUp );
  }

  toggleLoadMoreDisabled( disabled )
  {
    if ( disabled === void 0 ) {
      disabled = this.photoProvider.getCurrentAlbum().getURL() === false;
    } else {
      disabled = !!disabled;
    }

    this.loadMoreButton.prop('disabled', disabled );
  }

  loadMore()
  {
    this.toggleLoadMoreDisabled( true );

    const toggleButton = () => {
      this.toggleLoadMoreDisabled();
    };

    this.loadPhotos().catch( debug.warn ).then( toggleButton, toggleButton );
  }

  clearSelected( selector )
  {
    this.selectedPhoto = null;
    const panel = selector ? $( selector, this.content ) : this.content;
    panel.find('.selected').removeClass('selected');
    this.submitButton.prop('disabled', 1 );
  }

  switchToPanel( panel )
  {
    if ( this.currentPanel !== panel ) {

      if ( panel === 'photos' ) {

        this.albumsButton.removeClass('active');
        this.albumsPanel.removeClass('active');

        this.photosButton.addClass('active');
        this.photosPanel.addClass('active');

      } else if ( panel === 'albums' ) {

        this.albumsButton.addClass('active');
        this.albumsPanel.addClass('active');

        this.photosButton.removeClass('active');
        this.photosPanel.removeClass('active');

      }

      this.currentPanel = panel;

    }

    return this;
  }

  switchToAlbum( albumId )
  {
    if ( albumId !== this.photoProvider.currentAlbumID ) {
      this.toggleLoadingClass( true );
      this.photoProvider.switchToAlbum( albumId );
      this.clearPhotosPanel().getPhotos().then( () => {
        this.renderPhotos( this.photoProvider.getCurrentAlbumPhotos() );
        this.loadMoreButton.prop('disabled', this.photoProvider.getCurrentAlbum().getURL() === false );
        this.toggleLoadingClass( false );
      });
    }

    return this.switchToPanel('photos');
  }

  handlePhotosButtonClick()
  {
    this.switchToPanel('photos');
  }

  handleAlbumsButtonClick()
  {
    this.switchToPanel('albums');
    this.toggleLoadingClass( true );
    this.loadMoreButton.prop('disabled', true );

    this.photoProvider.getAlbums().then( ( albums ) => {
      this.renderAlbums( albums );
    }).then( () => {
      this.toggleLoadingClass( false );
    });
  }

  handleAlbumClick( e )
  {
    const albumTn = $(e.currentTarget),
          albumId = albumTn.data('album-id');

    if ( albumId === this.photoProvider.currentAlbumID ) {

      // You clicked the album you already have loaded in the photos panel so just go back to it.
      this.switchToPanel('photos');

    } else {

      this.clearSelected( this.albumsPanel );
      albumTn.addClass('selected');
      this.switchToAlbum( albumId );

    }
  }

  handlePhotoClick( e )
  {
    e.preventDefault();

    const photo    = $(e.currentTarget),
          photoId = photo.data('photo-id');

    if ( photoId !== this.selectedPhoto ) {
      this.clearSelected( this.photosPanel );
      photo.addClass('selected');
      this.selectedPhoto = photoId;
      this.submitButton.prop('disabled', 0 );
    }
  }

  handlePhotoDoubleClick( e )
  {
    const photo   = $(e.currentTarget),
          photoId = photo.data('photo-id');

    if ( photoId === this.selectedPhoto ) {
      this.handleSubmit( e );
    }
  }

  handleLoadMoreButtonClick( e )
  {
    e.preventDefault();
    this.loadMore();
  }

  handleCancelButtonClick( e )
  {
    e.preventDefault();
    this.clearSelected( this.photosPanel );
    this.close();
  }

  handleSubmitButtonClick( e )
  {
    this.handleSubmit( e );
  }

  getSelectedPhotoURL()
  {
    return '';
  }

  getSelectedPhoto()
  {
    if ( this.hasSelectedPhoto() ) {
      return this.photoProvider.getPhoto( this.selectedPhoto );
    }

    return false;
  }

  hasSelectedPhoto()
  {
    return this.selectedPhoto !== null && this.photoProvider.hasPhoto( this.selectedPhoto );
  }

  handleSubmit( e )
  {
    e.preventDefault();

    const photo = this.getSelectedPhoto();

    // debug.info( this.selectedPhoto, photo );

    if ( photo !== false ) {
      this.trigger('selected.photopicker', [ photo, this.photoProvider ] );
      this.close();
    }
  }

  setupTemplate()
  {
    this.template     = $(this.template).html();
    this.content      = $(this.template);

    this.photosPanel  = $('.photos-panel', this.content );
    this.albumsPanel  = $('.albums-panel', this.content );

    this.photosButton = $('.button-photos', this.content );
    this.albumsButton = $('.button-albums', this.content );

    if ( ! this.photoProvider.supportsAlbums() ) {
      this.photosButton.remove();
      this.albumsButton.remove();

      this.photosButton = null;
      this.albumsButton = null;

      $('.button-container', this.content ).remove();
    }

    this.loadMoreButton = $('.button-load-more', this.content );
    this.cancelButton   = $('.button-cancel', this.content );
    this.submitButton   = $('.button-submit', this.content );

    return this;
  }

  trigger( name, parameters = {} )
  {
    $(document.documentElement).trigger( name, parameters );
  }

}

export default PhotoPicker;
