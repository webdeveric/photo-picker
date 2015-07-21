import $ from 'jquery';
import ContentProvider from 'ContentProvider';
import AjaxContentProvider from 'AjaxContentProvider';

class Lightbox
{
  constructor( template, contentProvider, {
    closeOnESC    = true,
    htmlClass     = 'lightbox-open',
    openClass     = 'open',
    closeSelector = '.lightbox-close-action',
    titleSelector = '.lightbox-title',
    extraClass    = ''
  } = {} )
  {
    this.$template = $(template);
    this.setContentProvider( contentProvider );

    this.options = {};
    this.options.closeOnESC = closeOnESC;
    this.options.htmlClass = htmlClass;
    this.options.openClass = openClass;
    this.options.closeSelector = closeSelector;
    this.options.titleSelector = titleSelector;
    this.options.extraClass = extraClass;
  }

  static checkQueue()
  {
    if ( Lightbox.queue.length ) {
      var next = Lightbox.queue.pop();
      setTimeout( function() {
        next.open();
      }, Lightbox.queueDelay || 250 );
    }
  }

  static close()
  {
    if ( Lightbox.current ) {
      Lightbox.current.close();
    }
    return Lightbox;
  }

  trigger( name, parameters )
  {
    $(document.documentElement).trigger( name, parameters );
  }

  setContentProvider( contentProvider = null )
  {
    this.contentProvider = contentProvider instanceof ContentProvider ? contentProvider : new ContentProvider();
  }

  renderContent()
  {
    this.$template.addClass('loading');

    this.contentProvider.unbindEvents();

    const $contentFrame = this.$template.find('.lightbox-content').empty();

    this.contentProvider.getContent().then(
      ( content ) => {
        $contentFrame.append( content );
        this.contentProvider.bindEvents();
        this.$template.removeClass('loading');
        this.trigger('render.lightbox', [ this ] );
      },
      ( error ) => {
        console.error( error );
      }
    );
  }

  option( name, defaultValue = '' )
  {
    return this.options[ name ] !== void 0 ? this.options[ name ] : defaultValue;
  }

  open()
  {
    if ( Lightbox.open ) {

      Lightbox.queue.unshift( this );

    } else {

      this.bindEvents();

      Lightbox.current = this;
      Lightbox.open = true;

      this.addClasses();

      this.setTitle();
      this.renderContent();

      this.trigger('open.lightbox', [ this ] );

    }

    return this;
  }

  addClasses()
  {
    $(document.documentElement).addClass( this.option('htmlClass') );
    this.$template.addClass( this.option('openClass' ) ).addClass( this.option('extraClass') );
    return this;
  }

  toggleClass( className, state )
  {
    this.$template.toggleClass( className, state );
    return this;
  }

  removeClasses()
  {
    $(document.documentElement).removeClass( this.option('htmlClass') );
    this.$template.removeClass( this.option('openClass') ).removeClass( this.option('extraClass') );
    return this;
  }

  setTitle( title )
  {
    title = title || this.option('title', '');
    this.$template.find( this.option('titleSelector') ).text( title );
    return this;
  }

  close( event )
  {
    if ( event ) {
      if ( event.target !== event.currentTarget ) {
        return this;
      }

      if ( ! $(event.currentTarget).data('allow-default') ) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    this.unbindEvents();
    Lightbox.current = null;
    Lightbox.open = false;

    this.removeClasses();

    this.trigger('close.lightbox', [ this ] );

    Lightbox.checkQueue();

    return this;
  }

  checkESC( event )
  {
    if ( event.keyCode === 27 && this.option('closeOnESC', true) ) {
      this.close();
    }
  }

  bindEvents()
  {
    $(document.documentElement).on('keyup.lightbox', $.proxy( this.checkESC, this ) );
    this.$template.on('click.lightbox', this.option('closeSelector'), $.proxy( this.close, this ) );
    return this;
  }

  unbindEvents()
  {
    $(document.documentElement).off('keyup.lightbox');
    this.$template.off('click.lightbox', this.option('closeSelector') );
    return this;
  }
}

Lightbox.open       = false;
Lightbox.current    = null;
Lightbox.queue      = [];
Lightbox.queueDelay = 250;

$.fn.lightbox = function( options )
{
  const settings = $.extend({}, $.fn.lightbox.defaults, options);

  function handleClick( event ) {
    event.preventDefault();
    event.stopPropagation();

    let provider   = null,
        $target    = $(event.currentTarget),
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

export default Lightbox;
