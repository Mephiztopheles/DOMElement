import StringProperty from "../../node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import Component      from "./Component.js";
import { Attributes } from "./DOMElement.js";
import Input          from "./Input.js";

export default class SearchList extends Component {

    private readonly searchMap       = new Map<StringProperty, Component>();
    private readonly body: Component = new Component();
    private readonly input: Input    = new Input( null, { autofocus: "true" } );

    constructor ( element?, attributes?: Attributes ) {

        super( element, attributes );

        this.add( this.body );
        this.add( this.input );
        this.addClass( "search-list" );
        this.body.addClass( "body" );
        this.input.value.addListener( () => {
            this.search();
        } );
    }

    addToList ( name: StringProperty, element: Component ) {
        this.searchMap.set( name, element );
    }

    search () {

        this.body.clear();

        const regex = new RegExp( `.*${this.input.value.value}.*`, "i" );

        this.searchMap.forEach( ( element: Component, name: StringProperty ) => {
            if ( name.value.match( regex ) )
                this.body.add( element );
        } );
    }

    focusInput () {
        this.input.focus();
    }
}