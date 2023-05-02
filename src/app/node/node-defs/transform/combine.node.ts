import { Vector2, Vector3, Vector4 } from "../../../core/math/vector";
import { BaseNode } from "../../core/base-node";
import { convertSocketTypes } from "../../core/compiler/code-gen-helpers";
import { NodeEngine } from "../../core/node-engine";
import { NodeParameter } from "../../core/node-parameter";
import { Socket } from "../../core/socket";
import { NodeClass, NodeId } from "../../core/types/node-classes";
import { SocketType } from "../../core/types/socket-types";
import { SelectorParam } from "../../node-parameters/selector.parameter";

export class CombineNode extends BaseNode {

    readonly nodeId = NodeId.combine;
    constructor(engine: NodeEngine, pos: Vector2) {
        super(engine, pos, NodeClass.transform,
            [
                { label: 'x', role: 'input', type: SocketType.float, value: 0 },
                { label: 'y', role: 'input', type: SocketType.float, value: 0 },
                { label: 'z', role: 'input', type: SocketType.float, value: 0, hidden: true },
                { label: 'w', role: 'input', type: SocketType.float, value: 0, hidden: true },
            ],
            [
                { label: 'Vector', role: 'output', type: SocketType.vector2, value: new Vector2() },
                { label: 'Vector', role: 'output', type: SocketType.vector3, value: new Vector3(), hidden: true },
                { label: 'Vector', role: 'output', type: SocketType.vector4, value: new Vector4(), hidden: true },
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
                                this._label = 'Combine XY';
                                this._output.forEach((s, idx) => {
                                    s.hidden = idx != 0;
                                    if (s.hidden) this.nodeEngine.deleteConnection(s.uId);
                                });
                                this._input.forEach((s, idx) => {
                                    s.hidden = idx > 1;
                                    if (s.hidden) this.nodeEngine.deleteConnection(s.uId);
                                });
                                break;
                            case 'v3':
                                this._label = 'Combine XYZ';
                                this._output.forEach((s, idx) => {
                                    s.hidden = idx != 1;
                                    if (s.hidden) this.nodeEngine.deleteConnection(s.uId);
                                });
                                this._input.forEach((s, idx) => {
                                    s.hidden = idx > 2;
                                    if (s.hidden) this.nodeEngine.deleteConnection(s.uId);
                                });
                                break;
                            case 'v4':
                                this._label = 'Combine XYZW';
                                this._output.forEach((s, idx) => {
                                    s.hidden = idx != 2;
                                    if (s.hidden) this.nodeEngine.deleteConnection(s.uId);
                                });
                                this._input.forEach((s, idx) => {
                                    s.hidden = idx > 3;
                                    if (s.hidden) this.nodeEngine.deleteConnection(s.uId);
                                });
                                break;
                        }

                        this.updateNode({ label: true, inputSockets: true, outputSockets: true });
                    }, 'v2') as NodeParameter<unknown>
            ]
        );

        this._label = 'Combine XY'
    }
    code(): string {
        let socket: Socket<unknown>;
        const vectorType = this._parameters[0].value as string;

        let code: string;

        switch (vectorType) {
            case 'v2':
            default:
                socket = this._output[0];
                code = `vec2 ${socket.getVariableName()} = vec2(`;
                break;
            case 'v3':
                socket = this._output[1];
                code = `vec3 ${socket.getVariableName()} = vec3(`;
                break;
            case 'v4':
                socket = this._output[2];
                code = `vec4 ${socket.getVariableName()} = vec4(`;
                break;
        }

        const x = this._input[0];
        const y = this._input[1];
        const z = this._input[2];
        const w = this._input[3];

        code += x.connection ? convertSocketTypes(x.connection[1], x.type, Socket.getVariableNameForId(x.connection[0])) : (x.value as number).toFixed(2);
        code += ', ';
        code += y.connection ? convertSocketTypes(y.connection[1], y.type, Socket.getVariableNameForId(y.connection[0])) : (y.value as number).toFixed(2);

        if (vectorType == 'v3' || vectorType == 'v4') {
            code += ', ';
            code += z.connection ? convertSocketTypes(z.connection[1], z.type, Socket.getVariableNameForId(z.connection[0])) : (z.value as number).toFixed(2);
        }

        if (vectorType == 'v4') {
            code += ', ';
            code += w.connection ? convertSocketTypes(w.connection[1], w.type, Socket.getVariableNameForId(w.connection[0])) : (w.value as number).toFixed(2);
        }

        code += ');\n';


        return code;

    }
    definitions(): [string, string][] {
        return [];
    }

} 