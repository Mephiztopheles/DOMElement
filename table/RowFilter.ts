export interface RowFilter<T> {
    include( entry: T, index: number ): boolean
}

export class AndFilter<T> implements RowFilter<T> {

    private filters: Array<RowFilter<T>> = [];

    include( entry: T, index: number ): boolean {

        let i = 0;
        for ( i; i < this.filters.length; i++ )
            if ( !this.filters[ i ].include( entry, index ) )
                return false;

        return true;
    }

    addFilter( filter: RowFilter<T> ) {
        this.filters.push( filter );
    }

    removeFilter( filter: RowFilter<T> ) {
        let index = this.filters.indexOf( filter );

        if ( index != -1 )
            this.filters.splice( index, 1 );
    }

}

export class OrFilter<T> implements RowFilter<T> {

    private filters: Array<RowFilter<T>> = [];

    include( entry: T, index: number ): boolean {

        let i = 0;
        for ( i; i < this.filters.length; i++ )
            if ( this.filters[ i ].include( entry, index ) )
                return true;

        return false;
    }

    addFilter( filter: RowFilter<T> ) {
        this.filters.push( filter );
    }

    removeFilter( filter: RowFilter<T> ) {
        let index = this.filters.indexOf( filter );

        if ( index != -1 )
            this.filters.splice( index, 1 );
    }
}