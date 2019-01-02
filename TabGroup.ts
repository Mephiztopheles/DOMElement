import Component  from "./Component.js";
import Controller from "./helper/Controller.js";

export default class TabGroup extends Component {

    public readonly headerController: Controller = new TabGroupController;
    public readonly bodyController: Controller   = new TabGroupController;
    private readonly header: Component;
    private readonly body: Component;
    private readonly tabs: Tab[];
    private readonly loaded: string[];

    constructor ( element: Element, ...tabs: Tab[] ) {

        super( element );
        this.tabs   = tabs;
        this.loaded = [];

        this.header = <Component>this.children[ 0 ];
        this.headerController.bind( this.header );

        this.body = <Component>this.children[ 1 ];
        this.bodyController.bind( this.body );

        this.activate( this.body.children[ 0 ].data( "name" ) );

        this.header.on( "click", event => {

            if ( event.target === this.header.element )
                return;

            this.activate( ( <HTMLElement>event.target ).getAttribute( "data-name" ) );
        } );

        tabs.forEach( tab => {
            tab.initialized( this );
        } );

    }

    activate ( name: string ) {

        let target = this.header.children.filter( value => {

            value.removeClass( "active" );
            return value.data( "name" ) === name;
        } )[ 0 ];

        if ( target == null )
            return;

        this.body.children.forEach( child => {
            child.css( "display", "none" );
        } );

        const tab = this.body.children.filter( value => value.data( "name" ) === target.data( "name" ) )[ 0 ];

        if ( tab == null )
            return;

        target.addClass( "active" );
        tab.css( "display", "" );
        this.tabs.forEach( it => {

            if ( it.name === name ) {

                if ( this.loaded.indexOf( name ) == -1 ) {

                    this.loaded.push( name );
                    it.load( this, <Component>tab );
                }

                it.activated( this, <Component>tab );
            }
        } );
    }
}

class TabGroupController extends Controller {

}

export abstract class Tab {

    readonly name: string;

    initialized ( tabGroup: TabGroup ): void {

    };

    activated ( tabGroup: TabGroup, component: Component ): void {

    };

    abstract load ( tabGroup: TabGroup, component: Component ): void;
}