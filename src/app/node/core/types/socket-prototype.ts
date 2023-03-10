import { SocketType } from "./socket-types";

export interface SocketPrototype<T> {
    label: string;
    type: SocketType;
    role: "input" | "output";
    uId?: string;
    hidden?: boolean;
    value?: T;
}