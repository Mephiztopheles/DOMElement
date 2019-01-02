import Component from "./Component.js";
import ArrayProperty from "../../node_modules/@mephiztopheles/properties/properties/ArrayProperty.js";
export default class List extends Component {
    constructor(element, attributes = {}) {
        super(element, attributes);
        this.map = new WeakMap();
        this.list = new ArrayProperty([]);
        this.templateCompiler = () => {
        };
        this.list.addListener(() => {
            this.compile();
        });
    }
    setList(property) {
        this.list.bind(property);
        this.compile();
    }
    setTemplateCompiler(templateCompiler) {
        this.templateCompiler = templateCompiler;
    }
    compile() {
        if (this.template == null)
            this.template = this.children[0].clone();
        this.clear();
        this.list.forEach(item => {
            let element = this.map.get(item);
            if (element == null) {
                element = this.template.clone();
                this.templateCompiler(element, item);
                this.map.set(item, element);
            }
            this.add(element);
        });
    }
}
//# sourceMappingURL=List.js.map