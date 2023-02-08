import { AbstractComponent } from "./gui/abstract-component";
import { GuiEngine } from "./gui/gui-engine";
import { InputProcessor } from "./input/input-processor";
import { Vector2 } from "./math/vector";

export class CanvasApp {
    private canvasElement: HTMLCanvasElement;
    private inputProcessor: InputProcessor;
    private guiEngine: GuiEngine;
    constructor(canvasId: string, private rootComponent: AbstractComponent) {

        GuiEngine.initialize(canvasId);
        this.guiEngine = GuiEngine.getInstance();

        this.canvasElement = this.guiEngine.canvasElement;
        this.inputProcessor = new InputProcessor(this.canvasElement);
    }

    start() {
        window.requestAnimationFrame(this.loopProcedure.bind(this));
    }

    private loopProcedure(time: number) {
        this.rootComponent.generateLayout(new Vector2(), new Vector2(this.canvasElement.width, this.canvasElement.height));
        this.guiEngine.render(this.rootComponent);
        // TODO: process input
        window.requestAnimationFrame(this.loopProcedure.bind(this));
    }
}