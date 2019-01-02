const rbrace     = /^(?:{[\w\W]*}|\[[\w\W]*])$/,
      rmultiDash = /[A-Z]/g,
      cache      = new WeakMap();

export function getCached ( element: Element, name: string ) {

    let cached = cache.get( element );

    if ( cached == null )
        cache.set( element, cached = {} );

    let data = cached[ name ];
    if ( data === undefined )
        data = dataAttr( element, name );

    return data;
}

export function setCached ( element: Element, name: string, value: any ) {

    let cached = cache.get( element );

    if ( cached == null )
        cache.set( element, cached = {} );

    cached[ name ] = value;
}

export function getData ( data ) {

    if ( data === "true" )
        return true;

    if ( data === "false" )
        return false;

    if ( data === "null" )
        return null;

    // Only convert to a number if it doesn't change the string
    if ( data === +data + "" )
        return +data;

    if ( rbrace.test( data ) )
        return JSON.parse( data );

    return data;
}

export function dataAttr ( elem: Element, key: string ) {

    let name;

    // If nothing was found internally, try to fetch any
    // data from the HTML5 data-* attribute

    name     = "data-" + key.replace( rmultiDash, "-$&" ).toLowerCase();
    let data = elem.getAttribute( name );

    if ( typeof data === "string" ) {

        try {

            data = getData( data );

        } catch ( e ) {

        }

    } else {

        data = undefined;

    }

    return data;
}