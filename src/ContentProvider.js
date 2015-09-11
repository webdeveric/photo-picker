import EventDispatcher from './EventDispatcher';

class ContentProvider extends EventDispatcher
{
  constructor( content = '', options = {} )
  {
    super();

    this.content = content;
    this.options = options;
  }

  bindEvents()
  {
    return this;
  }

  unbindEvents()
  {
    return this;
  }

  getContent()
  {
    return Promise.resolve( this.content );
  }

  setContent( content )
  {
    this.content = content;
    return this;
  }
}

export default ContentProvider;
