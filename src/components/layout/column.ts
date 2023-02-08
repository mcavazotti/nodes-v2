import { AbstractComponent } from "../../core/gui/abstract-component";
import { LayoutComponent } from "../../core/gui/layout-component";
import { PreferedSizeComponent } from "../../core/gui/directives/prefered-size-component";
import { Vector2 } from "../../core/math/vector";
import { MainAxisJustify } from "../../core/gui/constants/enums";

export class Column extends LayoutComponent {
    private justify: MainAxisJustify;

    constructor({ children, justify }: { children?: AbstractComponent[], justify?: MainAxisJustify }) {
        super();
        this.children = children ?? [];
        this.justify = justify ?? MainAxisJustify.start;
    }

    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft, availableSpace);

        let childrenHeight: number[] = [];
        let pendingSizeCount = 0;
        this.children!.forEach(c => {
            if ('preferedSize' in (c as PreferedSizeComponent))
                childrenHeight.push((c as PreferedSizeComponent).preferedSize().x);
            else {
                childrenHeight.push(NaN);
                pendingSizeCount++;
            }
        });

        let totalHeight = childrenHeight.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
        if (totalHeight > availableSpace.y) {
            childrenHeight = childrenHeight.map(h => isNaN(h) ? NaN : h / (totalHeight / availableSpace.y));
            totalHeight = availableSpace.y;
        }
        let remainingHeight = availableSpace.y - totalHeight;
        let dividedHeight = remainingHeight / pendingSizeCount;

        let anchor = topLeft.y;

        if (this.justify == MainAxisJustify.end) anchor += remainingHeight;
        if (this.justify == MainAxisJustify.center) anchor += remainingHeight / 2;

        let gap = remainingHeight / (this.children!.length - 1)

        this.children!.forEach((c, idx) => {
            if (isNaN(childrenHeight[idx])) {
                c.generateLayout(new Vector2(topLeft.x, anchor), new Vector2(availableSpace.x, dividedHeight));
                anchor += dividedHeight;
            } else {
                c.generateLayout(new Vector2(topLeft.x, anchor), new Vector2(availableSpace.x, childrenHeight[idx]));
                anchor += childrenHeight[idx];
            }
            if (idx < this.children!.length && this.justify == MainAxisJustify.spaceAround) {
                anchor += gap;
            }
        });
    }
}