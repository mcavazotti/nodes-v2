import { AbstractComponent, RenderFunc } from "../../core/gui/proto-components/abstract-component";
import { PreferedSize } from "../../core/gui/proto-components/prefered-size";
import { Vector2 } from "../../core/math/vector";

export class TopBar extends AbstractComponent implements PreferedSize {
    height: number;
    constructor({ child, height }: { child?: AbstractComponent, height?: number }) {
        super();
        if (child)
            this.children = [child];

        this.height = height?? 50;
    }

    preferedSize(): Vector2 {
        return new Vector2(Infinity, this.height);
    }
    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft, availableSpace);
        if (this.children)
            this.children![0].generateLayout(topLeft, availableSpace);
    }

    renderProcedure(): RenderFunc {
        return (ctx) => {
            // ctx.fillStyle = 'tomato';
            ctx.strokeStyle ='black';
            ctx.strokeRect(this.position!.x, this.position!.y, this.size!.x, this.size!.y);
        }
    }
}