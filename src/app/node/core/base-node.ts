import { NodeParameter } from "./node-parameter";
import { NodeClass, NodeId } from "./types/node-classes";
import { Socket } from "./socket";
import { Vector2, Vector3, Vector4 } from "../../core/math/vector";
import { HTMLComponent } from "../../core/render/html-component";
import { SocketPrototype } from "./types/socket-prototype";
import { SocketType } from "./types/socket-types";
import { ColorRGBA } from "../../core/math/color";
import { SerializedNode } from "./types/serialized-types";
import { Selectable } from "../../core/render/selectable";
import { NodeCompiler } from "./compiler/node-compiler";
import { NodeEngine } from "./node-engine";

export abstract class BaseNode extends HTMLComponent implements Selectable {
    private static idCounter: number = 0;

    static setCounter(num: number) {
        this.idCounter = num;
    }

    protected _label!: string;
    protected _type: NodeClass;
    protected _input: Socket<unknown>[];
    protected _output: Socket<unknown>[];
    protected _parameters: NodeParameter<unknown>[];
    protected nodeEngine: NodeEngine;
    abstract readonly nodeId: NodeId;

    get label() { return this._label };
    get type() { return this._type };
    get input() { return this._input };
    get output() { return this._output };
    get parameters() { return this._parameters ?? [] };

    readonly uId: string;
    position: Vector2;
    dirty: boolean;
    selected: boolean;

