import 'babel-polyfill';
import $ from 'jquery';
import '../src/lightbox-jquery';
import { debug } from '../src/util';
import PhotoPicker from '../src/PhotoPicker';
import FacebookPhotoProvider from '../src/FacebookPhotoProvider';
import InstagramPhotoProvider from '../src/InstagramPhotoProvider';

let facebookAppIDs = {
  'photopicker.dev': '741643222570603',
  'photopicker.webdeveric.com': '744567285611530'
};

let instagramClient = {
  'photopicker.dev': {
    id: 'e63a8cb495e94cdebf6c7c16b1b55e20',
    url: 'http://photopicker.dev/callback.html'
  },
  'photopicker.webdeveric.com': {
    id: 'e63a8cb495e94cdebf6c7c16b1b55e20',
    url: 'https://photopicker.webdeveric.com/callback.html'
  }
};

function handlePhotoSelection( e )
{
  if ( e.detail.data.photo ) {
    const img = new Image();

    img.onload = () => {
      $('#preview').empty().append( img );
    }

    img.src = e.detail.data.photo.getSrc();
  }
}

function handlePhotoError( e )
{
  console.error( e );
}

$(function() {

  $('.no-js').removeClass('no-js').addClass('js');

  // Lightbox demo
  $('#lightbox-demo').lightbox( '.default-lightbox', {
    descendantSelector: '.item'
  });

  let facebookPhotoProvider = new FacebookPhotoProvider({
    appId: facebookAppIDs[ window.location.host ],
    status: true,
    xfbml: false
  });

  let instagramPhotoProvider = new InstagramPhotoProvider(
    instagramClient[ window.location.host ].id,
    instagramClient[ window.location.host ].url
  );

  let facebookPicker = new PhotoPicker(
    '#photo-picker',
    facebookPhotoProvider,
    {
      lightbox: {
        title: 'Facebook Photos',
        extraClass: 'facebook-picker-lightbox',
        titleSelector: '.lightbox-title-text'
      }
    }
  );

  let instagramPicker = new PhotoPicker(
    '#photo-picker',
    instagramPhotoProvider,
    {
      lightbox: {
        title: 'Instagram Photos',
        extraClass: 'instagram-picker-lightbox',
        titleSelector: '.lightbox-title-text'
      }
    }
  );

  facebookPicker.on('selected.photopicker', handlePhotoSelection ).on('error.photopicker', handlePhotoError );
  instagramPicker.on('selected.photopicker', handlePhotoSelection ).on('error.photopicker', handlePhotoError );

  $('#facebook-picker-button').on('click', facebookPicker.open.bind( facebookPicker ) );
  $('#instagram-picker-button').on('click', instagramPicker.open.bind( instagramPicker ) );

});
