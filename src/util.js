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

export const log = window.console.log.bind( window.console );

export const info = window.console.info.bind( window.console );

export const warn = window.console.warn.bind( window.console );

export const error = window.console.error.bind( window.console );
