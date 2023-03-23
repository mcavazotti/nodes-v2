import { ColorRGB, ColorRGBA } from "../../../core/math/color";
import { Vector2 } from "../../../core/math/vector";
import { BaseNode } from "../../core/base-node";
import { convertSocketTypes } from "../../core/compiler/code-gen-helpers";
import { Socket } from "../../core/socket";
import { NodeClass, NodeId } from "../../core/types/node-classes";
import { SocketType } from "../../core/types/socket-types";

export class OutputNode extends BaseNode {
    nodeId = NodeId.output;

    constructor(pos: Vector2) {
        super(pos, NodeClass.output,
            [{ label: 'Color', role: 'input', hidden: false, type: SocketType.color, value: new ColorRGBA(0, 0, 0,1) }],
            [],
        );
        this._label = 'Output';

    }
    code(): string {
            let code = "gl_FragColor = ";
            let socket = this._input[0] as Socket<ColorRGBA>;
            if (!socket.connection) {
                code += `vec4${socket.value!.toString()}`;
            }
            else {
                code += convertSocketTypes(socket.connection[1], socket.type, Socket.getVariableNameForId(socket.connection[0]));
            }
            return code + ";\n";
        
    }
    definitions(): [string, string][] {
        return [];
    }
}