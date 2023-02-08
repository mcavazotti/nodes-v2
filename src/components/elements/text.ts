import { AbstractComponent, RenderFunc } from "../../core/gui/abstract-component";
import { PreferedSizeComponent } from "../../core/gui/directives/prefered-size-component";
import { GuiEngine } from "../../core/gui/gui-engine";
import { Vector2 } from "../../core/math/vector";

export class Text extends AbstractComponent implements PreferedSizeComponent {
    private text: string;
    private style: string;
    private color: string;

    constructor({ text, style, color }: { text: string, style?: string, color?: string; }) {
        super();
        this.text = text;
        this.style = style ?? 'normal 12px serif';
        this.color = color ?? 'black';
    }

    preferedSize(): Vector2 {
        let context = GuiEngine.getInstance().canvasContext;
        context.font = this.style;
        let metrics = context.measureText(this.text);
        return new Vector2(metrics.width, metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
    }

    renderProcedure(): RenderFunc {
        return (ctx) => {
            ctx.font = this.style;
            ctx.fillStyle = this.color;
            ctx.textBaseline = 'top';
            ctx.fillText(this.text, this.position!.x, this.position!.y);
        }
    }

}