    static fromJSON<T extends BaseNode>(type: new (...args: any[]) => T, json: SerializedNode, engine: NodeEngine) {
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
                writable: true
            },
            _label: {
                value: json.label,
                writable: true
            },
            _type: {
                value: json.type,
                writable: false
            },
            _input: {
                value: json.input.map(s => Socket.fromJson(s)),
                writable: true
            },
            _output: {
                value: json.output.map(s => Socket.fromJson(s)),
                writable: true
            },

        }) as T;
    }

    constructor(engine: NodeEngine, pos: Vector2, nodeType: NodeClass, inputs: SocketPrototype<unknown>[] = [], outputs: SocketPrototype<unknown>[] = [], parameters: NodeParameter<unknown>[] = []) {
        super();
        this.nodeEngine = engine;
        this.uId = `n-${BaseNode.idCounter.toString().padStart(4, '0')}`;
        BaseNode.idCounter++;
        this._type = nodeType;
        this.position = pos;
        this.dirty = false;
        this._input = inputs.map((prototype, idx) => new Socket({ ...prototype, uId: `i-${this.uId}-${idx}` }));
        this._output = outputs.map((prototype, idx) => new Socket({ ...prototype, uId: `o-${this.uId}-${idx}` }));
        this._parameters = parameters.map((param, idx) => {
            param.setUid(`p-${this.uId}-${idx}`);
            return param;
        });


        this.selected = false;
    }

    setSelection(selectState: boolean): void {
        this.selected = selectState;
        if (selectState)
            this.getOuterElement()!.classList.add('selected', 'top');
        else
            this.getOuterElement()!.classList.remove('selected', 'top');
    }

    htmlElementGetter(): HTMLElement {
        return document.getElementById(`node-${this.uId}`)!;
    }

    getHtml(): string {
        return `
        <div id="node-${this.uId}" class="node" data-node-id="${this.uId}">
            <div class="header ${this.type}">
                <span>${this.label}</span>
            </div>
            <div class="body">
                <div id="output-sockets-${this.uId}">
                    ${this.getSocketHtml('output')}
                </div>
                <div id="parameters-${this.uId}">
                    ${this.getParametersHtml()}
                </div>
                <div id="input-sockets-${this.uId}">
                    ${this.getSocketHtml('input')}
                </div>
            </div>
        </div>`;
    }

    private getSocketHtml(type: 'input' | 'output'): string {
        const sockets = type == 'input' ? this._input : this._output;
        return sockets.filter(socket => !socket.hidden).map((socket) =>
            `
                    <div class="socket-row ${type}">
                        <span>${socket.label}</span>
                        <div class="socket ${socket.type}" id="socket-${socket.uId}" data-socket-id="${socket.uId}"></div>
                    </div>
                    ${socket.connection || type == 'output' ? '' : `<div class="socket-row">${this.generateInput(socket)}</div>`}
            `
        ).reduce((a, b) => a + '\n' + b, '');
    }

    private generateInput(socket: Socket<unknown>): string {
        switch (socket.type) {
            case SocketType.bool: {
                const s = socket as Socket<boolean>;
                return `<input type="checkbox" id="input-${socket.uId}" ${s.value ? 'checked' : ''} />`;
            }
            case SocketType.float: {
                const s = socket as Socket<number>;
                return `
                <div class="socket-numeric-input">
                    <input type="number" id="input-${socket.uId}" value="${s.value}" />
                </div>`;
            }
            case SocketType.vector2: {
                const s = socket as Socket<Vector2>;
                return `
                <div class="socket-numeric-input">
                    <input type="number" id="input-${socket.uId}-x" value="${s.value?.x}" />
                    <input type="number" id="input-${socket.uId}-y" value="${s.value?.y}" />
                </div>`;
            }
            case SocketType.vector3: {
                const s = socket as Socket<Vector3>;
                return `
                <div class="socket-numeric-input">
                    <input type="number" id="input-${socket.uId}-x" value="${s.value?.x}" />
                    <input type="number" id="input-${socket.uId}-y" value="${s.value?.y}" />
                    <input type="number" id="input-${socket.uId}-z" value="${s.value?.z}" />
                </div>`;
            }
            case SocketType.vector4: {
                const s = socket as Socket<Vector4>;
                return `
                <div class="socket-numeric-input">
                    <input type="number" id="input-${socket.uId}-x" value="${s.value?.x}" />
                    <input type="number" id="input-${socket.uId}-y" value="${s.value?.y}" />
                    <input type="number" id="input-${socket.uId}-z" value="${s.value?.z}" />
                    <input type="number" id="input-${socket.uId}-w" value="${s.value?.w}" />
                </div>`;
            }
            case SocketType.color: {
                const s = socket as Socket<ColorRGBA>;
                return `<input type="color" id="input-${socket.uId}" value="${s.value?.toHex()}" />`;
            }
        }
    }

    private getParametersHtml(): string {
        return this.parameters.map(p => `
                <div class="parameter">
                    ${p.getHtml()}
                </div>`).reduce((a, b) => a + '\n' + b, '');
    }

    setListeners(): void {
        this.setSocketListeners();
        this.setParameterListeners();
    }

    private setSocketListeners() {
        const nodeCompiler = NodeCompiler.getInstance();

        for (const socket of this._input) {
            switch (socket.type) {
                case SocketType.bool: {
                    const input = document.getElementById(`input-${socket.uId}`) as HTMLInputElement;
                    if (input) {
                        input.addEventListener('click', () => {
                            socket.value = input.checked;
                            nodeCompiler.compile();
                        });
                    }
                    break;
                }
                case SocketType.float: {
                    const input = document.getElementById(`input-${socket.uId}`) as HTMLInputElement;
                    if (input) {
                        input.addEventListener('change', () => {
                            socket.value = input.valueAsNumber;
                            nodeCompiler.compile();
                        });
                    }
                    break;
                }
                case SocketType.vector2: {
                    const x = document.getElementById(`input-${socket.uId}-x`) as HTMLInputElement;
                    const y = document.getElementById(`input-${socket.uId}-y`) as HTMLInputElement;
                    if (x && y) {
                        x.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector2(x.valueAsNumber);
                            (socket.value as Vector2).x = x.valueAsNumber;
                            nodeCompiler.compile();
                        });
                        y.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector2(0, y.valueAsNumber);
                            (socket.value as Vector2).y = y.valueAsNumber;
                            nodeCompiler.compile();
                        });
                    }
                    break;
                }
                case SocketType.vector3: {
                    const x = document.getElementById(`input-${socket.uId}-x`) as HTMLInputElement;
                    const y = document.getElementById(`input-${socket.uId}-y`) as HTMLInputElement;
                    const z = document.getElementById(`input-${socket.uId}-z`) as HTMLInputElement;
                    if (x && y && z) {
                        x.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector3(x.valueAsNumber);
                            (socket.value as Vector3).x = x.valueAsNumber;
                            nodeCompiler.compile();
                        });
                        y.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector3(0, y.valueAsNumber);
                            (socket.value as Vector3).y = y.valueAsNumber;
                            nodeCompiler.compile();
                        });
                        z.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector3(0, 0, z.valueAsNumber);
                            (socket.value as Vector3).z = z.valueAsNumber;
                            nodeCompiler.compile();
                        });
                    }
                    break;
                }
                case SocketType.vector4: {
                    const x = document.getElementById(`input-${socket.uId}-x`) as HTMLInputElement;
                    const y = document.getElementById(`input-${socket.uId}-y`) as HTMLInputElement;
                    const z = document.getElementById(`input-${socket.uId}-z`) as HTMLInputElement;
                    const w = document.getElementById(`input-${socket.uId}-w`) as HTMLInputElement;
                    if (x && y && z && w) {
                        x.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector4(x.valueAsNumber);
                            (socket.value as Vector4).x = x.valueAsNumber;
                            nodeCompiler.compile();
                        });
                        y.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector4(0, y.valueAsNumber);
                            (socket.value as Vector4).y = y.valueAsNumber;
                            nodeCompiler.compile();
                        });
                        z.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector4(0, 0, z.valueAsNumber);
                            (socket.value as Vector4).z = z.valueAsNumber;
                            nodeCompiler.compile();
                        });
                        w.addEventListener('change', () => {
                            if (!socket.value) socket.value = new Vector4(0, 0, 0, w.valueAsNumber);
                            (socket.value as Vector4).w = w.valueAsNumber;
                            nodeCompiler.compile();
                        });
                    }
                    break;
                }
                case SocketType.color: {
                    const input = document.getElementById(`input-${socket.uId}`) as HTMLInputElement;
                    if (input) {
                        input.addEventListener('change', () => {
                            socket.value = new ColorRGBA(input.value);
                            nodeCompiler.compile();
                        });
                    }
                    break;
                }
            }
        }
    }

    private setParameterListeners() {
        for (const param of this._parameters) {
            param.setListeners();
        }
    }

    updateNode(updates: {
        label?: boolean;
        inputSockets?: boolean;
        outputSockets?: boolean;
        // parameters?: boolean;
    }) {
        if (updates.label) {
            const span = document.querySelector(`#node-${this.uId} .header span`) as HTMLSpanElement;
            span.innerHTML = this._label;
        }
        if (updates.inputSockets) {
            const div = document.getElementById(`input-sockets-${this.uId}`) as HTMLDivElement;
            div.innerHTML = this.getSocketHtml('input');
            this.setSocketListeners();
        }
        if (updates.outputSockets) {
            const div = document.getElementById(`output-sockets-${this.uId}`) as HTMLDivElement;
            div.innerHTML = this.getSocketHtml('output');
        }
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