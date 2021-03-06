import StringProperty           from "node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import Component                from "./Component.js";
import { Style }                from "./helper/Style.js";
import Controller               from "./helper/Controller.js";
import ASTCompiler              from "node_modules/@mephiztopheles/astcompiler/ASTCompiler.js";
import BooleanProperty          from "node_modules/@mephiztopheles/properties/properties/BooleanProperty.js";
import { eventTypesInData }     from "./helper/eventTypes.js";
import { getCached, setCached } from "./helper/cache.js";


let errorHandler = ( exception ) => {
    console.error( "Error while handling event", exception );
};

function getClass ( elem ) {
    return elem.getAttribute && elem.getAttribute( "class" ) || "";
}

function stripAndCollapse ( value ) {
    return ( value.match( rnothtmlwhite ) || [] ).join( " " );
}

function classesToArray ( value ) {

    if ( Array.isArray( value ) )
        return value;

    if ( typeof value === "string" )
        return value.match( rnothtmlwhite ) || [];

    return [];
}

const nodeMap = new WeakMap();

const rnothtmlwhite  = ( /[^\x20\t\r\n\f]+/g ),
      rtypenamespace = /^([^.]*)(?:\.(.+)|)/;

export interface Attributes {
    [ name: string ]: string
}

interface EventHandle {
    listener: ( this: Element, ev: Event ) => any;
    namespaces: string[];
    type: string;
}

export default abstract class DOMElement {

    public readonly text: StringProperty                 = new StringProperty();
    public readonly html: StringProperty                 = new StringProperty();
    protected listeners: Map<string, Array<EventHandle>> = new Map();
    protected controller: Controller;
    public disabled: BooleanProperty                     = new BooleanProperty( false );

    public static registerErrorHandler ( handler: ( exception: Error ) => void ) {

        if ( handler == null )
            throw new Error( "'handler' cannot be null!" );

        errorHandler = handler;
    }

    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor ( public readonly element?: Element, attributes: Attributes = {} ) {

        if ( this.element == null )
            this.element = document.createElement( "div" );

        for ( let attribute in attributes )
            this.attr( attribute, attributes[ attribute ] );

        let xElement = nodeMap.get( this.element );
        if ( xElement == null )
            nodeMap.set( this.element, this );

        if ( this.element instanceof HTMLElement ) {

            const htmlElement = <HTMLElement>this.element;
            this.text.value   = htmlElement.innerText;
            this.text.addListener( observable => {
                htmlElement.innerText = observable.value;
            } );
        }

        this.html.value = this.element.innerHTML;
        this.html.addListener( observable => {
            this.element.innerHTML = observable.value;
        } );


        let applyProp = ( value ) => {
            if ( value )
                this.attr( "disabled", "disabled" );
            else
                this.removeAttr( "disabled" );
        };
        this.disabled.addListener( applyProp );
    }

    get parent () {

        if ( this.element.parentElement == null )
            return null;

        return DOMElement.wrap( this.element.parentElement );
    }

    protected static wrap ( element: Element ): Component {

        let xElement = nodeMap.get( element );
        if ( xElement != null )
            return xElement;

        xElement = new Component( element );
        nodeMap.set( element, xElement );

        return xElement;
    }

    bindToController ( controller ) {

        this.controller = controller;

        this.off( ".DOM" );


        eventTypesInData.forEach( entry => {

            const data = this.data( entry.name );
            if ( data ) {

                this.on( `${entry.name}.DOM`, event => {

                    if ( entry.listenDisabled && this.disabled.value ) {

                        event.preventDefault();
                        return;
                    }

                    try {

                        return this._parse( data, { event } );

                    } catch ( exception ) {
                        errorHandler( exception );
                    }
                } );
            }
        } );

        const disabled = this.data( "disabled" );
        if ( disabled ) {

            let property = <BooleanProperty>this._parse( disabled );
            if ( property != null )
                this.disabled.bind( property );
        }
    }

    clone () {
        return new ( <any>this.constructor )( this.element.cloneNode( true ) );
    }

