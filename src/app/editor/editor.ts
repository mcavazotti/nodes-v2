import { Vector2 } from "../core/math/vector";
import { Camera } from "../core/render/camera";
import { BaseNode } from "../node/core/base-node";
import { NodeEngine } from "../node/core/node-engine";
import { OutputNode } from "../node/node-defs/output/output.node";
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

    private nodeEngine: NodeEngine;

    constructor(divId: string) {
        this.nodeEngine = new NodeEngine();

        this.nodeEngine.addNode(new OutputNode(new Vector2()));

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
                <button id="save">Save</button>
                <button id="load">Load</button>
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
        this.boardDiv.replaceChildren();
        for (const node of this.nodeEngine.getNodes()) {
            node.destroy();
            this.boardDiv.appendChild(node.generateTemplate().content);
            node.setListeners();
            this.setNodePosition(node);
        }
    }



    setInputHandlers() {
        this.boardDiv.addEventListener('mousedown', (ev) => {
            if (ev.button == 0)
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

                            const node = this.nodeEngine.getNodeById(this.inputState.drag.id!.replace('node-', ''))!;
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
                }
            }
        });

        this.boardDiv.addEventListener('wheel', (ev) => {

            // const mouseWorldPos = this.camera.convertRasterToWorld(new Vector2(ev.clientX, ev.clientY));

            if (ev.deltaY > 0) {
                this.camera.zoom = Math.min(this.camera.zoom + 1, 10);
            }
            if (ev.deltaY < 0) {
                this.camera.zoom = Math.max(this.camera.zoom - 1, 1);
            }

            // const newMouseWorldPos = this.camera.convertRasterToWorld(new Vector2(ev.clientX, ev.clientY));
            // const offset = newMouseWorldPos.sub(mouseWorldPos);
            // this.camera.position = this.camera.position.sub(offset);
            // console.log(this.camera.position.toJSON());

            for (const n of this.nodeEngine.getNodes()) {
                n.getOuterElement()!.style.transform = `scale(${1 / this.camera.zoom})`;
                this.setNodePosition(n);
            }



        });

        document.getElementById('save')!.addEventListener('click', () => {
            const file = new Blob([JSON.stringify(this.nodeEngine.exportNodes())], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(file);
            a.download = 'nodes.json';
            a.click();
            a.remove();
        })
        document.getElementById('load')!.addEventListener('click', () => {
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
        })

    }

    setNodePosition(node: BaseNode) {
        const screenPos = this.camera.convertWorldToRaster(node.position);
        const nodeElem = node.getOuterElement()!;
        nodeElem.style.left = screenPos.x + 'px';
        nodeElem.style.top = screenPos.y + 'px';
    }
}