import { AbstractComponent } from "./gui/proto-components/abstract-component";
import { GuiEngine } from "./gui/gui-engine";
import { InputProcessor } from "./input/input-processor";
import { Vector2 } from "./math/vector";
import { InputState } from "./input/input-state";
import { isMouseListener } from "./gui/proto-components/mouse-listener";

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
        this.processInput();
        window.requestAnimationFrame(this.loopProcedure.bind(this));
    }

    private processInput() {
        const inputState = this.inputProcessor.getInputState();
        if (inputState.mouseRawPosition)
            this.processMouseInput(this.rootComponent, inputState);
    }

    private processMouseInput(component: AbstractComponent, inputState: InputState): boolean {
        const childrenUnderCursor = component.getChildren().filter(c => this.guiEngine.isInsideBoundaries(c, inputState.mouseRawPosition!));

        for (const child of childrenUnderCursor) {
            if (!this.processMouseInput(child, inputState)) return false;
        }
        if (isMouseListener(component) && inputState.click) return component.click?.call(component) ?? true;
        return true;
    }

}