    data ( name: string, value?: any ) {

        if ( arguments.length == 1 )
            return getCached( this.element, name );
        else
            setCached( this.element, name, value );
    }

    hasClass ( clazz: string ): boolean {
        return this.element.classList.contains( clazz );
    }

    css ( name: string, value?: any ): any | void {

        let styles, len,
            map = {},
            i   = 0;

        if ( Array.isArray( name ) ) {

            styles = Style.getStyles( this.element );
            len    = name.length;

            for ( ; i < len; i++ ) {
                map[ name[ i ] ] = Style.css( this.element, name[ i ], false, styles );
            }

            return map;
        }

        return value !== undefined ?
            Style.style( this.element, name, value ) :
            Style.css( this.element, name );
    }

    addClass ( className: string ) {

        if ( className != "" && className != null )
            className.split( " " ).forEach( it => this.element.classList.add( it ) );
    }

    removeClass ( className: string | Function ) {

        if ( typeof className == "function" ) {

            this.removeClass( className.call( this, 0, getClass( this.element ) ) );
            return;
        }

        let finalValue, curValue;

        const classes = classesToArray( className );

        if ( classes.length != 0 ) {

            curValue = getClass( this.element );

            let cur = this.element.nodeType === 1 && ( " " + stripAndCollapse( curValue ) + " " );

            if ( cur ) {

                let clazz;
                let j = 0;

                // noinspection JSAssignmentUsedAsCondition
                while ( clazz = classes[ j++ ] )
                    while ( cur.indexOf( " " + clazz + " " ) > -1 )
                        cur = cur.replace( " " + clazz + " ", " " );

                finalValue = stripAndCollapse( cur );
                if ( curValue !== finalValue )
                    this.element.setAttribute( "class", finalValue );
            }
        }
    }

    toggleClass ( className: string ) {

        if ( this.hasClass( className ) )
            this.removeClass( className );
        else
            this.addClass( className );
    }

    on ( type: string, listener: ( this: Element | MouseEvent | KeyboardEvent, ev: Event ) => any, options?: boolean | AddEventListenerOptions ) {

        const types = ( type || "" ).match( rnothtmlwhite ) || [ "" ];
        types.forEach( type => {

            const tmp = rtypenamespace.exec( type ) || [];

            type             = tmp[ 1 ];
            const namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();


            let listeners = this.listeners.get( type );

            if ( listeners == null )
                this.listeners.set( type, listeners = [] );

            listeners.push( {
                namespaces,
                type,
                listener
            } );

            this.element.addEventListener( type, listener, options );
        } );
    }

    off ( type: string ) {


        const types = ( type || "" ).match( rnothtmlwhite ) || [ "" ];
        types.forEach( type => {

            const tmp = rtypenamespace.exec( type ) || [];

            type             = tmp[ 1 ];
            const namespaces = ( tmp[ 2 ] || "" ).split( "." ).sort();

            // Unbind all events (on this namespace, if provided) for the element
            if ( !type ) {

                this.listeners.forEach( ( list, key ) => {

                    list.forEach( entry => {

                        if ( entry.namespaces.toString() == namespaces.toString() )
                            this.element.removeEventListener( key, entry.listener );
                    } )
                } );
                return;
            }

            const listenersForType = this.listeners.get( type );

            if ( listenersForType == null )
                return;

            listenersForType.forEach( ( handle, index ) => {
                if ( handle.namespaces.toString() == namespaces.toString() ) {

                    listenersForType.splice( index, 1 );
                    this.element.removeEventListener( handle.type, handle.listener );
                }
            } );
        } );
    }

    trigger ( type: string ) {
        this.element.dispatchEvent( new Event( type ) );
    }

    attr ( attribute: string, value: string ): string {

        if ( value == null )
            return this.element.getAttribute( attribute );

        this.element.setAttribute( attribute, value );
        return value;
    }

    removeAttr ( attribute: string ) {
        this.element.removeAttribute( attribute );
    }

    private _parse ( expression, local = {} ) {

        return new Function( "", new ASTCompiler( expression ).compile().generate() )()( this.controller, Object.assign( {
            $static: this.controller.constructor
        }, local ) );
    }
}