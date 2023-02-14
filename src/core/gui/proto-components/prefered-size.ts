import { Vector2 } from "../../math/vector";

export function isPreferedSize(obj: any): obj is PreferedSize {
    return 'preferedSize' in obj;
}

export interface PreferedSize {
    preferedSize(): Vector2;
}