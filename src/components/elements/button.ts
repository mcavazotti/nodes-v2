import { AbstractComponent, RenderFunc } from "../../core/gui/proto-components/abstract-component";
import { ClickEventFn, MouseListener } from "../../core/gui/proto-components/mouse-listener";
import { isPreferedSize, PreferedSize } from "../../core/gui/proto-components/prefered-size";
import { Vector2 } from "../../core/math/vector";

export class Button extends AbstractComponent implements MouseListener, PreferedSize {
    click?: ClickEventFn;

    constructor({ child, click }: { child?: AbstractComponent, click?: ClickEventFn }) {
        super();
        if (child) this.children = [child];
        else this.children = [];
        if (click) {
            this.click = () => {
                return click() ?? false;
            };
        }
    }

    preferedSize(): Vector2 {
        if (this.children) {
            if (isPreferedSize(this.children[0])) return this.children[0].preferedSize();
        }
        return new Vector2(NaN, NaN);
    }

    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft, availableSpace);
        this.children![0].generateLayout(topLeft, availableSpace);
    }

    renderProcedure(): RenderFunc {
        return (ctx) => {
            // TODO: use theme
            ctx.strokeStyle = 'red';
            ctx.strokeRect(this.position!.x, this.position!.y, this.size!.x, this.size!.y);
        }
    }

}