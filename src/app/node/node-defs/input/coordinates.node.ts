import { Vector2 } from "../../../core/math/vector";
import { BaseNode } from "../../core/base-node";
import { NodeClass, NodeId } from "../../core/types/node-classes";
import { SocketType } from "../../core/types/socket-types";

export class CoordinatesNode extends BaseNode {
    nodeId = NodeId.coordinates;
    
    constructor(pos: Vector2) {
        super(pos, NodeClass.input,
            [],
            [{ label: 'Coord', role: 'output', hidden: false, type: SocketType.vector2 }]);
        this._label = 'Coordinates';

    }
    code(): string {
        throw new Error("Method not implemented.");
    }
    definitions(): [string, string][] {
        throw new Error("Method not implemented.");
    }


}