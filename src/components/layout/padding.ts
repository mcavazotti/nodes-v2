import { AbstractComponent } from "../../core/gui/abstract-component";
import { LayoutComponent } from "../../core/gui/layout-component";
import { Vector2 } from "../../core/math/vector";

export class Padding extends LayoutComponent {
    paddingTopLeft: Vector2;
    paddingBottomRight: Vector2;
    constructor({
        child,
        all,
        vertical, horizontal,
        top, bottom, left, right
    }: {
        child: AbstractComponent,
        all?: number,
        vertical?: number, horizontal?: number,
        top?: number, bottom?: number, left?: number, right?: number
    }) {
        super();
        this.children = [child];

        let t = top ?? vertical ?? all ?? 0;
        let b = bottom ?? vertical ?? all ?? 0;
        let l = left ?? horizontal ?? all ?? 0;
        let r = right ?? horizontal ?? all ?? 0;

        this.paddingTopLeft = new Vector2(l, t);
        this.paddingBottomRight = new Vector2(r, b);
    }

    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft, availableSpace);
        this.children![0].generateLayout(topLeft.add(this.paddingTopLeft), availableSpace.sub(this.paddingTopLeft).sub(this.paddingBottomRight));
    }
}