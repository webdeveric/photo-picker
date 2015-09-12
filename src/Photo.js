export default class Photo
{
  constructor( id, src, thumbnail, likes = 0, tags = [], description = '' )
  {
    this.id          = id;
    this.src         = src;
    this.thumbnail   = thumbnail;
    this.likes       = likes;
    this.tags        = tags;
    this.description = description;
  }

  addTag( tag )
  {
    if ( Array.isArray( this.tags ) ) {
      this.tags.push( tag );
    }

    return this;
  }

  setDescription( description )
  {
    if ( description ) {
      this.description = description;
    }

    return this;
  }

  setTags( tags )
  {
    if ( tags ) {
      this.tags = [];
      this.tags.push( ...tags );
    }

    return this;
  }

  incrementLikes()
  {
    ++this.likes;
    return this;
  }

  getSrc()
  {
    return this.src;
  }

  getThumbnail()
  {
    return this.thumbnail;
  }

  getThumbnailImg()
  {
    if ( ! this.thumbnail ) {

      return false;

    } else {

      const img = new Image(),
            resetImg = function( i ) {
              i.className = '';
              i.onload = i.onerror = i.onabort = null;
            };

      img.id = this.id;
      img.className = 'image-loading';

      img.onload = function() {
        resetImg( this );
      };

      img.onerror = img.onabort = function() {
        resetImg( this );
        this.parentNode.removeChild( this );
      };

      img.src = this.thumbnail;

      return img;
    }
  }

  getHTML()
  {
    const item      = document.createElement('div'),
          imgWraper = document.createElement('div'),
          img       = this.getThumbnailImg();

    item.className = 'photo-box photo';
    imgWraper.className = 'image-wrapper';
    imgWraper.appendChild( img );
    item.appendChild( imgWraper );

    item.setAttribute('data-photo-id', this.id );

    return item;
  }
}
