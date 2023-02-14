import { AbstractComponent, RenderFunc } from "./abstract-component";

export abstract class LayoutComponent extends AbstractComponent {
    renderProcedure(): RenderFunc {
        return (_ctx) => { };
    }
}