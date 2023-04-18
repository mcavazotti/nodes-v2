import { Vector2 } from "../core/math/vector";
import { Camera } from "../core/render/camera";

export interface DragAction {
    element: 'board' | 'node' | 'socket';
    id?: string;
    htmlElement?: HTMLElement
    initialMousePos: Vector2;
    initialMousePosWorld: Vector2;
    elementPos?: Vector2;
}

export interface SelectAction {
    element: 'node';
    id: string;
}

export function getDragAction(event: MouseEvent, camera: Camera): DragAction | null {
    let element = event.target as HTMLElement;
    if (element.id?.includes('socket-'))
        return {
            element: 'socket',
            id: element.dataset.socketId,
            initialMousePos: new Vector2(event.clientX, event.clientY),
            initialMousePosWorld: camera.convertRasterToWorld(new Vector2(event.clientX, event.clientY)),
            elementPos: new Vector2(element.offsetLeft, element.offsetTop),
            htmlElement: element,
        };

    if (element.id == 'board')
        return {
            element: 'board',
            initialMousePos: new Vector2(event.clientX, event.clientY),
            initialMousePosWorld: camera.convertRasterToWorld(new Vector2(event.clientX, event.clientY)),
        };

    if (element.id?.includes('parameter-'))
        return null;

    while (element && !element?.id.includes('node-')) element = element.parentElement!;

    if (element)
        return {
            element: 'node',
            id: element.dataset.nodeId,
            initialMousePos: new Vector2(event.clientX, event.clientY),
            initialMousePosWorld: camera.convertRasterToWorld(new Vector2(event.clientX, event.clientY)),
            elementPos: new Vector2(element.offsetLeft, element.offsetTop),
            htmlElement: element,
        };

    return null;

}