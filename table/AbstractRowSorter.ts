export abstract class AbstractRowSorter<T> {

    abstract compare( a: T, b: T ): number;
}