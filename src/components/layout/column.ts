import { AbstractComponent } from "../../core/gui/proto-components/abstract-component";
import { MainAxisJustify } from "../../core/gui/definitions/enums";
import { ArrayLayout } from "../../core/gui/proto-components/array-layout";

export class Column extends ArrayLayout {

    constructor({ children, justify }: { children?: AbstractComponent[], justify?: MainAxisJustify }) {
        super('y', { children: children, justify: justify });
    }
}