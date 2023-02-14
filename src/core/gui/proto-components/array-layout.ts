import { AbstractComponent } from "./abstract-component";
import { MainAxisJustify } from "../definitions/enums";
import { isPreferedSize, PreferedSize } from "./prefered-size";
import { LayoutComponent } from "./layout-component";
import { Vector2 } from "../../math/vector";

export abstract class ArrayLayout extends LayoutComponent {
    protected justify: MainAxisJustify;

    constructor(private axis: 'x' | 'y', { children, justify }: { children?: AbstractComponent[], justify?: MainAxisJustify }) {
        super();
        this.children = children ?? [];
        this.justify = justify ?? MainAxisJustify.start;
    }

    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft, availableSpace);

        let childrenSpace: number[] = [];
        let pendingSizeCount = 0;
        this.children!.forEach(c => {
            if (isPreferedSize(c))
                childrenSpace.push(c.preferedSize()[this.axis]);
            else {
                childrenSpace.push(NaN);
                pendingSizeCount++;
            }
        });

        let totalSpace = childrenSpace.reduce((a, b) => a + (isNaN(b) ? 0 : b), 0);
        if (totalSpace > availableSpace[this.axis]) {
            childrenSpace = childrenSpace.map(w => isNaN(w) ? NaN : w / (totalSpace / availableSpace[this.axis]));
            totalSpace = availableSpace[this.axis];
        }
        let remainingSpace = availableSpace[this.axis] - totalSpace;
        let dividedSpace = remainingSpace / pendingSizeCount;

        let anchor = topLeft[this.axis];

        if (this.justify == MainAxisJustify.end) anchor += remainingSpace;
        if (this.justify == MainAxisJustify.center) anchor += remainingSpace / 2;

        let gap = remainingSpace / (this.children!.length - 1)

        this.children!.forEach((c, idx) => {
            let childTopLeft: Vector2;
            let childAvailableSpace: Vector2;
            if (isNaN(childrenSpace[idx])) {
                if (this.axis == 'x') {
                    childTopLeft = new Vector2(anchor, topLeft.y);
                    childAvailableSpace = new Vector2(dividedSpace, availableSpace.y)
                }
                else {
                    childTopLeft = new Vector2(topLeft.x, anchor);
                    childAvailableSpace = new Vector2(availableSpace.x, dividedSpace)
                }

                anchor += dividedSpace;
            } else {
                if (this.axis == 'x') {
                    childTopLeft = new Vector2(anchor, topLeft.y);
                    childAvailableSpace = new Vector2(childrenSpace[idx], availableSpace.y)
                }
                else {
                    childTopLeft = new Vector2(topLeft.x, anchor);
                    childAvailableSpace = new Vector2(availableSpace.x, childrenSpace[idx])
                }
                anchor += childrenSpace[idx];
            }

            c.generateLayout(childTopLeft, childAvailableSpace);

            if (idx < this.children!.length && this.justify == MainAxisJustify.spaceAround) {
                anchor += gap;
            }
        });
    }
} 