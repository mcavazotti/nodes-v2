import { SocketType } from "../types/socket-types";

export function convertSocketTypes(from: SocketType, to: SocketType, value: string): string {
    let error = Error(`Can't convert ${from} to ${to}.`);
    if (from == to || from == SocketType.color && to == SocketType.vector4 || from == SocketType.vector4 && to == SocketType.color)
        return value.toString();

    switch (from) {
        case SocketType.bool:
            switch (to) {
                case SocketType.float:
                    return `(${value}? 1.0: 0.0)`
                default:
                    throw error;
            }
        case SocketType.float:
            switch (to) {
                case SocketType.bool:
                    return `(${value} != 0.0)`;
                case SocketType.vector2:
                    return `vec2(${value}, ${value})`;
                case SocketType.vector3:
                    return `vec3(${value}, ${value}, ${value})`;
                case SocketType.color:
                    return `vec4(${value}, ${value}, ${value}, ${value})`;
                default:
                    throw error;
            }
        case SocketType.vector2:
            switch (to) {
                case SocketType.bool:
                    return `(length(${value}) != 0.0)`;
                default:
                    throw error;
            }
        case SocketType.vector3:
            switch (to) {
                case SocketType.bool:
                    return `(length(${value}) != 0.0)`;
                case SocketType.vector2:
                    return `${value}.xy`;
                case SocketType.color:
                    return `vec4(${value}, 1.0)`
                default:
                    throw error;
            }
        case SocketType.color:
        case SocketType.vector4:
            switch (to) {
                case SocketType.bool:
                    return `(length(${value}) != 0.0)`;
                case SocketType.vector2:
                    return `${value}.xy`;
                case SocketType.vector3:
                    return `${value}.xyz`;
                default:
                    throw error;
            }
        default:
            throw Error(`Unknown socket type ${from}`);
    }
}

export function getNodeIdFromSocketId(id: string): string {
    return id.match(/(n-\d{4})/)![0];
}