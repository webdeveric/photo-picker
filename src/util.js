export function createObject( proto )
{
  if ( Object.create !== void 0 ) {
    return Object.create( proto );
  }

  function Obj() {}
  Obj.prototype = proto;
  return new Obj();
}

// export function extendClass( Class, ParentClass )
// {
//   Class.prototype = createObject( ParentClass.prototype );
//   Class.prototype.constructor = Class;
//   return Class;
// }

export function objectToArray( obj, callback )
{
  const data = [];

  for ( let i in obj ) {
    if ( obj.hasOwnProperty( i ) ) {
      data[ data.length ] = typeof callback === 'function' ? callback( obj[ i ] ) : obj[ i ];
    }
  }

  return data;
}

export function throwIt( error )
{
  throw error;
}

export const debug = {

  enabled: true,
  useGroup: false,

  console: ( type = 'log', ...args ) => {

    const console = window.console;

    if ( ! console ) {
      return;
    }

    if ( debug.enabled && console[ type ] ) {

      if ( debug.useGroup && console.group ) {
        console.group();
      }

      args.forEach( ( arg ) => console[ type ]( arg ) );

      if ( debug.useGroup && console.groupEnd ) {
        console.groupEnd();
      }

    }
  },

  log: ( ...args ) => {
    debug.console( 'log', ...args );

  },

  info: ( ...args ) => {
    debug.console( 'info', ...args );
  },

  warn: ( ...args ) => {
    debug.console( 'warn', ...args );
  },

  error: ( ...args ) => {
    debug.console( 'error', ...args );
  }
};
