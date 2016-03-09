import $ from 'jquery';
import Photo from './Photo';
import Album from './Album';
import PhotoProvider from './PhotoProvider';
import getFB from './facebook-sdk';
import { debug } from './util';

export default class FacebookPhotoProvider extends PhotoProvider
{
  constructor( sdkSettings = {}, scopes = [ 'public_profile', 'user_photos' ] )
  {
    super( {
      name: 'facebook',
      url: '/me/photos?type=uploaded&fields=id,images,from',
      albumsurl: '/me/albums?fields=id,name,count,cover_photo{id,images,picture,source},description,type,privacy',
      limit: 100
    } );

    this.sdkSettings = sdkSettings;
    this.sdkSettings.version = 'v2.4';

    this.scopes   = scopes;
    this.rejected = false;
  }

  login()
  {
    const parameters = {
      scope: this.scopes.join(','),
      return_scopes: true,
      display: 'popup'
    };

    if ( this.rejected ) {
      parameters.auth_type = 'rerequest';
    }

    return new Promise( ( resolve, reject ) => {

      getFB( this.sdkSettings ).then(
        FB => {

          FB.login( response => {

            if ( response.authResponse ) {

              if ( response.authResponse.grantedScopes ) {

                const ok = this.scopes.every( scope => {
                  if ( ! response.authResponse.grantedScopes.includes( scope ) ) {
                    reject( new Error( `User did not provide ${scope} access.` ) );
                    return false; // this breaks the loop.
                  }

                  return true;
                });

                if ( ok ) {
                  resolve( response );
                }

              } else {

                reject( new Error( 'User did not provide correct access.' ) );

              }

            } else {

              reject( new Error( 'User cancelled login or did not fully authorize.' ) );

            }
          }, parameters );

        },

        // getFB failed
        reject
      );

    });
  }

  init()
  {
    return new Promise( ( resolve, reject ) => {

      getFB( this.sdkSettings ).then(

        FB => {

          FB.getLoginStatus( response => {

            if ( response.status === 'connected' ) {

              this.api( '/me/permissions', {} ).then( res => {

                res.data.every( d => {
                  if ( d.status !== 'granted' ) {
                    this.rejected = true;
                    return false;
                  }

                  return true;
                });

                return this.rejected;

              }).then( rejected => {

                if ( rejected ) {
                  this.login().then( () => { resolve( this ); }, reject );
                } else {
                  resolve( this );
                }

              });

            } else {

              this.login().then( () => { resolve( this ); }, reject );

            }

          });
        },

        // getFB failed
        reject
      );

    });

  }

  api( url, parameters = {} )
  {
    parameters = $.extend( this.getParameters(), parameters );

    if ( url === void 0 ) {
      return Promise.reject( new Error('FacebookPhotoProvider.api: URL is undefined') );
    }

    return new Promise( ( resolve, reject ) => {

      getFB( this.sdkSettings ).then(

        FB => {

          FB.api(
            url,
            parameters,
            response => {

              if ( response && ! response.error ) {

                resolve( response );

              } else {

                const error = new Error( response.error.message ? response.error.message : 'FB.api failed' );

                reject( error );

              }

            }
          );

        },

        // getFB failed
        reject
      );

    });

  }

  apiGetPhotoURL( photoId )
  {
    return `/${photoId}?fields=id,images,picture,source,from`;
  }

  apiGetAlbumURL( albumId )
  {
    return `/${albumId}?fields=id,name,count,cover_photo{id,images,picture,source},description,type,privacy`;
    // ?fields=id,name,description,type,from,privacy,photos{id,images,from},count
  }

  apiGetAlbumPhotosURL( albumId )
  {
    return `/${albumId}/photos?fields=id,images,from`;
  }

  getNextUrl( results )
  {
    return results.paging && results.paging.next ? results.paging.next : false;
  }

  buildPhoto( data )
  {
    let id = data.id,
        src,
        thumbnail;

    if ( data.images.length > 1 ) {

      src       = data.images.shift().source;
      thumbnail = data.images.pop().source;

    } else {

      src       = data.source;
      thumbnail = data.picture;

    }

    return new Photo({ id, src, thumbnail });
  }

  buildAlbum( data )
  {
    const album = new Album({
      id: data.id,
      name: data.name,
      photosURL: this.apiGetAlbumPhotosURL( data.id )
    });

    if ( typeof data.cover_photo === 'object' && data.cover_photo.id ) {
      let photo = this.buildPhoto( data.cover_photo );
      this.addPhoto( photo );
      album.photo = photo;
      album.coverPhoto = data.cover_photo.id;
    }

    return album;
  }

}
