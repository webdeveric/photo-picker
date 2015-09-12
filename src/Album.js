import Photo from './Photo';

export default class Album
{
  constructor( { id = 'default', name = '', photosURL = '', coverPhoto = '' } = {} )
  {
    this.id         = id;
    this.name       = name;
    this.photosURL  = photosURL;
    this.coverPhoto = coverPhoto;
    this.photoIDs   = [];
    this.photo      = null; // This should hold a Photo object for the cover photo;
  }

  addPhotoID( id )
  {
    this.photoIDs.push( id );
    return this;
  }

  getPhotoIDs()
  {
    return this.photoIDs || [];
  }

  getURL()
  {
    return this.photosURL || false;
  }

  setURL( url )
  {
    this.photosURL = url;
    return this;
  }

  getHTML()
  {
    const item      = document.createElement('div'),
          imgWraper = document.createElement('div'),
          caption   = document.createElement('div');

    let img = null;

    if ( this.photo instanceof Photo ) {
      img = this.photo.getThumbnailImg();
    } else {
      img = document.createElement('div');
      img.className = 'image-placeholder';
    }

    item.className      = 'photo-box album';
    imgWraper.className = 'image-wrapper';
    caption.className   = 'caption';

    caption.appendChild( document.createTextNode( this.name ) );

    imgWraper.appendChild( img );
    item.appendChild( imgWraper );
    item.appendChild( caption );

    item.setAttribute('data-album-id', this.id );

    return item;
  }

  hasPhotos()
  {
    return this.photoIDs.length > 0;
  }
}
