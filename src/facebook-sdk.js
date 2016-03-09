import $ from 'jquery';

var loadingSDK = false,
    resolvers = [],
    rejecters = [];

function resetVars()
{
  loadingSDK = false;
  resolvers = [];
  rejecters = [];
}

function resolveSDK( sdk )
{
  resolvers.forEach( resolve => { resolve( sdk ); } );
  resetVars();
}

function rejectSDK( error )
{
  rejecters.forEach( reject => { reject( error ); } );
  resetVars();
}

function loadSDK( options = {} )
{
  if ( loadingSDK ) {
    return;
  }

  loadingSDK = true;

  if ( window.FB ) {

    resolveSDK( window.FB );

  } else {

    $.ajaxSetup({ cache: true });

    $.getScript('//connect.facebook.net/en_US/sdk.js').done( () => {

      if ( Object.keys( options ).length ) {
        window.FB.init( options );
      }

      resolveSDK( window.FB );

    }).fail( ( jqxhr, settings, error ) => {

      rejectSDK( new Error( error ) );

    });

  }

}

export default function getFB( { appId = '', version = 'v2.4' } = {} )
{
  return new Promise( ( resolve, reject ) => {
    resolvers.push( resolve );
    rejecters.push( reject );
    loadSDK( { appId, version } );
  });
}
