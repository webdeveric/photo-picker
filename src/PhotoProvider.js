import Photo from './Photo';
import Album from './Album';
import { throwIt, debug } from './util';

export default class PhotoProvider
{
  constructor( { name = 'default', url, albumsurl = null, limit = 64 } )
  {
    this.name      = name;
    this.url       = url;
    this.albumsurl = albumsurl;
    this.limit     = limit;

    if ( typeof Map === 'undefined' ) {
      debug.error('Map is undefined. Please provide a polyfill.');
    } else {
      this.photos = new Map();
      this.albums = new Map();
    }

    this.currentAlbumID = 'default';
    this.albumsLoaded   = false;

    this.addAlbum(
      new Album( 'default', 'All Photos', this.url )
    );
  }

  init()
  {
    return Promise.resolve( this );
  }

  getName()
  {
    return this.name || '';
  }

  getURL()
  {
    const album = this.getCurrentAlbum();
    return album !== false ? album.getURL() : false;
  }

  getParameters()
  {
    return {
      limit: this.limit
    };
  }

  numAlbums()
  {
    return this.albums.size;
  }

  numPhotos()
  {
    return this.photos.size;
  }

  numAlbumPhotos()
  {
    return this.getCurrentAlbum().getPhotoIDs().length;
  }

  addPhoto( photoInstance )
  {
    if ( photoInstance instanceof Photo ) {
      this.photos.set( String( photoInstance.id ), photoInstance );
    }

    return this;
  }

  addAlbum( albumInstance )
  {
    if ( albumInstance instanceof Album ) {
      this.albums.set( String( albumInstance.id ), albumInstance );
    }

    return this;
  }

  hasPhoto( photoId )
  {
    return this.photos.has( String( photoId ) );
  }

  // Updated this to return a Promise.
  // If the Photo exists, resolve it, otherwise, call the api to get it.
  getPhoto( photoId )
  {
    return this.hasPhoto( photoId ) ? this.photos.get( String( photoId ) ) : false;
  }

  getCurrentAlbumPhotos()
  {
    const photoIds = this.getCurrentAlbum().getPhotoIDs();
    const photos   = new Map();

    photoIds.forEach( ( id ) => {
      if ( this.photos.has( String( id ) ) ) {
        let photo = this.photos.get( id );
        photos.set( String( photo.id ), photo );
      }
    });

    return photos;
  }

  getPhotos()
  {
    return new Promise( ( resolve, reject ) => {

      if ( ! this.getCurrentAlbum().hasPhotos() ) {

        this.loadPhotos().then( resolve, reject );

      } else {

        resolve( this.getCurrentAlbumPhotos() );

      }

    });
  }

  loadPhotos( url )
  {
    const apiURL = url || this.getURL();

    if ( apiURL !== false ) {

      return this.api( apiURL, this.getParameters() ).then(
        ( results ) => {
          return this.processResults( results );
        },
        throwIt
      );

    }

    return Promise.reject( new Error('No more photos to load') );
  }

  supportsAlbums()
  {
    return this.albumsurl !== null;
  }

  getAlbums()
  {
    return this.loadAlbums();
  }

  getAlbum( albumId )
  {
    return this.albums.get( String( albumId ) ) || false;
  }

  getCurrentAlbum()
  {
    return this.getAlbum( this.currentAlbumID );
  }

  switchToAlbum( albumId )
  {
    if ( this.hasAlbum( albumId ) ) {
      this.currentAlbumID = albumId;
    } else {
      this.currentAlbumID = 'default';
    }

    return this;
  }

  hasAlbum( albumId )
  {
    return this.albums.has( String( albumId ) );
  }

  /*
    This method is a little different from loadPhotos.
    Albums should be loaded all at once since there are normally many more photos than albums.
  */
  loadAlbums()
  {
    if ( ! this.supportsAlbums() ) {
      return Promise.reject( new Error('This photo provider does not support albums') );
    }

    if ( this.albumsLoaded ) {
      return Promise.resolve( this.albums );
    }

    return this.apiScrape( this.albumsurl, this.getParameters() ).then( this.processAlbumData.bind( this ) );
  }

  apiGetPhoto( photoId )
  {
    let photo = this.getPhoto( photoId );

    if ( photo !== false ) {
      return Promise.resolve( photo );
    }

    return this.api( this.apiGetPhotoURL( photoId ), this.getParameters() ).then(
      ( data ) => {
        photo = this.buildPhoto( data );
        this.addPhoto( photo );
        return photo;
      },
      throwIt
    );
  }

  apiGetAlbum( albumId )
  {
    return this.api( this.apiGetAlbumURL( albumId ), this.getParameters() );
  }

  processResults( results )
  {
    const album = this.getCurrentAlbum();

    album.setURL( this.getNextUrl( results ) );

    const photos = new Map();

    results.data.forEach( ( d ) => {
      let photo = this.buildPhoto( d );
      this.addPhoto( photo );
      album.addPhotoID( photo.id );
      photos.set( String( photo.id ), photo );
    });

    return photos;
  }

  /*
    data is an array.
    The apiScrape method returns an array containing the results from each call to the API.
    In this case, it is an array of objects representing albums from the API.
  */
  processAlbumData( data )
  {
    if ( ! this.albumsLoaded ) {

      data.forEach( ( d ) => {
        this.addAlbum( this.buildAlbum( d ) );
      });

      this.albumsLoaded = true;
    }

    return this.albums;
  }

  /*
    Please override the following methods when you subclass PhotoProvider.
  */

  api( /* url, parameters */ )
  {
    debug.info('PhotoProvider.api: Please override this method in your subclasses');
    return Promise.resolve( {
      data: [],
      paging: {}
    } );
  }

  apiScrape( url, parameters, data = [] )
  {
    return this.api( url, parameters ).then(
      ( results ) => {
        const nextURL = this.getNextUrl( results );

        data.push( ...results.data );

        if ( nextURL ) {
          return this.apiScrape( nextURL, parameters, data );
        }

        return data;
      },
      throwIt
    );
  }

  apiGetPhotoURL( photoId )
  {
    debug.info('PhotoProvider.apiGetPhotoURL: Please override this method in your subclasses');
    return '/' + photoId;
  }

  apiGetAlbumURL( albumId )
  {
    debug.info('PhotoProvider.apiGetAlbumURL: Please override this method in your subclasses');
    return '/' + albumId;
  }

  getNextUrl( /* results */ )
  {
    return false;
  }

  buildPhoto( /* data */ )
  {
    return new Photo();
  }

  buildAlbum( /* data */ )
  {
    return new Album();
  }

}
