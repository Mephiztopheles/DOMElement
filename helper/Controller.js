import Component from "../Component.js";
import Exception from "../../C/System/Exception.js";
export default class Controller {
    constructor(window) {
        this.window = window;
        this.bound = false;
    }
    bind(element) {
        if (this.bound)
            throw new Exception(`Controller ${this.constructor.name} already bound`);
        bind(this, element);
        this.bound = true;
    }
}
function bind(controller, element) {
    const id = element.data("id");
    element.bindToController(controller);
    if (id) {
        // @ts-ignore -> this is the only one which is allowed
        controller[id] = element;
    }
    if (element instanceof Component) {
        element.children.forEach(child => {
            bind(controller, child);
        });
    }
}
//# sourceMappingURL=Controller.js.map