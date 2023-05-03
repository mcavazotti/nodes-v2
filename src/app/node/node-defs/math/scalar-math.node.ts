import { ColorRGBA } from "../../../core/math/color";
import { Vector2 } from "../../../core/math/vector";
import { BaseNode } from "../../core/base-node";
import { convertSocketTypes } from "../../core/compiler/code-gen-helpers";
import { NodeEngine } from "../../core/node-engine";
import { Socket } from "../../core/socket";
import { MathOperations } from "../../core/types/math-ops";
import { NodeId, NodeClass } from "../../core/types/node-classes";
import { SocketType } from "../../core/types/socket-types";
import { SelectorParam } from "../../node-parameters/selector.parameter";


export class ScalarMathNode extends BaseNode {
    nodeId = NodeId.scalarMath;

    constructor(engine: NodeEngine, pos: Vector2) {
        super(engine, pos, NodeClass.mathOp,
            [
                { label: 'a', role: 'input', hidden: false, type: SocketType.float, value: 0 },
                { label: 'b', role: 'input', hidden: false, type: SocketType.float, value: 0 }
            ],
            [
                { label: 'c', role: 'output', hidden: false, type: SocketType.float },
                { label: 'c', role: 'output', hidden: true, type: SocketType.bool },

            ],
            [
                new SelectorParam<MathOperations>('Operation', [
                    { label: 'Add', value: MathOperations.add },
                    { label: 'Subtract', value: MathOperations.sub },
                    { label: 'Multiply', value: MathOperations.mult },
                    { label: 'Divide', value: MathOperations.divide },
                    // { label: 'Modulus', value: MathOperations.mod },
                ], (val) => {
                    switch (val) {
                        case MathOperations.add:
                            this._label = 'Add';
                            break;
                            case MathOperations.sub:
                            this._label = 'Subtract';
                            break;
                            case MathOperations.mult:
                            this._label = 'Multiply';
                            break;
                            case MathOperations.divide:
                            this._label = 'Divide';
                            break;
                            // case MathOperations.mod:
                            // this._label = 'Modulus';
                            // break;
                    }
                    this.updateNode({ label: true, inputSockets: true, outputSockets: true });
                }) as SelectorParam<unknown>
            ]
        );
        this._label = 'Add';

    }
    code(): string {
        let code = '';
        const a = this._input[0] as Socket<number>;
        const b = this._input[1] as Socket<number>;
        const varA = a.connection ? convertSocketTypes(a.connection[1], a.type, Socket.getVariableNameForId(a.connection[0])) : (a.value as number).toFixed(2);
        const varB = b.connection ? convertSocketTypes(b.connection[1], b.type, Socket.getVariableNameForId(b.connection[0])) : (b.value as number).toFixed(2);

        switch (this._parameters[0].value) {
            case MathOperations.add:
                code = `${varA} + ${varB};`;
                break;
            case MathOperations.sub:
                code = `${varA} - ${varB};`;
                break;
            case MathOperations.mult:
                code = `${varA} * ${varB};`;
                break;
            case MathOperations.divide:
                code = `${varA} / ${varB};`;
                break;
            // case MathOperations.mod:
            //     code = `${varA} % ${varB};`;
            //     break;
        }

        return `float ${this._output[0].getVariableName()} = ${code}\n`;
    }
    definitions(): [string, string][] {
        return [];
    }
}