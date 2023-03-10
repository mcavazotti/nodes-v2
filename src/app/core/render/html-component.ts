export interface HTMLComponent {
    getHtml(): string;
    getOuterElement(): HTMLElement;
    setListeners(): void;
    destroy():void;
    dirty: boolean;
}