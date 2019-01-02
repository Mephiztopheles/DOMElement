import StringProperty from "../../node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import Property       from "../../node_modules/@mephiztopheles/properties/Property.js";
import DOMElement     from "./DOMElement.js";

export default class Button extends DOMElement {

    public readonly element: HTMLButtonElement;
    public readonly type: StringProperty = new StringProperty( ( <HTMLButtonElement>this.element ).type );
    public readonly text: StringProperty = new StringProperty( ( <HTMLButtonElement>this.element ).innerText );

    constructor( element?: Element, text?: string ) {

        super( element || document.createElement( "button" ) );

        this.type.addListener( ( observable: Property<string>, newValue: string ) => {
            this.element.type = newValue;
        } );
        this.text.addListener( ( observable: Property<string>, newValue: string ) => {
            this.element.innerText = newValue;
        } );

        if ( text != null )
            this.text.value = text;
    }
}