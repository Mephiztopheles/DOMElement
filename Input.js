import StringProperty from "../../node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import DOMElement from "./DOMElement.js";
export default class Input extends DOMElement {
    constructor(element, attributes) {
        super(element || document.createElement("input"), attributes);
        this.value = new StringProperty(this.element.value);
        this.type = new StringProperty(this.element.type);
        this.name = new StringProperty(this.element.name);
        this.value.addListener((observable, newValue) => {
            if (newValue === this.element.value)
                return;
            let value = newValue || "";
            if (this.element.value == value)
                return;
            this.element.value = value;
            this.element.dispatchEvent(new Event("input"));
        });
        this.type.addListener((observable, newValue) => {
            this.element.type = newValue;
        });
        this.name.addListener((observable, newValue) => {
            this.element.name = newValue;
        });
        this.element.addEventListener("input", () => {
            this.value.value = this.element.value;
        });
        this.element.addEventListener("change", () => {
            this.value.value = this.element.value;
        });
    }
    focus(options) {
        this.element.focus(options);
    }
}
//# sourceMappingURL=Input.js.map