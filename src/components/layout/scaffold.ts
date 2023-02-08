import { AbstractComponent } from "../../core/gui/abstract-component";
import { PreferedSizeComponent } from "../../core/gui/directives/prefered-size-component";
import { LayoutComponent } from "../../core/gui/layout-component";
import { Vector2 } from "../../core/math/vector";

export class Scaffold extends LayoutComponent {
    private topBar?: PreferedSizeComponent;
    private body?: AbstractComponent;
    constructor({ topBar, body }: { topBar?: PreferedSizeComponent, body?: AbstractComponent }) {
        super()
        this.topBar = topBar;
        this.body = body;
        this.children = [];
        if (topBar) {
            this.children.push(topBar);
            topBar.setParent(this);
        }
        if (body) {
            this.children.push(body);
            body.setParent(this);
        }
    }

    generateLayout(topLeft: Vector2, availableSpace: Vector2): void {
        super.generateLayout(topLeft,availableSpace);

        let anchor = topLeft.copy();
        if (this.topBar) {
            let topBarPreferedSize = this.topBar.preferedSize();
            this.topBar.generateLayout(anchor, new Vector2(availableSpace.x, topBarPreferedSize.y));
            anchor = anchor.add(new Vector2(0, topBarPreferedSize.y));
        }
        if (this.body) {
            this.body.generateLayout(anchor, new Vector2(availableSpace.x, availableSpace.y - (anchor.y - topLeft.y)));
        }
    }
}