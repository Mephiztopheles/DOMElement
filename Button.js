import StringProperty from "../../node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import DOMElement from "./DOMElement.js";
export default class Button extends DOMElement {
    constructor(element, text) {
        super(element || document.createElement("button"));
        this.type = new StringProperty(this.element.type);
        this.text = new StringProperty(this.element.innerText);
        this.type.addListener((observable, newValue) => {
            this.element.type = newValue;
        });
        this.text.addListener((observable, newValue) => {
            this.element.innerText = newValue;
        });
        if (text != null)
            this.text.value = text;
    }
}
//# sourceMappingURL=Button.js.map