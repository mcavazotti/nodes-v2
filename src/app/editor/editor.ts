import { Vector2 } from "../core/math/vector";
import { Camera } from "../core/render/camera";
import { cubicBelzier } from "../core/render/canvas-primitives";
import { GlEnviroment } from "../gl/gl-enviroment";
import { BaseNode } from "../node/core/base-node";
import { NodeCompiler } from "../node/core/compiler/node-compiler";
import { NodeEngine } from "../node/core/node-engine";
import * as Node from "../node/node-defs/node-defs";
import { SelectorParam } from "../node/node-parameters/selector.parameter";
import { DragAction, getDragAction, SelectAction } from "./input-handler";

export class NodeEditor {
    private hostDiv!: HTMLDivElement;
    private canvasElement!: HTMLCanvasElement;
    private canvasContext!: CanvasRenderingContext2D;
    private boardDiv!: HTMLDivElement;

    private inputState: {
        drag: DragAction | null;
        select: SelectAction | null;
    }

    private camera: Camera;

    private nodeEngine: NodeEngine;
    private glEnviroment: GlEnviroment;

    constructor(divId: string) {
        this.initializeHTML(divId);
        this.setInputHandlers();
        this.setButtonListeners();

        this.glEnviroment = new GlEnviroment('gl-output');
        this.nodeEngine = new NodeEngine(this.glEnviroment.uniforms, (code) => this.glEnviroment.refreshProgram(code));

        const output = new Node.OutputNode(this.nodeEngine, new Vector2());
        const separate = new Node.SeparateNode(this.nodeEngine, new Vector2(-5));
        output.input[0].connection = [separate.output[0].uId, separate.output[0].type];
        this.nodeEngine.addNode(output);
        this.nodeEngine.addNode(separate);

        this.camera = new Camera(new Vector2(), 1, new Vector2(this.boardDiv.clientWidth, this.boardDiv.clientHeight));
        this.addNodesToBoard();

        NodeCompiler.getInstance().compile();

        this.inputState = {
            drag: null,
            select: null,
        };


    }

