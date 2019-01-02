import Component from "../Component.js";

export default abstract class AbstractTableRenderer<T> {

    abstract getCellClass( cellIndex: number ): string

    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptCell( component: Component, index: number ): Component {
        return component;
    }

    // noinspection JSMethodCanBeStatic
    getHeaderClass(): string {
        return "";
    };

    // noinspection JSMethodCanBeStatic
    getBodyClass() {
        return "";
    }

    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptRow( component: Component, index: number, entry: T ): Component {
        return component;
    }

    // noinspection JSMethodCanBeStatic
    getRowClass( rowIndex: number ): string {
        return "";
    }

    // noinspection JSMethodCanBeStatic
    interceptHeaderCell( component: Component ): Component {
        return component;
    }
}