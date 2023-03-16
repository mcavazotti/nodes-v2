import { ColorRGB } from "../../../core/math/color";
import { Vector2 } from "../../../core/math/vector";
import { BaseNode } from "../../core/base-node";
import { NodeClass, NodeId } from "../../core/types/node-classes";
import { SocketType } from "../../core/types/socket-types";

export class OutputNode extends BaseNode {
    nodeId = NodeId.output;

    constructor(pos: Vector2) {
        super(pos, NodeClass.output,
            [{ label: 'Color', role: 'input', hidden: false, type: SocketType.color, value: new ColorRGB(0, 0, 0) }],
            [],
        );
        this._label = 'Output';

    }
    code(): string {
        throw new Error("Method not implemented.");
    }
    definitions(): [string, string][] {
        throw new Error("Method not implemented.");
    }
}