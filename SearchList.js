import Component from "./Component.js";
import Input from "./Input.js";
export default class SearchList extends Component {
    constructor(element, attributes) {
        super(element, attributes);
        this.searchMap = new Map();
        this.body = new Component();
        this.input = new Input(null, { autofocus: "true" });
        this.add(this.body);
        this.add(this.input);
        this.addClass("search-list");
        this.body.addClass("body");
        this.input.value.addListener(() => {
            this.search();
        });
    }
    addToList(name, element) {
        this.searchMap.set(name, element);
    }
    search() {
        this.body.clear();
        const regex = new RegExp(`.*${this.input.value.value}.*`, "i");
        this.searchMap.forEach((element, name) => {
            if (name.value.match(regex))
                this.body.add(element);
        });
    }
    focusInput() {
        this.input.focus();
    }
}
//# sourceMappingURL=SearchList.js.map