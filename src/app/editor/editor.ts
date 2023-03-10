import { Vector2 } from "../core/math/vector";
import { CoordinatesNode } from "../node/node-defs/input/coordinates.node";

export class NodeEditor {
    private hostDiv: HTMLDivElement;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private boardDiv: HTMLDivElement;

    constructor(divId: string) {
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

        const node = new CoordinatesNode(new Vector2());
        const template = document.createElement('template');
        template.innerHTML = node.getHtml();

        this.boardDiv.appendChild(template.content);

        let drag: boolean = false;
        let dragNode: HTMLDivElement;
        let nodePos: Vector2;
        let initialPos: Vector2;

        this.boardDiv.addEventListener('mousedown', (ev) => {
            let element = ev.target as HTMLElement;
            while(element && !element?.id.includes('node-')) element = element.parentElement!;

            
            if (element) {
                dragNode = element as HTMLDivElement;
                drag = true;
                initialPos = new Vector2(ev.clientX, ev.clientY);
                nodePos = new Vector2(dragNode.offsetLeft, dragNode.offsetTop);
            }
        });

        this.boardDiv.addEventListener('mouseup', (ev) => {
            if (drag) drag = false;
        });

        this.boardDiv.addEventListener('mousemove', (ev) => {
            if (drag) {
                dragNode.style.top = (nodePos.y + ev.clientY - initialPos.y) + 'px';
                dragNode.style.left = (nodePos.x + ev.clientX - initialPos.x) + 'px';
            }
        });

        const button = document.getElementById('1') as HTMLButtonElement;
    }


}