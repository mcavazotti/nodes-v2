import { ColorRGBA } from "../../core/math/color";
import { Vector2, Vector3, Vector4 } from "../../core/math/vector";
import { BaseNode } from "./base-node";
import { SerializedSocket } from "./types/serialized-types";
import { SocketPrototype } from "./types/socket-prototype";
import { SocketType } from "./types/socket-types";

export class Socket<T> {

    readonly uId: string;
    readonly label: string;
    readonly type: SocketType;
    readonly role: "input" | "output";
    value?: T;
    connection: [string, SocketType] | null;
    hidden: boolean;

    static fromJson(json: SerializedSocket) {
        const socket = new Socket(json);
        socket.connection = json.connection;
        if (socket.value) {
            switch (socket.type) {
                case SocketType.color: {
                    socket.value = new ColorRGBA(socket.value as string);
                    break;
                }
                case SocketType.vector2: {
                    let val = socket.value as number[];
                    socket.value = new Vector2(val[0], val[1]);
                    break;
                }
                case SocketType.vector3: {
                    let val = socket.value as number[];
                    socket.value = new Vector3(val[0], val[1], val[2]);
                    break;
                }
                case SocketType.vector4: {
                    let val = socket.value as number[];
                    socket.value = new Vector4(val[0], val[1], val[2], val[3]);
                    break;
                }

            }
        }
        return socket;
    }

    constructor(prototype: SocketPrototype<T>) {
        if (!prototype.uId) throw Error('Missing uId for socket initalization.');
        this.uId = prototype.uId;
        this.label = prototype.label;
        this.type = prototype.type;
        this.role = prototype.role;
        this.value = prototype.value;
        this.hidden = !!prototype.hidden;
        this.connection = null;
    }
    toJSON(): SerializedSocket {
        return {
            uId: this.uId,
            label: this.label,
            type: this.type,
            role: this.role,
            connection: this.connection,
            hidden: this.hidden,
            value: this.value
        };
    }

    getVariableName(): string {
        return Socket.getVariableNameForId(this.uId);
    }

    static getVariableNameForId(id: string): string {
        return id.replace(/\-/g, '');
    }
}