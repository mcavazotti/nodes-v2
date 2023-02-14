import { Vector2 } from "../math/vector";
import { MouseInputType } from "./input-enums";

export interface InputState {
    mousePosition?: Vector2;
    mouseRawPosition?: Vector2;
    mouseButtonDown?: Set<MouseInputType>;
    mouseButtonUp?: MouseInputType;
    click?:boolean;
    doubleClick?:boolean;
    mouseMovement?: Vector2;
    mouseScroll?: MouseInputType.scrollDown | MouseInputType.scrollUp | null;
    keysDown?: Set<string>;
    keyUp?: string;
}