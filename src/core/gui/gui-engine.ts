import { AbstractComponent, RenderFunc } from "./abstract-component";

export class GuiEngine {
    private static instance: GuiEngine
    private _canvasElement: HTMLCanvasElement;
    private _canvasContext: CanvasRenderingContext2D;

    get canvasElement() {
        return this._canvasElement;
    }

    get canvasContext() {
        return this._canvasContext;
    }


    private constructor(canvasId: string) {
        let element = document.getElementById(canvasId);
        if (!element) throw Error(`Couldn't find element with id: "${canvasId}"`);
        if (!(element instanceof HTMLCanvasElement)) throw Error(`Element with id "${canvasId}" is not a Canvas Element`);
        this._canvasElement = element;

        let context = element.getContext('2d');
        if (!context) throw Error("Failed to get Canvas context");

        this._canvasContext = context;
    }
    public static getInstance() {
        if (!GuiEngine.instance) throw Error("GuiEngine was not initialized");

        return GuiEngine.instance;
    }

    public static initialize(canvasId: string) {
        if (GuiEngine.instance) throw Error("GuiEngine has already been initialized");
        GuiEngine.instance = new GuiEngine(canvasId);
    }

    render(root: AbstractComponent): void {
        let componentQueue = [root];
        let renderProcs: RenderFunc[] = [];

        while (componentQueue.length > 0) {
            let comp = componentQueue.shift();
            renderProcs.push(comp!.renderProcedure());
            componentQueue.push(...comp!.getChildren());
        }
        renderProcs.forEach(proc => proc(this.canvasContext));
    }
}