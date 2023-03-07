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
        const boxContent = document.createElement('template');
        boxContent.innerHTML = `
        <h2>Lorem Ipsum</h2>
        <input type="color">
        `;

        const box = document.createElement('div');
        box.appendChild(boxContent.content);
        box.style.backgroundColor = 'tomato';
        box.style.position = 'absolute';

        interface Coord {
            x: number, y: number
        }
        let click = false;
        let mousePos: Coord;
        let boxPos: Coord;
        let zoom = 10;
        this.boardDiv.addEventListener('wheel', (event) => {
            if (event.deltaY > 0) zoom = Math.min(zoom + 1, 20);
            if (event.deltaY < 0) zoom = Math.max(zoom - 1, 1);
            box.style.transform = `scale(${10/zoom})`
        });
        box.addEventListener('mousedown', (e) => {
            click = true;
            mousePos = { x: e.clientX, y: e.clientY };
            boxPos = { x: box.offsetLeft, y: box.offsetTop };
        });
        box.addEventListener('mouseup', () => {
            click = false;
        })
        box.addEventListener('mousemove', (e) => {
            if (click) {
                box.style.top = (boxPos.y + e.clientY - mousePos.y) + 'px';
                box.style.left = (boxPos.x + e.clientX - mousePos.x) + 'px';
            }
        })

        this.boardDiv.appendChild(box);

        const button = document.getElementById('1') as HTMLButtonElement;
    }


}