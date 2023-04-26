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
            <label for="parameter-${this.uId}">${this.label}</label>
            <select name="${this.uId}" id="parameter-${this.uId}">
                ${this.options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('\n')}
                </select>
        </div>
        `;
    }
    setListeners(): void {
        document.getElementById(`parameter-${this.uId}`)!.addEventListener('change', (ev) => {
            this.value = (ev.target! as HTMLSelectElement).value as unknown as T;
            this.onValueChange(this.value);
        })
    }

}