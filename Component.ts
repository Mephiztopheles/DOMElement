import DOMElement from "./DOMElement.js";

export default class Component extends DOMElement {

    public readonly children: Array<DOMElement> = [];

    constructor ( element?: Element, attributes: { [ name: string ]: string } = {} ) {

        super( element, attributes );

        for ( let i = 0; i < this.element.children.length; i++ )
            this.children.push( DOMElement.wrap( this.element.children[ i ] ) );
    }

    get firstChild () {
        return this.children[ 0 ];
    }

    add<T extends DOMElement> ( child: T ) {

        this.children.push( child );
        this.element.appendChild( child.element );
    }

    contains<T extends DOMElement> ( child: T ): boolean {
        return this.element.contains( child.element );
    }

    remove<T extends DOMElement> ( oldChild?: T ) {

        if ( arguments.length === 0 ) {

            if ( this.element.parentElement != null && this.element.parentElement.contains( this.element ) )
                this.element.parentElement.removeChild( this.element );

        } else {

            if ( this.element.contains( oldChild.element ) ) {

                this.element.removeChild( oldChild.element );
                let index = this.children.indexOf( oldChild );
                if ( index != -1 )
                    this.children.splice( index, 1 );
            }
        }
    }

    setAttribute ( qualifiedName: string, value: string ): void {
        this.element.setAttribute( qualifiedName, value );
    }

    replaceChild<T extends Component> ( newChild: T, oldChild: T ) {
        this.element.replaceChild( newChild.element, oldChild.element );
    }

    find ( filter: ( component: Component ) => boolean, deep: boolean | number ) {

        let results = [];

        if ( filter( this ) )
            results.push( this );

        if ( deep == false || deep == 0 )
            return results;

        ( <number>deep )--;

        this.children.forEach( child => {

            if ( child instanceof Component )
                results = results.concat( child.find( filter, deep ) );
        } );

        return results;
    }

    clear () {

        while ( this.firstChild )
            this.remove( this.firstChild );
    }
}