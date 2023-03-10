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

    constructor(prototype: SocketPrototype<T>) {
        if (!prototype.uId) throw Error('Missing uId for socket initalization.');
        this.uId = prototype.uId;
        this.label = prototype.label;
        this.type = prototype.type;
        this.role = prototype.role;
        this.value = prototype.value;
        this.hidden = false;
        this.connection = null;
    }
    toJSON() {
        return {
            uId: this.uId,
            label: this.label,
            type: this.type,
            role: this.role,
            connection: this.connection,
            value: JSON.stringify(this.value)
        };
    }
}