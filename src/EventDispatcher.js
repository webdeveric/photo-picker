export default class EventDispatcher
{
  constructor()
  {
    this.listeners = Object.create( null );
  }

  parseEvents( events )
  {
    if ( typeof events === 'string' ) {
      events = events.split(/\s+/);
    }

    return events;
  }

  onEvent( eventName, handler )
  {
    if ( ! this.listeners[ eventName ] ) {
      this.listeners[ eventName ] = [];
    }

    let queue = this.listeners[ eventName ];

    if ( queue.indexOf( handler ) === -1 ) {
      queue[ queue.length ] = handler;
    }

    return this;
  }

  offEvent( eventName, handler )
  {
    if ( this.listeners[ eventName ] ) {
      if ( handler === null ) {
        delete this.listeners[ eventName ];
      } else {
        this.listeners[ eventName ].splice( index, 1 );
      }
    }

    return this;
  }

  on( events, handler )
  {
    this.parseEvents( events ).forEach( ( eventName ) => {
      this.onEvent( eventName, handler );
    });

    return this;
  }

  off( eventName, handler = null )
  {
    this.parseEvents( events ).forEach( ( eventName ) => {
      this.offEvent( eventName, handler );
    });

    return this;
  }

  trigger( eventName, data = {} )
  {
    if ( this.listeners[ eventName ] ) {

      let queue = this.listeners[ eventName ];

      let customEvent = new CustomEvent( eventName, {
        detail: {
          dispatcher: this,
          data
        }
      });

      queue.forEach( ( handler ) => {
        if ( typeof handler === 'function' ) {
          handler( customEvent );
        } else if ( typeof handler === 'object' && handler.handleEvent && typeof handler.handleEvent === 'function' ) {
          handler.handleEvent( customEvent );
        }
      });

    }

    return this;
  }
}
