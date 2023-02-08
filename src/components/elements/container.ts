import { AbstractComponent, RenderFunc } from "../../core/gui/abstract-component";
import { Vector2 } from "../../core/math/vector";

export class Container extends AbstractComponent {
    constructor({ child }: { child?: AbstractComponent }) {
        super();
        if (child) this.children = [child];
        else this.children = [];
    }

    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft, availableSpace);
        this.children![0].generateLayout(topLeft, availableSpace);
    }

    renderProcedure(): RenderFunc {
        return (ctx) => {
            // TODO: use theme
            ctx.fillStyle = 'cyan';
            ctx.fillRect(this.position!.x, this.position!.y, this.size!.x, this.size!.y);
        }
    }

}