import { AbstractComponent } from "../../core/gui/abstract-component";
import { LayoutComponent } from "../../core/gui/layout-component";
import { PreferedSizeComponent } from "../../core/gui/directives/prefered-size-component";
import { Vector2 } from "../../core/math/vector";
import { MainAxisJustify } from "../../core/gui/constants/enums";

export class Row extends LayoutComponent {
    private justify: MainAxisJustify;

    constructor({ children, justify }: { children?: AbstractComponent[], justify?: MainAxisJustify }) {
        super();
        this.children = children ?? [];
        this.justify = justify ?? MainAxisJustify.start;
    }

    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft, availableSpace);

        let childrenWidth: number[] = [];
        let pendingSizeCount = 0;
        this.children!.forEach(c => {
            if ('preferedSize' in (c as PreferedSizeComponent))
                childrenWidth.push((c as PreferedSizeComponent).preferedSize().x);
            else {
                childrenWidth.push(NaN);
                pendingSizeCount++;
            }
        });

        let totalWidth = childrenWidth.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
        if (totalWidth > availableSpace.x) {
            childrenWidth = childrenWidth.map(w => isNaN(w) ? NaN : w / (totalWidth / availableSpace.x));
            totalWidth = availableSpace.x;
        }
        let remainingWidth = availableSpace.x - totalWidth;
        let dividedWidth = remainingWidth / pendingSizeCount;

        let anchor = topLeft.x;

        if (this.justify == MainAxisJustify.end) anchor += remainingWidth;
        if (this.justify == MainAxisJustify.center) anchor += remainingWidth / 2;

        let gap = remainingWidth / (this.children!.length - 1)

        this.children!.forEach((c, idx) => {
            if (isNaN(childrenWidth[idx])) {
                c.generateLayout(new Vector2(anchor, topLeft.y), new Vector2(dividedWidth, availableSpace.y));
                anchor += dividedWidth;
            } else {
                c.generateLayout(new Vector2(anchor, topLeft.y), new Vector2(childrenWidth[idx], availableSpace.y));
                anchor += childrenWidth[idx];
            }
            if (idx < this.children!.length && this.justify == MainAxisJustify.spaceAround) {
                anchor += gap;
            }
        });
    }
}