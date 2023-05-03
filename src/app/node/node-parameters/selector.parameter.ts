import { NodeCompiler } from "../core/compiler/node-compiler";
import { NodeParameter } from "../core/node-parameter";
export interface SelectorEntry<T> {
    label: string;
    value: T;
}

export class SelectorParam<T> extends NodeParameter<T> {
    private compiler = NodeCompiler.getInstance();

    getOuterElement(): HTMLElement {
        throw new Error("Method not implemented.");
    }
    constructor(label: string, public options: SelectorEntry<T>[], onValueChange: (val: T) => void, defaultValue: T | null = null) {
        super(label, onValueChange, defaultValue ?? options[0].value);
    }

    getHtml(): string {
        return `
        <div id="${this.uId}">
            <label for="parameter-${this.uId}">${this.label}</label>
            <select name="${this.uId}" id="parameter-${this.uId}">
                ${this.options.map((o) => `<option value="${o.value}" ${o.value == this.value ? 'selected ' : ''}>${o.label}</option>`).join('\n')}
                </select>
        </div>
        `;
    }
    setListeners(): void {
        document.getElementById(`parameter-${this.uId}`)!.addEventListener('change', (ev) => {
            this.value = (ev.target! as HTMLSelectElement).value as unknown as T;
            this.onValueChange(this.value);
            this.compiler.compile();
        })
    }

}