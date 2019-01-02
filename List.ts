import Component     from "./Component.js";
import ArrayProperty from "../../node_modules/@mephiztopheles/properties/properties/ArrayProperty.js";
import DOMElement    from "./DOMElement.js";

export default class List<T extends Object> extends Component {

    public template: DOMElement;
    private readonly map: WeakMap<T, Component> = new WeakMap();
    private readonly list: ArrayProperty<T>     = new ArrayProperty( [] );

    constructor ( element?: Element, attributes: { [ name: string ]: string } = {} ) {
        super( element, attributes );

        this.list.addListener( () => {
            this.compile();
        } );
    }

    setList ( property: ArrayProperty<T> ) {

        this.list.bind( property );
        this.compile();
    }

    setTemplateCompiler ( templateCompiler: TemplateCompiler<T> ) {
        this.templateCompiler = templateCompiler;
    }

    private templateCompiler: TemplateCompiler<T> = () => {
    };

    private compile () {

        if ( this.template == null )
            this.template = this.children[ 0 ].clone();

        this.clear();
        this.list.forEach( item => {

            let element = this.map.get( item );
            if ( element == null ) {

                element = this.template.clone();
                this.templateCompiler( element, item );
                this.map.set( item, element );
            }
            this.add( element );
        } );
    }
}

export interface TemplateCompiler<T> {
    ( component: Component, item: T ): void
}