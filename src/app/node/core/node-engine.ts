import { CoordinatesNode } from "../node-defs/input/coordinates.node";
import { OutputNode } from "../node-defs/output/output.node";
import { BaseNode } from "./base-node";
import { convertSocketTypes } from "./compiler/code-gen-helpers";
import { CompilationDoneFunc, NodeCompiler } from "./compiler/node-compiler";
import { Socket } from "./socket";
import { NodeId } from "./types/node-classes";
import { SerializedNode } from "./types/serialized-types";

export class NodeEngine {
    private _nodes: Map<string, BaseNode> = new Map();
    private _sockets: Map<string, Socket<unknown>> = new Map();
    private _nodeCompiler: NodeCompiler = NodeCompiler.getInstance();


    constructor(private uniforms: string[], private compileCalback: CompilationDoneFunc) {
        this._nodeCompiler.setCompileRequestListener(() => {
            return {
                nodes: this._nodes,
                root: this.getRootNode(),
                uniforms: this.uniforms
            }
        });
        this._nodeCompiler.setCompilationDoneListener((code) => {
            console.log(code);
            this.compileCalback(code);
        })
    }
    getRootNode() {
        return [...this._nodes.values()].find((n) => n.nodeId == NodeId.output)!
    }

    getNodeById(id: string) {
        return this._nodes.get(id);
    }

    getSocketById(id: string) {
        return this._sockets.get(id);
    }

    getNodes() {
        return Array.from(this._nodes.values());
    }

    addNode(node: BaseNode) {
        this._nodes.set(node.uId, node);
        node.input.forEach(s => this._sockets.set(s.uId, s));
        node.output.forEach(s => this._sockets.set(s.uId, s));
    }

    removeNode(node: BaseNode): boolean {
        if (node.nodeId == NodeId.output) return false;
        node.output.forEach(socket =>
            Array.from(this._sockets.values())
                .filter(s => s.role == 'input' && s.connection && s.connection[0] == socket.uId)
                .forEach(s => s.connection = null)
        );
        node.input.forEach(s => this._sockets.delete(s.uId));
        node.output.forEach(s => this._sockets.delete(s.uId));

        node.destroy();
        this._nodes.delete(node.uId);
        return true
    }

    importNodes(jsonContent: SerializedNode[]) {
        this._nodes.clear();
        this._sockets.clear();
        for (const n of jsonContent) {
            switch (n.nodeId) {
                case NodeId.output:
                    this.addNode(BaseNode.fromJSON(OutputNode, n, this));
                    break;
                case NodeId.coordinates:
                    this.addNode(BaseNode.fromJSON(CoordinatesNode, n, this));
                    break;
            }
        }
    }

    exportNodes(): SerializedNode[] {
        return Array.from(this._nodes.values()).map(n => n.toJSON());
    }

    getSocketParent(socket: Socket<unknown>): BaseNode {
        return this._nodes.get(socket.uId.match(/n-\d{4}/)![0])!
    }

    getConnections(): [string, string][] {
        return Array.from(this._sockets.values()).filter(s => s.role == 'input' && s.connection).map(s => [s.connection![0], s.uId]);
    }

    createConnection(socket1: string, socket2: string) {
        const sock1 = this._sockets.get(socket1)!;
        const sock2 = this._sockets.get(socket2)!;

        const input = sock1.role == 'input' ? sock1 : sock2;
        const output = sock1.role == 'output' ? sock1 : sock2;

        // test validity of connection
        convertSocketTypes(output.type, input.type, '');
        try {
            input.connection = [output.uId, output.type];

            this._nodeCompiler.transverseNodes(this.getSocketParent(input), this._nodes, {
                definitions: new Map(),
                visitedNode: new Set(),
                visiting: new Set(),
                mainCode: ""
            });
        } catch (error) {
            console.error(error)
            input.connection = null;
        }
        this.getSocketParent(input).updateNode({ inputSockets: true });
        this._nodeCompiler.compile();
    }

    deleteConnection(socketId: string) {
        const socket = this._sockets.get(socketId)!;
        if (socket.role == 'input') {
            socket.connection = null;
            this.getSocketParent(socket).updateNode({ inputSockets: true });
        } else {
            Array.from(this._sockets.values()).filter(s => s.role == 'input' && s.connection && s.connection[0] == socketId).forEach(s => {
                s.connection = null;
                this.getSocketParent(s).updateNode({ inputSockets: true });
            });
        }
        this._nodeCompiler.compile();
    }
}