import { NodeParameter } from "./node-parameter";
import { NodeClass } from "./types/node-classes";
import { Socket } from "./socket";
import { Vector2 } from "../../core/math/vector";
import { HTMLComponent } from "../../core/render/html-component";
import { SocketPrototype } from "./types/socket-prototype";

export abstract class BaseNode implements HTMLComponent {
    private static idCounter: number = 0;
    private htmlElement: HTMLDivElement | null;

    protected _label!: string;
    protected _type!: NodeClass;
    protected _input!: Socket<unknown>[];
    protected _output!: Socket<unknown>[];
    protected _parameters!: NodeParameter<unknown>[];

    get label() { return this._label };
    get type() { return this._type };
    get input() { return this._input };
    get output() { return this._output };
    get parameters() { return this._parameters ?? [] };

    readonly uId: string;
    position: Vector2;
    dirty: boolean;

    constructor(pos: Vector2, inputs: SocketPrototype<unknown>[] = [], outputs: SocketPrototype<unknown>[] = []) {
        this.uId = `n-${BaseNode.idCounter.toString().padStart(4, '0')}`;
        BaseNode.idCounter++;
        this._type = NodeClass.input;
        this.position = pos;
        this.dirty = false;
        this._input = inputs.map((prototype, idx) => new Socket({ ...prototype, uId: `i-${this.uId}-${idx}` }));
        this._output = outputs.map((prototype, idx) => new Socket({ ...prototype, uId: `o-${this.uId}-${idx}` }));

        this.htmlElement = null;
    }

    getHtml(): string {
        return `
        <div id="node-${this.uId}" class="node">
            <div class="header ${this.type}">
                <span>${this.label}</span>
            </div>
            <div class="body">
            ${this.output.map((socket) =>
            `
                    <div class="socket-row output">
                        <span>${socket.label}</span>
                        <div class="socket ${socket.type}" id="socket-${socket.uId}"></div>
                    </div>
                    `
        )
            }
            </div>
        </div>`;
    }

    generateTemplate(): HTMLTemplateElement {
        const template = document.createElement('template');
        template.innerHTML = this.getHtml();
        this.htmlElement = template.content.firstElementChild as HTMLDivElement;
        return template;
    }

    getOuterElement(): HTMLElement | null {
        return this.htmlElement;
    }

    setListeners(): void {
    }

    destroy(): void {
        this.htmlElement?.remove();
        this.htmlElement = null;
    }

    abstract code(): string;
    abstract definitions(): [string, string][];
}