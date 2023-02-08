import { AbstractComponent, RenderFunc } from "../../core/gui/abstract-component";
import { PreferedSizeComponent } from "../../core/gui/directives/prefered-size-component";
import { Vector2 } from "../../core/math/vector";

export class TopBar extends AbstractComponent implements PreferedSizeComponent {
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
            ctx.fillStyle = 'tomato';
            ctx.fillRect(this.position!.x, this.position!.y, this.size!.x, this.size!.y);
        }
    }
}