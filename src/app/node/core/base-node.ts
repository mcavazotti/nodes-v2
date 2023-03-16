import { NodeParameter } from "./node-parameter";
import { NodeClass, NodeId } from "./types/node-classes";
import { Socket } from "./socket";
import { Vector2, Vector3, Vector4 } from "../../core/math/vector";
import { HTMLComponent } from "../../core/render/html-component";
import { SocketPrototype } from "./types/socket-prototype";
import { SocketType } from "./types/socket-types";
import { ColorRGB } from "../../core/math/color";
import { SerializedNode } from "./types/serialized-types";
// import { SerializedNode } from "./types/serialized-types";

export abstract class BaseNode implements HTMLComponent {
    private static idCounter: number = 0;

    static setCounter(num: number) {
        this.idCounter = num;
    }

    private htmlElement: HTMLDivElement | null;

    protected _label!: string;
    protected _type!: NodeClass;
    protected _input!: Socket<unknown>[];
    protected _output!: Socket<unknown>[];
    protected _parameters!: NodeParameter<unknown>[];
    abstract readonly nodeId: NodeId;

    get label() { return this._label };
    get type() { return this._type };
    get input() { return this._input };
    get output() { return this._output };
    get parameters() { return this._parameters ?? [] };

    readonly uId: string;
    position: Vector2;
    dirty: boolean;

    static fromJSON<T extends BaseNode>(type: new (...args: any[]) => T, json: SerializedNode) {
        return Object.create(type.prototype, {
            uId: {
                value: json.uId,
                writable: false
            },
            nodeId: {
                value: json.nodeId,
                writable: false
            },
            position: {
                value: new Vector2(json.position[0], json.position[1]),
            },
            _label: {
                value: json.label,
            },
            _type: {
                value: json.type,
            },
            _input: {
                value: json.input.map(s => Socket.fromJson(s)),
            },
            _output: {
                value: json.output.map(s => Socket.fromJson(s)),
            },

        }) as T;
    }

    constructor(pos: Vector2, nodeType: NodeClass, inputs: SocketPrototype<unknown>[] = [], outputs: SocketPrototype<unknown>[] = []) {
        this.uId = `n-${BaseNode.idCounter.toString().padStart(4, '0')}`;
        BaseNode.idCounter++;
        this._type = nodeType;
        this.position = pos;
        this.dirty = false;
        this._input = inputs.map((prototype, idx) => new Socket({ ...prototype, uId: `i-${this.uId}-${idx}`}));
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
        )}

            ${this.input.map((socket) =>
            `
                    <div class="socket-row input">
                        <span>${socket.label}</span>
                        <div class="socket ${socket.type}" id="socket-${socket.uId}"></div>
                    </div>
                    ${socket.connection ? '' : `<div class="socket-row">${this.generateInput(socket)}</div>`}
                `
        )}
            </div>
        </div>`;
    }

    private generateInput(socket: Socket<unknown>): string {
        switch (socket.type) {
            case SocketType.bool: {
                const s = socket as Socket<boolean>;
                return `<input type="checkbox" id="input-${socket.uId}" ${s.value ? 'checked' : ''} />`;
            }
            case SocketType.float: {
                const s = socket as Socket<number>;
                return `<input type="number" id="input-${socket.uId}" value="${s.value}" />`;

            }
            case SocketType.vector2: {
                const s = socket as Socket<Vector2>;
                return `
                <div>
                    <input type="number" id="input-${socket.uId}-x" value="${s.value?.x}" />
                    <input type="number" id="input-${socket.uId}-y" value="${s.value?.y}" />
                </div>`;
            }
            case SocketType.vector3: {
                const s = socket as Socket<Vector3>;
                return `
                <div>
                    <input type="number" id="input-${socket.uId}-x" value="${s.value?.x}" />
                    <input type="number" id="input-${socket.uId}-y" value="${s.value?.y}" />
                    <input type="number" id="input-${socket.uId}-z" value="${s.value?.z}" />
                </div>`;
            }
            case SocketType.vector4: {
                const s = socket as Socket<Vector4>;
                return `
                <div>
                    <input type="number" id="input-${socket.uId}-x" value="${s.value?.x}" />
                    <input type="number" id="input-${socket.uId}-y" value="${s.value?.y}" />
                    <input type="number" id="input-${socket.uId}-z" value="${s.value?.z}" />
                    <input type="number" id="input-${socket.uId}-w" value="${s.value?.w}" />
                </div>`;
            }
            case SocketType.color: {
                const s = socket as Socket<ColorRGB>;
                return `<input type="color" id="input-${socket.uId}" value="${s.value?.toHex()}" />`;
            }
        }
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

    toJSON(): SerializedNode {
        return {
            uId: this.uId,
            nodeId: this.nodeId,
            label: this._label,
            position: this.position.toJSON() as [number, number],
            type: this._type,
            input: this._input.map(s => s.toJSON()),
            output: this._output.map(s => s.toJSON()),
        }
    }

    abstract code(): string;
    abstract definitions(): [string, string][];
}