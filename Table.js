import Component from "./Component.js";
export default class Table extends Component {
    constructor(model, element) {
        super(element || document.createElement("table"));
        this.rows = new Map();
        if (this.element.tagName != "TABLE")
            throw new Error("Table must be a real table for all features");
        if (model == null)
            throw new Error("Table needs a model to be painted");
        this.model = model;
        this.header = new Component(document.createElement("thead"));
        this.body = new Component(document.createElement("tbody"));
        this.header.addClass("table-header");
        this.body.addClass("table-body");
        this.body.addClass(this.model.getBodyClass());
        this.header.addClass(this.model.getHeaderClass());
        this.add(this.header);
        this.add(this.body);
        this.addClass("table");
        model.addObserver(this);
    }
    paint() {
        this.paintHeader();
        this.paintBody();
    }
    dataChanged() {
        this.paintBody();
    }
    structureChanged() {
        this.paintHeader();
    }
    handleRowClick(event, entry) {
        this.model.toggleSelection(event.ctrlKey || this.dragging, entry);
        this.rows.forEach((node, item) => {
            if (this.model.isSelected(item))
                node.addClass("selected");
            else
                node.removeClass("selected");
        });
    }
    paintBody() {
        const count = this.model.getCount();
        const cells = this.model.getCellCount();
        this.rows.forEach((value, key) => {
            if (this.model.getIndex(key) == -1) {
                if (this.body.contains(value))
                    this.body.remove(value);
                this.rows.delete(key);
            }
        });
        let itemIndex = 0;
        let rowIndex = 0;
        for (rowIndex; rowIndex < count; rowIndex++) {
            const entry = this.model.get(rowIndex);
            let row = this.rows.get(entry);
            if (!this.model.include(rowIndex)) {
                if (row != null && this.body.contains(row))
                    this.body.remove(row);
            }
            else {
                if (row == null)
                    row = this.createRow(rowIndex, entry);
                this.body.add(row);
                if (this.model.isDirty(entry))
                    this.paintRow(row, rowIndex, cells, itemIndex);
                itemIndex++;
            }
        }
    }
    createRow(rowIndex, entry) {
        const row = this.model.interceptRow(new Component(document.createElement("tr")), rowIndex, entry);
        const cells = this.model.getCellCount();
        row.addClass("table-row");
        row.addClass(this.model.getRowClass(rowIndex));
        this.rows.set(entry, row);
        let cellIndex = 0;
        for (cellIndex; cellIndex < cells; cellIndex++) {
            let cell = this.model.interceptCell(new Component(document.createElement("td")), cellIndex);
            cell.addClass("table-cell");
            cell.addClass(this.model.getCellClass(cellIndex));
            row.add(cell);
        }
        row.on("contextmenu", (event) => {
            this.handleRowClick(event, entry);
        });
        row.on("click", (event) => {
            this.handleRowClick(event, entry);
        });
        row.on("mousedown", () => {
            this.dragging = true;
        });
        row.on("mouseup", () => {
            this.dragging = false;
        });
        row.on("mouseenter", (event) => {
            if (this.dragging)
                this.handleRowClick(event, entry);
        });
        return row;
    }
    paintRow(row, rowIndex, cells, index) {
        let cellIndex = 0;
        for (cellIndex; cellIndex < cells; cellIndex++)
            row.children[cellIndex].html.bind(this.model.getValueAt(rowIndex, cellIndex, index));
        if (this.model.isSelected(rowIndex))
            row.addClass("selected");
    }
    paintHeader() {
        Table.clearElement(this.header);
        const cells = this.model.getCellCount();
        let cellIndex = 0;
        for (cellIndex; cellIndex < cells; cellIndex++) {
            const cell = this.model.interceptHeaderCell(new Component(document.createElement("th")));
            cell.addClass("table-cell");
            cell.addClass(this.model.getCellClass(cellIndex));
            cell.html.value = this.model.getNameAt(cellIndex);
            this.header.add(cell);
        }
    }
    static clearElement(element) {
        while (element.firstChild) {
            element.remove(element.firstChild);
        }
    }
}
//# sourceMappingURL=Table.js.map