import StringProperty             from "node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import Property                   from "node_modules/@mephiztopheles/properties/Property.js";
import DOMElement, { Attributes } from "./DOMElement.js";

export default class Input extends DOMElement {

    public readonly element: HTMLInputElement;
    public readonly value: StringProperty = new StringProperty( ( <HTMLInputElement>this.element ).value );
    public readonly type: StringProperty  = new StringProperty( ( <HTMLButtonElement>this.element ).type );
    public readonly name: StringProperty  = new StringProperty( ( <HTMLButtonElement>this.element ).name );

    constructor( element?: Element, attributes?: Attributes ) {

        super( element || document.createElement( "input" ), attributes );

        this.value.addListener( ( observable: Property<string>, newValue: string ) => {

            if ( newValue === this.element.value )
                return;

            let value = newValue || "";
            if ( this.element.value == value )
                return;

            this.element.value = value;
            this.element.dispatchEvent( new Event( "input" ) );
        } );
        this.type.addListener( ( observable: Property<string>, newValue: string ) => {
            this.element.type = newValue;
        } );
        this.name.addListener( ( observable: Property<string>, newValue: string ) => {
            this.element.name = newValue;
        } );

        this.element.addEventListener( "input", () => {
            this.value.value = this.element.value;
        } );
        this.element.addEventListener( "change", () => {
            this.value.value = this.element.value;
        } );
    }

    focus( options?: FocusOptions ) {
        this.element.focus( options );
    }
}