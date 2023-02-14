import { AbstractComponent } from "../../core/gui/proto-components/abstract-component";
import { MainAxisJustify } from "../../core/gui/definitions/enums";
import { ArrayLayout } from "../../core/gui/proto-components/array-layout";

export class Row extends ArrayLayout {
    constructor({ children, justify }: { children?: AbstractComponent[], justify?: MainAxisJustify }) {
        super('x', { children: children, justify: justify });
    }
}