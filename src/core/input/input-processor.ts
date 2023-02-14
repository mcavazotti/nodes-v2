import { Vector2 } from "../math/vector";
import { MouseInputType } from "./input-enums";
import { InputState } from "./input-state"

export class InputProcessor {
    private inputState: InputState = {};
    constructor(private canvasElement: HTMLCanvasElement) {

        canvasElement.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        canvasElement.addEventListener("mousemove", (event) => {
            let rect = canvasElement.getBoundingClientRect()
            let vec = new Vector2(event.clientX - rect.left, event.clientY - rect.top);
            this.inputState.mouseRawPosition = vec;
        });

        canvasElement.addEventListener('mousedown', (event) => {
            if (!this.inputState.mouseButtonDown)
                this.inputState.mouseButtonDown = new Set();

            switch (event.button) {
                case 0:
                    this.inputState.mouseButtonDown.add(MouseInputType.leftButton);
                    break;
                case 1:
                    this.inputState.mouseButtonDown.add(MouseInputType.middleButton);
                    break;
                case 2:
                    this.inputState.mouseButtonDown.add(MouseInputType.rightButton);
                    break;

                default:
                    break;
            }
        });

        canvasElement.addEventListener('mouseup', (event) => {
            let mouseButton: MouseInputType | null = null;
            switch (event.button) {
                case 0:
                    mouseButton = MouseInputType.leftButton;
                    break;
                case 1:
                    mouseButton = MouseInputType.middleButton;
                    break;
                case 2:
                    mouseButton = MouseInputType.rightButton;
                    break;

                default:
                    break;
            }
            this.inputState.mouseButtonUp = mouseButton!;
        });

        canvasElement.addEventListener('click', () => {
            this.inputState.click = true;
        });
        canvasElement.addEventListener('dblclick', () => {
            this.inputState.doubleClick = true;
        });

        canvasElement.addEventListener("wheel", (event) => {
            let wheelDirection = event.deltaY < 0 ? MouseInputType.scrollUp : MouseInputType.scrollDown;
            this.inputState.mouseScroll = wheelDirection;
        });

        canvasElement.addEventListener('keydown', (event) => {
            if (!this.inputState.keysDown)
                this.inputState.keysDown = new Set();
            this.inputState.keysDown.add(event.code);
        });

        canvasElement.addEventListener('keyup', (event) => {
            this.inputState.keysDown?.delete(event.code);
            this.inputState.keyUp = event.code;
        });
    }

    getInputState(): InputState {
        const state = {
            ...this.inputState,
            mouseButtonDown: new Set(this.inputState.mouseButtonDown),
            keysDown: new Set(this.inputState.keysDown)
        };
        this.inputState.mouseButtonUp = undefined;
        this.inputState.keyUp = undefined;
        this.inputState.click = undefined;
        this.inputState.doubleClick = undefined;
        this.inputState.mouseScroll = null;
        return state;
    }
}