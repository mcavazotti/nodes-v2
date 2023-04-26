import { Vector2 } from "../../../core/math/vector";
import { BaseNode } from "../../core/base-node";
import { NodeEngine } from "../../core/node-engine";
import { NodeClass, NodeId } from "../../core/types/node-classes";
import { SocketType } from "../../core/types/socket-types";

export class CoordinatesNode extends BaseNode {
    nodeId = NodeId.coordinates;

    constructor(engine: NodeEngine, pos: Vector2) {
        super(engine, pos, NodeClass.input,
            [],
            [{ label: 'Coord', role: 'output', hidden: false, type: SocketType.vector2 }]);
        this._label = 'Coordinates';

    }

    code(): string {
        return `vec2 ${this.output[0].getVariableName()} = gl_FragCoord.xy / uResolution;\n`;
    }

    definitions(): [string, string][] {
        return []
    }
}