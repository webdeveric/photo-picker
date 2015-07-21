import $ from 'jquery';
import Photo from './Photo';
import PhotoProvider from './PhotoProvider';
import Popup from 'popup-window';

class InstagramPhotoProvider extends PhotoProvider
{
  constructor( clientID, redirectURI )
  {
    super( 'https://api.instagram.com/v1/users/self/media/recent', null );

    this.name        = 'instagram';
    this.clientID    = clientID;
    this.redirectURI = redirectURI;
    this.accessToken = null;

    this.authorizeURL = `https://api.instagram.com/oauth/authorize/?response_type=token&client_id=${this.clientID}&redirect_uri=${this.redirectURI}`;
  }

  init()
  {
    return new Promise( (resolve, reject) => {

      if ( this.accessToken !== null ) {

        // console.info('Instagram access token already set');
        resolve( this );

      } else {

        // console.info('Trying to get access token from Instagram');

        if ( ! this.clientID || ! this.redirectURI ) {

          reject( new Error('Please provide clientID and redirectURI') );

        } else {

          const closedOrBlocked = () => {
            window.receiveInstagramToken = null;
            if ( this.accessToken !== null ) {
              resolve( this );
            } else {
              reject( new Error('Authorization window was blocked or closed') );
            }
          };

          new Popup(
            this.authorizeURL,
            {
              name: 'instagram',
              width: 650,
              height: 480
            }
          ).opened( () => {

            window.receiveInstagramToken = ( token ) => {
              this.setAccessToken( token );
              window.receiveInstagramToken = null;
              resolve( this );
            };

          }).closed( closedOrBlocked ).blocked( closedOrBlocked ).open();

        }
      }
    });
  }

  getParameters()
  {
    return {
      count: this.limit,
      access_token: this.accessToken
    };
  }

  setAccessToken( token )
  {
    this.accessToken = token;
    return this;
  }

  api( url, parameters = {} )
  {
    parameters = $.extend( this.getParameters(), parameters );

    return new Promise( ( resolve, reject ) => {

      $.ajax({
        url,
        data: parameters,
        dataType: 'jsonp'
      }).then( ( response ) => {

        if ( response.meta.code && (response.meta.code | 0) === 200 ) {
          resolve( response );
        } else {

          if ( response.meta.error_message ) {

            reject( new Error( response.meta.error_message ) );

          } else {

            reject( new Error( `Instagram error ${response.meta.code}` ) );

          }
        }

      });

    });
  }

  apiGetPhotoURL( photoId )
  {
    return `/media/${photoId}`;
  }

  apiGetAlbumURL()
  {
    return false;
  }

  getNextUrl( results )
  {
    return results.pagination && results.pagination.next_url ? results.pagination.next_url : false;
  }

  buildPhoto( data )
  {
    const photo = new Photo(
      data.id,
      data.images.standard_resolution.url.replace('http://', '//'),
      data.images.thumbnail.url.replace('http://', '//'),
      data.likes.count,
      data.tags
    );

    if ( data.caption && data.caption.text ) {
      photo.setDescription( data.caption.text );
    }

    return photo;
  }

}

export default InstagramPhotoProvider;
