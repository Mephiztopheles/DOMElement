import Component from "./Component.js";
import Controller from "./helper/Controller.js";
export default class TabGroup extends Component {
    constructor(element, ...tabs) {
        super(element);
        this.headerController = new TabGroupController;
        this.bodyController = new TabGroupController;
        this.tabs = tabs;
        this.loaded = [];
        this.header = this.children[0];
        this.headerController.bind(this.header);
        this.body = this.children[1];
        this.bodyController.bind(this.body);
        this.activate(this.body.children[0].data("name"));
        this.header.on("click", event => {
            if (event.target === this.header.element)
                return;
            this.activate(event.target.getAttribute("data-name"));
        });
        tabs.forEach(tab => {
            tab.initialized(this);
        });
    }
    activate(name) {
        let target = this.header.children.filter(value => {
            value.removeClass("active");
            return value.data("name") === name;
        })[0];
        if (target == null)
            return;
        this.body.children.forEach(child => {
            child.css("display", "none");
        });
        const tab = this.body.children.filter(value => value.data("name") === target.data("name"))[0];
        if (tab == null)
            return;
        target.addClass("active");
        tab.css("display", "");
        this.tabs.forEach(it => {
            if (it.name === name) {
                if (this.loaded.indexOf(name) == -1) {
                    this.loaded.push(name);
                    it.load(this, tab);
                }
                it.activated(this, tab);
            }
        });
    }
}
class TabGroupController extends Controller {
}
export class Tab {
    initialized(tabGroup) {
    }
    ;
    activated(tabGroup, component) {
    }
    ;
}
//# sourceMappingURL=TabGroup.js.map