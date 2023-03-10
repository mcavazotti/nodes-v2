import { HTMLComponent } from "../../core/render/html-component";

export abstract class NodeParameter<T> implements HTMLComponent {
    dirty: boolean;
    constructor(public readonly label: string, public value?: T) {
        this.dirty = false;
    }
    getOuterElement(): HTMLElement {
        throw new Error("Method not implemented.");
    }

    abstract getHtml(): string;
    abstract setListeners(): void
    abstract destroy(): void
    abstract validateInput(val: T): boolean;
}