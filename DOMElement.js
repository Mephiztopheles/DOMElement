import StringProperty from "../../node_modules/@mephiztopheles/properties/properties/StringProperty.js";
import Component from "./Component.js";
import { Style } from "./helper/Style.js";
import ASTCompiler from "./helper/ASTCompiler.js";
import BooleanProperty from "../../node_modules/@mephiztopheles/properties/properties/BooleanProperty.js";
import Logger from "../C/System/Logger.js";
import ErrorDialog from "../C/System/ErrorDialog.js";
import Locale from "../C/System/locale/Locale.js";
class DOM {
}
const cache = new WeakMap();
const logger = new Logger(DOM);
const eventTypesInData = [{
        name: "click",
        listenDisabled: true
    }, {
        name: "drop",
        listenDisabled: true
    }, {
        name: "dragenter",
        listenDisabled: true
    }, {
        name: "hover",
        listenDisabled: false
    }, {
        name: "dblclick",
        listenDisabled: true
    }, {
        name: "keydown",
        listenDisabled: true
    }];
function getCached(element, name) {
    let cached = cache.get(element);
    if (cached == null)
        cache.set(element, cached = {});
    let data = cached[name];
    if (data === undefined)
        data = dataAttr(element, name);
    return data;
}
function setCached(element, name, value) {
    let cached = cache.get(element);
    if (cached == null)
        cache.set(element, cached = {});
    cached[name] = value;
}
function getData(data) {
    if (data === "true") {
        return true;
    }
    if (data === "false") {
        return false;
    }
    if (data === "null") {
        return null;
    }
    // Only convert to a number if it doesn't change the string
    if (data === +data + "") {
        return +data;
    }
    if (rbrace.test(data)) {
        return JSON.parse(data);
    }
    return data;
}
function dataAttr(elem, key) {
    let name;
    // If nothing was found internally, try to fetch any
    // data from the HTML5 data-* attribute
    name = "data-" + key.replace(rmultiDash, "-$&").toLowerCase();
    let data = elem.getAttribute(name);
    if (typeof data === "string") {
        try {
            data = getData(data);
        }
        catch (e) {
        }
    }
    else {
        data = undefined;
    }
    return data;
}
function getClass(elem) {
    return elem.getAttribute && elem.getAttribute("class") || "";
}
function stripAndCollapse(value) {
    return (value.match(rnothtmlwhite) || []).join(" ");
}
function classesToArray(value) {
    if (Array.isArray(value))
        return value;
    if (typeof value === "string")
        return value.match(rnothtmlwhite) || [];
    return [];
}
const nodeMap = new WeakMap();
const rbrace = /^(?:{[\w\W]*}|\[[\w\W]*])$/, rmultiDash = /[A-Z]/g, rnothtmlwhite = (/[^\x20\t\r\n\f]+/g), rtypenamespace = /^([^.]*)(?:\.(.+)|)/;
export default class DOMElement {
    // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
    constructor(element, attributes = {}) {
        this.element = element;
        this.text = new StringProperty();
        this.html = new StringProperty();
        this.listeners = new Map();
        this.disabled = new BooleanProperty(false);
        if (this.element == null)
            this.element = document.createElement("div");
        for (let attribute in attributes)
            this.attr(attribute, attributes[attribute]);
        let xElement = nodeMap.get(this.element);
        if (xElement == null)
            nodeMap.set(this.element, this);
        if (this.element instanceof HTMLElement) {
            const htmlElement = this.element;
            this.text.value = htmlElement.innerText;
            this.text.addListener(observable => {
                htmlElement.innerText = observable.value;
            });
        }
        this.html.value = this.element.innerHTML;
        this.html.addListener(observable => {
            this.element.innerHTML = observable.value;
        });
        let applyProp = (value) => {
            if (value)
                this.attr("disabled", "disabled");
            else
                this.removeAttr("disabled");
        };
        this.disabled.addListener(applyProp);
    }
    get parent() {
        if (this.element.parentElement == null)
            return null;
        return DOMElement.wrap(this.element.parentElement);
    }
    static wrap(element) {
        let xElement = nodeMap.get(element);
        if (xElement != null)
            return xElement;
        xElement = new Component(element);
        nodeMap.set(element, xElement);
        return xElement;
    }
    bindToController(controller) {
        this.controller = controller;
        this.off(".DOM");
        eventTypesInData.forEach(entry => {
            const data = this.data(entry.name);
            if (data) {
                this.on(`${entry.name}.DOM`, event => {
                    if (entry.listenDisabled && this.disabled.value) {
                        event.preventDefault();
                        return;
                    }
                    try {
                        return this._parse(data, { event });
                    }
                    catch (e) {
                        logger.error(`Error while running ${entry.name} handler`, e);
                        new ErrorDialog(Locale.getProperty("System.error"), Locale.get("DOMElement.error.action"), this.controller.window).show();
                    }
                });
            }
        });
        const disabled = this.data("disabled");
        if (disabled) {
            let property = this._parse(disabled);
            if (property != null)
                this.disabled.bind(property);
        }
    }
    clone() {
        return new this.constructor(this.element.cloneNode(true));
    }
    data(name, value) {
        if (arguments.length == 1)
            return getCached(this.element, name);
        else
            setCached(this.element, name, value);
    }
    hasClass(clazz) {
        return this.element.classList.contains(clazz);
    }
    css(name, value) {
        let styles, len, map = {}, i = 0;
        if (Array.isArray(name)) {
            styles = Style.getStyles(this.element);
            len = name.length;
            for (; i < len; i++) {
                map[name[i]] = Style.css(this.element, name[i], false, styles);
            }
            return map;
        }
        return value !== undefined ?
            Style.style(this.element, name, value) :
            Style.css(this.element, name);
    }
    addClass(className) {
        if (className != "" && className != null)
            className.split(" ").forEach(it => this.element.classList.add(it));
    }
    removeClass(className) {
        if (typeof className == "function") {
            this.removeClass(className.call(this, 0, getClass(this.element)));
            return;
        }
        let finalValue, curValue;
        const classes = classesToArray(className);
        if (classes.length != 0) {
            curValue = getClass(this.element);
            let cur = this.element.nodeType === 1 && (" " + stripAndCollapse(curValue) + " ");
            if (cur) {
                let clazz;
                let j = 0;
                // noinspection JSAssignmentUsedAsCondition
                while (clazz = classes[j++])
                    while (cur.indexOf(" " + clazz + " ") > -1)
                        cur = cur.replace(" " + clazz + " ", " ");
                finalValue = stripAndCollapse(cur);
                if (curValue !== finalValue)
                    this.element.setAttribute("class", finalValue);
            }
        }
    }
    toggleClass(className) {
        if (this.hasClass(className))
            this.removeClass(className);
        else
            this.addClass(className);
    }
    on(type, listener, options) {
        const types = (type || "").match(rnothtmlwhite) || [""];
        types.forEach(type => {
            const tmp = rtypenamespace.exec(type) || [];
            type = tmp[1];
            const namespaces = (tmp[2] || "").split(".").sort();
            let listeners = this.listeners.get(type);
            if (listeners == null)
                this.listeners.set(type, listeners = []);
            listeners.push({
                namespaces,
                type,
                listener
            });
            this.element.addEventListener(type, listener, options);
        });
    }
    off(type) {
        const types = (type || "").match(rnothtmlwhite) || [""];
        types.forEach(type => {
            const tmp = rtypenamespace.exec(type) || [];
            type = tmp[1];
            const namespaces = (tmp[2] || "").split(".").sort();
            // Unbind all events (on this namespace, if provided) for the element
            if (!type) {
                this.listeners.forEach((list, key) => {
                    list.forEach(entry => {
                        if (entry.namespaces.toString() == namespaces.toString())
                            this.element.removeEventListener(key, entry.listener);
                    });
                });
                return;
            }
            const listenersForType = this.listeners.get(type);
            if (listenersForType == null)
                return;
            listenersForType.forEach((handle, index) => {
                if (handle.namespaces.toString() == namespaces.toString()) {
                    listenersForType.splice(index, 1);
                    this.element.removeEventListener(handle.type, handle.listener);
                }
            });
        });
    }
    trigger(type) {
        this.element.dispatchEvent(new Event(type));
    }
    attr(attribute, value) {
        if (value == null)
            return this.element.getAttribute(attribute);
        this.element.setAttribute(attribute, value);
        return value;
    }
    removeAttr(attribute) {
        this.element.removeAttribute(attribute);
    }
    _parse(expression, local = {}) {
        return new Function("", new ASTCompiler(expression).compile().generate())()(this.controller, Object.assign({
            $static: this.controller.constructor
        }, local));
    }
}
//# sourceMappingURL=DOMElement.js.map