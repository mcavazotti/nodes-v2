import { Vector2 } from "../math/vector";

export interface RenderFunc {
    (ctx: CanvasRenderingContext2D): void;
}

export abstract class AbstractComponent {
    protected position?: Vector2;
    protected size?: Vector2;
    protected parent?: AbstractComponent;
    protected children?: AbstractComponent[];
    abstract renderProcedure(): RenderFunc;

    getChildren(): AbstractComponent[] {
        if (this.children)
            return [...this.children];
        return [];
    }
    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        this.position = topLeft;
        this.size = availableSpace;
    }
    setParent(p: AbstractComponent) {
        this.parent = p;
    }
}