import { CoordinatesNode } from "../node-defs/input/coordinates.node";
import { OutputNode } from "../node-defs/output/output.node";
import { BaseNode } from "./base-node";
import { NodeCompiler } from "./compiler/node-compiler";
import { Socket } from "./socket";
import { NodeClass, NodeId } from "./types/node-classes";
import { SerializedNode } from "./types/serialized-types";

export class NodeEngine {
    private _nodes: Map<string, BaseNode> = new Map();
    private _sockets: Map<string, Socket<unknown>> = new Map();
    private _nodeCompiler: NodeCompiler = NodeCompiler.getInstance();

    constructor(private uniforms: string[]) {
        this._nodeCompiler.setCompileRequestListener(() => {
            return {
                nodes: this._nodes,
                root: this.getRootNode(),
                uniforms: this.uniforms
            }
        });
        this._nodeCompiler.setCompilationDoneListener((code) => {
            console.log(code);
        })
    }
    getRootNode() {
        return [...this._nodes.values()].find((n) => n.nodeId == NodeId.output)!
    }

    getNodeById(id: string) {
        return this._nodes.get(id);
    }
    getNodes() {
        return Array.from(this._nodes.values());
    }

    addNode(node: BaseNode) {
        this._nodes.set(node.uId, node);
        node.input.forEach(s => this._sockets.set(s.uId, s));
        node.output.forEach(s => this._sockets.set(s.uId, s));
    }

    removeNode(node: BaseNode) {
        if (node.nodeId == NodeId.output) return;
        node.output.forEach(socket =>
            Array.from(this._sockets.values())
                .filter(s => s.role == 'input' && s.connection && s.connection[0] == socket.uId)
                .forEach(s => s.connection = null)
        );
        node.input.forEach(s => this._sockets.delete(s.uId));
        node.output.forEach(s => this._sockets.delete(s.uId));
        this._nodes.delete(node.uId);
    }

    importNodes(jsonContent: SerializedNode[]) {
        this._nodes.clear();
        this._sockets.clear();
        for (const n of jsonContent) {
            switch (n.nodeId) {
                case NodeId.output:
                    this.addNode(BaseNode.fromJSON(OutputNode, n));
                    break;
                case NodeId.coordinates:
                    this.addNode(BaseNode.fromJSON(CoordinatesNode, n));
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
}