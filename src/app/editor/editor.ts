import { Vector2 } from "../core/math/vector";
import { Camera } from "../core/render/camera";
import { BaseNode } from "../node/core/base-node";
import { CoordinatesNode } from "../node/node-defs/input/coordinates.node";
import { DragAction, getDragAction } from "./input-handler";

export class NodeEditor {
    private hostDiv!: HTMLDivElement;
    private canvasElement!: HTMLCanvasElement;
    private canvasContext!: CanvasRenderingContext2D;
    private boardDiv!: HTMLDivElement;

    private inputState: {
        drag: DragAction | null;
    }

    private camera: Camera;

    private nodes: Map<string, BaseNode>;

    constructor(divId: string) {
        const node = new CoordinatesNode(new Vector2());
        this.nodes = new Map([[node.uId, node]]);

        this.initializeHTML(divId);
        this.camera = new Camera(new Vector2(), 1, new Vector2(this.boardDiv.clientWidth, this.boardDiv.clientHeight));
        this.setInputHandlers();
        this.addNodesToBoard();

        this.inputState = {
            drag: null
        };


    }

    initializeHTML(divId: string) {
        this.hostDiv = document.getElementById(divId) as HTMLDivElement;
        if (!this.hostDiv) throw Error("Couldn't find div with id: " + divId)

        const ui = document.createElement('template');
        ui.innerHTML = `
        <div style="height: 100%; width: 100%; display: flex; flex-direction: column;">
        <div>
        <button id="1">1</button>
        <button id="2">2</button>
        <button id="3">3</button>
        </div>
        <div style="position: relative">
                <canvas style="height: 100%; width: 100%;"></canvas>
                <div id="board" style="height: 100%; width: 100%; position: absolute; left:0; top:0; overflow: hidden;"></div>
            </div>
        </div>
        `;
        this.hostDiv.appendChild(ui.content);
        this.canvasElement = this.hostDiv.getElementsByTagName('canvas').item(0) as HTMLCanvasElement;
        this.canvasContext = this.canvasElement.getContext('2d')!;

        this.boardDiv = document.getElementById('board') as HTMLDivElement;
    }

    addNodesToBoard() {
        for (const node of this.nodes.values()) {
            node.destroy();
            this.boardDiv.appendChild(node.generateTemplate().content);
            this.setNodePosition(node);
        }
    }



    setInputHandlers() {
        this.boardDiv.addEventListener('mousedown', (ev) => {
            this.inputState.drag = getDragAction(ev, this.camera);

        });

        this.boardDiv.addEventListener('mouseup', (ev) => {
            if (this.inputState.drag) this.inputState.drag = null;
        });

        this.boardDiv.addEventListener('mousemove', (ev) => {
            if (this.inputState.drag) {
                switch (this.inputState.drag.element) {
                    case 'node':
                        {
                            const htmlNode = this.inputState.drag.htmlElement!;
                            const newPos = new Vector2((this.inputState.drag.elementPos!.x + ev.clientX - this.inputState.drag.initialMousePos.x), (this.inputState.drag.elementPos!.y + ev.clientY - this.inputState.drag.initialMousePos.y));
                            htmlNode.style.top = newPos.y + 'px';
                            htmlNode.style.left = newPos.x + 'px';

                            const node = this.nodes.get(this.inputState.drag.id!.replace('node-', ''))!;
                            node.position = this.camera.convertRasterToWorld(newPos);
                            break;
                        }
                    case 'board':
                        {
                            const mouseWorldPos = this.camera.convertRasterToWorld(new Vector2(ev.clientX, ev.clientY));
                            this.camera.position = this.camera.position.sub(mouseWorldPos.sub(this.inputState.drag.initialMousePosWorld));

                            for (const n of this.nodes.values()) {
                                this.setNodePosition(n);
                            }
                            break;
                        }
                }
            }
        });
    }

    setNodePosition(node: BaseNode) {
        const screenPos = this.camera.convertWorldToRaster(node.position);
        const nodeElem = node.getOuterElement()!;
        nodeElem.style.left = screenPos.x + 'px';
        nodeElem.style.top = screenPos.y + 'px';
    }
}