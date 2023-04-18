import { Vector2 } from "../math/vector";

export function cubicBelzier(context: CanvasRenderingContext2D, controlPoints: [Vector2, Vector2, Vector2, Vector2]) {
    // context.beginPath();
    context.moveTo(controlPoints[0].x, controlPoints[0].y);
    context.bezierCurveTo(
        controlPoints[1].x, controlPoints[1].y,
        controlPoints[2].x, controlPoints[2].y,
        controlPoints[3].x, controlPoints[3].y
    );
}