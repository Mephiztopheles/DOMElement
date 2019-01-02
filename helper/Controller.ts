import Component      from "../Component.js";
import Exception      from "../../C/System/Exception.js";
import DOMElement     from "../DOMElement.js";
import InternalWindow from "../../C/System/InternalWindow/InternalWindow.js";
import Property       from "../../../node_modules/@mephiztopheles/properties/Property.js";


export default abstract class Controller {

    readonly [ key: string ]: Component | Property<any> | any;

    private bound: boolean = false;

    constructor ( public readonly window?: InternalWindow ) {

    }

    bind ( element: Component ) {

        if ( this.bound )
            throw new Exception( `Controller ${this.constructor.name} already bound` );

        bind( this, element );

        this.bound = true;
    }
}

function bind ( controller: Controller, element: DOMElement ) {

    const id = element.data( "id" );
    element.bindToController( controller );

    if ( id ) {
        // @ts-ignore -> this is the only one which is allowed
        controller[ id ] = element;
    }

    if ( element instanceof Component ) {

        element.children.forEach( child => {
            bind( controller, child );
        } );
    }
}