    initializeHTML(divId: string) {
        this.hostDiv = document.getElementById(divId) as HTMLDivElement;
        if (!this.hostDiv) throw Error("Couldn't find div with id: " + divId)

        const ui = document.createElement('template');
        ui.innerHTML = `
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column">
            <div style="margin: 0 8px">
                <button id="btn-save">Save</button>
                <button id="btn-load">Load</button>
                <button id="3">3</button>
            </div>
            <div style="display: flex; flex-direction: row; flex-grow:1;">
                <div style="position: relative; margin: 8px;">
                    <canvas style="height: 100%; width: 100%;"></canvas>
                    <div id="board" style="height: 100%; width: 100%; position: absolute; left:0; top:0; overflow: hidden;" tabindex="0"></div>
                </div>
                <div style="margin: 8px;">
                    <canvas id="gl-output" height=300 width=300></canvas>
                </div>
            </div>
            <div style="display: flex; gap: 1rem; margin: 0 8px">
                <div class="button-field">
                    <h4>Input</h4>
                    <div>
                        <button id="btn-coordinates">Coordinates</button>
                    </div>
                </div>
                <div class="button-field">
                    <h4>Conversion</h4>
                    <div>
                        <button id="btn-separate">Separate</button>
                        <button id="btn-join">Join</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        this.hostDiv.appendChild(ui.content);
        this.canvasElement = this.hostDiv.getElementsByTagName('canvas').item(0) as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d')!;
        this.canvasElement.width = this.canvasElement.getBoundingClientRect().width;
        this.canvasElement.height = this.canvasElement.getBoundingClientRect().height;

        this.boardDiv = document.getElementById('board') as HTMLDivElement;
    }

    addNodesToBoard() {
        this.boardDiv.replaceChildren();
        for (const node of this.nodeEngine.getNodes()) {
            node.destroy();
            const template = document.createElement('template');
            template.innerHTML = node.getHtml();
            this.boardDiv.appendChild(template.content);
            node.setHTMLElement();
            node.setListeners();
            this.setNodePosition(node);
        }
        this.drawConnections();
    }



    private setInputHandlers() {
        this.boardDiv.addEventListener('mousedown', (ev) => {
            if (ev.button == 0) {
                this.inputState.drag = getDragAction(ev, this.camera, this.canvasElement);
                if (this.inputState.select && this.inputState.select.id != this.inputState.drag?.id)
                    this.nodeEngine.getNodeById(this.inputState.select.id)!.setSelection(false);


                if (this.inputState.drag?.element == 'node') {
                    this.inputState.select = {
                        element: 'node',
                        id: this.inputState.drag.id!
                    };
                    this.nodeEngine.getNodeById(this.inputState.select.id)!.setSelection(true);
                } else {
                    if (this.inputState.select) {
                        this.nodeEngine.getNodeById(this.inputState.select.id)!.setSelection(false);
                    }
                    this.inputState.select = null;
                }

            }

        });

        this.boardDiv.addEventListener('mouseup', (ev) => {
            if (this.inputState.drag?.element == 'socket' && (ev.target as HTMLElement)?.id.includes('socket-')) {
                try {
                    this.nodeEngine.createConnection(this.inputState.drag.id!, (ev.target as HTMLElement).dataset.socketId!);
                } catch (error) {
                    throw error;
                } finally {
                    if (this.inputState.drag) this.inputState.drag = null;
                }

                this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
                this.drawConnections();

            }

            if (this.inputState.drag) this.inputState.drag = null;
        });

        this.boardDiv.addEventListener('mousemove', (ev) => {
            this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            this.drawConnections();

            if (this.inputState.drag) {
                switch (this.inputState.drag.element) {
                    case 'node':
                        {
                            const htmlNode = this.inputState.drag.htmlElement!;
                            const newPos = new Vector2((this.inputState.drag.elementPos!.x + ev.clientX - this.inputState.drag.initialMousePos.x), (this.inputState.drag.elementPos!.y + ev.clientY - this.inputState.drag.initialMousePos.y));
                            htmlNode.style.top = newPos.y + 'px';
                            htmlNode.style.left = newPos.x + 'px';

                            const node = this.nodeEngine.getNodeById(this.inputState.drag.id!)!;
                            node.position = this.camera.convertRasterToWorld(newPos);
                            break;
                        }
                    case 'board':
                        {
                            const mouseWorldPos = this.camera.convertRasterToWorld(new Vector2(ev.clientX, ev.clientY));
                            this.camera.position = this.camera.position.sub(mouseWorldPos.sub(this.inputState.drag.initialMousePosWorld));

                            for (const n of this.nodeEngine.getNodes()) {
                                this.setNodePosition(n);
                            }
                            break;
                        }
                    case 'socket':
                        {


                            const socket = this.nodeEngine.getSocketById(this.inputState.drag.id!)!;



                            const mousePos = new Vector2(ev.clientX - this.canvasElement.getBoundingClientRect().left, ev.clientY - this.canvasElement.getBoundingClientRect().top);

                            if (socket.role == 'input') {
                                if (socket.connection) {
                                    const outputSocketId = socket.connection[0];
                                    const outputSocket = document.getElementById(`socket-${socket.connection[0]}`)!;
                                    this.inputState.drag.id = outputSocketId;
                                    this.inputState.drag.htmlElement = outputSocket;

                                    this.nodeEngine.deleteConnection(socket.uId);
                                    this.canvasContext.beginPath();
                                    this.setConnectionPath(mousePos, this.getSocketElementCenter(outputSocket));
                                    this.canvasContext.stroke();
                                } else {
                                    this.canvasContext.beginPath();
                                    this.setConnectionPath(mousePos, this.getSocketElementCenter(this.inputState.drag.htmlElement!));
                                    this.canvasContext.stroke();
                                }
                            } else {
                                this.canvasContext.beginPath();
                                this.setConnectionPath(this.getSocketElementCenter(this.inputState.drag.htmlElement!), mousePos);
                                this.canvasContext.stroke();
                            }


                            break;
                        }
                }
            }
        });

        this.boardDiv.addEventListener('wheel', (ev) => {
            if (ev.deltaY > 0) {
                this.camera.zoom = Math.min(this.camera.zoom + 1, 10);
            }
            if (ev.deltaY < 0) {
                this.camera.zoom = Math.max(this.camera.zoom - 1, 1);
            }

            for (const n of this.nodeEngine.getNodes()) {
                n.getOuterElement()!.style.transform = `scale(${1 / this.camera.zoom})`;
                n.getOuterElement()!.style.transformOrigin = `top left`;
                this.setNodePosition(n);
            }

            this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
            this.drawConnections();

        });

        this.boardDiv.addEventListener('keydown', (ev) => {
            console.log(ev.code)
            switch (ev.code) {
                case 'KeyX':
                case 'Delete':
                    if (this.inputState.select) {
                        const node = this.nodeEngine.getNodeById(this.inputState.select.id)!;
                        if (this.nodeEngine.removeNode(node))
                            this.inputState.select = null;
                    }
                    break;
            }
        });
    }

    private setButtonListeners() {
        document.getElementById('btn-save')!.addEventListener('click', () => {
            const file = new Blob([JSON.stringify(this.nodeEngine.exportNodes())], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'nodes.json';
            a.click();
            a.remove();
        });
        document.getElementById('btn-load')!.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.addEventListener('change', () => {
                if (input.files) {
                    const file = input.files[0];
                    file.text().then((val) => {
                        console.log(val)
                        this.nodeEngine.importNodes(JSON.parse(val));
                        this.addNodesToBoard();
                    })
                }
            })
            input.click();
        });

        this.setNodeButtonListeners([
            ['btn-coordinates', Node.CoordinatesNode],
            ['btn-separate', Node.SeparateNode],
        ]);
    }

    private setNodeButtonListeners(buttonEntries: [string, new (...args: any[]) => BaseNode][]) {
        for (const button of buttonEntries) {
            document.getElementById(button[0])!.addEventListener('click', () => {
                this.nodeEngine.addNode(new button[1](this.nodeEngine , this.camera.position.copy()));
                this.addNodesToBoard();
            });
        }
    }

    private getSocketElementCenter(socketElement: HTMLElement): Vector2 {
        const borderTotalIncrement = 4;
        const centerPoint = new Vector2(socketElement.getBoundingClientRect().left + ((socketElement.getBoundingClientRect().width - borderTotalIncrement) / 2),
            socketElement.getBoundingClientRect().top + ((socketElement.getBoundingClientRect().height - borderTotalIncrement) / 2));
        const correctedCenter = centerPoint.sub(new Vector2(this.canvasElement.getBoundingClientRect().left, this.canvasElement.getBoundingClientRect().top));

        return correctedCenter;

    }

    private setConnectionPath(p1: Vector2, p2: Vector2) {
        if ((p1.sub(p2)).length < 200) {
            this.canvasContext.moveTo(p1.x, p1.y);
            this.canvasContext.lineTo(p2.x, p2.y);
        } else {
            cubicBelzier(this.canvasContext, [
                p1,
                p1.add(new Vector2(100, 0)),
                p2.add(new Vector2(-100, 0)),
                p2
            ]);
        }
    }

    private drawConnections() {
        this.canvasContext.strokeStyle = 'white';
        this.canvasContext.lineWidth = 2;
        const connections = this.nodeEngine.getConnections();
        this.canvasContext.beginPath();

        for (const connection of connections) {
            const socket1 = document.getElementById(`socket-${connection[0]}`)!;
            const socket2 = document.getElementById(`socket-${connection[1]}`)!;

            const centerPoint1 = this.getSocketElementCenter(socket1);
            const centerPoint2 = this.getSocketElementCenter(socket2);

            this.setConnectionPath(centerPoint1, centerPoint2);
        }

        this.canvasContext.stroke();
    }

    setNodePosition(node: BaseNode) {
        const screenPos = this.camera.convertWorldToRaster(node.position);
        const nodeElem = node.getOuterElement()!;
        nodeElem.style.left = screenPos.x + 'px';
        nodeElem.style.top = screenPos.y + 'px';
    }
}