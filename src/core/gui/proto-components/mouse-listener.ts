export interface ClickEventFn {
    (): boolean | void
}
export function isMouseListener(obj: any): obj is MouseListener {
    return 'click' in obj;
}

export interface MouseListener {
    click?: ClickEventFn;
}