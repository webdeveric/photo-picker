import $ from 'jquery';
import ContentProvider from './ContentProvider';
import AjaxContentProvider from './AjaxContentProvider';
import EventDispatcher from './EventDispatcher';

export default class Lightbox extends EventDispatcher
{
  constructor( template, contentProvider, {
    closeOnESC    = true,
    htmlClass     = 'lightbox-open',
    openClass     = 'open',
    closeSelector = '.lightbox-close-action',
    titleSelector = '.lightbox-title',
    extraClass    = '',
    title         = '',
  } = {} )
  {
    super();

    this.$template = $(template);
    this.setContentProvider( contentProvider );

    this.options = {};
    this.options.closeOnESC = closeOnESC;
    this.options.htmlClass = htmlClass;
    this.options.openClass = openClass;
    this.options.closeSelector = closeSelector;
    this.options.titleSelector = titleSelector;
    this.options.extraClass = extraClass;
    this.options.title = title;
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
      content => {
        $contentFrame.append( content );
        this.contentProvider.bindEvents();
        this.$template.removeClass('loading');
        this.trigger('render.lightbox');
      },
      error => {
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

      this.trigger('open.lightbox');

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

    this.trigger('close.lightbox');

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
