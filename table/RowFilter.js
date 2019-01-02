export class AndFilter {
    constructor() {
        this.filters = [];
    }
    include(entry, index) {
        let i = 0;
        for (i; i < this.filters.length; i++)
            if (!this.filters[i].include(entry, index))
                return false;
        return true;
    }
    addFilter(filter) {
        this.filters.push(filter);
    }
    removeFilter(filter) {
        let index = this.filters.indexOf(filter);
        if (index != -1)
            this.filters.splice(index, 1);
    }
}
export class OrFilter {
    constructor() {
        this.filters = [];
    }
    include(entry, index) {
        let i = 0;
        for (i; i < this.filters.length; i++)
            if (this.filters[i].include(entry, index))
                return true;
        return false;
    }
    addFilter(filter) {
        this.filters.push(filter);
    }
    removeFilter(filter) {
        let index = this.filters.indexOf(filter);
        if (index != -1)
            this.filters.splice(index, 1);
    }
}
//# sourceMappingURL=RowFilter.js.map