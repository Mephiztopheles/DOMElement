export default class AbstractTableRenderer {
    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptCell(component, index) {
        return component;
    }
    // noinspection JSMethodCanBeStatic
    getHeaderClass() {
        return "";
    }
    ;
    // noinspection JSMethodCanBeStatic
    getBodyClass() {
        return "";
    }
    // noinspection JSMethodCanBeStatic, JSUnusedLocalSymbols
    interceptRow(component, index, entry) {
        return component;
    }
    // noinspection JSMethodCanBeStatic
    getRowClass(rowIndex) {
        return "";
    }
    // noinspection JSMethodCanBeStatic
    interceptHeaderCell(component) {
        return component;
    }
}
//# sourceMappingURL=AbstractTableRenderer.js.map