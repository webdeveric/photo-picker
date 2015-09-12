import $ from 'jquery';
import AjaxContentProvider from './AjaxContentProvider';
import ContentProvider from './ContentProvider';
import Lightbox from './Lightbox';

$.fn.lightbox = function( options )
{
  const settings = $.extend({}, $.fn.lightbox.defaults, options);

  function handleClick( event ) {
    event.preventDefault();
    event.stopPropagation();

    let provider   = null,
        $target    = $(event.target),
        href       = $target.data('lightbox-href') || $target.attr('href') || false,
        content    = $target.data('lightbox-content') || false,
        template   = $target.data('lightbox-template') || false,
        title      = $target.data('lightbox-title') || '',
        extraClass = $target.data('lightbox-class') || '';

    switch ( true ) {
      case href !== false:
        provider = new AjaxContentProvider( href, settings.provider );
        break;
      case content !== false:
        provider = new ContentProvider( content );
        break;
      case template !== false:
        // TODO: Make this class.
        // provider = new TemplateProvider( template );
        break;
    }

    const lightbox = new Lightbox(
      settings.template,
      provider,
      {
        title: title,
        extraClass: extraClass
      }
    );

    lightbox.open();
  }

  this.on('click', settings.descendantSelector, handleClick).addClass('js-lightbox');

  return this;
};

$.fn.lightbox.defaults = {
  template: '.default-lightbox',
  descendantSelector: null,
  provider: {
    ajaxOptions: {},
    processData: function( data, textStatus, jqXHR ) {
      const ct = jqXHR.getResponseHeader('content-type') || '';

      if (ct.indexOf('json') > -1) {
        return data.content;
      }

      return data;
    }
  }
};
