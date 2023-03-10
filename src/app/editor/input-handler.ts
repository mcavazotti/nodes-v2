import { Vector2 } from "../core/math/vector";

export interface DragAction {
    element: 'board' | 'node' | 'socket';
    id?: string;
    htmlElement?: HTMLElement
    initialMousePos: Vector2;
    elementPos?: Vector2;
}

export function getDragAction(event: MouseEvent): DragAction | null {
    let element = event.target as HTMLElement;
    if (element.id?.includes('socket-'))
        return {
            element: 'socket',
            id: element.id,
            initialMousePos: new Vector2(event.clientX, event.clientY),
            elementPos: new Vector2(element.offsetLeft, element.offsetTop),
            htmlElement: element,
        };

    if (element.id == 'board')
        return {
            element: 'board',
            initialMousePos: new Vector2(event.clientX, event.clientY),
        };

    while (element && !element?.id.includes('node-')) element = element.parentElement!;

    if (element)
        return {
            element: 'node',
            id: element.id,
            initialMousePos: new Vector2(event.clientX, event.clientY),
            elementPos: new Vector2(element.offsetLeft, element.offsetTop),
            htmlElement: element,
        };

    return null;

}