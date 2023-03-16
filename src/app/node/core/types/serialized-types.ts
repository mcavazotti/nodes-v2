import { Vector2 } from "../../../core/math/vector";
import { NodeClass, NodeId } from "./node-classes";
import { SocketPrototype } from "./socket-prototype";
import { SocketType } from "./socket-types";

export type SerializedSocket = SocketPrototype<unknown> & {
    connection: [string, SocketType] | null;
}

export interface SerializedNode {
    nodeId: NodeId;
    uId: string;
    position: [number, number];
    label: string;
    type: NodeClass;
    input: SerializedSocket[];
    output: SerializedSocket[];
    parameters?: never; // TODO figure it out later 
}