import { Vector2, Vector3, Vector4 } from "../../../core/math/vector";
import { BaseNode } from "../../core/base-node";
import { convertSocketTypes } from "../../core/compiler/code-gen-helpers";
import { NodeParameter } from "../../core/node-parameter";
import { Socket } from "../../core/socket";
import { NodeClass, NodeId } from "../../core/types/node-classes";
import { SocketType } from "../../core/types/socket-types";
import { SelectorParam } from "../../node-parameters/selector.parameter";

export class SeparateNode extends BaseNode {
    private vectorType: 'v2' | 'v3' | 'v4' = 'v2';

    readonly nodeId = NodeId.separate;
    constructor(pos: Vector2) {
        super(pos, NodeClass.transform,
            [
                { label: 'Vector', role: 'input', type: SocketType.vector2, value: new Vector2() },
                { label: 'Vector', role: 'input', type: SocketType.vector3, value: new Vector3(), hidden: true },
                { label: 'Vector', role: 'input', type: SocketType.vector4, value: new Vector4(), hidden: true },
            ],
            [
                { label: 'x', role: 'output', type: SocketType.float },
                { label: 'y', role: 'output', type: SocketType.float },
                { label: 'z', role: 'output', type: SocketType.float, hidden: true },
                { label: 'w', role: 'output', type: SocketType.float, hidden: true },
            ],
            [
                new SelectorParam('Type', [
                    { label: '2D Vector', value: 'v2' },
                    { label: '3D Vector', value: 'v3' },
                    { label: '4D Vector', value: 'v4' },
                ],
                    (val) => {
                        switch (val) {
                            case 'v2':
                                this._label = 'Separate XY';
                                this._input.forEach((s, idx) => {
                                    s.hidden = idx != 0;
                                    if (s.hidden) s.connection = null
                                });
                                this._output.forEach((s, idx) => { s.hidden = idx > 1 });
                                break;
                            case 'v3':
                                this._label = 'Separate XYZ';
                                this._input.forEach((s, idx) => {
                                    s.hidden = idx != 1;
                                    if (s.hidden) s.connection = null
                                });
                                this._output.forEach((s, idx) => { s.hidden = idx > 2 });
                                break;
                            case 'v4':
                                this._label = 'Separate XYZW';
                                this._input.forEach((s, idx) => {
                                    s.hidden = idx != 2;
                                    if (s.hidden) s.connection = null
                                });
                                this._output.forEach((s, idx) => { s.hidden = idx > 3 });
                                break;
                        }

                        this.updateNode({ label: true, inputSockets: true, outputSockets: true });
                    }, 'v2') as NodeParameter<unknown>
            ]
        );

        this._label = 'Separate XY'
    }
    code(): string {
        let socket: Socket<unknown>;
        const vectorType = this._parameters[0].value as string;

        switch (vectorType) {
            case 'v2':
            default:
                socket = this._input[0];
                break;
            case 'v3':
                socket = this._input[1];
                break;
            case 'v4':
                socket = this._input[2];
                break;
        }

        let code: string;
        if (!socket.connection) {
            code = `
                float ${this._output[0].getVariableName()} = ${(socket.value! as Vector2).x.toFixed(2)};
                float ${this._output[1].getVariableName()} = ${(socket.value! as Vector2).y.toFixed(2)};\n`;
            if (vectorType == 'v3')
                code += `float ${this._output[2].getVariableName()} = ${(socket.value! as Vector3).z.toFixed(2)};\n`;
            if (vectorType == 'v4')
                code += `float ${this._output[2].getVariableName()} = ${(socket.value! as Vector4).w.toFixed(2)};\n`;
        }
        else {
            code = `
                float ${this._output[0].getVariableName()} = ${convertSocketTypes(socket.connection[1], socket.type, Socket.getVariableNameForId(socket.connection[0]))}.x;
                float ${this._output[1].getVariableName()} = ${convertSocketTypes(socket.connection[1], socket.type, Socket.getVariableNameForId(socket.connection[0]))}.y;\n`;
            if (vectorType == 'v3')
                code += `float ${this._output[2].getVariableName()} = ${convertSocketTypes(socket.connection[1], socket.type, Socket.getVariableNameForId(socket.connection[0]))}.z;\n`;
            if (vectorType == 'v4')
                code += `float ${this._output[2].getVariableName()} = ${convertSocketTypes(socket.connection[1], socket.type, Socket.getVariableNameForId(socket.connection[0]))}.w;\n`;
        }
        return code;

    }
    definitions(): [string, string][] {
        return [];
    }

} 