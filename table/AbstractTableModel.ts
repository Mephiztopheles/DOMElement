import StringProperty        from "../../../node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import Component             from "../Component.js";
import { AbstractRowSorter } from "./AbstractRowSorter.js";
import { RowFilter }         from "./RowFilter";

export interface Observer {

    dataChanged();

    structureChanged();
}

const push   = Array.prototype.push;
const sort   = Array.prototype.sort;
const splice = Array.prototype.splice;

export default abstract class AbstractTableModel<T> {

    protected observers: Array<Observer> = [];
    protected rowSorter: AbstractRowSorter<T>;
    protected rowFilter: RowFilter<T>;
    protected items: Array<T>            = [];
    protected selectedItems: Array<T>    = [];
    protected multiSelection: boolean;
    private dirtyRows: Array<T>          = [];
    private dirty: boolean;

    public constructor( items: Array<T>, sorter?: AbstractRowSorter<T>, rowFilter?: RowFilter<T> ) {

        if ( items != null )
            this.setItems( items );

        if ( rowFilter != null )
            this.setRowFilter( rowFilter );

        if ( sorter != null )
            this.setRowSorter( sorter );

        this.setDirty( true );
    }

    sort( compareFn?: ( a: T, b: T ) => number ): this {

        if ( compareFn == null )
            compareFn = this.rowSorter.compare;
        sort.call( this.items, compareFn );

        this.setDirty( true );
        this.dataChanged();
        return this;
    }

    setRowFilter( rowFilter: RowFilter<T> ) {
        this.rowFilter = rowFilter;
    }

    setRowSorter( sorter: AbstractRowSorter<T> ) {

        this.rowSorter = sorter;
        this.sort();
    }

    public include( index: number ): boolean {
        return this.rowFilter != null ? this.rowFilter.include( this.get( index ), index ) : true;
    }

    abstract getValueAt( row: number, cell: number, index: number ): StringProperty

    abstract getNameAt( index: number ): string

    public setDirty( dirty: boolean, ...entries: T[] ) {

        this.dirty = false;

        if ( entries.length == 0 ) {

            this.dirty            = dirty;
            this.dirtyRows.length = 0;
        } else {

            if ( dirty ) {
                this.dirtyRows.push.apply( this.dirtyRows, entries );
            } else {

                entries.forEach( entry => {

                    let start = this.dirtyRows.indexOf( entry );
                    this.dirtyRows.splice( start, 1 );
                } );
            }
        }
    }

    public get( index: number ): T {
        return this.items[ index ];
    }

    public getMultiSelection(): boolean {
        return this.multiSelection;
    }

    public setMultiSelection( value: boolean ) {
        this.multiSelection = value;
    }

    public setSelected( selected: T ) {

        this.selectedItems.length = 0;
        this.selectedItems.push( selected );
    }

    public toggleSelection( dragging: boolean, item: T | number ) {

        if ( typeof item == "number" ) {
            item = this.get( item );
        }

        let index = this.selectedItems.indexOf( item );
        if ( !this.multiSelection || ( this.multiSelection && !dragging ) ) {

            this.selectedItems.length = 0;
            index                     = -1;
        }

        if ( index != -1 )
            this.selectedItems.splice( index, 1 );
        else
            this.selectedItems.push( item );
    }

    public getIndex( entry: T ): number {
        return this.items.indexOf( entry );
    }

    public getCount(): number {
        return this.items.length;
    }

    public isDirty( entry: T ): boolean {
        return this.dirty ? true : this.dirtyRows.indexOf( entry ) != -1;
    }

    public abstract getCellCount(): number;

    public add( ...elements: T[] ): number {
        return this.addAll( elements );
    }

    public clear() {

        this.items.length = 0;
        this.setDirty( true );
        this.dataChanged();
    }

    public addAll( elements: Array<T> ): number {

        const length = push.apply( this.items, elements );

        let args = [ true ];
        args.push.apply( args, elements );
        this.setDirty.apply( this, args );

        this.dataChanged();

        return length;
    }

    public remove( element: T ): number {

        let index = this.items.indexOf( element );
        if ( index != -1 )
            this.items.splice( index, 1 );

        return this.items.length;
    }

    public splice( start: number, deleteCount?: number ): T[] {

        const elements = splice.call( this.items, start, deleteCount );

        for ( start; start < this.items.length; start++ )
            this.setDirty.call( this, true, this.items[ start ] );

        elements.forEach( item => {

            let index = this.selectedItems.indexOf( item );
            if ( index != -1 )
                this.selectedItems.splice( index, 1 );
        } );

        this.dataChanged();

        return elements;
    }

    public addObserver( observer: Observer ) {

        observer.structureChanged();
        observer.dataChanged();
        this.observers.push( observer );
    }

    public removeObserver( observer: Observer ) {

        const index = this.observers.indexOf( observer );
        this.observers.splice( index, 1 );
    }

    public isSelected( item: T | number ) {

        if ( typeof item == "number" )
            item = this.get( item );

        return this.selectedItems.indexOf( item ) != -1;
    }

    abstract getCellClass( cellIndex: number ): string

    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    public interceptCell( component: Component, index: number ): Component {
        return component;
    }

    // noinspection JSMethodCanBeStatic
    public getHeaderClass(): string {
        return "";
    };

    // noinspection JSMethodCanBeStatic
    public getBodyClass() {
        return "";
    }

    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    public interceptRow( component: Component, index: number, entry: T ): Component {
        return component;
    }

    // noinspection JSMethodCanBeStatic
    public getRowClass( rowIndex: number ): string {
        return "";
    }

    // noinspection JSMethodCanBeStatic
    public interceptHeaderCell( component: Component ): Component {
        return component;
    }

    protected addSelectedItem( item: T ) {

        if ( this.selectedItems.indexOf( item ) == -1 )
            this.selectedItems.push( item );
    }

    protected removeSelectedItem( item: T ) {

        let index = this.selectedItems.indexOf( item );
        if ( index != -1 )
            this.selectedItems.splice( index, 1 );
    }

    protected dataChanged() {

        this.observers.forEach( it => {
            it.dataChanged();
        } );

        this.setDirty( false );
    }

    protected structureChanged() {

        this.observers.forEach( it => {

            it.structureChanged();
            it.dataChanged();
        } );
    }

    private setItems( items: Array<T> ) {
        push.apply( this.items, items );
    }
}