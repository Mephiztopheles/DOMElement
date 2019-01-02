import Component          from "./Component.js";
import AbstractTableModel from "./table/AbstractTableModel.js";

export default class Table<T extends Object> extends Component {

    private readonly header: Component;
    private readonly body: Component;
    private model: AbstractTableModel<T>;

    private rows: Map<T, Component> = new Map();
    private dragging: boolean;

    constructor( model: AbstractTableModel<T>, element?: Element ) {

        super( element || document.createElement( "table" ) );

        if ( this.element.tagName != "TABLE" )
            throw new Error( "Table must be a real table for all features" );

        if ( model == null )
            throw new Error( "Table needs a model to be painted" );

        this.model = model;

        this.header = new Component( document.createElement( "thead" ) );
        this.body   = new Component( document.createElement( "tbody" ) );

        this.header.addClass( "table-header" );
        this.body.addClass( "table-body" );

        this.body.addClass( this.model.getBodyClass() );
        this.header.addClass( this.model.getHeaderClass() );

        this.add( this.header );
        this.add( this.body );
        this.addClass( "table" );

        model.addObserver( this );
    }

    public paint() {

        this.paintHeader();
        this.paintBody();
    }

    dataChanged() {
        this.paintBody();
    }

    structureChanged() {
        this.paintHeader();
    }

    protected handleRowClick( event: MouseEvent, entry: T ) {

        this.model.toggleSelection( event.ctrlKey || this.dragging, entry );
        this.rows.forEach( ( node, item ) => {

            if ( this.model.isSelected( item ) )
                node.addClass( "selected" );
            else
                node.removeClass( "selected" );
        } );
    }

    private paintBody() {

        const count = this.model.getCount();
        const cells = this.model.getCellCount();

        this.rows.forEach( ( value, key ) => {

            if ( this.model.getIndex( key ) == -1 ) {

                if ( this.body.contains( value ) )
                    this.body.remove( value );
                this.rows.delete( key );
            }
        } );

        let itemIndex = 0;
        let rowIndex  = 0;
        for ( rowIndex; rowIndex < count; rowIndex++ ) {

            const entry = this.model.get( rowIndex );

            let row = this.rows.get( entry );

            if ( !this.model.include( rowIndex ) ) {

                if ( row != null && this.body.contains( row ) )
                    this.body.remove( row );

            } else {

                if ( row == null )
                    row = this.createRow( rowIndex, entry );

                this.body.add( row );

                if ( this.model.isDirty( entry ) )
                    this.paintRow( row, rowIndex, cells, itemIndex );
                itemIndex++;
            }
        }
    }

    private createRow( rowIndex: number, entry: T ): Component {

        const row   = this.model.interceptRow( new Component( document.createElement( "tr" ) ), rowIndex, entry );
        const cells = this.model.getCellCount();

        row.addClass( "table-row" );
        row.addClass( this.model.getRowClass( rowIndex ) );
        this.rows.set( entry, row );

        let cellIndex = 0;
        for ( cellIndex; cellIndex < cells; cellIndex++ ) {

            let cell = this.model.interceptCell( new Component( document.createElement( "td" ) ), cellIndex );

            cell.addClass( "table-cell" );
            cell.addClass( this.model.getCellClass( cellIndex ) );
            row.add( cell );
        }
        row.on( "contextmenu", ( event: MouseEvent ) => {
            this.handleRowClick( event, entry );
        } );

        row.on( "click", ( event: MouseEvent ) => {
            this.handleRowClick( event, entry );
        } );

        row.on( "mousedown", () => {
            this.dragging = true;
        } );

        row.on( "mouseup", () => {
            this.dragging = false;
        } );

        row.on( "mouseenter", ( event: MouseEvent ) => {

            if ( this.dragging )
                this.handleRowClick( event, entry );
        } );

        return row;
    }

    private paintRow( row: Component, rowIndex: number, cells: number, index: number ) {

        let cellIndex = 0;
        for ( cellIndex; cellIndex < cells; cellIndex++ )
            row.children[ cellIndex ].html.bind( this.model.getValueAt( rowIndex, cellIndex, index ) );

        if ( this.model.isSelected( rowIndex ) )
            row.addClass( "selected" );
    }

    private paintHeader() {

        Table.clearElement( this.header );

        const cells   = this.model.getCellCount();
        let cellIndex = 0;
        for ( cellIndex; cellIndex < cells; cellIndex++ ) {

            const cell = this.model.interceptHeaderCell( new Component( document.createElement( "th" ) ) );
            cell.addClass( "table-cell" );
            cell.addClass( this.model.getCellClass( cellIndex ) );

            cell.html.value = this.model.getNameAt( cellIndex );
            this.header.add( cell );
        }
    }

    private static clearElement( element: Component ) {

        while ( element.firstChild ) {
            element.remove( element.firstChild );
        }
    }
}