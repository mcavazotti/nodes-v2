import { NodeParameter } from "../core/node-parameter";
export interface SelectorEntry<T> {
    label: string;
    value: T;
}

export class SelectorParam<T> extends NodeParameter<T> {
    getOuterElement(): HTMLElement {
        throw new Error("Method not implemented.");
    }
    constructor(label: string, public options: SelectorEntry<T>[], onValueChange: (val: T) => void, defaultValue: T | null = null) {
        super(label, onValueChange, defaultValue);
    }

    getHtml(): string {
        return `
        <div id="${this.uId}">
            <label for="${this.uId}">${this.label}</label>
            <select name="${this.uId} value="${this.value}">
                ${this.options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('\n')}
                </select>
        </div>
        `;
    }
    setListeners(): void {
        this.htmlElement!.getElementsByTagName('select')[0].addEventListener('change', (ev) => {
            console.log(ev);
        })
    }

}