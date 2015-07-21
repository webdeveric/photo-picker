import $ from 'jquery';
import ContentProvider from './ContentProvider';

class AjaxContentProvider extends ContentProvider
{
  constructor( url = '', {
    alwaysFetch = false,
    ajaxOptions = {},
    processData = function( data ) {
      return data;
    }
  } = {} )
  {
    super( '', { alwaysFetch, ajaxOptions, processData } );

    this.url = url;
  }

  fetchContent()
  {
    return new Promise( ( resolve, reject ) => {

      $.ajax( this.url, this.options.ajaxOptions ).done( (data, textStatus, jqXHR) => {

        if ( this.options.processData ) {

          this.setContent( this.options.processData( data, textStatus, jqXHR ) );

        } else {

          this.setContent( data );

        }

        resolve( this.content );

      }).fail( ( jqXHR, textStatus, errorThrown ) => {

        reject( new Error( errorThrown ) );

      });

    });
  }

  getContent()
  {
    if ( this.options.alwaysFetch || ! this.content ) {
      return this.fetchContent();
    }

    return super.getContent();
  }
}

export default AjaxContentProvider;
